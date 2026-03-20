import http from "node:http";
import { buildRuntimeConfig, parseBoolean, parseInteger, parseList } from "./lib/github-stats/config.mjs";
import { fetchUserStats } from "./lib/github-stats/fetch-user-stats.mjs";
import { fetchTopLanguages } from "./lib/github-stats/fetch-top-languages.mjs";
import { renderStatsSvg } from "./lib/github-stats/render-stats-svg.mjs";
import { renderTopLangsSvg } from "./lib/github-stats/render-top-langs-svg.mjs";

function writeSvg(res, svg) {
  res.writeHead(200, {
    "Content-Type": "image/svg+xml; charset=utf-8",
    "Cache-Control": "public, max-age=3600"
  });
  res.end(svg);
}

function writeJson(res, statusCode, payload) {
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://127.0.0.1");
  const baseConfig = buildRuntimeConfig({
    username: url.searchParams.get("username") || undefined,
    includeAllCommits: parseBoolean(url.searchParams.get("include_all_commits")),
    topLanguagesCount: parseInteger(url.searchParams.get("langs_count"), 6),
    excludedRepos: parseList(url.searchParams.get("excluded_repos"))
  });

  try {
    if (url.pathname === "/api/stats") {
      const stats = await fetchUserStats(baseConfig.username, {
        includeAllCommits: baseConfig.includeAllCommits,
        excludedRepos: baseConfig.excludedRepos
      });
      return writeSvg(res, renderStatsSvg(stats, baseConfig.theme));
    }

    if (url.pathname === "/api/top-langs") {
      const languages = await fetchTopLanguages(baseConfig.username, {
        excludedRepos: baseConfig.excludedRepos,
        limit: baseConfig.topLanguagesCount
      });
      return writeSvg(res, renderTopLangsSvg(languages, baseConfig.username, baseConfig.theme));
    }

    return writeJson(res, 404, {
      message: "Not found",
      availableRoutes: ["/api/stats", "/api/top-langs"]
    });
  } catch (error) {
    return writeJson(res, 500, { message: error.message });
  }
});

const port = Number.parseInt(process.env.PORT || "9000", 10);
server.listen(port, "0.0.0.0", () => {
  console.log(`Readme stats server listening on http://127.0.0.1:${port}`);
});
