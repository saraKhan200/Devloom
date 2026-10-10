import { getOctokit } from "./client.js";

/**
 *
 * @param owner - the ownerof the repo
 * @param repo - the name of the repo
 * @param baseBranch - the base branch of the repo
 * @param since - the date after whihc commits are responded
 * @param token - the auth token
 * @returns - string
 */
export async function getCommits(
  owner: string,
  repo: string,
  baseBranch: string = "main",
  since: string,
  token?: string,
) {
  const octokit = getOctokit(token);
  const data = await octokit.rest.repos.listCommits({
    owner,
    repo,
    since,
    ref: `heads/${baseBranch}`,
  });

  if (data?.status > 299) {
    return `Error occured, status${data.status}. check ${data?.url}`;
  }

  const commitSummary = data?.data
    .map((commit) => {
      `"${commit?.commit?.message}" - commit stats-${commit?.stats},by-${commit?.author?.login ?? commit?.author?.email ?? "Unknown User"},committed on-${commit?.commit?.committer?.date}`;
    })
    .join(", \n");

  return `last ${data?.data.length} commits - ${commitSummary}`;
}
