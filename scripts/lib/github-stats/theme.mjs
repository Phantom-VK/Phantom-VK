const THEMES = Object.freeze({
  dark: Object.freeze({
    name: "dark",
    background: "#0B0C0E",
    surface: "#131417",
    line: "#23252A",
    text: "#F2F3F5",
    muted: "#8B9099",
    accent: "#F2F3F5"
  }),
  light: Object.freeze({
    name: "light",
    background: "#FFFFFF",
    surface: "#FAFAFA",
    line: "#E6E7EA",
    text: "#0B0C0E",
    muted: "#6B7078",
    accent: "#0B0C0E"
  })
});

function resolveTheme(name) {
  return THEMES[name] || THEMES.dark;
}

function hexToRgb(hex) {
  const normalized = hex.replace("#", "");
  const value = normalized.length === 3
    ? normalized.split("").map((c) => c + c).join("")
    : normalized;
  const int = Number.parseInt(value, 16);
  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255
  };
}

function rgbToHsl(r, g, b) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;

  if (max === min) {
    return { h: 0, s: 0, l };
  }

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  switch (max) {
    case rn:
      h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
      break;
    case gn:
      h = ((bn - rn) / d + 2) / 6;
      break;
    default:
      h = ((rn - gn) / d + 4) / 6;
  }

  return { h, s, l };
}

function hueToRgb(p, q, t) {
  let tt = t;
  if (tt < 0) tt += 1;
  if (tt > 1) tt -= 1;
  if (tt < 1 / 6) return p + (q - p) * 6 * tt;
  if (tt < 1 / 2) return q;
  if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
  return p;
}

function hslToRgb(h, s, l) {
  if (s === 0) {
    const v = Math.round(l * 255);
    return { r: v, g: v, b: v };
  }

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  return {
    r: Math.round(hueToRgb(p, q, h + 1 / 3) * 255),
    g: Math.round(hueToRgb(p, q, h) * 255),
    b: Math.round(hueToRgb(p, q, h - 1 / 3) * 255)
  };
}

function rgbToHex(r, g, b) {
  return `#${[r, g, b].map((c) => Math.max(0, Math.min(255, c)).toString(16).padStart(2, "0")).join("")}`;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * harmonizeColor
 *
 * GitHub linguist colors are loud and mutually clashing at full saturation.
 * Keep the hue (it carries language recognition) but clamp saturation and
 * lightness into a band that reads as intentional against the card theme.
 */
function harmonizeColor(hex, theme) {
  const { r, g, b } = hexToRgb(hex);
  const { h, s, l } = rgbToHsl(r, g, b);

  const clampedS = Math.min(s, 0.45);
  const isDark = theme.name === "dark";
  const [lMin, lMax] = isDark ? [0.55, 0.72] : [0.35, 0.5];
  const clampedL = clamp(l, lMin, lMax);

  const { r: rr, g: gg, b: bb } = hslToRgb(h, clampedS, clampedL);
  return rgbToHex(rr, gg, bb);
}

export { THEMES, resolveTheme, harmonizeColor };
