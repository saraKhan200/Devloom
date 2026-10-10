import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import * as schemas from "../schemas/github.schemas.js";
import github from "./tools/github/index.js";
import { gitError } from "./tools/github/client.js";

/**
 * Instantiates and configures the core McpServer instance.
 * Decoupled from transport mechanisms to enable isolated testing via the MCP Inspector.
 */
export default function createMcpServer(): McpServer {
  const server = new McpServer({
    name: "DevLoom MCP Server",
    version: "1.0.0",
    description:
      "devloom is a MCP server for Alexa which lets developers, programmers and tech interested people access to github, vercel and google via Alexa !!",
  });

  // ==========================================
  // Pull Requests
  // ==========================================

  server.registerTool(
    "github_list_prs",
    {
      description:
        "Fetches open pull requests for a specified GitHub repository.",
      inputSchema: schemas.listPullRequestsSchema,
    },
    async ({ owner, state, repo, sort, token: argsToken }, extra) => {
      try {
        const context = extra as { requestContext?: { authHeader?: string } };
        const token = context.requestContext?.authHeader || argsToken;
        const resultText = await github.listPullRequests(
          owner,
          state,
          repo,
          sort,
          token,
        );
        return { content: [{ type: "text", text: resultText }] };
      } catch (error) {
        return gitError(error, "could not list PRs, Error");
      }
    },
  );

  server.registerTool(
    "github_make_pull_request",
    {
      description:
        "Creates a new pull request in a specified GitHub repository.",
      inputSchema: schemas.makePullRequestsSchema,
    },
    async (
      { owner, repo, head, base, title, body, token: argsToken },
      extra,
    ) => {
      try {
        const context = extra as { requestContext?: { authHeader?: string } };
        const token = context.requestContext?.authHeader || argsToken;
        const resultText = await github.makePullRequests(
          owner,
          repo,
          head,
          base,
          title,
          body,
          token,
        );
        return { content: [{ type: "text", text: resultText }] };
      } catch (error) {
        return gitError(error, "could not make PR, Error");
      }
    },
  );

  server.registerTool(
    "github_merge_pull_request",
    {
      description: "Merges a pull request in a specified GitHub repository.",
      inputSchema: schemas.mergePullRequestsSchema,
    },
    async (
      { owner, repo, pullNumber, commitTitle, commitMessage, token: argsToken },
      extra,
    ) => {
      try {
        const context = extra as { requestContext?: { authHeader?: string } };
        const token = context.requestContext?.authHeader || argsToken;
        const resultText = await github.mergePullRequests(
          owner,
          repo,
          pullNumber,
          commitTitle,
          commitMessage,
          token,
        );
        return { content: [{ type: "text", text: resultText }] };
      } catch (error) {
        return gitError(error, "could not merge PR, Error");
      }
    },
  );

  // ==========================================
  // Branches
  // ==========================================

  server.registerTool(
    "github_create_branch",
    {
      description: "Creates a new branch in a specified GitHub repository.",
      inputSchema: schemas.createBranchSchema,
    },
    async (
      { owner, repo, newBranchName, baseBranch, token: argsToken },
      extra,
    ) => {
      try {
        const context = extra as { requestContext?: { authHeader?: string } };
        const token = context.requestContext?.authHeader || argsToken;
        const resultText = await github.createBranch(
          owner,
          repo,
          newBranchName,
          baseBranch,
          token,
        );
        return { content: [{ type: "text", text: resultText }] };
      } catch (error) {
        return gitError(error, "could not create branch, Error");
      }
    },
  );

  server.registerTool(
    "github_list_branches",
    {
      description: "Lists all branches for a specified GitHub repository.",
      inputSchema: schemas.listBranchesSchema,
    },
    async ({ owner, repo, token: argsToken }, extra) => {
      try {
        const context = extra as { requestContext?: { authHeader?: string } };
        const token = context.requestContext?.authHeader || argsToken;
        const resultText = await github.listBranches(owner, repo, token);
        return { content: [{ type: "text", text: resultText }] };
      } catch (error) {
        return gitError(error, "could not list branches, Error");
      }
    },
  );

  // ==========================================
  // Commits
  // ==========================================

  server.registerTool(
    "github_get_commits",
    {
      description:
        "Gets the recent commits from a branch since a specific date.",
      inputSchema: schemas.getCommitsSchema,
    },
    async ({ owner, repo, baseBranch, since, token: argsToken }, extra) => {
      try {
        const context = extra as { requestContext?: { authHeader?: string } };
        const token = context.requestContext?.authHeader || argsToken;
        const resultText = await github.getCommits(
          owner,
          repo,
          baseBranch,
          since,
          token,
        );
        return { content: [{ type: "text", text: resultText }] };
      } catch (error) {
        return gitError(error, "could not get commits, Error");
      }
    },
  );

  // ==========================================
  // Issues
  // ==========================================

  server.registerTool(
    "github_create_issue",
    {
      description: "Creates a new issue in a specified GitHub repository.",
      inputSchema: schemas.createIssuesSchema,
    },
    async ({ owner, repo, title, body, token: argsToken }, extra) => {
      try {
        const context = extra as { requestContext?: { authHeader?: string } };
        const token = context.requestContext?.authHeader || argsToken;
        const resultText = await github.createIssues(
          owner,
          repo,
          title,
          body,
          token,
        );
        return { content: [{ type: "text", text: resultText }] };
      } catch (error) {
        return gitError(error, "could not create issue, Error");
      }
    },
  );

  server.registerTool(
    "github_get_issues",
    {
      description:
        "Lists issues in a specified GitHub repository, optionally filtering by mentioned or creator.",
      inputSchema: schemas.getIssuesSchema,
    },
    async ({ owner, repo, mentioned, creator, token: argsToken }, extra) => {
      try {
        const context = extra as { requestContext?: { authHeader?: string } };
        const token = context.requestContext?.authHeader || argsToken;
        const resultText = await github.getIssues(
          owner,
          repo,
          mentioned,
          creator,
          token,
        );
        return { content: [{ type: "text", text: resultText }] };
      } catch (error) {
        return gitError(error, "could not get issues, Error");
      }
    },
  );

  server.registerTool(
    "github_create_comment_on_issue",
    {
      description: "Adds a comment to a specific issue or pull request.",
      inputSchema: schemas.createCommentOnIssueSchema,
    },
    async ({ owner, repo, issueNumber, body, token: argsToken }, extra) => {
      try {
        const context = extra as { requestContext?: { authHeader?: string } };
        const token = context.requestContext?.authHeader || argsToken;
        const resultText = await github.createCommentOnIssue(
          owner,
          repo,
          issueNumber,
          body,
          token,
        );
        return { content: [{ type: "text", text: resultText }] };
      } catch (error) {
        return gitError(error, "could not create comment, Error");
      }
    },
  );

  // ==========================================
  // Releases
  // ==========================================

  server.registerTool(
    "github_list_releases",
    {
      description: "Lists releases for a specified GitHub repository.",
      inputSchema: schemas.listReleasesSchema,
    },
    async ({ owner, repo, page, token: argsToken }, extra) => {
      try {
        const context = extra as { requestContext?: { authHeader?: string } };
        const token = context.requestContext?.authHeader || argsToken;
        const resultText = await github.listReleases(owner, repo, page, token);
        return { content: [{ type: "text", text: resultText }] };
      } catch (error) {
        return gitError(error, "could not list releases, Error");
      }
    },
  );

  server.registerTool(
    "github_get_tag_releases",
    {
      description: "Gets a specific release by tag name for a repository.",
      inputSchema: schemas.getTagReleasesSchema,
    },
    async ({ owner, repo, tag, token: argsToken }, extra) => {
      try {
        const context = extra as { requestContext?: { authHeader?: string } };
        const token = context.requestContext?.authHeader || argsToken;
        const resultText = await github.getTagReleases(owner, repo, tag, token);
        return { content: [{ type: "text", text: resultText }] };
      } catch (error) {
        return gitError(error, "could not get tag release, Error");
      }
    },
  );

  // ==========================================
  // Search
  // ==========================================

  server.registerTool(
    "github_search_topics",
    {
      description: "Searches GitHub for topics based on a query.",
      inputSchema: schemas.searchTopicsSchema,
    },
    async ({ q, page, token: argsToken }, extra) => {
      try {
        const context = extra as { requestContext?: { authHeader?: string } };
        const token = context.requestContext?.authHeader || argsToken;
        const resultText = await github.searchTopics(q, page, token);
        return { content: [{ type: "text", text: resultText }] };
      } catch (error) {
        return gitError(error, "could not search topics, Error");
      }
    },
  );

  server.registerTool(
    "github_search_repos",
    {
      description: "Searches GitHub for repositories based on a query.",
      inputSchema: schemas.searchReposSchema,
    },
    async ({ q, page, token: argsToken }, extra) => {
      try {
        const context = extra as { requestContext?: { authHeader?: string } };
        const token = context.requestContext?.authHeader || argsToken;
        const resultText = await github.searchRepos(q, page, token);
        return { content: [{ type: "text", text: resultText }] };
      } catch (error) {
        return gitError(error, "could not search repositories, Error");
      }
    },
  );

  server.registerTool(
    "github_search_issues_and_prs",
    {
      description:
        "Searches GitHub for issues and pull requests based on a query.",
      inputSchema: schemas.searchIssuesAndPRsSchema,
    },
    async ({ q, sort, page, token: argsToken }, extra) => {
      try {
        const context = extra as { requestContext?: { authHeader?: string } };
        const token = context.requestContext?.authHeader || argsToken;
        const resultText = await github.searchIssuesAndPRs(
          q,
          sort,
          page,
          token,
        );
        return { content: [{ type: "text", text: resultText }] };
      } catch (error) {
        return gitError(error, "could not search issues and PRs, Error");
      }
    },
  );

  server.registerTool(
    "github_search_users",
    {
      description: "Searches GitHub for users based on a query.",
      inputSchema: schemas.searchUsersSchema,
    },
    async ({ q, page, token: argsToken }, extra) => {
      try {
        const context = extra as { requestContext?: { authHeader?: string } };
        const token = context.requestContext?.authHeader || argsToken;
        const resultText = await github.searchUsers(q, page, token);
        return { content: [{ type: "text", text: resultText }] };
      } catch (error) {
        return gitError(error, "could not search users, Error");
      }
    },
  );

  // ==========================================
  // User Operations
  // ==========================================

  server.registerTool(
    "github_accept_repo_invite",
    {
      description:
        "Accepts a repository invitation for the authenticated user.",
      inputSchema: schemas.acceptRepoInviteSchema,
    },
    async ({ owner, repo, invitationId, token: argsToken }, extra) => {
      try {
        const context = extra as { requestContext?: { authHeader?: string } };
        const token = context.requestContext?.authHeader || argsToken;
        const resultText = await github.acceptRepoInvite(
          owner,
          repo,
          invitationId,
          token,
        );
        return { content: [{ type: "text", text: resultText }] };
      } catch (error) {
        return gitError(error, "could not accept repo invite, Error");
      }
    },
  );

  server.registerTool(
    "github_create_repo",
    {
      description: "Creates a new repository for the authenticated user.",
      inputSchema: schemas.createRepoSchema,
    },
    async ({ name, description, isPrivate, token: argsToken }, extra) => {
      try {
        const context = extra as { requestContext?: { authHeader?: string } };
        const token = context.requestContext?.authHeader || argsToken;
        const resultText = await github.createRepo(
          name,
          description,
          isPrivate,
          token,
        );
        return { content: [{ type: "text", text: resultText }] };
      } catch (error) {
        return gitError(error, "could not create repository, Error");
      }
    },
  );

  server.registerTool(
    "github_create_fork",
    {
      description:
        "Creates a fork of a specified repository for the authenticated user.",
      inputSchema: schemas.createforkSchema,
    },
    async ({ owner, repo, token: argsToken }, extra) => {
      try {
        const context = extra as { requestContext?: { authHeader?: string } };
        const token = context.requestContext?.authHeader || argsToken;
        const resultText = await github.createfork(owner, repo, token);
        return { content: [{ type: "text", text: resultText }] };
      } catch (error) {
        return gitError(error, "could not create fork, Error");
      }
    },
  );

  return server;
}
