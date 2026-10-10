import { z } from "zod";

// ==========================================
// Branch Schemas
// ==========================================

export const createBranchSchema = z.object({
  owner: z.string().describe("The owner of the repo"),
  repo: z.string().describe("The name of the repo"),
  newBranchName: z.string().describe("The name of the new branch to create"),
  baseBranch: z
    .string()
    .default("main")
    .describe("The base branch from which to create the new branch"),
  token: z
    .string()
    .optional()
    .describe("GitHub Personal Access Token for authentication"),
});

export const listBranchesSchema = z.object({
  owner: z.string().describe("The owner of the repo"),
  repo: z.string().describe("The name of the repo"),
  token: z
    .string()
    .optional()
    .describe("GitHub Personal Access Token for authentication"),
});

// ==========================================
// Commit Schemas
// ==========================================

export const getCommitsSchema = z.object({
  owner: z.string().describe("The owner of the repo"),
  repo: z.string().describe("The name of the repo"),
  baseBranch: z
    .string()
    .default("main")
    .describe("The base branch of the repo"),
  since: z
    .string()
    .describe("The date after which commits are returned (ISO date string)"),
  token: z
    .string()
    .optional()
    .describe("GitHub Personal Access Token for authentication"),
});

// ==========================================
// Issue Schemas
// ==========================================

export const createIssuesSchema = z.object({
  owner: z.string().describe("The owner of the repo"),
  repo: z.string().describe("The name of the repo"),
  title: z.string().describe("The title of the issue"),
  body: z.string().describe("The main body string of the issue"),
  token: z
    .string()
    .optional()
    .describe("GitHub Personal Access Token for authentication"),
});

export const getIssuesSchema = z.object({
  owner: z.string().describe("The owner of the repo"),
  repo: z.string().describe("The name of the repo"),
  mentioned: z
    .string()
    .optional()
    .describe("Filter by user mentioned in the issue"),
  creator: z.string().optional().describe("Filter by the creator of the issue"),
  token: z
    .string()
    .optional()
    .describe("GitHub Personal Access Token for authentication"),
});

export const createCommentOnIssueSchema = z.object({
  owner: z.string().describe("The owner of the repo"),
  repo: z.string().describe("The name of the repo"),
  issueNumber: z
    .number()
    .describe("The issue or pull request number to comment on"),
  body: z.string().describe("The body text for the comment"),
  token: z
    .string()
    .optional()
    .describe("GitHub Personal Access Token for authentication"),
});

// ==========================================
// Pull Request Schemas
// ==========================================

export const listPullRequestsSchema = z.object({
  owner: z.string().describe("The owner of the repo"),
  state: z
    .enum(["open", "closed", "all"])
    .describe("The state filter for pull requests"),
  repo: z.string().describe("The name of the repo"),
  sort: z
    .enum(["created", "updated", "popularity", "long-running"])
    .describe("Property basis on which pull requests are sorted"),
  token: z
    .string()
    .optional()
    .describe("GitHub Personal Access Token for authentication"),
});

export const makePullRequestsSchema = z.object({
  owner: z.string().describe("The name of the owner of the repo"),
  repo: z.string().describe("The name of the repo to create a PR in"),
  head: z.string().describe("The branch where your changes are implemented"),
  base: z.string().describe("The target branch you want changes pulled into"),
  title: z.string().describe("The title for your PR"),
  body: z.string().describe("The main body (content) of your PR"),
  token: z
    .string()
    .optional()
    .describe("GitHub Personal Access Token for authentication"),
});

export const mergePullRequestsSchema = z.object({
  owner: z.string().describe("The owner of the repo"),
  repo: z.string().describe("The name of the repo"),
  pullNumber: z.number().describe("The pull request number (e.g., 1)"),
  commitTitle: z.string().describe("The commit title for the merge"),
  commitMessage: z.string().describe("The commit message for the merge"),
  token: z
    .string()
    .optional()
    .describe("GitHub Personal Access Token for authentication"),
});

// ==========================================
// Release Schemas
// ==========================================

export const listReleasesSchema = z.object({
  owner: z.string().describe("The name of the owner"),
  repo: z.string().describe("The name of the repo"),
  page: z.number().optional().describe("The pagination page number"),
  token: z
    .string()
    .optional()
    .describe("GitHub Personal Access Token for authentication"),
});

export const getTagReleasesSchema = z.object({
  owner: z.string().describe("The name of the repo owner"),
  repo: z.string().describe("The name of the repo"),
  tag: z.string().describe("The tag name to fetch the release for"),
  token: z
    .string()
    .optional()
    .describe("GitHub Personal Access Token for authentication"),
});

// ==========================================
// Search Schemas
// ==========================================

export const searchTopicsSchema = z.object({
  q: z.string().describe("The search query string"),
  page: z.number().optional().describe("The pagination page number"),
  token: z
    .string()
    .optional()
    .describe("GitHub Personal Access Token for authentication"),
});

export const searchReposSchema = z.object({
  q: z.string().describe("The search query string"),
  page: z.number().optional().describe("The pagination page number"),
  token: z
    .string()
    .optional()
    .describe("GitHub Personal Access Token for authentication"),
});

export const searchIssuesAndPRsSchema = z.object({
  q: z.string().describe("The search query string"),
  sort: z
    .enum([
      "comments",
      "reactions",
      "reactions-+1",
      "reactions--1",
      "reactions-smile",
      "reactions-thinking_face",
      "reactions-heart",
      "reactions-tada",
      "interactions",
      "created",
      "updated",
    ])
    .default("updated")
    .describe("Property basis on which search results are sorted"),
  page: z.number().optional().describe("The pagination page number"),
  token: z
    .string()
    .optional()
    .describe("GitHub Personal Access Token for authentication"),
});

export const searchUsersSchema = z.object({
  q: z.string().describe("The search query string"),
  page: z.number().optional().describe("The pagination page number"),
  token: z
    .string()
    .optional()
    .describe("GitHub Personal Access Token for authentication"),
});

// ==========================================
// User Schemas
// ==========================================

export const acceptRepoInviteSchema = z.object({
  owner: z.string().describe("The owner of the repo"),
  repo: z.string().describe("The name of the repo"),
  invitationId: z.number().describe("The invitation ID to accept"),
  token: z
    .string()
    .optional()
    .describe("GitHub Personal Access Token for authentication"),
});

export const createRepoSchema = z.object({
  name: z.string().describe("The name of the new repository"),
  description: z.string().describe("The repository description"),
  isPrivate: z.boolean().describe("Whether the repository should be private"),
  token: z
    .string()
    .optional()
    .describe("GitHub Personal Access Token for authentication"),
});

export const createforkSchema = z.object({
  owner: z.string().describe("The owner of the repository to fork"),
  repo: z.string().describe("The name of the repository to fork"),
  token: z
    .string()
    .optional()
    .describe("GitHub Personal Access Token for authentication"),
});

// Export inferred TypeScript types for all schemas
export type CreateBranchInput = z.infer<typeof createBranchSchema>;
export type ListBranchesInput = z.infer<typeof listBranchesSchema>;
export type GetCommitsInput = z.infer<typeof getCommitsSchema>;
export type CreateIssuesInput = z.infer<typeof createIssuesSchema>;
export type GetIssuesInput = z.infer<typeof getIssuesSchema>;
export type CreateCommentOnIssueInput = z.infer<
  typeof createCommentOnIssueSchema
>;
export type ListPullRequestsInput = z.infer<typeof listPullRequestsSchema>;
export type MakePullRequestsInput = z.infer<typeof makePullRequestsSchema>;
export type MergePullRequestsInput = z.infer<typeof mergePullRequestsSchema>;
export type ListReleasesInput = z.infer<typeof listReleasesSchema>;
export type GetTagReleasesInput = z.infer<typeof getTagReleasesSchema>;
export type SearchTopicsInput = z.infer<typeof searchTopicsSchema>;
export type SearchReposInput = z.infer<typeof searchReposSchema>;
export type SearchIssuesAndPRsInput = z.infer<typeof searchIssuesAndPRsSchema>;
export type SearchUsersInput = z.infer<typeof searchUsersSchema>;
export type AcceptRepoInviteInput = z.infer<typeof acceptRepoInviteSchema>;
export type CreateRepoInput = z.infer<typeof createRepoSchema>;
export type CreateForkInput = z.infer<typeof createforkSchema>;
