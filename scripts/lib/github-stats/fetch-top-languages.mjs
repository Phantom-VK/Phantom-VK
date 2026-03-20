import { githubGraphQL } from "./github-client.mjs";

const TOP_LANGUAGES_QUERY = `
  query ReadmeStatsLanguages($login: String!, $after: String) {
    user(login: $login) {
      repositories(ownerAffiliations: OWNER, isFork: false, privacy: PUBLIC, first: 100, after: $after, orderBy: { field: PUSHED_AT, direction: DESC }) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          name
          languages(first: 10, orderBy: { field: SIZE, direction: DESC }) {
            edges {
              size
              node {
                name
                color
              }
            }
          }
        }
      }
    }
  }
`;

const LANGUAGE_ALIASES = Object.freeze({
  "Jupyter Notebook": {
    name: "Python",
    color: "#3572A5"
  }
});

function normalizeLanguage(language) {
  const alias = LANGUAGE_ALIASES[language.name];

  if (!alias) {
    return language;
  }

  return {
    ...language,
    name: alias.name,
    color: alias.color || language.color
  };
}

async function fetchTopLanguages(username, options = {}) {
  const languageTotals = new Map();
  let hasNextPage = true;
  let after = null;

  while (hasNextPage) {
    const data = await githubGraphQL(TOP_LANGUAGES_QUERY, { login: username, after });
    const user = data.user;

    if (!user) {
      throw new Error(`GitHub user "${username}" was not found.`);
    }

    for (const repo of user.repositories.nodes) {
      if (options.excludedRepos?.includes(repo.name)) {
        continue;
      }

      for (const edge of repo.languages.edges) {
        const normalized = normalizeLanguage({
          name: edge.node.name,
          color: edge.node.color || "#8b949e"
        });
        const current = languageTotals.get(normalized.name) || {
          name: normalized.name,
          color: normalized.color || "#8b949e",
          size: 0
        };

        current.size += edge.size;
        if (!current.color && normalized.color) {
          current.color = normalized.color;
        }

        languageTotals.set(normalized.name, current);
      }
    }

    hasNextPage = user.repositories.pageInfo.hasNextPage;
    after = user.repositories.pageInfo.endCursor;
  }

  const languages = [...languageTotals.values()].sort((a, b) => b.size - a.size);
  const totalSize = languages.reduce((sum, language) => sum + language.size, 0);
  const sliced = languages.slice(0, options.limit || 6).map((language) => ({
    ...language,
    share: totalSize === 0 ? 0 : (language.size / totalSize) * 100
  }));

  return {
    totalSize,
    languages: sliced
  };
}

export { fetchTopLanguages };
