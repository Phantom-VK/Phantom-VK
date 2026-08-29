import {
  buildSvgDocument,
  escapeXml,
  formatPercent,
  truncateText,
} from "./render-shared.mjs";
import { harmonizeColor } from "./theme.mjs";

/**
 * renderLangRow
 * One language entry: name (left) / percent (right), track bar below with an
 * explicit-width fill bar (see bug fix: the old version had no width attribute
 * at all and relied entirely on a CSS animation to size it).
 */
function renderLangRow(lang, theme, rowY, delay, barW) {
  const fillW = Math.max((lang.share / 100) * barW, 3).toFixed(2);
  const pct = formatPercent(lang.share);
  const color = harmonizeColor(lang.color, theme);

  return `
  <g transform="translate(0, ${rowY})">
    <g class="stagger" style="animation-delay: ${delay}ms">
      <text x="0" y="14" class="lang-name">${escapeXml(truncateText(lang.name, 28))}</text>
      <text x="${barW}" y="14" text-anchor="end" class="meta">${escapeXml(pct)}</text>

      <rect x="0" y="22" width="${barW}" height="6" rx="3" fill="${theme.line}" />
      <rect
        x="0" y="22" width="${fillW}" height="6" rx="3"
        fill="${color}"
        class="lang-progress"
        style="animation-delay: ${delay + 80}ms;"
      />
    </g>
  </g>`;
}

/**
 * renderTopLangsSvg
 *
 * Fixed-canvas top-languages card (440x300) — identical dimensions to the
 * stats card so both pair at 49%/49% in the README without a height mismatch.
 *
 * @param {object} result   - { languages: [{ name, color, share }] }
 * @param {string} username
 * @param {object} theme
 */
function renderTopLangsSvg(result, username, theme) {
  const W = 440;
  const H = 300;
  const PAD = 28;

  const HEADER_BASELINE_Y = 40;
  const BODY_Y = 76;

  const barW = W - PAD * 2;
  const bodyHeight = H - BODY_Y - PAD;
  const rowH = bodyHeight / Math.max(result.languages.length, 1);

  const title = `${username}'s Top Languages`;

  const rows = result.languages
    .map((lang, i) => renderLangRow(lang, theme, i * rowH, i * 40, barW))
    .join("");

  const body = `
  <!-- Title -->
  <text x="${PAD}" y="${HEADER_BASELINE_Y}" class="title">Most Used Languages</text>

  <!-- Language rows -->
  <g transform="translate(${PAD}, ${BODY_Y})">
    ${rows}
  </g>`;

  return buildSvgDocument({ width: W, height: H, theme, title, body, idPrefix: "toplangs" });
}

export { renderTopLangsSvg };
