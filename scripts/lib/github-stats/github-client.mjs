const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";
const GITHUB_REST_URL = "https://api.github.com";

function resolveGitHubToken() {
  const token =
    process.env.GH_TOKEN ||
    process.env.GH_STATS_TOKEN ||
    process.env.GITHUB_TOKEN ||
    process.env.PAT_1;

  if (!token) {
    throw new Error(
      "Missing GitHub token. Set GH_TOKEN, GH_STATS_TOKEN, GITHUB_TOKEN, or PAT_1."
    );
  }

  return token;
}

function buildHeaders(token, accept = "application/vnd.github+json") {
  return {
    Accept: accept,
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "User-Agent": "phantom-vk-readme-stats",
    "X-GitHub-Api-Version": "2022-11-28"
  };
}

async function readJsonResponse(response) {
  const data = await response.json();

  if (!response.ok) {
    const message = data?.message || `GitHub API request failed with status ${response.status}.`;
    throw new Error(message);
  }

  return data;
}

async function githubGraphQL(query, variables = {}, token = resolveGitHubToken()) {
  const response = await fetch(GITHUB_GRAPHQL_URL, {
    method: "POST",
    headers: buildHeaders(token),
    body: JSON.stringify({ query, variables })
  });

  const data = await readJsonResponse(response);

  if (data.errors?.length) {
    throw new Error(data.errors[0].message || "GitHub GraphQL query failed.");
  }

  return data.data;
}

async function githubRest(path, options = {}, token = resolveGitHubToken()) {
  const response = await fetch(`${GITHUB_REST_URL}${path}`, {
    method: options.method || "GET",
    headers: buildHeaders(token, options.accept),
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  return readJsonResponse(response);
}

export { githubGraphQL, githubRest, resolveGitHubToken };
