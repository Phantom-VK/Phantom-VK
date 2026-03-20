import { buildSvgDocument, escapeXml, formatPercent } from "./render-shared.mjs";

function renderTopLangsSvg(result, username, theme) {
  const title = `${username}'s Top Languages`;
  const barWidth = 431;
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
      const rowY = 154 + index * 40;
      return `
        <g transform="translate(24 ${rowY - 24})">
          <rect width="447" height="28" rx="10" fill="rgba(13,17,23,0.46)" stroke="rgba(240,246,252,0.06)" />
          <circle cx="16" cy="14" r="6" fill="${language.color}" />
          <text x="30" y="18" class="value" style="font-size:14px;">${escapeXml(language.name)}</text>
          <text x="431" y="18" text-anchor="end" class="meta">${formatPercent(language.share)}</text>
        </g>
      `;
    })
    .join("");

  const body = `
    <rect x="20" y="20" width="455" height="106" rx="18" fill="rgba(13,17,23,0.62)" stroke="rgba(240,246,252,0.08)" />
    <rect x="32" y="34" width="108" height="24" rx="12" fill="url(#accent-gradient)" opacity="0.22" />
    <text x="86" y="50" text-anchor="middle" class="pill">Languages</text>
    <text x="32" y="84" class="title">${escapeXml(title)}</text>
    <text x="32" y="104" class="meta">Weighted by language bytes across your owned repositories</text>

    <g transform="translate(32 132)">
      <rect width="${barWidth}" height="18" rx="9" fill="rgba(240,246,252,0.08)" />
      <g clip-path="url(#lang-bar-clip)">
        ${segments}
      </g>
    </g>

    ${rows}
  `;

  return buildSvgDocument({
    width: 495,
    height: 154 + result.languages.length * 40 + 24,
    theme,
    title,
    extraDefs: `<clipPath id="lang-bar-clip"><rect width="${barWidth}" height="18" rx="9" /></clipPath>`,
    body
  });
}

export { renderTopLangsSvg };
