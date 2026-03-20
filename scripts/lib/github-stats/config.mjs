const DEFAULT_THEME = Object.freeze({
  background: "#0d1117",
  panel: "#161b22",
  border: "#30363d",
  title: "#f0f6fc",
  text: "#c9d1d9",
  muted: "#8b949e",
  accent: "#58a6ff",
  accentSoft: "#1f6feb",
  success: "#3fb950",
  warning: "#d29922"
});

function parseBoolean(value, defaultValue = false) {
  if (value === undefined || value === null || value === "") {
    return defaultValue;
  }

  return ["1", "true", "yes", "on"].includes(String(value).toLowerCase());
}

function parseInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function parseList(value) {
  if (!value) {
    return [];
  }

  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildRuntimeConfig(overrides = {}) {
  const username = overrides.username || process.env.GITHUB_STATS_USERNAME || "phantom-vk";
  const outputDir = overrides.outputDir || process.env.GITHUB_STATS_OUTPUT_DIR || "profile";
  const includeAllCommits = parseBoolean(
    overrides.includeAllCommits ?? process.env.GITHUB_STATS_INCLUDE_ALL_COMMITS,
    false
  );
  const topLanguagesCount = parseInteger(
    overrides.topLanguagesCount ?? process.env.GITHUB_STATS_TOP_LANGS_COUNT,
    6
  );
  const excludedRepos = parseList(
    overrides.excludedRepos ?? process.env.GITHUB_STATS_EXCLUDED_REPOS
  );
  const theme = {
    ...DEFAULT_THEME,
    ...(overrides.theme || {})
  };

  return {
    username,
    outputDir,
    includeAllCommits,
    topLanguagesCount,
    excludedRepos,
    theme
  };
}

export { DEFAULT_THEME, buildRuntimeConfig, parseBoolean, parseInteger, parseList };
