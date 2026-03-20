import { buildSvgDocument, escapeXml, formatCompactNumber, truncateText } from "./render-shared.mjs";

function renderStatBlock({ x, y, label, value, accent, icon, width = 186 }) {
  return `
    <g transform="translate(${x} ${y})">
      <rect width="${width}" height="44" rx="12" fill="rgba(13,17,23,0.46)" stroke="rgba(240,246,252,0.08)" />
      <circle cx="18" cy="22" r="9" fill="${accent}" fill-opacity="0.18" />
      <text x="18" y="25" text-anchor="middle" style="fill:${accent}; font: 700 10px 'Segoe UI', Ubuntu, Sans-Serif;">${escapeXml(icon)}</text>
      <text x="34" y="18" class="label">${escapeXml(label)}</text>
      <text x="34" y="32" class="value">${escapeXml(value)}</text>
    </g>
  `;
}

function renderRankBadge(stats, theme) {
  return `
    <g transform="translate(318 28)">
      <rect width="88" height="38" rx="12" fill="rgba(13,17,23,0.58)" stroke="rgba(240,246,252,0.08)" />
      <text x="14" y="15" class="small">Rank</text>
      <text x="14" y="31" style="fill:${theme.title}; font: 800 18px 'Segoe UI', Ubuntu, Sans-Serif;">${escapeXml(
        stats.rank.level
      )}</text>
      <text x="74" y="31" text-anchor="end" class="small">@${escapeXml(stats.login)}</text>
    </g>
  `;
}

function renderStatsSvg(stats, theme) {
  const title = `${stats.name}'s GitHub Stats`;
  const subtitle = truncateText(`${stats.name} • ${stats.login}`, 34);
  const body = `
    <rect x="16" y="16" width="398" height="68" rx="16" fill="rgba(13,17,23,0.56)" stroke="rgba(240,246,252,0.08)" />
    <rect x="28" y="28" width="78" height="20" rx="10" fill="url(#accent-gradient)" opacity="0.2" />
    <text x="67" y="41" text-anchor="middle" class="pill">GitHub Stats</text>
    <text x="28" y="64" class="title">GitHub Stats</text>
    <text x="28" y="78" class="meta">${escapeXml(subtitle)}</text>

    ${renderRankBadge(stats, theme)}

    ${renderStatBlock({
      x: 16,
      y: 98,
      label: "Stars",
      value: formatCompactNumber(stats.totalStars),
      accent: theme.warning,
      icon: "★"
    })}
    ${renderStatBlock({
      x: 212,
      y: 98,
      label: "Repos",
      value: formatCompactNumber(stats.totalRepos),
      accent: theme.accent,
      icon: "▣"
    })}
    ${renderStatBlock({
      x: 16,
      y: 150,
      label: "PRs",
      value: formatCompactNumber(stats.totalPRs),
      accent: theme.success,
      icon: "⇄"
    })}
    ${renderStatBlock({
      x: 212,
      y: 150,
      label: "Issues",
      value: formatCompactNumber(stats.totalIssues),
      accent: theme.accentSoft,
      icon: "!"
    })}
    ${renderStatBlock({
      x: 16,
      y: 202,
      label: "Commits",
      value: formatCompactNumber(stats.totalCommits),
      accent: theme.accent,
      icon: "↺"
    })}
    ${renderStatBlock({
      x: 212,
      y: 202,
      label: "Reviews",
      value: formatCompactNumber(stats.totalReviews),
      accent: theme.success,
      icon: "✓"
    })}
    ${renderStatBlock({
      x: 16,
      y: 254,
      label: "Followers",
      value: formatCompactNumber(stats.followers),
      accent: theme.warning,
      icon: "◎"
    })}
    ${renderStatBlock({
      x: 212,
      y: 254,
      label: "Contribs",
      value: formatCompactNumber(stats.contributedTo),
      accent: theme.accentSoft,
      icon: "↗"
    })}
  `;

  return buildSvgDocument({
    width: 430,
    height: 316,
    theme,
    title,
    body
  });
}

export { renderStatsSvg };
