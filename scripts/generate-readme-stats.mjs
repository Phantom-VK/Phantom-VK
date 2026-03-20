import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { buildRuntimeConfig } from "./lib/github-stats/config.mjs";
import { fetchUserStats } from "./lib/github-stats/fetch-user-stats.mjs";
import { fetchTopLanguages } from "./lib/github-stats/fetch-top-languages.mjs";
import { renderStatsSvg } from "./lib/github-stats/render-stats-svg.mjs";
import { renderTopLangsSvg } from "./lib/github-stats/render-top-langs-svg.mjs";

async function main() {
  const config = buildRuntimeConfig();
  await mkdir(config.outputDir, { recursive: true });

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

  const statsSvg = renderStatsSvg(stats, config.theme);
  const topLangsSvg = renderTopLangsSvg(languages, config.username, config.theme);

  await Promise.all([
    writeFile(join(config.outputDir, "stats.svg"), statsSvg, "utf8"),
    writeFile(join(config.outputDir, "top-langs.svg"), topLangsSvg, "utf8")
  ]);

  console.log(`Generated README stats for ${config.username} in ${config.outputDir}/`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
