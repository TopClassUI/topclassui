// The icon pipeline, kept out of the script so the tests can drive it directly.
import { createHash } from 'node:crypto'

/** Names that flip in RTL by shape, before the manual list in docs/icons.md. */
const DIRECTIONAL_PATTERNS = [/^arrow-/, /^caret-/, /^chevron-/]

export interface Icon { name: string; viewBox: string; path: string; directional: boolean }
export interface IconSource { name: string; svg: string }

/** Between one heading and the next, so a name quoted elsewhere is not read as a member. */
export function section(markdown: string, heading: string): string {
  const start = markdown.indexOf(heading)
  if (start < 0) return ''
  const after = start + heading.length
  const end = markdown.indexOf('\n## ', after)
  return markdown.slice(after, end < 0 ? markdown.length : end)
}

const backticked = (text: string) => [...text.matchAll(/`([a-z0-9-]+)`/g)].map((m) => m[1] ?? '')

/** The 84 names docs/icons.md lists, which is the set raw/ must carry. */
export function documentedNames(markdown: string): string[] {
  return [...new Set(backticked(section(markdown, '## The set')))].sort()
}

/** The names docs/icons.md says flip, read from its table rather than from prose. */
export function documentedDirectional(markdown: string): string[] {
  const body = section(markdown, '## Which icons flip in RTL')
  const rows = body.split('\n').filter((l) => l.startsWith('|') && !l.includes('---') && !l.includes('Flips'))
  return [...new Set(rows.flatMap((row) => backticked(row.split('|')[1] ?? '')))].sort()
}

export function manualDirectional(markdown: string): string[] {
  const line = section(markdown, '## Which icons flip in RTL')
    .split('\n')
    .find((l) => l.includes('**Manual list:**'))
  return line ? backticked(line).sort() : []
}

export const isDirectional = (name: string, manual: Set<string>) =>
  DIRECTIONAL_PATTERNS.some((p) => p.test(name)) || manual.has(name)

/** `arrow-u-up-left` to `arrowUUpLeft`, which is the module's export name. */
export function camelCase(name: string): string {
  const [first = '', ...rest] = name.split('-')
  return first + rest.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('')
}

/** Anything a path `d` may NOT contain, so nothing else can reach the generated module. */
const ILLEGAL_PATH_DATA = /[^MmLlHhVvCcSsQqTtAaZz0-9.,+\-eE\s]/

/** Elements whose geometry the `path` field cannot carry. */
const SHAPES = /<(circle|rect|line|polygon|polyline|ellipse|g|use|image|text|clipPath|mask|defs|pattern|filter)\b/

/** Attributes that move or repaint the geometry, which readIcon would throw away. */
const DISCARDED = /\s(transform|clip-path|mask|filter|style|fill-rule|clip-rule|opacity|fill-opacity)=/

const ident = /^[a-z][A-Za-z0-9]*$/

/** One filled path, one viewBox, currentColor: anything else cannot survive IconData. */
export function readIcon(source: IconSource, manual: Set<string>): Icon {
  const { name, svg: original } = source
  // Annotated on the variable, which is what lets TypeScript narrow after a call.
  const fail: (why: string) => never = (why) => { throw new Error(`raw/${name}.svg: ${why}`) }

  // Stripped first, or a commented-out path can become the icon.
  const svg = original.replace(/<!--[\s\S]*?-->/g, '')

  if (!ident.test(camelCase(name))) fail(`gives the invalid export name "${camelCase(name)}"`)

  const extras = SHAPES.exec(svg)
  if (extras) fail(`contains <${extras[1] ?? ''}>; convert it to a path in raw/ first`)

  const paths = [...svg.matchAll(/<path\b[^>]*?\bd="([^"]*)"/g)]
  if (paths.length === 0) fail('has no <path>')
  if (paths.length > 1) fail(`has ${String(paths.length)} paths; merge them into one in raw/ first`)

  const viewBox = /viewBox="([^"]+)"/.exec(svg)?.[1]
  if (viewBox === undefined) fail('has no viewBox')
  if (viewBox !== '0 0 256 256') fail(`has viewBox "${viewBox}", expected "0 0 256 256"`)

  // A stroked outline has no area, so <Svg> would fill it and render nothing.
  const stroked = /\sstroke(-[a-z]+)?="(?!none")/.exec(svg)
  if (stroked) fail('is stroke-drawn; convert the stroke to a filled path in raw/ first')

  const unfilled = /\sfill="none"/.exec(svg)
  if (unfilled) fail('sets fill="none"; the path must be filled, because <Svg> fills it')

  const paint = /(?:fill|stroke)="([^"]+)"/g
  for (const m of svg.matchAll(paint)) {
    const value = (m[1] ?? '').trim()
    if (value.toLowerCase() !== 'currentcolor') fail(`hard-codes the colour "${value}"; it must be currentColor`)
  }

  const discarded = DISCARDED.exec(svg)
  if (discarded) fail(`carries ${discarded[1] ?? ''}, which is dropped; bake it into the path in raw/ first`)

  // Collapsed, because a legal multi-line d would otherwise break the generated module.
  const path = (paths[0]?.[1] ?? '').replace(/\s+/g, ' ').trim()
  if (path === '') fail('has an empty path')
  const illegal = ILLEGAL_PATH_DATA.exec(path)
  if (illegal) {
    fail(`has ${JSON.stringify(illegal[0])} in its path data, which is not a path command or a number`)
  }

  return { name, viewBox, path, directional: isDirectional(name, manual) }
}

const header = '// Generated by pnpm icons:build from raw/. Do not edit.'

export function iconModule(icon: Icon): string {
  return [
    header,
    '',
    "import type { IconData } from '../types.js'",
    '',
    `export const ${camelCase(icon.name)}: IconData = {`,
    `  viewBox: '${icon.viewBox}',`,
    `  path: '${icon.path}',`,
    `  directional: ${String(icon.directional)},`,
    '}',
    '',
  ].join('\n')
}

export function namesModule(icons: Icon[]): string {
  const names = icons.map((i) => `  '${i.name}',`).join('\n')
  return [
    header,
    '',
    'export const ICON_NAMES = [',
    names,
    '] as const',
    '',
    'export type IconName = (typeof ICON_NAMES)[number]',
    '',
  ].join('\n')
}

export function directionalModule(icons: Icon[]): string {
  const names = icons.filter((i) => i.directional).map((i) => `  '${i.name}',`).join('\n')
  return [
    header,
    '',
    "import type { IconName } from './names.generated.js'",
    '',
    '/** Icons whose shape points along the reading direction, so they mirror in RTL. */',
    'export const DIRECTIONAL: ReadonlySet<IconName> = new Set<IconName>([',
    names,
    '])',
    '',
  ].join('\n')
}

export function loadersModule(icons: Icon[]): string {
  const entries = icons
    .map((i) => `  '${i.name}': () => import('./data/${i.name}.js').then((m) => m.${camelCase(i.name)}),`)
    .join('\n')
  return [
    header,
    '',
    "import type { IconData } from './types.js'",
    "import type { IconName } from './names.generated.js'",
    '',
    '/** One code-split chunk per icon, so the map costs bytes and never path data. */',
    'export const LOADERS: Record<IconName, () => Promise<IconData>> = {',
    entries,
    '}',
    '',
  ].join('\n')
}

export function versionModule(icons: Icon[]): string {
  const hash = createHash('sha256')
  for (const icon of icons) hash.update(`${icon.name}|${icon.viewBox}|${icon.path}|${String(icon.directional)}\n`)
  return [
    header,
    '',
    `export const ICONS_VERSION = '${hash.digest('hex').slice(0, 12)}'`,
    `export const ICONS_COUNT = ${String(icons.length)}`,
    '',
  ].join('\n')
}

/** Every file the pipeline owns, as a path relative to src/icons. */
export function generate(sources: IconSource[], markdown: string): Map<string, string> {
  const manual = new Set(manualDirectional(markdown))
  const icons = sources
    .map((s) => readIcon(s, manual))
    .sort((a, b) => a.name.localeCompare(b.name, 'en'))

  const byExport = new Map<string, string>()
  for (const icon of icons) {
    const key = camelCase(icon.name)
    const clash = byExport.get(key)
    if (clash !== undefined) throw new Error(`${icon.name} and ${clash} both export "${key}"`)
    byExport.set(key, icon.name)
  }

  const documented = documentedNames(markdown)
  const present = icons.map((i) => i.name)
  const missing = documented.filter((n) => !present.includes(n))
  const extra = present.filter((n) => !documented.includes(n))
  if (missing.length) throw new Error(`docs/icons.md lists icons raw/ does not have: ${missing.join(', ')}`)
  if (extra.length) throw new Error(`raw/ has icons docs/icons.md does not list: ${extra.join(', ')}`)

  const derived = icons.filter((i) => i.directional).map((i) => i.name).sort()
  const tabled = documentedDirectional(markdown)
  if (derived.join(',') !== tabled.join(',')) {
    throw new Error(
      'the directional set does not match the table in docs/icons.md.'
      + `\n  derived: ${derived.join(', ')}`
      + `\n  table:   ${tabled.join(', ')}`,
    )
  }

  const files = new Map<string, string>()
  for (const icon of icons) files.set(`data/${icon.name}.ts`, iconModule(icon))
  files.set('names.generated.ts', namesModule(icons))
  files.set('directional.generated.ts', directionalModule(icons))
  files.set('loaders.generated.ts', loadersModule(icons))
  files.set('version.generated.ts', versionModule(icons))
  return files
}
