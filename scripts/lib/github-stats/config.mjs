import { THEMES, resolveTheme } from "./theme.mjs";

const DEFAULT_THEME = THEMES.dark;

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
  const themeName = overrides.themeName || process.env.GITHUB_STATS_THEME || "dark";
  const theme = {
    ...resolveTheme(themeName),
    ...(overrides.theme || {})
  };

  return {
    username,
    outputDir,
    includeAllCommits,
    topLanguagesCount,
    excludedRepos,
    themeName,
    theme
  };
}

export { DEFAULT_THEME, buildRuntimeConfig, parseBoolean, parseInteger, parseList };
