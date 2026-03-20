

import {
  buildSvgDocument,
  escapeXml,
  formatPercent,
  truncateText,
} from "./render-shared.mjs";

/**
 * renderLangRow
 * One language entry matching the reference layout:
 *   - lang name (left) | percent (right)
 *   - grey track bar | colored fill bar (animated)
 *
 * @param {object} lang   - { name, color, share }
 * @param {number} rowY   - y offset for this row (within the body group)
 * @param {number} delay  - stagger animation delay ms
 * @param {number} barW   - total width of progress track
 */
function renderLangRow(lang, rowY, delay, barW = 250) {
  const fillW = Math.max((lang.share / 100) * barW, 3).toFixed(2);
  const pct   = formatPercent(lang.share);

  return `
  <g transform="translate(0, ${rowY})">
    <g class="stagger" style="animation-delay: ${delay}ms">
      <!-- Language name -->
      <text data-testid="lang-name" x="2" y="15" class="lang-name">${escapeXml(truncateText(lang.name, 24))}</text>
      <!-- Percent right-aligned -->
      <text x="${barW + 2}" y="15" text-anchor="end" class="lang-name">${escapeXml(pct)}</text>

      <!-- Progress bar -->
      <svg width="${barW}" x="0" y="22">
        <!-- Grey track -->
        <rect rx="4" ry="4" x="0" y="0" width="${barW}" height="7"
          fill="rgba(255,255,255,0.08)"
        />
        <!-- Colored fill, animated -->
        <svg data-testid="lang-progress" width="${fillW}">
          <rect
            height="7"
            fill="${lang.color}"
            rx="4" ry="4" x="0" y="0"
            class="lang-progress"
            style="animation-delay: ${delay + 300}ms;"
          />
        </svg>
      </svg>
    </g>
  </g>`;
}

/**
 * renderTopLangsSvg
 *
 * Full top-languages card.
 * Width = 320, height = 55 (header) + langs * 45 + 20 (bottom pad).
 *
 * @param {object} result   - { languages: [{ name, color, share }] }
 * @param {string} username
 * @param {object} theme
 */
function renderTopLangsSvg(result, username, theme) {
  const W        = 320;
  const BAR_W    = 260;   
  const BODY_Y   = 55;    
  const ROW_H    = 45;    
  const PAD_BOT  = 20;

  const H = BODY_Y + result.languages.length * ROW_H + PAD_BOT;
  const title = `${username}'s Top Languages`;

  const langRows = result.languages
    .map((lang, i) =>
      renderLangRow(
        lang,
        i * ROW_H,          
        450 + i * 150,     
        BAR_W,
      )
    )
    .join("");

  const body = `
  <!-- Title -->
  <g data-testid="card-title" transform="translate(25, 35)">
    <text x="0" y="0" class="header" data-testid="header">Most Used Languages</text>
  </g>

  <!-- Lang rows -->
  <g data-testid="main-card-body" transform="translate(0, ${BODY_Y})">
    <svg data-testid="lang-items" x="25">
      ${langRows}
    </svg>
  </g>`;

  return buildSvgDocument({ width: W, height: H, theme, title, body });
}

export { renderTopLangsSvg };
