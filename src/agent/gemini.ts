import { GoogleGenAI, Type, type FunctionDeclaration } from "@google/genai";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import createMcpServer from "../mcp/server.js";

// Tool declarations formatted for Gemini Function Calling
const githubToolDeclarations: FunctionDeclaration[] = [
  {
    name: "github_list_prs",
    description: "Fetches pull requests for a specified GitHub repository.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        owner: { type: Type.STRING, description: "Owner of the repo" },
        repo: { type: Type.STRING, description: "Name of the repo" },
        state: {
          type: Type.STRING,
          description: "Filter state: 'open', 'closed', or 'all'",
        },
        sort: {
          type: Type.STRING,
          description:
            "Basis to sort: 'created', 'updated', 'popularity', or 'long-running'",
        },
      },
      required: ["owner", "repo", "state", "sort"],
    },
  },
  {
    name: "github_make_pull_request",
    description: "Creates a new pull request in a specified repository.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        owner: { type: Type.STRING, description: "Owner of the repo" },
        repo: { type: Type.STRING, description: "Name of the repo" },
        head: { type: Type.STRING, description: "Branch with new changes" },
        base: { type: Type.STRING, description: "Target base branch" },
        title: { type: Type.STRING, description: "PR title" },
        body: { type: Type.STRING, description: "PR body/content" },
      },
      required: ["owner", "repo", "head", "base", "title", "body"],
    },
  },
  {
    name: "github_merge_pull_request",
    description: "Merges a pull request.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        owner: { type: Type.STRING, description: "Owner of the repo" },
        repo: { type: Type.STRING, description: "Name of the repo" },
        pullNumber: { type: Type.NUMBER, description: "PR number" },
        commitTitle: {
          type: Type.STRING,
          description: "Title for merge commit",
        },
        commitMessage: {
          type: Type.STRING,
          description: "Message for merge commit",
        },
      },
      required: ["owner", "repo", "pullNumber", "commitTitle", "commitMessage"],
    },
  },
  {
    name: "github_create_branch",
    description: "Creates a new branch from a base branch.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        owner: { type: Type.STRING, description: "Owner of the repo" },
        repo: { type: Type.STRING, description: "Name of the repo" },
        newBranchName: {
          type: Type.STRING,
          description: "Name for new branch",
        },
        baseBranch: {
          type: Type.STRING,
          description: "Base branch name (defaults to main)",
        },
      },
      required: ["owner", "repo", "newBranchName"],
    },
  },
  {
    name: "github_list_branches",
    description: "Lists all branches for a repository.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        owner: { type: Type.STRING, description: "Owner of the repo" },
        repo: { type: Type.STRING, description: "Name of the repo" },
      },
      required: ["owner", "repo"],
    },
  },
  {
    name: "github_get_commits",
    description: "Gets recent commits from a branch since an ISO date string.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        owner: { type: Type.STRING, description: "Owner of the repo" },
        repo: { type: Type.STRING, description: "Name of the repo" },
        baseBranch: { type: Type.STRING, description: "Base branch name" },
        since: { type: Type.STRING, description: "ISO date string" },
      },
      required: ["owner", "repo", "since"],
    },
  },
  {
    name: "github_create_issue",
    description: "Creates an issue in a repository.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        owner: { type: Type.STRING, description: "Owner of the repo" },
        repo: { type: Type.STRING, description: "Name of the repo" },
        title: { type: Type.STRING, description: "Issue title" },
        body: { type: Type.STRING, description: "Issue description" },
      },
      required: ["owner", "repo", "title", "body"],
    },
  },
  {
    name: "github_get_issues",
    description: "Lists issues in a repository with optional filters.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        owner: { type: Type.STRING, description: "Owner of the repo" },
        repo: { type: Type.STRING, description: "Name of the repo" },
        mentioned: {
          type: Type.STRING,
          description: "User mentioned in issue",
        },
        creator: { type: Type.STRING, description: "Creator of issue" },
      },
      required: ["owner", "repo"],
    },
  },
  {
    name: "github_create_comment_on_issue",
    description: "Creates a comment on an issue or pull request.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        owner: { type: Type.STRING, description: "Owner of the repo" },
        repo: { type: Type.STRING, description: "Name of the repo" },
        issueNumber: { type: Type.NUMBER, description: "Issue/PR number" },
        body: { type: Type.STRING, description: "Comment body text" },
      },
      required: ["owner", "repo", "issueNumber", "body"],
    },
  },
  {
    name: "github_list_releases",
    description: "Lists repository releases.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        owner: { type: Type.STRING, description: "Owner of the repo" },
        repo: { type: Type.STRING, description: "Name of the repo" },
        page: { type: Type.NUMBER, description: "Page number" },
      },
      required: ["owner", "repo"],
    },
  },
  {
    name: "github_get_tag_releases",
    description: "Gets a release by tag name.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        owner: { type: Type.STRING, description: "Owner of the repo" },
        repo: { type: Type.STRING, description: "Name of the repo" },
        tag: { type: Type.STRING, description: "Tag name" },
      },
      required: ["owner", "repo", "tag"],
    },
  },
  {
    name: "github_search_topics",
    description: "Searches GitHub topics.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        q: { type: Type.STRING, description: "Search query string" },
        page: { type: Type.NUMBER, description: "Pagination page" },
      },
      required: ["q"],
    },
  },
  {
    name: "github_search_repos",
    description: "Searches GitHub repositories.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        q: { type: Type.STRING, description: "Search query string" },
        page: { type: Type.NUMBER, description: "Pagination page" },
      },
      required: ["q"],
    },
  },
  {
    name: "github_search_issues_and_prs",
    description: "Searches GitHub issues and pull requests.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        q: { type: Type.STRING, description: "Search query string" },
        sort: { type: Type.STRING, description: "Sort field" },
        page: { type: Type.NUMBER, description: "Pagination page" },
      },
      required: ["q"],
    },
  },
  {
    name: "github_search_users",
    description: "Searches GitHub users.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        q: { type: Type.STRING, description: "Search query string" },
        page: { type: Type.NUMBER, description: "Pagination page" },
      },
      required: ["q"],
    },
  },
  {
    name: "github_accept_repo_invite",
    description: "Accepts a repository invitation.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        owner: { type: Type.STRING, description: "Owner of the repo" },
        repo: { type: Type.STRING, description: "Name of the repo" },
        invitationId: { type: Type.NUMBER, description: "Invitation ID" },
      },
      required: ["owner", "repo", "invitationId"],
    },
  },
  {
    name: "github_create_repo",
    description: "Creates a new repository for authenticated user.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING, description: "Repository name" },
        description: {
          type: Type.STRING,
          description: "Repository description",
        },
        isPrivate: { type: Type.BOOLEAN, description: "Is repository private" },
      },
      required: ["name", "description", "isPrivate"],
    },
  },
  {
    name: "github_create_fork",
    description: "Forks a repository for authenticated user.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        owner: { type: Type.STRING, description: "Owner of the repo" },
        repo: { type: Type.STRING, description: "Name of the repo" },
      },
      required: ["owner", "repo"],
    },
  },
];

/**
 * Runs the Gemini Agent loop. Evaluates user prompts, executes tool calls as requested by Gemini,
 * feeds execution results back to Gemini, and returns the final human-readable response.
 *
 * @param userPrompt - User's prompt text
 * @param geminiApiKey - User's Gemini API key
 * @param githubToken - User's temporary GitHub Access Token
 * @returns Final synthesized text response from Gemini
 */
export async function runGeminiAgent(
  userPrompt: string,
  geminiApiKey: string,
  githubToken?: string,
): Promise<string> {
  if (!geminiApiKey) {
    throw new Error("Gemini API key is required to execute agentic queries.");
  }

  const mcpServer = createMcpServer();
  const [clientTransport, serverTransport] =
    InMemoryTransport.createLinkedPair();
  const mcpClient = new Client({
    name: "DevLoom Gemini Agent",
    version: "1.0.0",
  });

  try {
    await mcpServer.connect(serverTransport);
    await mcpClient.connect(clientTransport);

    const ai = new GoogleGenAI({ apiKey: geminiApiKey });

    const systemInstruction = `
You are DevLoom, an intelligent developer assistant.
You have direct access to a set of GitHub tools.
Analyze the user's intent and execute any necessary tool calls.
If multiple tool calls are required to complete a multi-step task, execute them step-by-step.
Synthesize the technical results into concise, clear, and voice-friendly summaries for Alexa/Web users.
`;

    const chat = ai.chats.create({
      model: "gemini-3.6-flash",
      config: {
        systemInstruction,
        tools: [{ functionDeclarations: githubToolDeclarations }],
      },
    });

    let response = await chat.sendMessage({ message: userPrompt });

    const maxIterations = 8;
    let iteration = 0;

    while (iteration < maxIterations) {
      const functionCalls = response.functionCalls;

      if (!functionCalls || functionCalls.length === 0) {
        break;
      }

      const functionResponses = [];
      for (const call of functionCalls) {
        if (!call.name) {
          continue;
        }

        const toolArgs = (call.args as Record<string, unknown>) || {};
        const result = await mcpClient.callTool({
          name: call.name,
          arguments: {
            ...toolArgs,
            ...(githubToken ? { token: githubToken } : {}),
          },
        });
        const content: unknown = result.content;
        const executionResult = Array.isArray(content)
          ? content
              .filter(
                (item: unknown): item is { type: "text"; text: string } =>
                  typeof item === "object" &&
                  item !== null &&
                  "type" in item &&
                  item.type === "text" &&
                  "text" in item &&
                  typeof item.text === "string",
              )
              .map((item) => item.text)
              .join("\n")
          : typeof content === "string"
            ? content
            : JSON.stringify(content ?? "");

        functionResponses.push({
          functionResponse: {
            name: call.name,
            response: { output: executionResult },
          },
        });
      }

      if (functionResponses.length === 0) {
        break;
      }

      response = await chat.sendMessage({ message: functionResponses });
      iteration++;
    }

    return response.text || "Task executed successfully.";
  } finally {
    await Promise.allSettled([mcpClient.close(), mcpServer.close()]);
  }
}
