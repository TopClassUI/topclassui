// oklch to sRGB with CSS Color 4 gamut mapping, then WCAG contrast. Naive clipping
// moves a chromatic shade enough to change the answer, which is why this maps.

export interface Rgb { r: number; g: number; b: number }

/** oklch -> linear sRGB, via Oklab. */
function oklchToLinearRgb(l: number, c: number, hDeg: number): Rgb {
  const h = (hDeg * Math.PI) / 180
  const a = c * Math.cos(h)
  const bb = c * Math.sin(h)

  const l_ = l + 0.3963377774 * a + 0.2158037573 * bb
  const m_ = l - 0.1055613458 * a - 0.0638541728 * bb
  const s_ = l - 0.0894841775 * a - 1.291485548 * bb

  const L = l_ * l_ * l_
  const M = m_ * m_ * m_
  const S = s_ * s_ * s_

  return {
    r: 4.0767416621 * L - 3.3077115913 * M + 0.2309699292 * S,
    g: -1.2684380046 * L + 2.6097574011 * M - 0.3413193965 * S,
    b: -0.0041960863 * L - 0.7034186147 * M + 1.707614701 * S,
  }
}

const inGamut = (c: Rgb, eps = 1e-5) =>
  c.r >= -eps && c.r <= 1 + eps && c.g >= -eps && c.g <= 1 + eps && c.b >= -eps && c.b <= 1 + eps

/** CSS Color 4: hold lightness and hue, bisect chroma until the colour fits. */
function gamutMap(l: number, c: number, h: number): Rgb {
  const direct = oklchToLinearRgb(l, c, h)
  if (inGamut(direct)) return direct
  if (l <= 0) return { r: 0, g: 0, b: 0 }
  if (l >= 1) return { r: 1, g: 1, b: 1 }

  let lo = 0
  let hi = c
  let best = oklchToLinearRgb(l, 0, h)
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2
    const candidate = oklchToLinearRgb(l, mid, h)
    if (inGamut(candidate)) { best = candidate; lo = mid }
    else hi = mid
  }
  return best
}

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n)

const wrap360 = (n: number) => (((n % 360) + 360) % 360)

/** Relative luminance per WCAG 2.x, from linear sRGB. */
function luminance(c: Rgb): number {
  return 0.2126 * clamp01(c.r) + 0.7152 * clamp01(c.g) + 0.0722 * clamp01(c.b)
}

export interface Color { l: number; c: number; h: number; alpha: number }

/** linear sRGB -> oklch, the inverse of oklchToLinearRgb. */
export function toOklch(rgb: Rgb): Color {
  const l_ = Math.cbrt(0.4122214708 * rgb.r + 0.5363325363 * rgb.g + 0.0514459929 * rgb.b)
  const m_ = Math.cbrt(0.2119034982 * rgb.r + 0.6806995451 * rgb.g + 0.1073969566 * rgb.b)
  const s_ = Math.cbrt(0.0883024619 * rgb.r + 0.2817188376 * rgb.g + 0.6299787005 * rgb.b)

  const l = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_
  const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_
  const bb = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_

  return { l, c: Math.hypot(a, bb), h: wrap360((Math.atan2(bb, a) * 180) / Math.PI), alpha: 1 }
}

const NUMBER = String.raw`[+-]?(?:\d+(?:\.\d*)?|\.\d+)`
const PART = `(?:${NUMBER}%?|none)`
const HUE = `(?:${NUMBER}(?:deg)?|none)`
const OKLCH = new RegExp(
  String.raw`^oklch\(\s*(${PART})\s+(${PART})\s+(${HUE})(?:\s*/\s*(${PART}))?\s*\)$`,
  'i',
)

/** CSS Color 4 pins 100% chroma to 0.4. */
const CHROMA_FULL = 0.4

/** CSS Color 4 allows `none` for a missing component; Tailwind writes every grey that way. */
function num(raw: string, full: number): number {
  if (raw.toLowerCase() === 'none') return 0
  const pct = raw.endsWith('%')
  const n = Number(pct ? raw.slice(0, -1) : raw)
  return pct ? (n / 100) * full : n
}

function hueOf(raw: string): number {
  if (raw.toLowerCase() === 'none') return 0
  return wrap360(Number(raw.replace(/deg$/i, '')))
}

/** `oklch(54.1% 0.281 293.009)`, `oklch(98.5% 0 none)`, `oklch(0 0 0 / 50%)`; anchored. */
export function parseOklch(value: string): Color | null {
  const m = OKLCH.exec(value.trim())
  if (!m) return null
  const alpha = m[4]
  return {
    l: num(m[1] ?? '', 1),
    c: num(m[2] ?? '', CHROMA_FULL),
    h: hueOf(m[3] ?? ''),
    alpha: alpha === undefined ? 1 : clamp01(num(alpha, 1)),
  }
}

type Mapper = (l: number, c: number, h: number) => Rgb

/** The other plausible reading of an out-of-gamut colour, and what some browsers paint. */
function clipToGamut(l: number, c: number, h: number): Rgb {
  const direct = oklchToLinearRgb(l, c, h)
  return { r: clamp01(direct.r), g: clamp01(direct.g), b: clamp01(direct.b) }
}

export function toLinearRgb(color: Color, map: Mapper = gamutMap): Rgb {
  return map(color.l, color.c, color.h)
}

/** The sRGB transfer function; alpha composites in this gamma-encoded space, not in linear light. */
const encode = (v: number) => {
  const n = clamp01(v)
  return n <= 0.0031308 ? 12.92 * n : 1.055 * Math.pow(n, 1 / 2.4) - 0.055
}

const decode = (v: number) => {
  const n = clamp01(v)
  return n <= 0.04045 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4)
}

const encodeRgb = (c: Rgb): Rgb => ({ r: encode(c.r), g: encode(c.g), b: encode(c.b) })
const decodeRgb = (c: Rgb): Rgb => ({ r: decode(c.r), g: decode(c.g), b: decode(c.b) })

/** Nothing sits behind the page, so a translucent backdrop flattens onto white. */
const BACKDROP: Color = { l: 1, c: 0, h: 0, alpha: 1 }

/** Gamma-encoded sRGB, with the backdrop's own alpha flattened first. */
function flatten(top: Color, bottom: Color, map: Mapper): Rgb {
  const t = encodeRgb(toLinearRgb(top, map))
  if (top.alpha >= 1) return t
  const b = bottom.alpha < 1 ? flatten(bottom, BACKDROP, map) : encodeRgb(toLinearRgb(bottom, map))
  const a = clamp01(top.alpha)
  return { r: t.r * a + b.r * (1 - a), g: t.g * a + b.g * (1 - a), b: t.b * a + b.b * (1 - a) }
}

/** Flatten a translucent colour onto what is behind it; returns linear sRGB. */
export function over(top: Color, bottom: Color, map: Mapper = gamutMap): Rgb {
  return decodeRgb(flatten(top, bottom, map))
}

/** WCAG contrast ratio, 1 to 21. `a` is drawn on `b`, so alpha makes the pair asymmetric. */
function ratio(a: Color, b: Color, map: Mapper): number {
  const la = luminance(a.alpha < 1 ? over(a, b, map) : toLinearRgb(a, map))
  const lb = luminance(b.alpha < 1 ? over(b, BACKDROP, map) : toLinearRgb(b, map))
  const hi = Math.max(la, lb)
  const lo = Math.min(la, lb)
  return (hi + 0.05) / (lo + 0.05)
}

export function contrast(a: Color, b: Color): number {
  return ratio(a, b, gamutMap)
}

/** Both readings of an out-of-gamut colour, so a check can judge the worse of the two. */
export function contrastRange(a: Color, b: Color): { min: number; max: number } {
  const mapped = ratio(a, b, gamutMap)
  const clipped = ratio(a, b, clipToGamut)
  return { min: Math.min(mapped, clipped), max: Math.max(mapped, clipped) }
}

/** CSS Color 4: a chroma of 0 leaves the hue powerless, so the other colour's hue stands in. */
function hues(a: Color, b: Color): [number, number] {
  if (a.c === 0 && b.c === 0) return [0, 0]
  if (a.c === 0) return [b.h, b.h]
  if (b.c === 0) return [a.h, a.h]
  return [a.h, b.h]
}

/** color-mix(in oklch, A P%, B): polar interpolation, hue along the shorter arc. */
export function mixOklch(a: Color, b: Color, percent: number): Color {
  const t = percent / 100
  const [ha, hb] = hues(a, b)
  let delta = hb - ha
  if (delta > 180) delta -= 360
  else if (delta < -180) delta += 360
  return {
    l: a.l * t + b.l * (1 - t),
    c: a.c * t + b.c * (1 - t),
    h: wrap360(ha + delta * (1 - t)),
    alpha: a.alpha * t + b.alpha * (1 - t),
  }
}
