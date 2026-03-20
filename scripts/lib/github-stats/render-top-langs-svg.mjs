import { buildSvgDocument, escapeXml, formatPercent, truncateText } from "./render-shared.mjs";

function renderTopLangsSvg(result, username, theme) {
  const title = `${username}'s Top Languages`;
  const barWidth = 382;
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
      const rowY = 118 + index * 30;
      return `
        <g transform="translate(16 ${rowY})">
          <rect width="398" height="22" rx="9" fill="rgba(13,17,23,0.44)" stroke="rgba(240,246,252,0.06)" />
          <circle cx="14" cy="11" r="5" fill="${language.color}" />
          <text x="28" y="15" class="meta" style="fill:${theme.text};">${escapeXml(truncateText(language.name, 22))}</text>
          <text x="382" y="15" text-anchor="end" class="small">${formatPercent(language.share)}</text>
        </g>
      `;
    })
    .join("");

  const body = `
    <rect x="16" y="16" width="398" height="68" rx="16" fill="rgba(13,17,23,0.56)" stroke="rgba(240,246,252,0.08)" />
    <rect x="28" y="28" width="86" height="20" rx="10" fill="url(#accent-gradient)" opacity="0.2" />
    <text x="71" y="41" text-anchor="middle" class="pill">Languages</text>
    <text x="28" y="64" class="title">Top Languages</text>
    <text x="28" y="78" class="meta">${escapeXml(truncateText(`${username} • owned repos`, 30))}</text>

    <g transform="translate(24 96)">
      <rect width="${barWidth}" height="12" rx="6" fill="rgba(240,246,252,0.08)" />
      <g clip-path="url(#lang-bar-clip)">
        ${segments}
      </g>
    </g>

    ${rows}
  `;

  return buildSvgDocument({
    width: 430,
    height: 126 + result.languages.length * 30,
    theme,
    title,
    extraDefs: `<clipPath id="lang-bar-clip"><rect width="${barWidth}" height="12" rx="6" /></clipPath>`,
    body
  });
}

export { renderTopLangsSvg };
