// Reads tokens.css the way a browser would: blocks in source order, the cascade per
// mode, then var(), color-mix() and calc() resolved to a colour.
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'

import { type Color, mixOklch, parseOklch } from './color.js'
import { isAtRule, parseCss, splitTopLevel } from './css-parse.js'

export interface Block { selector: string; decls: Map<string, string> }

const require_ = createRequire(import.meta.url)

/** At-rules whose contents apply only sometimes, so a static sweep cannot read them. */
const CONDITIONAL = ['@media', '@supports', '@container']

/** `[data-theme=dark]`, `[data-theme='dark']` and `[data-theme="dark"]` are one selector. */
const THEME = /^\[data-theme\s*(?:=\s*(?:"([\w-]+)"|'([\w-]+)'|([\w-]+)))?\s*\]$/

/** Tailwind's own palette, so a shade name here means what it means there. */
export function readPalette(): Map<string, Color> {
  const root = dirname(require_.resolve('tailwindcss/package.json'))
  const css = readFileSync(join(root, 'theme.css'), 'utf8')
  const out = new Map<string, Color>()
  for (const m of css.matchAll(/(--color-[a-z]+-?\d*)\s*:\s*([^;]+);/g)) {
    const color = parseOklch(m[2] ?? '')
    if (color) out.set(m[1] ?? '', color)
  }
  out.set('--color-white', { l: 1, c: 0, h: 0, alpha: 1 })
  out.set('--color-black', { l: 0, c: 0, h: 0, alpha: 1 })
  return out
}

/** Custom-property blocks in source order, skipping any a condition gates. */
export function readBlocks(css: string): Block[] {
  const blocks: Block[] = []
  for (const rule of parseCss(css).rules) {
    const chain = [...rule.ancestors, rule.prelude]
    if (chain.some((p) => CONDITIONAL.some((at) => isAtRule(p, at)))) continue
    const decls = new Map<string, string>()
    for (const d of rule.declarations) {
      if (d.property.startsWith('--')) decls.set(d.property, d.value)
    }
    if (decls.size) blocks.push({ selector: rule.prelude, decls })
  }
  return blocks
}

/** The selector list, with :where() and :is() unwrapped to the parts inside them. */
function flatten(selector: string): string[] {
  return splitTopLevel(selector, ',').flatMap((raw) => {
    const part = raw.trim()
    const fn = /^:(?:where|is)\(([\s\S]*)\)$/.exec(part)
    return fn ? flatten(fn[1] ?? '') : [part]
  })
}

const themeName = (part: string) => {
  const m = THEME.exec(part)
  return m ? (m[1] ?? m[2] ?? m[3]) : undefined
}

/** Every theme a stylesheet names, so a mode with no block of its own cannot pass. */
export function declaredModes(blocks: Block[]): Set<string> {
  const out = new Set<string>()
  for (const block of blocks) {
    for (const part of flatten(block.selector)) {
      const name = themeName(part)
      if (name !== undefined) out.add(name)
    }
  }
  return out
}

function appliesTo(selector: string, mode: string): boolean {
  return flatten(selector).some((part) => {
    if (part === ':root') return true
    const m = THEME.exec(part)
    if (!m) return false
    const name = m[1] ?? m[2] ?? m[3]
    return name === undefined || name === mode
  })
}

/** Every --tc-* value that applies in one mode, with :root as the base. */
export function tokensFor(blocks: Block[], mode: string): Map<string, string> {
  const out = new Map<string, string>()
  for (const block of blocks) {
    if (!appliesTo(block.selector, mode)) continue
    for (const [k, v] of block.decls) out.set(k, v)
  }
  return out
}

/** `12%`, `var(--tc-primary-mix)` or `calc(var(--tc-primary-mix) + 8%)`. */
export function resolvePercent(
  raw: string,
  tokens: Map<string, string>,
  seen = new Set<string>(),
): number | null {
  const plain = /^([\d.]+)%$/.exec(raw.trim())
  if (plain) return Number(plain[1])

  const varOnly = /^var\((--[\w-]+)\)$/.exec(raw.trim())
  if (varOnly) {
    const name = varOnly[1] ?? ''
    if (seen.has(name)) return null
    seen.add(name)
    const base = tokens.get(name)
    return base === undefined ? null : resolvePercent(base, tokens, seen)
  }

  const calc = /^calc\(\s*(.+?)\s*\+\s*([\d.]+)%\s*\)$/.exec(raw.trim())
  if (calc) {
    const base = resolvePercent(calc[1] ?? '', tokens, seen)
    return base === null ? null : base + Number(calc[2])
  }
  return null
}

const MIX = /^color-mix\(\s*in\s+oklch\s*,\s*var\((--[\w-]+)\)\s+(.+),\s*var\((--[\w-]+)\)\s*\)$/i

/** Resolve var(), color-mix() and a literal oklch into a colour. */
export function resolve(
  name: string,
  tokens: Map<string, string>,
  palette: Map<string, Color>,
  seen = new Set<string>(),
): Color | null {
  if (seen.has(name)) return null
  seen.add(name)

  const raw = tokens.get(name)
  if (raw === undefined) return palette.get(name) ?? null
  const value = raw.trim()

  // Guarded, so a wrapper like light-dark(oklch(..), oklch(..)) is never read as its first colour.
  if (/^oklch\(/i.test(value)) return parseOklch(value)

  const varOnly = /^var\((--[\w-]+)\)$/.exec(value)
  if (varOnly) return resolve(varOnly[1] ?? '', tokens, palette, seen)

  const mix = MIX.exec(value)
  if (mix) {
    const a = resolve(mix[1] ?? '', tokens, palette, new Set(seen))
    const b = resolve(mix[3] ?? '', tokens, palette, new Set(seen))
    if (!a || !b) return null
    const percent = resolvePercent(mix[2] ?? '', tokens)
    if (percent === null) return null
    return mixOklch(a, b, percent)
  }
  return null
}

/**
 * A token declared in one mode and not another is simply undefined there, and `var()`
 * has no fallback to recover with, so the rule that pays off is: every mode declares
 * every token, whether in its own block or by inheriting `:root`.
 */
export function tokensMissingPerMode(blocks: Block[]): { mode: string; token: string }[] {
  const modes = [...declaredModes(blocks)].sort()
  const perMode = new Map(modes.map((mode) => [mode, tokensFor(blocks, mode)]))
  const every = new Set<string>()
  for (const tokens of perMode.values()) for (const name of tokens.keys()) every.add(name)

  const out: { mode: string; token: string }[] = []
  for (const mode of modes) {
    for (const token of [...every].sort()) {
      if (!perMode.get(mode)?.has(token)) out.push({ mode, token })
    }
  }
  return out
}
