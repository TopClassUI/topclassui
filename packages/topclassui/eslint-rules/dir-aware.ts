// R-5.3-2: what moves or points along the inline axis follows --tc-dir. The eslint rule reads
// class strings and --tc-* style values with it, and check-css reads the stylesheets.

/** Splits a class at the colons between its variants, never at one inside brackets or parentheses. */
export function splitAtColons(token: string): string[] {
  return splitTop(token, (ch) => ch === ':')
}

/** Splits text where `isSeparator` holds outside parentheses and brackets. */
function splitTop(text: string, isSeparator: (ch: string) => boolean): string[] {
  const parts: string[] = []
  let depth = 0
  let start = 0
  for (let i = 0; i < text.length; i++) {
    const ch = text[i] ?? ''
    if (ch === '[' || ch === '(') depth++
    else if (ch === ']' || ch === ')') depth = Math.max(0, depth - 1)
    else if (depth === 0 && isSeparator(ch)) {
      parts.push(text.slice(start, i))
      start = i + 1
    }
  }
  parts.push(text.slice(start))
  return parts
}

/** The space-separated components of a CSS value. */
const components = (value: string) => splitTop(value.trim(), (ch) => /\s/.test(ch)).filter(Boolean)

/** An arbitrary Tailwind value written as CSS: underscores are spaces. */
const asCss = (value: string) => value.replaceAll('_', ' ').trim()

/** The arguments of the parenthesis that opens at `open`, split at its top-level commas. */
function callArguments(text: string, open: number): string[] {
  const args: string[] = []
  let depth = 0
  let start = open + 1
  for (let i = open; i < text.length; i++) {
    const ch = text[i]
    if (ch === '(') depth++
    else if (ch === ')' && --depth === 0) return [...args, text.slice(start, i)]
    else if (ch === ',' && depth === 1) {
      args.push(text.slice(start, i))
      start = i + 1
    }
  }
  return [...args, text.slice(start)]
}

/** True when the whole value is `calc(a*b*...)` with `var(--tc-dir)` as one factor and nothing added beside it. */
export function multipliesByDir(value: string): boolean {
  const s = value.replace(/[\s_]/g, '')
  const body = /^calc\((.*)\)$/.exec(s)?.[1]
  if (body === undefined) return false
  const factors: string[] = []
  let depth = 0
  let start = 0
  for (let i = 0; i < body.length; i++) {
    const ch = body[i] ?? ''
    if (ch === '(') depth++
    else if (ch === ')' && --depth < 0) return false
    else if (depth > 0) continue
    else if (ch === '+') return false
    else if (ch === '-' && i > 0 && !'*/'.includes(body[i - 1] ?? '')) return false
    else if (ch === '*') {
      factors.push(body.slice(start, i))
      start = i + 1
    }
  }
  return depth === 0 && [...factors, body.slice(start)].includes('var(--tc-dir)')
}

/** An x that needs no direction: none, a zero, or the pointer offset Base UI measures in physical px. */
const NEUTRAL_X = /^(-?0(px|%|rem)?|none|3d|var\(--(drawer|toast)-swipe-movement-x(,\s*0(px)?)?\))$/

export const dirAware = (x: string) => multipliesByDir(x) || NEUTRAL_X.test(asCss(x))

/** An angle mirrors only when it multiplies by --tc-dir or already lies on the block axis. */
function physicalAngle(text: string): boolean {
  if (multipliesByDir(text)) return false
  if (text.includes('--tc-dir')) return true
  const half = { deg: 180, turn: 0.5, rad: Math.PI, grad: 200 } as const
  return [...text.matchAll(/(-?[\d.]+)(deg|turn|rad|grad)\b/g)]
    .some(([, n, unit]) => Number(n) % half[unit as keyof typeof half] !== 0)
}

const round = (n: number) => `${String(Math.round(n * 1000) / 1000)}%`

/** An x offset from a named side, as a percentage when it is one, so both spellings of a mirror compare equal. */
function fromSide(side: string, offset: string): string {
  const pct = /^(-?[\d.]+)%$/.exec(offset)?.[1]
  if (pct !== undefined) return round(side === 'left' ? Number(pct) : 100 - Number(pct))
  if (/^-?0(px|rem)?$/.test(offset)) return side === 'left' ? '0%' : '100%'
  return `${side} ${offset}`
}

const Y = { top: '0%', center: '50%', bottom: '100%' } as Record<string, string>

/** The x and y of a position (background-position, object-position, `at` in a gradient), or undefined when a variable hides it. */
export function readPosition(value: string): { x: string; y: string } | undefined {
  const first = splitTop(value, (ch) => ch === ',')[0] ?? ''
  if (first.includes('var(')) return undefined
  const c = components(first)
  let x = '50%'
  let y = 'center'
  if (c.length <= 2) {
    const [a = 'center', b] = c
    if (b === undefined && (a === 'top' || a === 'bottom')) y = a
    else if (b === undefined) x = a
    else if (a === 'top' || a === 'bottom' || b === 'left' || b === 'right') [x, y] = [b, a]
    else [x, y] = [a, b]
    x = x === 'center' ? '50%' : x === 'left' || x === 'right' ? fromSide(x, '0') : fromSide('left', x)
  } else {
    for (let i = 0; i < c.length; i++) {
      const side = c[i] ?? ''
      const next = c[i + 1]
      const offset = next !== undefined && !/^(left|right|top|bottom|center)$/.test(next) ? c[++i] : undefined
      if (side === 'left' || side === 'right') x = fromSide(side, offset ?? '0')
      else if (side === 'top' || side === 'bottom') y = offset ? `${side} ${offset}` : side
    }
  }
  return { x, y: Y[y] ?? y }
}

/** The x a mirrored position must take in right to left. */
function mirrorX(x: string): string {
  const pct = /^(-?[\d.]+)%$/.exec(x)?.[1]
  if (pct !== undefined) return round(100 - Number(pct))
  return x.replace(/^(left|right)/, (side) => (side === 'left' ? 'right' : 'left'))
}

/** A transform origin is physical unless Base UI measures it or its x is the centre or multiplies by --tc-dir. */
export function physicalOrigin(value: string): boolean {
  const v = value.trim()
  if (v === 'var(--transform-origin)') return false
  const c = components(v)
  const [a = 'center', b] = c
  const x = b === undefined ? (a === 'top' || a === 'bottom' ? 'center' : a)
    : a === 'top' || a === 'bottom' || b === 'left' || b === 'right' ? b : a
  return !(x === 'center' || x === '50%' || /\*var\(--tc-dir\)|var\(--tc-dir\)\*/.test(x.replace(/\s/g, '')))
}

/** Whether a gradient function's arguments point or centre it on a physical side. */
function physicalGradient(kind: string, args: string): boolean {
  const first = asCss(splitTop(args, (ch) => ch === ',')[0] ?? '')
  if (kind === 'linear' || kind === 'gradient') {
    return !multipliesByDir(first) && (/(^|\s)to\s.*\b(left|right)\b/.test(first) || physicalAngle(first))
  }
  const from = /(?:^|\s)from\s+(\S+)/.exec(first)?.[1]
  if (from !== undefined && physicalAngle(from)) return true
  const at = /(?:^|\s)at\s+(.+)$/.exec(first)?.[1]
  if (at === undefined || at.includes('--tc-dir')) return false
  const x = readPosition(at)?.x
  return x !== undefined && x !== '50%'
}

const TRANSLATE_HINT = 'translates along a physical x; multiply it by --tc-dir, as translateX(calc(100%*var(--tc-dir)))'
const GRADIENT_HINT = 'points the gradient at a physical side; multiply the angle by --tc-dir, as bg-linear-[calc(90deg*var(--tc-dir))]'

/** Why a CSS value moves or points along a physical x, read from its translate and gradient functions. */
export function findPhysicalValue(value: string): string | undefined {
  for (const m of value.matchAll(/translate(X|3d)?\(/g)) {
    if (!dirAware(callArguments(value, m.index + m[0].length - 1)[0] ?? '')) return TRANSLATE_HINT
  }
  for (const m of value.matchAll(/(linear|conic|radial)-gradient\(/g)) {
    const open = m.index + m[0].length - 1
    if (physicalGradient(m[1] ?? '', callArguments(value, open).join(','))) return GRADIENT_HINT
  }
  return undefined
}

/** `rtl:`, `ltr:`, their group, peer, in, has and not forms, an arbitrary [dir=] and :dir(). */
const DIR_VARIANT = /^(not-|group-|peer-|in-|has-)?(rtl|ltr)(\/[\w-]+)?$|dir=["']?(rtl|ltr)|:dir\(/
const meansRtl = (v: string) => (v.startsWith('not-') ? v.includes('ltr') : v.includes('rtl'))

/** An object-* or bg-* position as a family and a CSS value, or undefined when the class is none. */
function positionOf(utility: string): { family: string; value: string } | undefined {
  const keyword = /^(object|bg)-((top|bottom|left|right|center)(-(top|bottom|left|right|center))?)$/.exec(utility)
  if (keyword) return { family: keyword[1] ?? '', value: (keyword[2] ?? '').replace('-', ' ') }
  const arbitrary = /^(object|bg-position)-\[(.+)\]$|^bg-\[position:(.+)\]$|^\[(object|background)-position:(.+)\]$/.exec(utility)
  if (arbitrary) {
    const family = arbitrary[1] ?? arbitrary[4] ?? 'bg'
    return { family: family === 'object' ? 'object' : 'bg', value: asCss(arbitrary[2] ?? arbitrary[3] ?? arbitrary[5] ?? '') }
  }
  const variable = /^(object|bg-position)-\((--[\w-]+)\)$/.exec(utility)
  if (variable) return { family: variable[1] === 'object' ? 'object' : 'bg', value: `var(${variable[2] ?? ''})` }
  return undefined
}

/** The CSS value of a transform-origin class, or undefined when the class sets none. */
function originOf(utility: string): string | undefined {
  const m = /^origin-(.+)$|^\[transform-origin:(.+)\]$/.exec(utility)
  const raw = m?.[1] ?? m?.[2]
  if (raw === undefined) return undefined
  if (/^\(--[\w-]+\)$/.test(raw)) return `var${raw}`
  if (raw.startsWith('[') && raw.endsWith(']')) return asCss(raw.slice(1, -1))
  return m?.[1] !== undefined && !raw.includes('(') ? raw.replaceAll('-', ' ') : asCss(raw)
}

/** The x a translate class moves along, as CSS. */
function translateX(xAxis: boolean, value: string): string {
  if (/^\(--[\w-]+\)$/.test(value)) return `var${value}`
  if (!value.startsWith('[') || !value.endsWith(']')) return value
  const inner = value.slice(1, -1)
  return xAxis ? inner : (components(asCss(inner))[0] ?? '')
}

/** Why a class string breaks R-5.3-2, with the offending class, or undefined when it keeps it. */
export function findPhysicalMotion(value: string): { cls: string; hint: string } | undefined {
  // A CSS declaration in a test is not a class list.
  if (value.includes(';')) return undefined
  const classes = value.split(/\s+/).filter(Boolean).map((cls) => {
    const variants = splitAtColons(cls)
    const utility = (variants.pop() ?? '').replace(/^!|!$/g, '')
    const dir = variants.filter((v) => DIR_VARIANT.test(v))
    return { cls, utility, dir, rest: variants.filter((v) => !DIR_VARIANT.test(v)).sort().join(':') }
  })
  const mirrors = new Set<string>()
  for (const c of classes) {
    const position = positionOf(c.utility)
    const at = position && readPosition(position.value)
    if (at && c.dir.some(meansRtl)) mirrors.add(`${position.family}|${c.rest}|${at.x}|${at.y}`)
  }
  for (const { cls, utility, dir, rest } of classes) {
    if (!utility || utility.endsWith('-')) continue
    const position = positionOf(utility)
    if (dir.length > 0) {
      if (!position) return { cls, hint: 'uses a direction variant; only object-* and bg-* positions may, everything else multiplies by --tc-dir' }
      continue
    }
    const translate = /^-?translate-(x-)?(.+)$/.exec(utility)
    if (translate && !/^[yz]-/.test(translate[2] ?? '') && !dirAware(translateX(Boolean(translate[1]), translate[2] ?? ''))) {
      return { cls, hint: 'moves along a physical x; multiply it by --tc-dir, as translate-x-[calc(100%*var(--tc-dir))]' }
    }
    const property = /^\[translate:(.+)\]$/.exec(utility)
    if (property && !dirAware(components(asCss(property[1] ?? ''))[0] ?? '')) return { cls, hint: TRANSLATE_HINT }
    const origin = originOf(utility)
    if (origin !== undefined && (physicalOrigin(origin) || /(^|[-_[:\s])(left|right)(?![a-z])/.test(utility))) {
      return { cls, hint: 'pins the transform origin to a physical x; use one Base UI measures, as origin-(--transform-origin), the centre, or an x times --tc-dir' }
    }
    const gradient = /^-?(bg|mask)-(linear|gradient|conic|radial)-(.+)$/.exec(utility)
    if (gradient) {
      const kind = gradient[2] ?? ''
      const spec = (gradient[3] ?? '').replace(/\/[\w-]+$/, '')
      const side = kind !== 'conic' && kind !== 'radial' && /^to-(r|l|tr|tl|br|bl)$/.test(spec)
      const angle = kind !== 'radial' && /^\d+$/.test(spec) && Number(spec) % 180 !== 0
      const bracket = spec.startsWith('[') && physicalGradient(kind, spec.slice(1, -1))
      const centre = kind === 'radial' && /^at-(.+-)?(left|right)$/.test(spec)
      if (side || angle || bracket || centre || spec.startsWith('(--')) return { cls, hint: GRADIENT_HINT }
    }
    if (/^-?mask-(l|r)-/.test(utility)) return { cls, hint: 'masks from a physical side; mask along the block axis, or both sides with mask-x-' }
    const found = findPhysicalValue(utility)
    if (found) return { cls, hint: found }
    const at = position && readPosition(position.value)
    if (position && at && at.x !== '50%' && !mirrors.has(`${position.family}|${rest}|${mirrorX(at.x)}|${at.y}`)) {
      return { cls, hint: 'is a physical position with no logical form; pair it with its rtl: mirror under the same variants' }
    }
  }
  return undefined
}

/** Why a CSS declaration breaks R-5.3-2, or undefined. Positions may sit physical inside a [dir] rule. */
export function findPhysicalDeclaration(property: string, value: string, dirScoped: boolean): string | undefined {
  const p = property.toLowerCase()
  const found = findPhysicalValue(value)
  if (found) return found
  if (p === 'translate' && !dirAware(components(value)[0] ?? '')) return TRANSLATE_HINT
  if (p === 'transform-origin' && physicalOrigin(value)) return 'pins the transform origin to a physical x; use var(--transform-origin), the centre, or an x times --tc-dir'
  if (/^(object-position|background-position(-x)?)$/.test(p) && !dirScoped && (readPosition(value)?.x ?? '50%') !== '50%') {
    return 'is a physical position; set it inside a [dir=rtl] rule and its mirror inside [dir=ltr]'
  }
  return undefined
}
