import { githubGraphQL, githubRest } from "./github-client.mjs";

const USER_STATS_QUERY = `
  query ReadmeStatsUser($login: String!, $after: String, $from: DateTime) {
    user(login: $login) {
      name
      login
      followers {
        totalCount
      }
      repositories(ownerAffiliations: OWNER, isFork: false, privacy: PUBLIC, first: 100, after: $after, orderBy: { field: STARGAZERS, direction: DESC }) {
        totalCount
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          name
          stargazerCount
        }
      }
      pullRequests(first: 1) {
        totalCount
      }
      openIssues: issues(states: OPEN) {
        totalCount
      }
      closedIssues: issues(states: CLOSED) {
        totalCount
      }
      repositoriesContributedTo(first: 1, contributionTypes: [COMMIT, ISSUE, PULL_REQUEST, REPOSITORY]) {
        totalCount
      }
      contributionsCollection(from: $from) {
        totalCommitContributions
        totalPullRequestReviewContributions
      }
    }
  }
`;

function getContributionsFromDate() {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - 365);
  return date.toISOString();
}

function calculateRank(stats) {
  const score =
    stats.totalStars * 5 +
    stats.followers * 4 +
    stats.totalPRs * 2 +
    stats.totalIssues * 1.5 +
    stats.totalReviews * 2 +
    stats.totalCommits * 0.08 +
    stats.totalRepos * 3 +
    stats.contributedTo * 2;

  if (score >= 5000) return { level: "S", score: Math.round(score) };
  if (score >= 3000) return { level: "A+", score: Math.round(score) };
  if (score >= 1800) return { level: "A", score: Math.round(score) };
  if (score >= 1100) return { level: "A-", score: Math.round(score) };
  if (score >= 650) return { level: "B+", score: Math.round(score) };
  if (score >= 350) return { level: "B", score: Math.round(score) };
  if (score >= 175) return { level: "B-", score: Math.round(score) };
  if (score >= 75) return { level: "C+", score: Math.round(score) };

  return { level: "C", score: Math.round(score) };
}

async function fetchTotalCommits(username) {
  const data = await githubRest(
    `/search/commits?q=author:${encodeURIComponent(username)}`,
    { accept: "application/vnd.github.cloak-preview+json" }
  );

  return Number(data.total_count || 0);
}

async function fetchUserStats(username, options = {}) {
  let hasNextPage = true;
  let after = null;
  let summary = null;
  let totalStars = 0;

  while (hasNextPage) {
    const data = await githubGraphQL(USER_STATS_QUERY, {
      login: username,
      after,
      from: getContributionsFromDate()
    });

    const user = data.user;
    if (!user) {
      throw new Error(`GitHub user "${username}" was not found.`);
    }

    if (!summary) {
      summary = user;
    }

    const visibleRepos = user.repositories.nodes.filter(
      (repo) => !options.excludedRepos?.includes(repo.name)
    );

    totalStars += visibleRepos.reduce((sum, repo) => sum + repo.stargazerCount, 0);
    hasNextPage = user.repositories.pageInfo.hasNextPage;
    after = user.repositories.pageInfo.endCursor;
  }

  const totalCommits = options.includeAllCommits
    ? await fetchTotalCommits(username)
    : summary.contributionsCollection.totalCommitContributions;

  const stats = {
    name: summary.name || summary.login,
    login: summary.login,
    totalStars,
    totalRepos: summary.repositories.totalCount,
    totalPRs: summary.pullRequests.totalCount,
    totalIssues: summary.openIssues.totalCount + summary.closedIssues.totalCount,
    totalReviews: summary.contributionsCollection.totalPullRequestReviewContributions,
    totalCommits,
    followers: summary.followers.totalCount,
    contributedTo: summary.repositoriesContributedTo.totalCount,
    commitWindowLabel: options.includeAllCommits ? "Commits" : "Commits (1y)"
  };

  return {
    ...stats,
    rank: calculateRank(stats)
  };
}

export { fetchUserStats };
