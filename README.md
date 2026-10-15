# DevLoom

> [!NOTE]
> This branch "main" is based on to run locally , for production ready code see the branch [production](https://github.com/saraKhan200/Devloom/tree/Production)

[![M8ven Score](https://m8ven.ai/badge/mcp/sarakhan200-devloom-wiex8t?v=0306aa48909dac424cd2b4b21d1805ba)](https://m8ven.ai/mcp/sarakhan200-devloom-wiex8t?s=readme)

**Turn GitHub busywork into a conversation.** DevLoom is a Developer first GitHub assistant built around the Model Context Protocol (MCP). Ask for repository context in plain language; Gemini can choose from DevLoom's GitHub tools, run them through MCP, and turn the results into a concise response.

The project includes a browser demo and an SSE-based MCP server. It gives teams a practical starting point for exploring natural-language developer workflows and building new MCP-powered ideas together.

## Why DevLoom

During a hackathon, incident, release rush, or focused coding session or even a morning code recall news :D, changing context between an editor, GitHub pages, and the terminal costs time. DevLoom brings common repository actions into one prompt-driven workflow: inspect branches and pull requests, find issues, look up releases, or perform selected write actions without hand-building each API request.

> [!TIP]
> You can try the Live website demo of the MCP [here](https://devloom.onrender.com/) , its hosted on reder.com so it might take less than 1 minute time to load  if not visited recently :) .


Useful for:

- Software engineers who need a quick repository briefing before reviewing or contributing.
- Hackathon teams coordinating issues, branches, and pull requests under time pressure.
- Maintainers preparing releases or catching up on repository activity.
- Developer-tool builders learning how MCP tools can be exposed to an LLM and reused by a separate MCP client.
- Voice-assistant and accessibility prototypes that benefit from short, conversational summaries.

## What It Can Do

DevLoom currently registers **18 GitHub MCP tools** and have more in-mind ;). The browser chat gives Gemini access to those tools; an MCP client can call the tools directly through the SSE transport. Reads and writes both use the permissions of the supplied GitHub token.

### Branches And Commits

| MCP tool               | Inputs                                                                       | Capability                                                                     |
| ---------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `github_list_branches` | `owner`, `repo`                                                              | List repository branches with commit SHAs and URLs.                            |
| `github_create_branch` | `owner`, `repo`, `newBranchName`; optional `baseBranch` (defaults to `main`) | Create a branch from the selected base branch. **Writes to GitHub.**           |
| `github_get_commits`   | `owner`, `repo`, `since`; optional `baseBranch` (defaults to `main`)         | Request commits on a branch since an ISO date, such as `2026-10-01T00:00:00Z`. |

### Issues And Comments

| MCP tool                         | Inputs                                           | Capability                                                                 |
| -------------------------------- | ------------------------------------------------ | -------------------------------------------------------------------------- |
| `github_get_issues`              | `owner`, `repo`; optional `mentioned`, `creator` | List repository issues, optionally filtering by mentioned user or creator. |
| `github_create_issue`            | `owner`, `repo`, `title`, `body`                 | Create an issue. **Writes to GitHub.**                                     |
| `github_create_comment_on_issue` | `owner`, `repo`, `issueNumber`, `body`           | Comment on an issue or pull request. **Writes to GitHub.**                 |

### Pull Requests

| MCP tool                    | Inputs                                                        | Capability                                                                                                      |
| --------------------------- | ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `github_list_prs`           | `owner`, `repo`, `state`, `sort`                              | List PRs using state `open`, `closed`, or `all`; sort by `created`, `updated`, `popularity`, or `long-running`. |
| `github_make_pull_request`  | `owner`, `repo`, `head`, `base`, `title`, `body`              | Open a PR from `head` into `base`. **Writes to GitHub.**                                                        |
| `github_merge_pull_request` | `owner`, `repo`, `pullNumber`, `commitTitle`, `commitMessage` | Merge a PR with the supplied commit metadata. **Writes to GitHub.**                                             |

### Releases

| MCP tool                  | Inputs                           | Capability                               |
| ------------------------- | -------------------------------- | ---------------------------------------- |
| `github_list_releases`    | `owner`, `repo`; optional `page` | List releases for a repository.          |
| `github_get_tag_releases` | `owner`, `repo`, `tag`           | Fetch the release associated with a tag. |

### Search

| MCP tool                       | Inputs                       | Capability                                                                                                                                                                                                                                    |
| ------------------------------ | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `github_search_topics`         | `q`; optional `page`         | Search GitHub topics.                                                                                                                                                                                                                         |
| `github_search_repos`          | `q`; optional `page`         | Search repositories. Use GitHub search syntax in `q` for qualifiers.                                                                                                                                                                          |
| `github_search_issues_and_prs` | `q`; optional `sort`, `page` | Search issues and PRs. Sort supports `comments`, `reactions`, `reactions-+1`, `reactions--1`, `reactions-smile`, `reactions-thinking_face`, `reactions-heart`, `reactions-tada`, `interactions`, `created`, or `updated` (default `updated`). |
| `github_search_users`          | `q`; optional `page`         | Search GitHub users.                                                                                                                                                                                                                          |

### Repositories And Account Actions

| MCP tool                    | Inputs                             | Capability                                                               |
| --------------------------- | ---------------------------------- | ------------------------------------------------------------------------ |
| `github_create_repo`        | `name`, `description`, `isPrivate` | Create a repository for the authenticated account. **Writes to GitHub.** |
| `github_create_fork`        | `owner`, `repo`                    | Fork a repository for the authenticated account. **Writes to GitHub.**   |
| `github_accept_repo_invite` | `owner`, `repo`, `invitationId`    | Accept a repository invitation by ID. **Writes to GitHub.**              |

All tool inputs are validated using Zod schemas in `src/schemas/github.schemas.ts`. The tools call GitHub through Octokit and return human-readable text rather than raw GitHub API objects.

## How The Pieces Fit

```text
Browser demo -- POST /api/chat --> Express on :3000
                              |
                        Gemini agent loop
                              |
                   in-memory MCP client/server
                              |
                      registered MCP tools
                              |
                            Octokit
                              |
                          GitHub API
```

The Gemini path and the standalone MCP transport are two entry points to the same registered tool layer:

1. The browser sends a prompt plus the user's Gemini and GitHub credentials to `POST /api/chat`.
2. Express validates the request and calls `runGeminiAgent`.
3. The agent gives Gemini tool declarations, receives any requested calls, and executes each through an in-memory MCP client connected to `createMcpServer()`.
4. The user's GitHub token is added to the MCP tool arguments by the server-side agent, not included in Gemini's tool declarations.
5. Tool results are returned to Gemini for a final response. Each chat request is independent; conversation history is not persisted.

Separately, an MCP client can connect to `GET /sse`. The server assigns that connection a session ID and accepts its MCP JSON-RPC messages at `POST /messages?sessionId=...`.

## HTTP Routes

| Method and path                 | Purpose                                                                                                                                            |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /` and static paths        | Serve the demo files from `public/` when using Express directly.                                                                                   |
| `POST /api/chat`                | Run the Gemini-to-MCP workflow. Body: `{ "prompt": "...", "geminiApiKey": "...", "githubToken": "..." }`. Success returns `{ "response": "..." }`. |
| `GET /sse`                      | Open an MCP Server-Sent Events session. Use an MCP-compatible client; it negotiates the session and message endpoint.                              |
| `POST /messages?sessionId=<id>` | Send MCP JSON-RPC messages for an active SSE session. An MCP client uses this route to list and call the registered tools.                         |

The chat route checks the prompt and credentials before starting a request. MCP tools are selected by name and invoked through MCP, giving the browser agent and MCP clients access to the same GitHub capabilities.

## Requirements

- Node.js and npm compatible with the installed Vite release.
- A GitHub personal access token with the minimum repository/account permissions needed for the actions you intend to try.
- A Gemini API key accepted by the Gemini API and access to the model configured in `src/agent/gemini.ts`.
- Network access to GitHub and Gemini APIs.

The browser demo uses **both** tokens for chat requests. An MCP client can provide the GitHub token in the `Authorization: Bearer <token>` header or as a tool's optional `token` argument. `GITHUB_TOKEN` is also supported as a fallback for tools that do not receive a token.

## Run Locally

```bash
git clone <repository-url>
cd devloom
npm install
```

Start the backend and frontend in separate terminals:

```bash
npm run dev:server
```

The Express backend listens on `http://localhost:3000` by default. In a second terminal:

```bash
npm run dev:ui
```

Open `http://localhost:5173`. Vite proxies `/api`, `/sse`, and `/messages` to the backend on port `3000`. To use the Express-served static UI instead, open `http://localhost:3000/` while the backend is running.
`PORT` can configure the Express backend; the Vite proxy forwards requests to port `3000` by default.

## Credentials And Configuration

Create a root `.env` file only if you need backend configuration or the MCP token fallback:

```dotenv
PORT=3000
GITHUB_TOKEN=github_pat_replace_with_your_token
```

The `.env` file is ignored by Git. Enter the Gemini key in the browser demo; it is sent to the backend with the prompt. The demo keeps entered credentials in JavaScript memory until the page reloads.

Use a fine-grained GitHub token, grant only the permissions required for the repositories and write operations you will test, and never commit real credentials. Actions such as creating or merging a PR, creating a branch/issue/repository, commenting, forking, and accepting invitations mutate GitHub state. Review the requested action and target repository before sending a prompt.

## Try It

Set the Gemini API key and GitHub token in the demo, then try prompts such as:

- “List the open pull requests in `owner/repo`, sorted by most recently updated.”
- “Show issues created by `octocat` in `owner/repo`.”
- “Find repositories about MCP servers written in TypeScript.”
- “Create a branch named `hackathon/demo` from `main` in `owner/repo`.”
- “Create an issue in `owner/repo` titled `Add onboarding docs` with a short checklist in the body.”
- “Summarize releases for `owner/repo` and include the latest tag.”

For the clearest results, include the owner, repository, branch names, PR targets, titles, and bodies. Gemini chooses the best match from DevLoom's registered tools to carry out each request.

## Build And Inspect

```bash
npm run build
```

This builds the frontend assets with Vite. During development, `npm run dev:server` runs the TypeScript backend directly with `tsx` and watches for changes.

For MCP development, connect an MCP-compatible inspector/client to `http://localhost:3000/sse`, list tools, and call them using their registered names. The `inspect` npm script is available for exploring the server during development.

## Project Map

| Path                            | Responsibility                                                              |
| ------------------------------- | --------------------------------------------------------------------------- |
| `src/app.ts`                    | Express middleware, static files, SSE and message routes, chat route.       |
| `src/mcp/server.ts`             | MCP server metadata and all 18 registered tools.                            |
| `src/schemas/github.schemas.ts` | Zod inputs and inferred tool input types.                                   |
| `src/mcp/tools/github/`         | Octokit-backed GitHub actions, grouped by domain.                           |
| `src/agent/gemini.ts`           | Gemini function declarations and agent loop using the in-memory MCP client. |
| `src/agent/executor.ts`         | Maps GitHub tool names to their implementations for agent workflows.        |
| `src/config.ts`                 | Loads root `.env`; configures `PORT` (default `3000`).                      |
| `public/`                       | Demo HTML, CSS, JavaScript, and logo.                                       |
| `vite.config.ts`                | Vite root, UI port, and backend proxies.                                    |
| `scripts/github.ts`             | Small direct GitHub function experiment, not the application entry point.   |

## Ideas To Build Next

DevLoom is designed to grow through small, useful integrations. Developers could add:

1. Add a confirmation step for actions that create or change GitHub content.
2. Bring in code search, workflow summaries, review requests, checks, or release drafting.
3. Add richer result formatting, direct links, and conversational follow-up context.
4. Connect voice input and spoken responses through an assistant integration.
5. Add another developer platform using the existing schema-and-tool pattern.
6. Build a polished credential flow and team-friendly deployment setup for shared demos.

## Contributing

When adding a capability, define and validate its input schema, implement the provider operation, register it in `src/mcp/server.ts`, and add a matching Gemini function declaration if the browser agent should be able to choose it. Keep read and write actions clearly described, document required token permissions, and add tests for both successful results and provider failures.

DevLoom is built for fast experiments and collaborative demos. Bring a repetitive GitHub task, make the tool boundary explicit, and turn it into a workflow a teammate can understand at a glance.

At the end i would say even though the functionality is limited for now,its idea,s domain in pretty bigand thus it would need time and more development to flourish on a global state but for this Amazon Hackathon its pretty well designed given the idea and bare bone implementation are solid :D .
