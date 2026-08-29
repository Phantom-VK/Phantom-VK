// render-shared.mjs

const FONT_STACK = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function formatCompactNumber(value) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: value >= 1000 ? 1 : 0,
  }).format(value);
}

function formatPercent(value) {
  return `${value.toFixed(value >= 10 ? 0 : 1)}%`;
}

function truncateText(value, maxLength) {
  const input = String(value);
  if (input.length <= maxLength) return input;
  return `${input.slice(0, Math.max(0, maxLength - 1))}…`;
}

/**
 * buildSvgDocument
 *
 * Monochrome card shell shared by every rendered card:
 *   - theme.background fill, thin theme.line border, rx 10
 *   - Shared CSS: .eyebrow .title .stat-label .stat-value .rank-value .meta .icon
 *   - Fast stagger reveal (200ms, strong ease-out), no motion beyond opacity
 *     + a scaleX bar-fill, and a prefers-reduced-motion escape hatch.
 *
 * @param {object} opts
 * @param {number}  opts.width
 * @param {number}  opts.height
 * @param {object}  opts.theme       - color tokens (see theme.mjs)
 * @param {string}  opts.body        - inner SVG markup
 * @param {string}  opts.title       - accessibility title
 * @param {string}  [opts.idPrefix]  - unique prefix for this document's ids (multiple
 *                                     cards can be embedded together; ids must not collide)
 * @param {string}  [opts.extraDefs] - additional <defs> (clipPaths etc.)
 */
function buildSvgDocument({ width, height, theme, body, title, idPrefix = "card", extraDefs = "" }) {
  const titleId = `${idPrefix}-title`;
  const descId = `${idPrefix}-desc`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg
  width="${width}"
  height="${height}"
  viewBox="0 0 ${width} ${height}"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
  role="img"
  aria-labelledby="${titleId} ${descId}"
>
  <title id="${titleId}">${escapeXml(title)}</title>
  <desc id="${descId}">${escapeXml(title)}</desc>

  <defs>
    ${extraDefs}
  </defs>

  <style>
    text {
      font-family: ${FONT_STACK};
    }

    .eyebrow {
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.10em;
      text-transform: uppercase;
      fill: ${theme.muted};
    }

    .title {
      font-size: 15px;
      font-weight: 600;
      letter-spacing: -0.01em;
      fill: ${theme.text};
    }

    .stat-label {
      font-size: 13px;
      font-weight: 450;
      fill: ${theme.muted};
    }

    .stat-value {
      font-size: 15px;
      font-weight: 600;
      letter-spacing: -0.01em;
      fill: ${theme.text};
      font-variant-numeric: tabular-nums;
    }

    .rank-value {
      font-size: 30px;
      font-weight: 700;
      letter-spacing: -0.02em;
      fill: ${theme.text};
      font-variant-numeric: tabular-nums;
    }

    .meta {
      font-size: 10px;
      font-weight: 450;
      letter-spacing: 0.02em;
      fill: ${theme.muted};
      font-variant-numeric: tabular-nums;
    }

    .lang-name {
      font-size: 13px;
      font-weight: 450;
      fill: ${theme.text};
    }

    .icon {
      fill: ${theme.muted};
    }

    .stagger {
      opacity: 0;
      animation: fadeIn 200ms cubic-bezier(0.23, 1, 0.32, 1) forwards;
    }

    .lang-progress {
      transform-box: fill-box;
      transform-origin: left center;
      transform: scaleX(0);
      animation: growBar 200ms cubic-bezier(0.23, 1, 0.32, 1) forwards;
    }

    @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
    @keyframes growBar { from { transform: scaleX(0); } to { transform: scaleX(1); } }

    @media (prefers-reduced-motion: reduce) {
      .stagger { animation: none; opacity: 1; }
      .lang-progress { animation: none; transform: scaleX(1); }
    }
  </style>

  <!-- Card surface -->
  <rect x="0.5" y="0.5" rx="10"
    width="${width - 1}" height="${height - 1}"
    fill="${theme.background}"
    stroke="${theme.line}"
  />

  ${body}
</svg>`;
}

export {
  buildSvgDocument,
  escapeXml,
  formatCompactNumber,
  formatPercent,
  truncateText,
};
