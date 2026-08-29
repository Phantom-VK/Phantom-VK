import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { buildRuntimeConfig } from "./lib/github-stats/config.mjs";
import { fetchUserStats } from "./lib/github-stats/fetch-user-stats.mjs";
import { fetchTopLanguages } from "./lib/github-stats/fetch-top-languages.mjs";
import { renderStatsSvg } from "./lib/github-stats/render-stats-svg.mjs";
import { renderTopLangsSvg } from "./lib/github-stats/render-top-langs-svg.mjs";
import { renderStackSvg } from "./lib/github-stats/render-stack-svg.mjs";
import { THEMES } from "./lib/github-stats/theme.mjs";

async function main() {
  const config = buildRuntimeConfig();
  await mkdir(config.outputDir, { recursive: true });

  // Fetch once, render once per theme — themes are a rendering concern only.
  const [stats, languages] = await Promise.all([
    fetchUserStats(config.username, {
      includeAllCommits: config.includeAllCommits,
      excludedRepos: config.excludedRepos
    }),
    fetchTopLanguages(config.username, {
      excludedRepos: config.excludedRepos,
      limit: config.topLanguagesCount
    })
  ]);

  const writes = Object.entries(THEMES).flatMap(([themeName, theme]) => [
    writeFile(join(config.outputDir, `stats-${themeName}.svg`), renderStatsSvg(stats, theme), "utf8"),
    writeFile(join(config.outputDir, `top-langs-${themeName}.svg`), renderTopLangsSvg(languages, config.username, theme), "utf8"),
    writeFile(join(config.outputDir, `stack-${themeName}.svg`), renderStackSvg(theme, stats.topRepos), "utf8")
  ]);

  await Promise.all(writes);

  console.log(`Generated README stats for ${config.username} in ${config.outputDir}/ (${Object.keys(THEMES).length} themes x 3 cards)`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
