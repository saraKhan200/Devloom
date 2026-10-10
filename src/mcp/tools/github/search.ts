import { getOctokit } from "./client.js";

/**
 * searches topics with octokit,s search
 * @param q - the search query
 * @param page - the pagination page number
 * @param token - the  auth  token
 * @returns string
 */
export async function searchTopics(
  q: string,
  page?: number,
  token?: string,
): Promise<string> {
  const octokit = getOctokit(token);
  const data = await octokit.rest.search.topics({
    q,
    page,
  });

  if (data?.status > 299) {
    return `unknown error-couldnt find Topics,status:${data?.status},url:${data?.url}.`;
  }

  const topicSummary = data?.data?.items
    .map((item) => {
      return `${item?.name} - ${item?.description ?? item?.short_description ?? "no description found"}`;
    })
    .join(". \n");
  // Format array into a clean speech summary string for Alexa
  return `Topics found - ${topicSummary}`;
}

/**
 * searches Repos with octokit,s search
 * @param q - the search query
 * @param page - the pagination page number
 * @param token - the  auth  token
 * @returns string
 */
export async function searchRepos(
  q: string,
  page?: number,
  token?: string,
): Promise<string> {
  const octokit = getOctokit(token);
  const data = await octokit.rest.search.repos({
    q,
    page,
  });

  if (data?.status > 299) {
    return `unknown error-couldnt find repos,status:${data?.status},url:${data?.url}.`;
  }

  const reposSummary = data?.data?.items
    .map((item) => {
      return `${item?.name} - ${item?.description},owner - ${item?.owner?.name ?? item?.owner?.email ?? "unknown"},check - ${item?.html_url}`;
    })
    .join(". \n");
  // Format array into a clean speech summary string for Alexa
  return `Repos found - ${reposSummary}`;
}

/**
 * searches issues and Pull requests , with octokit,s search
 * @param q - the search query
 * @param sort - sort on bases
 * @param page - the pagination page number
 * @param token - the  auth  token
 * @returns string
 */
export async function searchIssuesAndPRs(
  q: string,
  sort:
    | "comments"
    | "reactions"
    | "reactions-+1"
    | "reactions--1"
    | "reactions-smile"
    | "reactions-thinking_face"
    | "reactions-heart"
    | "reactions-tada"
    | "interactions"
    | "created"
    | "updated" = "updated",
  page?: number,
  token?: string,
): Promise<string> {
  const octokit = getOctokit(token);
  const data = await octokit.rest.search.issuesAndPullRequests({
    q,
    sort,
    page,
  });

  if (data?.status > 299) {
    return `unknown error-couldnt find issues or PRs,status:${data?.status},url:${data?.url}.`;
  }

  const issuesSummary = data?.data?.items
    .map((item) => {
      return `${item?.title} - ${item?.body} . Created at - ${item?.created_at} , check - ${item?.html_url}`;
    })
    .join(". \n");
  // Format array into a clean speech summary string for Alexa
  return `Issues and PRs found - ${issuesSummary}`;
}

/**
 * searches users, with octokit,s search
 * @param q - the search query
 * @param page - the pagination page number
 * @param token - the  auth  token
 * @returns string
 */
export async function searchUsers(
  q: string,
  page?: number,
  token?: string,
): Promise<string> {
  const octokit = getOctokit(token);
  const data = await octokit.rest.search.users({
    q,
    page,
  });

  if (data?.status > 299) {
    return `unknown error-couldnt find Users,status:${data?.status},url:${data?.url}.`;
  }

  const userSummary = data?.data?.items
    .map((item) => {
      return `${item?.name ?? "unknown"} - ${item?.bio}. public repos - ${item?.public_repos},followers - ${item?.followers},following - ${item?.following},E-mail - ${item?.email ?? "not given"}`;
    })
    .join(". \n");
  // Format array into a clean speech summary string for Alexa
  return `Users found - ${userSummary}`;
}
