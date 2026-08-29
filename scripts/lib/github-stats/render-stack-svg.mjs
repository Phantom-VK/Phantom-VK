import { buildSvgDocument, escapeXml } from "./render-shared.mjs";
import { STACK_GROUPS } from "./stack-data.mjs";

const AVG_CHAR_WIDTH = 7.5; // rough estimate for 13px system-font text, used to wrap group item lines
const LINE_H = 18;
const FIRST_LINE_OFFSET = 32; // from group top to first item line's baseline
const GROUP_BOTTOM_PAD = 26; // space after a group's last line before the next group starts

function wrapItems(items, maxChars) {
  const lines = [];
  let current = "";

  for (const item of items) {
    const candidate = current ? `${current} · ${item}` : item;
    if (candidate.length > maxChars && current) {
      lines.push(current);
      current = item;
    } else {
      current = candidate;
    }
  }

  if (current) lines.push(current);
  return lines;
}

function renderGroup(group, colW, topY) {
  const maxChars = Math.floor(colW / AVG_CHAR_WIDTH);
  const lines = wrapItems(group.items, maxChars);

  const eyebrowY = topY + 10;
  const linesSvg = lines
    .map((line, i) => `<text x="0" y="${topY + FIRST_LINE_OFFSET + i * LINE_H}" class="stat-label">${escapeXml(line)}</text>`)
    .join("\n      ");

  const height = FIRST_LINE_OFFSET + (lines.length - 1) * LINE_H + GROUP_BOTTOM_PAD;

  const svg = `
    <g>
      <text x="0" y="${eyebrowY}" class="eyebrow">${escapeXml(group.label)}</text>
      ${linesSvg}
    </g>`;

  return { svg, height };
}

function renderColumn(groups, colW, delay) {
  let cursorY = 0;
  const parts = [];

  for (const group of groups) {
    const { svg, height } = renderGroup(group, colW, cursorY);
    parts.push(svg);
    cursorY += height;
  }

  return {
    svg: `<g class="stagger" style="animation-delay: ${delay}ms">${parts.join("")}</g>`,
    height: cursorY,
  };
}

/**
 * renderStackSvg
 *
 * Full-width tech-stack card: replaces the 24 shields.io badges with a
 * two-column typographic layout — uppercase tracked group labels, items
 * joined by "·", one weight scale, monochrome (matches the stat cards).
 *
 * Optionally appends a full-width "Top Repositories" line below the two
 * columns. (This card's height is content-driven, unlike the two paired
 * stat cards which share a fixed 440x300 canvas, so it can absorb extra
 * content without breaking the README's 49%/49% pairing.)
 *
 * @param {object} theme - color tokens
 * @param {Array}  [topRepos] - [{ name, stars }], most-starred first
 */
function renderStackSvg(theme, topRepos = []) {
  const W = 920;
  const PAD = 32;
  const HEADER_BASELINE_Y = 40;
  const BODY_Y = 76;
  const COL_GAP = 40;

  const contentWidth = W - PAD * 2;
  const colW = (contentWidth - COL_GAP) / 2;

  const mid = Math.ceil(STACK_GROUPS.length / 2);
  const col1Groups = STACK_GROUPS.slice(0, mid);
  const col2Groups = STACK_GROUPS.slice(mid);

  const col1 = renderColumn(col1Groups, colW, 0);
  const col2 = renderColumn(col2Groups, colW, 40);
  const columnsHeight = Math.max(col1.height, col2.height);

  let topReposSvg = "";
  let topReposHeight = 0;

  if (topRepos.length > 0) {
    const line = topRepos.map((repo) => `${repo.name} (★${repo.stars})`).join("  ·  ");
    topReposSvg = `
    <g class="stagger" style="animation-delay: 80ms" transform="translate(0, ${columnsHeight})">
      <text x="0" y="10" class="eyebrow">Top Repositories</text>
      <text x="0" y="${FIRST_LINE_OFFSET}" class="stat-label">${escapeXml(line)}</text>
    </g>`;
    topReposHeight = FIRST_LINE_OFFSET + GROUP_BOTTOM_PAD;
  }

  const H = BODY_Y + columnsHeight + topReposHeight + PAD;

  const body = `
  <!-- Title -->
  <text x="${PAD}" y="${HEADER_BASELINE_Y}" class="title">Tech Stack</text>

  <!-- Column 1 -->
  <g transform="translate(${PAD}, ${BODY_Y})">
    ${col1.svg}
  </g>

  <!-- Column 2 -->
  <g transform="translate(${PAD + colW + COL_GAP}, ${BODY_Y})">
    ${col2.svg}
  </g>

  <!-- Top repositories -->
  <g transform="translate(${PAD}, ${BODY_Y})">
    ${topReposSvg}
  </g>`;

  return buildSvgDocument({ width: W, height: H, theme, title: "Tech Stack", body, idPrefix: "stack" });
}

export { renderStackSvg };
