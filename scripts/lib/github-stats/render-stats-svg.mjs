import { buildSvgDocument, escapeXml, formatCompactNumber, formatNumber } from "./render-shared.mjs";

function renderStatBlock({ x, y, label, value, accent, icon, width = 205 }) {
  return `
    <g transform="translate(${x} ${y})">
      <rect width="${width}" height="58" rx="14" fill="rgba(13,17,23,0.5)" stroke="rgba(240,246,252,0.08)" />
      <rect x="14" y="14" width="24" height="24" rx="8" fill="${accent}" fill-opacity="0.18" />
      <text x="26" y="30" text-anchor="middle" style="fill:${accent}; font: 700 12px 'Segoe UI', Ubuntu, Sans-Serif;">${escapeXml(icon)}</text>
      <text x="50" y="26" class="label">${escapeXml(label)}</text>
      <text x="14" y="46" class="value">${escapeXml(value)}</text>
    </g>
  `;
}

function renderRankRing(stats, theme) {
  const normalized = Math.max(8, Math.min(96, stats.rank.score / 60));
  const circumference = 2 * Math.PI * 34;
  const offset = circumference - (normalized / 100) * circumference;

  return `
    <g transform="translate(387 78)">
      <circle cx="0" cy="0" r="34" fill="rgba(13,17,23,0.74)" stroke="rgba(240,246,252,0.06)" />
      <circle cx="0" cy="0" r="34" fill="none" stroke="rgba(88,166,255,0.2)" stroke-width="6" />
      <circle
        cx="0"
        cy="0"
        r="34"
        fill="none"
        stroke="url(#accent-gradient)"
        stroke-width="6"
        stroke-linecap="round"
        stroke-dasharray="${circumference.toFixed(2)}"
        stroke-dashoffset="${offset.toFixed(2)}"
        transform="rotate(-90 0 0)"
      />
      <text x="0" y="-3" text-anchor="middle" style="fill:${theme.title}; font: 800 22px 'Segoe UI', Ubuntu, Sans-Serif;">${escapeXml(
        stats.rank.level
      )}</text>
      <text x="0" y="15" text-anchor="middle" class="small" style="fill:${theme.muted};">${Math.round(normalized)} / 100</text>
    </g>
  `;
}

function renderStatsSvg(stats, theme) {
  const title = `${stats.name}'s GitHub Stats`;
  const body = `
    <rect x="20" y="20" width="455" height="104" rx="18" fill="rgba(13,17,23,0.62)" stroke="rgba(240,246,252,0.08)" />
    <rect x="32" y="34" width="92" height="24" rx="12" fill="url(#accent-gradient)" opacity="0.22" />
    <text x="78" y="50" text-anchor="middle" class="pill">GitHub Stats</text>
    <text x="32" y="84" class="title">${escapeXml(title)}</text>
    <text x="32" y="104" class="meta">@${escapeXml(stats.login)} • self-hosted card • GitHub dark palette</text>

    ${renderRankRing(stats, theme)}

    ${renderStatBlock({
      x: 20,
      y: 142,
      label: "Stars",
      value: formatCompactNumber(stats.totalStars),
      accent: theme.warning,
      icon: "★"
    })}
    ${renderStatBlock({
      x: 250,
      y: 142,
      label: "Repositories",
      value: formatCompactNumber(stats.totalRepos),
      accent: theme.accent,
      icon: "▣"
    })}
    ${renderStatBlock({
      x: 20,
      y: 210,
      label: "Pull Requests",
      value: formatCompactNumber(stats.totalPRs),
      accent: theme.success,
      icon: "⇄"
    })}
    ${renderStatBlock({
      x: 250,
      y: 210,
      label: "Issues",
      value: formatCompactNumber(stats.totalIssues),
      accent: theme.accentSoft,
      icon: "!"
    })}
    ${renderStatBlock({
      x: 20,
      y: 278,
      label: stats.commitWindowLabel,
      value: formatCompactNumber(stats.totalCommits),
      accent: theme.accent,
      icon: "↺"
    })}
    ${renderStatBlock({
      x: 250,
      y: 278,
      label: "Reviews",
      value: formatCompactNumber(stats.totalReviews),
      accent: theme.success,
      icon: "✓"
    })}
    ${renderStatBlock({
      x: 20,
      y: 346,
      label: "Followers",
      value: formatCompactNumber(stats.followers),
      accent: theme.warning,
      icon: "◎"
    })}
    ${renderStatBlock({
      x: 250,
      y: 346,
      label: "Contributed To",
      value: formatCompactNumber(stats.contributedTo),
      accent: theme.accentSoft,
      icon: "↗"
    })}

    <rect x="20" y="424" width="455" height="38" rx="12" fill="rgba(13,17,23,0.48)" stroke="rgba(240,246,252,0.06)" />
    <text x="32" y="447" class="small">Score ${formatNumber(stats.rank.score)} • refreshes from your own GitHub API workflow</text>
  `;

  return buildSvgDocument({
    width: 495,
    height: 482,
    theme,
    title,
    body
  });
}

export { renderStatsSvg };
