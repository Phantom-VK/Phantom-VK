import {
  buildSvgDocument,
  escapeXml,
  formatCompactNumber,
  truncateText,
} from "./render-shared.mjs";

// ── SVG icon paths (GitHub Octicons, 16x16) ────────────────────────────────
// Each stat gets a distinct glyph. (Previously review/repo/contribs shared
// one path — repo-forked and eye are used below to keep every row unique.)

const ICONS = {
  star: `<path fill-rule="evenodd" d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25zm0 2.445L6.615 5.5a.75.75 0 01-.564.41l-3.097.45 2.24 2.184a.75.75 0 01.216.664l-.528 3.084 2.769-1.456a.75.75 0 01.698 0l2.77 1.456-.53-3.084a.75.75 0 01.216-.664l2.24-2.183-3.096-.45a.75.75 0 01-.564-.41L8 2.694v.001z"/>`,
  commit: `<path fill-rule="evenodd" d="M1.643 3.143L.427 1.927A.25.25 0 000 2.104V5.75c0 .138.112.25.25.25h3.646a.25.25 0 00.177-.427L2.715 4.215a6.5 6.5 0 11-1.18 4.458.75.75 0 10-1.493.154 8.001 8.001 0 101.6-5.684zM7.75 4a.75.75 0 01.75.75v2.992l2.028.812a.75.75 0 01-.557 1.392l-2.5-1A.75.75 0 017 8.25v-3.5A.75.75 0 017.75 4z"/>`,
  pr: `<path fill-rule="evenodd" d="M7.177 3.073L9.573.677A.25.25 0 0110 .854v4.792a.25.25 0 01-.427.177L7.177 3.427a.25.25 0 010-.354zM3.75 2.5a.75.75 0 100 1.5.75.75 0 000-1.5zm-2.25.75a2.25 2.25 0 113 2.122v5.256a2.251 2.251 0 11-1.5 0V5.372A2.25 2.25 0 011.5 3.25zM11 2.5h-1V4h1a1 1 0 011 1v5.628a2.251 2.251 0 101.5 0V5A2.5 2.5 0 0011 2.5zm1 10.25a.75.75 0 111.5 0 .75.75 0 01-1.5 0zM3.75 12a.75.75 0 100 1.5.75.75 0 000-1.5z"/>`,
  issue: `<path fill-rule="evenodd" d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8zm9 3a1 1 0 11-2 0 1 1 0 012 0zm-.25-6.25a.75.75 0 00-1.5 0v3.5a.75.75 0 001.5 0v-3.5z"/>`,
  review: `<path d="M8 2c1.981 0 3.671.992 4.933 2.078 1.27 1.091 2.187 2.345 2.637 3.023a1.62 1.62 0 010 1.798c-.45.678-1.367 1.932-2.637 3.023C11.67 13.008 9.981 14 8 14c-1.981 0-3.671-.992-4.933-2.078C1.797 10.83.88 9.576.43 8.898a1.62 1.62 0 010-1.798c.45-.677 1.367-1.931 2.637-3.022C4.329 2.992 6.019 2 8 2zm0 4a2 2 0 100 4 2 2 0 000-4z"/>`,
  repo: `<path fill-rule="evenodd" d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z"/>`,
  contribs: `<path fill-rule="evenodd" d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zM3.75 12a.75.75 0 100 1.5.75.75 0 000-1.5zm8.75.75a.75.75 0 111.5 0 .75.75 0 01-1.5 0zm2.25-8.5a.75.75 0 100-1.5.75.75 0 000 1.5z"/>`,
  follower: `<path fill-rule="evenodd" d="M5.5 3.5a2 2 0 100 4 2 2 0 000-4zM2 5.5a3.5 3.5 0 115.898 2.549 5.507 5.507 0 013.034 4.084.75.75 0 11-1.482.235 4.001 4.001 0 00-7.9 0 .75.75 0 01-1.482-.236A5.507 5.507 0 013.102 8.05 3.49 3.49 0 012 5.5zM11 4a.75.75 0 100 1.5 1.5 1.5 0 01.666 2.844.75.75 0 00-.416.672v.352a.75.75 0 00.574.73c1.2.289 2.162 1.2 2.522 2.372a.75.75 0 11-1.434.438 2.502 2.502 0 00-2.388-1.86.75.75 0 010-1.5A3 3 0 0011 4z"/>`,
};

function renderIcon(pathKey) {
  return `<svg class="icon" viewBox="0 0 16 16" width="16" height="16">
      ${ICONS[pathKey] ?? ICONS.star}
    </svg>`;
}

/**
 * renderStatRow
 * One stat row: icon | label ...gap... value (right-aligned)
 *
 * @param {object} opts
 * @param {string}  opts.icon   - key into ICONS
 * @param {string}  opts.label  - stat label text
 * @param {string}  opts.value  - formatted value string
 * @param {number}  opts.rowY   - y position of this row group
 * @param {number}  opts.rowH   - row height (used to vertically center content)
 * @param {number}  opts.delay  - animation-delay in ms
 * @param {number}  opts.valueX - x for right-aligned value text
 */
function renderStatRow({ icon, label, value, rowY, rowH, delay, valueX }) {
  const iconY = (rowH - 16) / 2;
  const textY = rowH / 2 + 4.5;

  return `
  <g transform="translate(0, ${rowY})">
    <g class="stagger" style="animation-delay: ${delay}ms">
      <g transform="translate(0, ${iconY.toFixed(2)})">${renderIcon(icon)}</g>
      <text class="stat-label" x="24" y="${textY.toFixed(2)}">${escapeXml(label)}</text>
      <text class="stat-value" x="${valueX}" y="${textY.toFixed(2)}" text-anchor="end">${escapeXml(value)}</text>
    </g>
  </g>`;
}

function renderRankBadge(stats, theme, x, y, bw, bh) {
  const cx = bw / 2;

  return `
  <g transform="translate(${x}, ${y})">
    <rect width="${bw}" height="${bh}" rx="12" fill="${theme.surface}" stroke="${theme.line}" />
    <text x="${cx}" y="28" text-anchor="middle" class="eyebrow">Rank</text>
    <text x="${cx}" y="78" text-anchor="middle" class="rank-value">${escapeXml(stats.rank?.level ?? "B+")}</text>
    <text x="${cx}" y="108" text-anchor="middle" class="meta">SCORE ${escapeXml(String(Math.round(stats.rank?.score ?? 0)))}</text>
  </g>`;
}

/**
 * renderStatsSvg
 *
 * Fixed-canvas stats card (440x300) so it pairs exactly with the top-languages
 * card at 49%/49% in the README.
 *
 * @param {object} stats  - { name, login, rank, totalStars, totalRepos, totalPRs,
 *                            totalIssues, totalCommits, totalReviews, followers,
 *                            contributedTo, commitWindowLabel, topRepos }
 * @param {object} theme  - color tokens
 */
function renderStatsSvg(stats, theme) {
  const W = 440;
  const H = 300;
  const PAD = 28;

  const HEADER_BASELINE_Y = 40;
  const BODY_Y = 76;

  const BADGE_W = 108;
  const BADGE_H = 130;
  const BADGE_GAP = 20;
  const badgeX = W - PAD - BADGE_W;
  const statsColW = badgeX - PAD - BADGE_GAP;
  // Row content sits inside a <g transform="translate(PAD, BODY_Y)"> group, so
  // this must stay in that group's local coordinate space (not re-add PAD).
  const valueX = statsColW;

  const rows = [
    { icon: "star", label: "Total Stars Earned", value: formatCompactNumber(stats.totalStars) },
    { icon: "repo", label: "Total Repos", value: formatCompactNumber(stats.totalRepos) },
    { icon: "commit", label: stats.commitWindowLabel ?? "Commits", value: formatCompactNumber(stats.totalCommits) },
    { icon: "pr", label: "Total PRs", value: formatCompactNumber(stats.totalPRs) },
    { icon: "issue", label: "Total Issues", value: formatCompactNumber(stats.totalIssues) },
    { icon: "review", label: "Total Reviews", value: formatCompactNumber(stats.totalReviews) },
    { icon: "follower", label: "Followers", value: formatCompactNumber(stats.followers) },
    { icon: "contribs", label: "Contributed To", value: formatCompactNumber(stats.contributedTo) },
  ];

  const bodyHeight = H - BODY_Y - PAD;
  const rowH = bodyHeight / rows.length;

  const badgeY = BODY_Y + (bodyHeight - BADGE_H) / 2;

  const title = `${stats.name}'s GitHub Stats`;

  const rowsSvg = rows
    .map((row, i) =>
      renderStatRow({
        icon: row.icon,
        label: row.label,
        value: row.value,
        rowY: i * rowH,
        rowH,
        delay: i * 40,
        valueX,
      })
    )
    .join("");

  const body = `
  <!-- Title -->
  <text x="${PAD}" y="${HEADER_BASELINE_Y}" class="title">${escapeXml(truncateText(stats.name, 28))}'s GitHub Stats</text>

  <!-- Stat rows -->
  <g transform="translate(${PAD}, ${BODY_Y})">
    ${rowsSvg}
  </g>

  <!-- Rank badge -->
  ${renderRankBadge(stats, theme, badgeX, badgeY, BADGE_W, BADGE_H)}`;

  return buildSvgDocument({ width: W, height: H, theme, title, body, idPrefix: "stats" });
}

export { renderStatsSvg };
