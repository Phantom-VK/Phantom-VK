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
    maximumFractionDigits: value >= 1000 ? 1 : 0
  }).format(value);
}

function formatPercent(value) {
  return `${value.toFixed(value >= 10 ? 0 : 1)}%`;
}

function buildSvgDocument({ width, height, theme, body, title, extraDefs = "" }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="title desc">
  <title id="title">${escapeXml(title)}</title>
  <desc id="desc">${escapeXml(title)}</desc>
  <defs>
    <linearGradient id="accent-gradient" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${theme.accent}" />
      <stop offset="100%" stop-color="${theme.success}" />
    </linearGradient>
    ${extraDefs}
  </defs>
  <style>
    .title { fill: ${theme.title}; font: 700 20px 'Segoe UI', Ubuntu, Sans-Serif; }
    .label { fill: ${theme.muted}; font: 600 11px 'Segoe UI', Ubuntu, Sans-Serif; letter-spacing: 0.08em; text-transform: uppercase; }
    .value { fill: ${theme.text}; font: 700 18px 'Segoe UI', Ubuntu, Sans-Serif; }
    .meta { fill: ${theme.muted}; font: 500 12px 'Segoe UI', Ubuntu, Sans-Serif; }
    .small { fill: ${theme.muted}; font: 500 11px 'Segoe UI', Ubuntu, Sans-Serif; }
  </style>
  <rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="16" fill="${theme.background}" stroke="${theme.border}" />
  ${body}
</svg>`;
}

export { buildSvgDocument, escapeXml, formatCompactNumber, formatNumber, formatPercent };
