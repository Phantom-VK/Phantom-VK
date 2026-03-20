import { buildSvgDocument, escapeXml, formatCompactNumber, formatNumber } from "./render-shared.mjs";

function renderStatBlock({ x, y, label, value, accent, width = 200 }) {
  return `
    <g transform="translate(${x} ${y})">
      <rect width="${width}" height="52" rx="12" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.04)" />
      <rect x="14" y="16" width="10" height="10" rx="3" fill="${accent}" />
      <text x="34" y="25" class="label">${escapeXml(label)}</text>
      <text x="14" y="42" class="value">${escapeXml(value)}</text>
    </g>
  `;
}

function renderStatsSvg(stats, theme) {
  const title = `${stats.name}'s GitHub Stats`;
  const body = `
    <rect x="20" y="20" width="455" height="64" rx="16" fill="${theme.panel}" />
    <text x="32" y="48" class="title">${escapeXml(title)}</text>
    <text x="32" y="68" class="meta">@${escapeXml(stats.login)} • built from your own GitHub API backend</text>

    <g transform="translate(365 32)">
      <rect width="88" height="40" rx="20" fill="url(#accent-gradient)" opacity="0.18" />
      <text x="44" y="17" text-anchor="middle" class="label" style="fill:${theme.title}">Rank</text>
      <text x="44" y="31" text-anchor="middle" class="value" style="fill:${theme.title}; font-size:16px;">${escapeXml(stats.rank.level)}</text>
    </g>

    ${renderStatBlock({
      x: 20,
      y: 98,
      label: "Stars",
      value: formatCompactNumber(stats.totalStars),
      accent: theme.warning
    })}
    ${renderStatBlock({
      x: 255,
      y: 98,
      label: "Repositories",
      value: formatCompactNumber(stats.totalRepos),
      accent: theme.accent
    })}
    ${renderStatBlock({
      x: 20,
      y: 158,
      label: "Pull Requests",
      value: formatCompactNumber(stats.totalPRs),
      accent: theme.success
    })}
    ${renderStatBlock({
      x: 255,
      y: 158,
      label: "Issues",
      value: formatCompactNumber(stats.totalIssues),
      accent: theme.accentSoft
    })}
    ${renderStatBlock({
      x: 20,
      y: 218,
      label: stats.commitWindowLabel,
      value: formatCompactNumber(stats.totalCommits),
      accent: theme.accent
    })}
    ${renderStatBlock({
      x: 255,
      y: 218,
      label: "Reviews",
      value: formatCompactNumber(stats.totalReviews),
      accent: theme.success
    })}
    ${renderStatBlock({
      x: 20,
      y: 278,
      label: "Followers",
      value: formatCompactNumber(stats.followers),
      accent: theme.warning
    })}
    ${renderStatBlock({
      x: 255,
      y: 278,
      label: "Contributed To",
      value: formatCompactNumber(stats.contributedTo),
      accent: theme.accentSoft
    })}

    <text x="32" y="354" class="small">Score ${formatNumber(stats.rank.score)} • refresh this card with GitHub Actions on your schedule</text>
  `;

  return buildSvgDocument({
    width: 495,
    height: 380,
    theme,
    title,
    body
  });
}

export { renderStatsSvg };
