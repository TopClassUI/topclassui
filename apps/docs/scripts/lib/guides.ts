// The library facts Colors, Icons and Theming print (docs-site pages 7 to 9), read from tokens.css, raw/ and docs/icons.md.
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

import { type Color, contrastRange } from '../../../../packages/topclassui/scripts/lib/color.js'
import { SURFACES, TONES } from '../../../../packages/topclassui/scripts/lib/contrast-checks.js'
import { MODES } from '../../../../packages/topclassui/scripts/lib/harness.js'
import { readBlocks, readPalette, resolve, resolvePercent, tokensFor } from '../../../../packages/topclassui/scripts/lib/tokens.js'
import { DIRECTIONAL } from '../../../../packages/topclassui/src/icons/directional.generated.js'
import type { GuideFacts, IconGroup, Measured, Shade, TokenFact } from '../../lib/guide-facts.js'
import { LIBRARY } from './library.js'

type Mode = (typeof MODES)[number]

const MIX = /^color-mix\(\s*in\s+oklch\s*,\s*var\((--[\w-]+)\)\s+(.+),\s*var\((--[\w-]+)\)\s*\)$/i

/** The name a reader would look up: blue-600, not the oklch it resolves to. */
export function shadeOf(name: string, tokens: Map<string, string>, seen = new Set<string>()): Shade {
  const raw = tokens.get(name)?.trim()
  if (raw === undefined || seen.has(name)) return { kind: 'value', text: name }
  seen.add(name)
  const ref = /^var\((--[\w-]+)\)$/.exec(raw)?.[1]
  if (ref?.startsWith('--color-')) return { kind: 'shade', name: ref.slice('--color-'.length) }
  if (ref !== undefined) return shadeOf(ref, tokens, seen)
  const mix = MIX.exec(raw)
  const percent = mix === null ? null : resolvePercent(mix[2] ?? '', tokens)
  if (mix !== null && percent !== null) return { kind: 'mix', percent, of: (mix[1] ?? '').replace(/^--tc-/, '') }
  return { kind: 'value', text: raw }
}

/** Which token a role is measured against, and the floor, as check-contrast measures it (R-5.6-4). */
function pairOf(token: string): { fg: string; bg: readonly string[]; min: number } | null {
  if (token === 'body' || token === 'muted') return { fg: token, bg: SURFACES, min: 4.5 }
  if (token === 'line-strong' || token === 'ring') return { fg: token, bg: SURFACES, min: 3 }
  const tone = /^(\w+)-(solid|on-solid|soft|on-soft)$/.exec(token)
  if (tone === null) return null
  const step = tone[2] === 'solid' || tone[2] === 'on-solid' ? 'solid' : 'soft'
  return { fg: `${tone[1] ?? ''}-on-${step}`, bg: [`${tone[1] ?? ''}-${step}`], min: 4.5 }
}

/** Every token the Colors tables name: the surfaces, text, lines, ring and four roles of each tone. */
export const COLOR_TOKENS = [
  ...SURFACES, 'body', 'muted', 'line', 'line-strong', 'ring',
  ...TONES.flatMap((tone) => ['solid', 'on-solid', 'soft', 'on-soft'].map((role) => `${tone}-${role}`)),
].map((token) => `--tc-${token}`)

export function tokenFacts(css: string, palette: Map<string, Color> = readPalette()): Record<string, TokenFact> {
  const blocks = readBlocks(css)
  const byMode = Object.fromEntries(MODES.map((mode) => [mode, tokensFor(blocks, mode)])) as Record<Mode, Map<string, string>>
  const color = (name: string, mode: Mode) => {
    const found = resolve(`--tc-${name}`, byMode[mode], palette)
    if (found === null) throw new Error(`--tc-${name} does not resolve in ${mode}`)
    return found
  }
  const measure = (token: string, mode: Mode): Measured | null => {
    const pair = pairOf(token)
    if (pair === null) return null
    const ratio = Math.min(...pair.bg.map((bg) => contrastRange(color(pair.fg, mode), color(bg, mode)).min))
    return { ratio: Math.round(ratio * 100) / 100, min: pair.min }
  }
  return Object.fromEntries(COLOR_TOKENS.map((name) => {
    const token = name.slice('--tc-'.length)
    const contrast = pairOf(token) === null ? null : Object.fromEntries(MODES.map((mode) => [mode, measure(token, mode)]))
    return [name, {
      shade: Object.fromEntries(MODES.map((mode) => [mode, shadeOf(name, byMode[mode])])),
      contrast,
    } as TokenFact]
  }))
}

/** One top-level block of tokens.css, copied as written, comments included. */
export function blockSource(css: string, selector: string): string {
  const lines = css.split('\n')
  const start = lines.indexOf(`${selector} {`)
  const end = lines.indexOf('}', start)
  if (start === -1 || end === -1) throw new Error(`tokens.css has no top-level ${selector} block`)
  return lines.slice(start, end + 1).join('\n')
}

/** The declarations of the first bare `:root` block: the knobs. */
export function knobsOf(css: string): Record<string, string> {
  const root = readBlocks(css).find((block) => block.selector === ':root')
  if (root === undefined) throw new Error('tokens.css has no :root block')
  return Object.fromEntries(root.decls)
}

/** The groups of docs/icons.md's "The set": `**Title** (n) - \`name\` ...`, one line each. */
export function iconGroupsOf(markdown: string): IconGroup[] {
  const section = /^## The set\n([\s\S]*?)(?=^## )/m.exec(markdown)?.[1] ?? ''
  return [...section.matchAll(/^\*\*(.+?)\*\* \((\d+)\) - (.+)$/gm)].map((match) => {
    const names = [...(match[3] ?? '').matchAll(/`([^`]+)`/g)].map((name) => name[1] ?? '')
    if (names.length !== Number(match[2])) throw new Error(`docs/icons.md: ${match[1] ?? ''} says ${match[2] ?? ''} and lists ${String(names.length)}`)
    return { title: match[1] ?? '', names }
  })
}

/** Every way the grouping can disagree with raw/: an icon in no group, in two, or a name with no file. */
export function groupProblems(groups: IconGroup[], files: readonly string[]): string[] {
  const listed = groups.flatMap((group) => group.names)
  const problems = files.filter((name) => !listed.includes(name)).map((name) => `${name} is in raw/ and in no group`)
  problems.push(...listed.filter((name, index) => listed.indexOf(name) !== index).map((name) => `${name} is in two groups`))
  problems.push(...listed.filter((name) => !files.includes(name)).map((name) => `${name} has no raw/${name}.svg`))
  return problems
}

export function guideFacts(root = LIBRARY): GuideFacts {
  const css = readFileSync(join(root, 'src', 'tokens.css'), 'utf8')
  const files = readdirSync(join(root, 'raw')).filter((file) => file.endsWith('.svg')).map((file) => file.slice(0, -4)).sort()
  const groups = iconGroupsOf(readFileSync(join(root, 'docs', 'icons.md'), 'utf8'))
  const problems = groupProblems(groups, files)
  if (problems.length > 0) throw new Error(`docs/icons.md and raw/ disagree:\n${problems.join('\n')}`)
  return {
    tokens: tokenFacts(css),
    knobs: knobsOf(css),
    modeBlocks: { dark: blockSource(css, "[data-theme='dark']"), ocean: blockSource(css, "[data-theme='ocean']") },
    icons: {
      total: files.length,
      directional: DIRECTIONAL.size,
      groups,
      all: groups.flatMap((group) => group.names).map((name) => ({ name, directional: (DIRECTIONAL as ReadonlySet<string>).has(name), solid: name.endsWith('-fill') })),
    },
  }
}
