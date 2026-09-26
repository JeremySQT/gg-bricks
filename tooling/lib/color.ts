// Color math shared by the palette generator and the foundations checks:
// OKLCH → sRGB (with deterministic chroma reduction into gamut), WCAG relative luminance and contrast.
import type { Color } from './types.ts';

export type Rgb = [number, number, number];

/** OKLab → linear sRGB (Björn Ottosson's reference matrices). */
function oklabToLinear(L: number, a: number, b: number): Rgb {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s
  ];
}

const encode = (x: number): number => (x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055);
const decode = (x: number): number => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4);
const inGamut = (c: Rgb, eps = 1e-6): boolean => c.every((x) => x >= -eps && x <= 1 + eps);

function oklchToLinear(L: number, C: number, h: number): Rgb {
  const rad = (h * Math.PI) / 180;
  return oklabToLinear(L, C * Math.cos(rad), C * Math.sin(rad));
}

/**
 * OKLCH → gamma-encoded sRGB components in 0–1. When the color lies outside sRGB, chroma is
 * reduced by bisection (lightness and hue preserved) until it fits: deterministic and hue-true.
 */
export function oklchToSrgb(L: number, C: number, h: number): Rgb {
  let lin = oklchToLinear(L, C, h);
  if (!inGamut(lin)) {
    let lo = 0,
      hi = C;
    for (let i = 0; i < 40; i++) {
      const mid = (lo + hi) / 2;
      if (inGamut(oklchToLinear(L, mid, h))) lo = mid;
      else hi = mid;
    }
    lin = oklchToLinear(L, lo, h);
  }
  return lin.map((x) => Math.min(1, Math.max(0, encode(x)))) as Rgb;
}

/** WCAG 2 relative luminance of gamma-encoded sRGB components. */
export const luminance = (c: Rgb): number => 0.2126 * decode(c[0]) + 0.7152 * decode(c[1]) + 0.0722 * decode(c[2]);

/** WCAG 2 contrast ratio between two opaque colors. */
export const contrast = (a: Rgb, b: Rgb): number => {
  const la = luminance(a),
    lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
};

/** Composite a (possibly translucent) color over an opaque backdrop. */
export const composite = (front: Color, backdrop: Rgb): Rgb => {
  const alpha = front.alpha ?? 1;
  return front.components.map((v, i) => v * alpha + backdrop[i] * (1 - alpha)) as Rgb;
};

export const toHex = (c: Rgb): string =>
  '#' +
  c
    .map((x) =>
      Math.round(x * 255)
        .toString(16)
        .padStart(2, '0')
    )
    .join('');
