// Pure rules of the "see your store become an app" teaser (no DOM).

export const DEFAULT_STORE_NAME = 'Sua Loja';
export const MAX_STORE_NAME = 24;
export const LOGO_ERROR = 'Envie PNG, JPG, WebP ou SVG de até 2MB.';
const LOGO_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];
const LOGO_MAX_BYTES = 2 * 1024 * 1024;

// Name shown in the drawn app: trimmed, inner spaces collapsed, at most 24 characters; empty becomes "Sua Loja".
export function normalizeStoreName(raw) {
  const name = String(raw ?? '').replace(/\s+/g, ' ').trim().slice(0, MAX_STORE_NAME).trim();
  return name || DEFAULT_STORE_NAME;
}

function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map(c => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// Text color for content over the brand color, with WCAG contrast of at least 4.5:1.
// White first, then the site's navy; mid tones where neither reaches 4.5:1 (e.g. #808080) fall back to black,
// which always reaches it together with white.
// SPEC_DEVIATION: design lists only '#ffffff' | '#0f1a33'; '#000000' is added so every custom color meets the spec's 4.5:1.
export function readableTextColor(hex) {
  for (const text of ['#ffffff', '#0f1a33']) if (contrast(hex, text) >= 4.5) return text;
  return contrast(hex, '#ffffff') >= contrast(hex, '#000000') ? '#ffffff' : '#000000';
}

// Logo accepted only as PNG, JPG, WebP or SVG up to 2MB (2 * 1024 * 1024 bytes).
export function validateLogo({ type, size }) {
  if (!LOGO_TYPES.includes(type) || size > LOGO_MAX_BYTES) return { ok: false, message: LOGO_ERROR };
  return { ok: true };
}
