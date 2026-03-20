import { buildSvgDocument, escapeXml, formatPercent } from "./render-shared.mjs";

function renderTopLangsSvg(result, username, theme) {
  const title = `${username}'s Top Languages`;
  const barWidth = 435;
  let offset = 0;

  const segments = result.languages
    .map((language) => {
      const width = Math.max((language.share / 100) * barWidth, 6);
      const segment = `<rect x="${offset.toFixed(2)}" y="0" width="${width.toFixed(2)}" height="16" fill="${language.color}" />`;
      offset += width;
      return segment;
    })
    .join("");

  const rows = result.languages
    .map((language, index) => {
      const rowY = 122 + index * 28;
      return `
        <circle cx="34" cy="${rowY - 5}" r="6" fill="${language.color}" />
        <text x="50" y="${rowY - 1}" class="value" style="font-size:15px;">${escapeXml(language.name)}</text>
        <text x="455" y="${rowY - 1}" text-anchor="end" class="meta">${formatPercent(language.share)}</text>
      `;
    })
    .join("");

  const body = `
    <rect x="20" y="20" width="455" height="72" rx="16" fill="${theme.panel}" />
    <text x="32" y="49" class="title">${escapeXml(title)}</text>
    <text x="32" y="69" class="meta">Aggregated from your owned public repositories</text>

    <g transform="translate(30 104)">
      <rect width="${barWidth}" height="16" rx="8" fill="rgba(255,255,255,0.06)" />
      <g clip-path="url(#lang-bar-clip)">
        ${segments}
      </g>
    </g>

    ${rows}
  `;

  return buildSvgDocument({
    width: 495,
    height: 122 + result.languages.length * 28 + 20,
    theme,
    title,
    extraDefs: `<clipPath id="lang-bar-clip"><rect width="${barWidth}" height="16" rx="8" /></clipPath>`,
    body
  });
}

export { renderTopLangsSvg };
