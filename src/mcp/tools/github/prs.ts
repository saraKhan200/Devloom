// Inside src/mcp/tools/github/prs.ts
import { getOctokit } from "./client.js";

/**
 *
 * @param owner - the owner of the repo
 * @param state - the state of the repo
 * @param repo - the name of the repo
 * @param sort - sorted on what basis ,can be "created" | "updated" | "popularity" | "long-running"
 * @param token - the auth token
 * @returns string
 */
export async function listPullRequests(
  owner: string,
  state: "open" | "closed" | "all",
  repo: string,
  sort: "created" | "updated" | "popularity" | "long-running",
  token?: string,
): Promise<string> {
  const octokit = getOctokit(token);
  const { data } = await octokit.rest.pulls.list({
    owner,
    state,
    repo,
    sort,
  });

  if (data.length === 0) {
    return `No open pull requests found for ${owner}/${repo}.`;
  }

  // Format array into a clean speech summary string for Alexa
  const prSummary = data
    .map(
      (pr) =>
        `#${pr.number}-${pr.title},body - ${pr?.body} , author - ${pr?.user?.login ?? pr?.user?.email ?? "unknown author"} , status:${pr?.state},check ${pr?.url}`,
    )
    .join(", \n");
  return `Found ${data.length} open pull requests: ${prSummary}`;
}

/**
 *
 * @param owner - name of the ownerof the repo
 * @param repo - the name of the repo itself to whihc you want to create a PR
 * @param head - The name of the branch where your changes are implemented,usually 'main'
 * @param base - tThe name of the branch you want the changes pulled into. This should be an existing branch on the current repository.
 * @param title - the title for your PR
 * @param body - the main body (content) of your PR
 * @param token - the Auth token
 * @returns - string
 */
export async function makePullRequests(
  owner: string,
  repo: string,
  head: string,
  base: string,
  title: string,
  body: string,
  token?: string,
): Promise<string> {
  const octokit = getOctokit(token);
  const data = await octokit.rest.pulls.create({
    owner,
    repo,
    title,
    head,
    base,
    body,
  });

  if (data?.status > 299) {
    return `unknown error,status:${data?.status},url:${data?.url} ${owner}/${repo}.`;
  }

  // Format array into a clean speech summary string for Alexa

  return `successfully made PR for repository - ${data?.data?.head?.repo?.name} , check - ${data.data?.html_url}`;
}

/**
 *
 * @param owner - the owner of the repo
 * @param repo - the nameof the repo
 * @param pullNumber - the Pull request number (eg - #1)
 * @param commitTitle - the commit Title for the merge
 * @param commitMessage - the commit Messagefor the merge
 * @param token the auth  token
 * @returns string
 */
export async function mergePullRequests(
  owner: string,
  repo: string,
  pullNumber: number,
  commitTitle: string,
  commitMessage: string,
  token?: string,
): Promise<string> {
  const octokit = getOctokit(token);
  const data = await octokit.rest.pulls.merge({
    owner,
    repo,
    pull_number: pullNumber,
    commit_title: commitTitle,
    commit_message: commitMessage,
  });

  if (data?.status > 299) {
    return `unknown error-couldnt merge Pull request,status:${data?.status},url:${data?.url} ${owner}/${repo}.`;
  }

  // Format array into a clean speech summary string for Alexa

  return `status:${data?.status} , merged PR-${data?.data?.merged} , message-${data?.data?.message} , sha-${data?.data?.sha}`;
}
