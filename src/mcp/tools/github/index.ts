import { createBranch, listBranches } from "./branch.js";
import { getCommits } from "./commits.js";
import { createIssues, getIssues, createCommentOnIssue } from "./issues.js";
import {
  makePullRequests,
  mergePullRequests,
  listPullRequests,
} from "./prs.js";
import { getTagReleases, listReleases } from "./releases.js";
import {
  searchUsers,
  searchIssuesAndPRs,
  searchRepos,
  searchTopics,
} from "./search.js";
import { acceptRepoInvite, createRepo, createfork } from "./user.js";

/**
 * this is THE main github export which contains and has all the github related functions as properties :D
 */
const github = {
  createBranch,
  listBranches,
  // below are commits functions
  getCommits,
  // below are the issues fucntions
  createIssues,
  getIssues,
  createCommentOnIssue,
  // below are the pull requests functions
  makePullRequests,
  mergePullRequests,
  listPullRequests,
  //   below are the releases functions
  getTagReleases,
  listReleases,
  // below are search functions
  searchUsers,
  searchIssuesAndPRs,
  searchRepos,
  searchTopics,
  //   below are the user,s functions
  acceptRepoInvite,
  createRepo,
  createfork,
};

export default github;
