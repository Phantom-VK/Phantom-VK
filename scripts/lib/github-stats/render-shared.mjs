// render-shared.mjs

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(value);
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
 * Clean dark card matching the reference github-readme-stats aesthetic:
 *   - #0D1117 background, thin #30363D border
 *   - Soft radial accent glow (top-left)
 *   - Shared CSS: .header .stat .label .stagger .rank-text .small .icon
 *   - Standard animations: fadeIn, scaleIn, rankSpin, growWidth
 *
 * @param {object} opts
 * @param {number}  opts.width
 * @param {number}  opts.height
 * @param {object}  opts.theme       - color tokens
 * @param {string}  opts.body        - inner SVG markup
 * @param {string}  opts.title       - accessibility title
 * @param {string}  [opts.extraDefs] - additional <defs> (clipPaths etc.)
 */
function buildSvgDocument({ width, height, theme, body, title, extraDefs = "" }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg
  width="${width}"
  height="${height}"
  viewBox="0 0 ${width} ${height}"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
  role="img"
  aria-labelledby="titleId descId"
>
  <title id="titleId">${escapeXml(title)}</title>
  <desc id="descId">${escapeXml(title)}</desc>

  <defs>
    <radialGradient id="ambient-glow" cx="0" cy="0" r="1"
      gradientUnits="userSpaceOnUse"
      gradientTransform="translate(0 0) scale(${(width * 0.8).toFixed(0)} ${(height * 1.1).toFixed(0)})">
      <stop offset="0%"   stop-color="${theme.accent}" stop-opacity="0.06" />
      <stop offset="100%" stop-color="${theme.accent}" stop-opacity="0"    />
    </radialGradient>
    ${extraDefs}
  </defs>

  <style>
    .header {
      font: 600 18px 'Segoe UI', Ubuntu, Sans-Serif;
      fill: ${theme.accent};
      animation: fadeIn 0.8s ease-in-out forwards;
    }
    @supports (-moz-appearance: auto) { .header { font-size: 15.5px; } }

    .stat {
      font: 600 14px 'Segoe UI', Ubuntu, 'Helvetica Neue', Sans-Serif;
      fill: ${theme.text};
    }
    @supports (-moz-appearance: auto) { .stat { font-size: 12px; } }

    .bold  { font-weight: 700; }
    .label { font: 600 11px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${theme.muted}; text-transform: uppercase; letter-spacing: 0.07em; }
    .small { font: 400 11px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${theme.muted}; }
    .lang-name { font: 400 11px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${theme.text}; }

    .rank-text  { font: 800 24px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${theme.text}; animation: scaleIn 0.3s ease-in-out forwards; }
    .rank-label { font: 600 9px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${theme.muted}; text-transform: uppercase; letter-spacing: 0.1em; }

    .icon { fill: ${theme.accent}; display: block; }

    .rank-circle-rim {
      stroke: ${theme.accent}; fill: none; stroke-width: 5; opacity: 0.18;
    }
    .rank-circle {
      stroke: ${theme.accent};
      stroke-dasharray: 250;
      fill: none;
      stroke-width: 5;
      stroke-linecap: round;
      opacity: 0.85;
      transform-origin: -10px 8px;
      transform: rotate(-90deg);
      animation: rankSpin 1s forwards ease-in-out;
    }

    .stagger { opacity: 0; animation: fadeIn 0.3s ease-in-out forwards; }

    .lang-progress { animation: growWidth 0.6s ease-in-out forwards; }
    #rect-mask rect { animation: slideIn 1s ease-in-out forwards; }

    @keyframes fadeIn   { from { opacity: 0; } to { opacity: 1; } }
    @keyframes scaleIn  { from { transform: translate(-5px,5px) scale(0); } to { transform: translate(-5px,5px) scale(1); } }
    @keyframes rankSpin { from { stroke-dashoffset: 251; } to { stroke-dashoffset: 110; } }
    @keyframes growWidth { from { width: 0; } to { width: 100%; } }
    @keyframes slideIn   { from { width: 0; } to { width: calc(100% - 100px); } }
  </style>

  <!-- Card surface -->
  <rect x="0.5" y="0.5" rx="8"
    width="${width - 1}" height="${height - 1}"
    fill="${theme.background}"
    stroke="${theme.border}" stroke-opacity="0.9"
  />
  <!-- Ambient glow overlay -->
  <rect x="0.5" y="0.5" rx="8"
    width="${width - 1}" height="${height - 1}"
    fill="url(#ambient-glow)"
  />

  ${body}
</svg>`;
}

export {
  buildSvgDocument,
  escapeXml,
  formatCompactNumber,
  formatNumber,
  formatPercent,
  truncateText,
};
