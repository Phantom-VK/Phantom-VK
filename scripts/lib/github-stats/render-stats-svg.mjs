
import {
  buildSvgDocument,
  escapeXml,
  formatCompactNumber,
  truncateText,
} from "./render-shared.mjs";

// ── SVG icon paths (GitHub Octicons) ───────────────────────────────────────

const ICONS = {
  star: `<path fill-rule="evenodd" d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25zm0 2.445L6.615 5.5a.75.75 0 01-.564.41l-3.097.45 2.24 2.184a.75.75 0 01.216.664l-.528 3.084 2.769-1.456a.75.75 0 01.698 0l2.77 1.456-.53-3.084a.75.75 0 01.216-.664l2.24-2.183-3.096-.45a.75.75 0 01-.564-.41L8 2.694v.001z"/>`,
  commit: `<path fill-rule="evenodd" d="M1.643 3.143L.427 1.927A.25.25 0 000 2.104V5.75c0 .138.112.25.25.25h3.646a.25.25 0 00.177-.427L2.715 4.215a6.5 6.5 0 11-1.18 4.458.75.75 0 10-1.493.154 8.001 8.001 0 101.6-5.684zM7.75 4a.75.75 0 01.75.75v2.992l2.028.812a.75.75 0 01-.557 1.392l-2.5-1A.75.75 0 017 8.25v-3.5A.75.75 0 017.75 4z"/>`,
  pr: `<path fill-rule="evenodd" d="M7.177 3.073L9.573.677A.25.25 0 0110 .854v4.792a.25.25 0 01-.427.177L7.177 3.427a.25.25 0 010-.354zM3.75 2.5a.75.75 0 100 1.5.75.75 0 000-1.5zm-2.25.75a2.25 2.25 0 113 2.122v5.256a2.251 2.251 0 11-1.5 0V5.372A2.25 2.25 0 011.5 3.25zM11 2.5h-1V4h1a1 1 0 011 1v5.628a2.251 2.251 0 101.5 0V5A2.5 2.5 0 0011 2.5zm1 10.25a.75.75 0 111.5 0 .75.75 0 01-1.5 0zM3.75 12a.75.75 0 100 1.5.75.75 0 000-1.5z"/>`,
  issue: `<path fill-rule="evenodd" d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8zm9 3a1 1 0 11-2 0 1 1 0 012 0zm-.25-6.25a.75.75 0 00-1.5 0v3.5a.75.75 0 001.5 0v-3.5z"/>`,
  review: `<path fill-rule="evenodd" d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z"/>`,
  repo: `<path fill-rule="evenodd" d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z"/>`,
  contribs: `<path fill-rule="evenodd" d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z"/>`,
  follower: `<path fill-rule="evenodd" d="M5.5 3.5a2 2 0 100 4 2 2 0 000-4zM2 5.5a3.5 3.5 0 115.898 2.549 5.507 5.507 0 013.034 4.084.75.75 0 11-1.482.235 4.001 4.001 0 00-7.9 0 .75.75 0 01-1.482-.236A5.507 5.507 0 013.102 8.05 3.49 3.49 0 012 5.5zM11 4a.75.75 0 100 1.5 1.5 1.5 0 01.666 2.844.75.75 0 00-.416.672v.352a.75.75 0 00.574.73c1.2.289 2.162 1.2 2.522 2.372a.75.75 0 11-1.434.438 2.502 2.502 0 00-2.388-1.86.75.75 0 010-1.5A3 3 0 0011 4z"/>`,
};

/**
 * renderIcon
 * Wraps an octicon path in a 16×16 SVG icon element.
 */
function renderIcon(pathKey) {
  return `<svg data-testid="icon" class="icon" viewBox="0 0 16 16" version="1.1" width="16" height="16">
      ${ICONS[pathKey] ?? ICONS.star}
    </svg>`;
}

/**
 * renderStatRow
 * One stat row: icon | label text ...dots... value
 *
 * Mirrors the reference layout exactly:
 *   - Row sits at y offset, staggered animation
 *   - Icon left at x=0, label at x=25, value right-aligned at valueX
 *   - Thin separator line below each row (except last)
 *
 * @param {object} opts
 * @param {string}  opts.icon       - key into ICONS
 * @param {string}  opts.label      - stat label text
 * @param {string}  opts.value      - formatted value string
 * @param {number}  opts.rowY       - y position of this row group
 * @param {number}  opts.delay      - animation-delay in ms
 * @param {number}  opts.valueX     - x for right-aligned value text
 * @param {boolean} [opts.showLine] - draw separator line below row
 * @param {number}  opts.lineWidth  - width of separator line
 */
function renderStatRow({ icon, label, value, rowY, delay, valueX, showLine = true, lineWidth }) {
  return `
  <g transform="translate(0, ${rowY})">
    <g class="stagger" style="animation-delay: ${delay}ms" transform="translate(25, 0)">
      ${renderIcon(icon)}
      <text class="stat bold" x="25" y="12.5">${escapeXml(label)}</text>
      <text class="stat bold" x="${valueX - 25}" y="12.5" text-anchor="end">${escapeXml(value)}</text>
    </g>
    ${showLine ? `<line x1="25" y1="22" x2="${lineWidth - 25}" y2="22" stroke="currentColor" stroke-opacity="0.07" stroke-width="1"/>` : ""}
  </g>`;
}

/**
 * renderRankCircle
 * Positioned top-right. Shows the rank level letter + "RANK" label.
 * dashOffset is computed from rank score (0-100): lower = more arc filled.
 *
 * @param {object} stats
 * @param {object} theme
 * @param {number} cx       
 * @param {number} cy    
 */
function renderRankCircle(stats, theme, cx, cy) {
  // dashoffset: 251 = empty, 0 = full. Map rank score (higher is better).
  // Default offset to show ~56% fill (B+ equivalent)
  const score = stats.rank?.score ?? 56;
  const dashOffset = (251 - (score / 100) * 251).toFixed(2);

  return `
  <g data-testid="rank-circle" transform="translate(${cx}, ${cy})">
    <!-- Rim -->
    <circle class="rank-circle-rim" cx="0" cy="0" r="40" />
    <!-- Animated arc -->
    <circle
      class="rank-circle"
      cx="0" cy="0" r="40"
      style="
        stroke-dasharray: 251;
        stroke-dashoffset: ${dashOffset};
        transform-origin: 0px 0px;
        transform: rotate(-90deg);
        animation: rankSpin 1s forwards ease-in-out;
      "
    />
    <!-- Rank letter -->
    <g class="rank-text">
      <text x="0" y="0"
        alignment-baseline="central"
        dominant-baseline="central"
        text-anchor="middle"
        data-testid="level-rank-icon"
        dy="0"
      >${escapeXml(stats.rank?.level ?? "B+")}</text>
    </g>
    <!-- RANK label below letter -->
    <text x="0" y="18"
      text-anchor="middle"
      class="rank-label"
    >RANK</text>
  </g>`;
}

/**
 * renderStatsSvg
 *
 * Full stats card. Width = 480, height scales with number of rows (8 rows default).
 *
 * @param {object} stats  - { name, login, rank, totalStars, totalRepos, totalPRs,
 *                            totalIssues, totalCommits, totalReviews, followers, contributedTo }
 * @param {object} theme  - color tokens
 */
function renderStatsSvg(stats, theme) {
  const W = 480;

  // ── Define which rows to show ──────────────────────────────────────────
  const rows = [
    { icon: "star",     label: "Total Stars Earned:",       value: formatCompactNumber(stats.totalStars) },
    { icon: "repo",     label: "Total Repos:",              value: formatCompactNumber(stats.totalRepos) },
    { icon: "commit",   label: "Total Commits (last year):",value: formatCompactNumber(stats.totalCommits) },
    { icon: "pr",       label: "Total PRs:",                value: formatCompactNumber(stats.totalPRs) },
    { icon: "issue",    label: "Total Issues:",             value: formatCompactNumber(stats.totalIssues) },
    { icon: "review",   label: "Total Reviews:",            value: formatCompactNumber(stats.totalReviews) },
    { icon: "follower", label: "Followers:",                value: formatCompactNumber(stats.followers) },
    { icon: "contribs", label: "Contributed to (last year):", value: formatCompactNumber(stats.contributedTo) },
  ];

  const ROW_H   = 28;   
  const BODY_Y  = 55;   
  const PAD_BOT = 20;
  const H = BODY_Y + rows.length * ROW_H + PAD_BOT;

  // Rank circle sits right of center, vertically centered in body
  const RANK_CX = W - 58;
  const RANK_CY = BODY_Y + (rows.length * ROW_H) / 2;

  // Value column: pushed left of rank circle
  const VALUE_X = RANK_CX - 56;

  const title = `${stats.name}'s GitHub Stats`;

  const rowsSvg = rows
    .map((row, i) =>
      renderStatRow({
        icon: row.icon,
        label: row.label,
        value: row.value,
        rowY: i * ROW_H,
        delay: 450 + i * 150,
        valueX: VALUE_X,
        showLine: i < rows.length - 1,
        lineWidth: VALUE_X + 20,
      })
    )
    .join("");

  const body = `
  <!-- Title -->
  <g data-testid="card-title" transform="translate(25, 35)">
    <text x="0" y="0" class="header" data-testid="header"
    >${escapeXml(truncateText(stats.name, 28))}'s GitHub Stats</text>
  </g>

  <!-- Stat rows -->
  <g data-testid="main-card-body" transform="translate(0, ${BODY_Y})">
    <svg x="0" y="0">
      ${rowsSvg}
    </svg>
  </g>

  <!-- Rank circle -->
  ${renderRankCircle(stats, theme, RANK_CX, RANK_CY)}`;

  return buildSvgDocument({ width: W, height: H, theme, title, body });
}

export { renderStatsSvg };
