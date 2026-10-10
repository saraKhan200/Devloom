import { getOctokit } from "./client.js";

/**
 * lists the releases for a repo
 * @param owner - the name of the owner
 * @param repo - the name of the repo
 * @param page - the pagination page number
 * @param token - the auth token
 * @returns string
 */
export async function listReleases(
  owner: string,
  repo: string,
  page?: number,
  token?: string,
): Promise<string> {
  const octokit = getOctokit(token);
  const data = await octokit.rest.repos.listReleases({
    owner,
    repo,
    page,
  });

  if (data?.status > 299) {
    return `unknown error-couldnt make the issue,status:${data?.status},url:${data?.url} ${owner}/${repo}.`;
  }

  // Format array into a clean speech summary string for Alexa
  const releasesSummary = data?.data
    .map((item) => {
      return `${item?.tag_name}-${item?.body} , created by ${item?.author?.login ?? item?.author?.name} for ${item?.target_commitish} branch, at ${item?.published_at} ,check - ${item?.html_url}`;
    })
    .join(". \n");

  return `Releases found - ${releasesSummary}`;
}

/**
 * returns a release based on the provided 'tag'
 * @param owner - the nameof the repo,s owner
 * @param repo - the name of the repo
 * @param tag - the 'tag' based on which you want to get a release
 * @param token - the auth token
 * @returns string
 */
export async function getTagReleases(
  owner: string,
  repo: string,
  tag: string,
  token?: string,
): Promise<string> {
  const octokit = getOctokit(token);
  const data = await octokit.rest.repos.getReleaseByTag({
    owner,
    repo,
    tag,
  });

  if (data?.status > 299) {
    return `unknown error-couldnt make the issue,status:${data?.status},url:${data?.url} ${owner}/${repo}.`;
  }

  // Format array into a clean speech summary string for Alexa

  return `${data?.data?.name}-${data?.data?.body} , created by ${data?.data?.author?.login ?? data?.data?.author?.name} for ${data?.data?.target_commitish} branch, at ${data?.data?.published_at} ,check - ${data?.data.html_url} , download from ${data?.data?.url}`;
}
