// What the getting-started pages print from the library: the provider's props, the utility names and the theme script.
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import ts from 'typescript'
import { THEME_SCRIPT } from 'topclassui/theme'
import { z } from 'zod'

import { DEFAULT_ADAPTIVE_QUERY } from '../../../../packages/topclassui/src/shared/adaptive/use-adaptive-mode.js'
import { COLLECTION_DEFAULTS } from '../../../../packages/topclassui/src/shared/contracts/collection.js'
import { TOAST_DEFAULTS } from '../../../../packages/topclassui/src/shared/contracts/toast.js'
import { openTypeProgram, ownPropsOf } from '../../../../packages/topclassui/scripts/lib/readme-types.js'
import { LIBRARY } from './library.js'

export const PROVIDER_FILE = join(LIBRARY, 'src', 'shared', 'provider', 'provider.tsx')

/** The provider's defaults live in these constants, not in a schema, so they are read from them. */
const PROVIDER_DEFAULTS: Record<string, unknown> = {
  adaptive: { query: DEFAULT_ADAPTIVE_QUERY },
  collection: COLLECTION_DEFAULTS,
  toast: TOAST_DEFAULTS,
}

export const guidesFileSchema = z.strictObject({
  provider: z.array(z.strictObject({ name: z.string().min(1), required: z.boolean(), type: z.string().min(1), default: z.string().min(1) })).min(1),
  utilities: z.array(z.strictObject({ tokens: z.array(z.string().min(1)).min(1), utilities: z.array(z.string().min(1)).min(1) })).min(1),
  themeScript: z.string().min(1),
  themeScriptHash: z.string().regex(/^sha256-[A-Za-z0-9+/]+=*$/),
})

export type GuidesFile = z.infer<typeof guidesFileSchema>

const literalsOf = (type: ts.Type): string | null => {
  const parts = (type.isUnion() ? type.types : [type]).filter((t) => (t.flags & ts.TypeFlags.Undefined) === 0)
  if (!parts.every((t) => t.isStringLiteral())) return null
  return parts.map((t) => `'${t.value}'`).join(' | ')
}

/** A default as a reader writes it in TypeScript: `{ query: '(width < 48rem)' }`. */
export function printValue(value: unknown): string {
  if (typeof value === 'string') return `'${value}'`
  if (value === null || typeof value !== 'object') return String(value)
  const entries = Object.entries(value).map(([key, inner]) => `${key}: ${printValue(inner)}`)
  return `{ ${entries.join(', ')} }`
}

/** The provider's own props through the README generator; a type alias of string literals is spelled out. */
export function providerProps(file = PROVIDER_FILE): GuidesFile['provider'] {
  const program = openTypeProgram(LIBRARY, [file])
  const checker = program.getTypeChecker()
  const source = program.getSourceFile(file)
  const symbol = source && checker.getSymbolAtLocation(source)
  const props = symbol && checker.getExportsOfModule(symbol).find((e) => e.name === 'TopClassProviderProps')
  const declared = props && checker.getDeclaredTypeOfSymbol(props)
  return ownPropsOf(program, file, 'TopClassProviderProps').map((row) => {
    const member = declared?.getProperty(row.name)
    const literal = member && source ? literalsOf(checker.getTypeOfSymbolAtLocation(member, source)) : null
    const fallback = PROVIDER_DEFAULTS[row.name]
    return {
      name: row.name,
      required: row.required,
      type: literal ?? row.type.replace(/`/g, ''),
      default: fallback === undefined ? row.default : printValue(fallback),
    }
  })
}

/** The utility a component writes for one theme variable, by its namespace and role. */
function utilityOf(name: string): string {
  const [space = '', ...rest] = name.split('-')
  const key = rest.join('-')
  if (space === 'radius') return `rounded-${key}`
  if (space === 'font') return `font-${key}`
  if (space === 'spacing') return key.startsWith('pad-x') ? `px-${key}` : key.startsWith('pad-y') ? `py-${key}` : key.startsWith('control') ? `h-${key}` : `size-${key}`
  if (key === 'ring') return 'outline-ring'
  if (key.startsWith('line')) return `border-${key}`
  if (key === 'body' || key === 'muted' || key.includes('-on-')) return `text-${key}`
  return `bg-${key}`
}

/** The row a theme variable joins: its first name segment for a colour (a tone, `surface`, `line`), its scale for spacing. */
function groupOf(name: string): string {
  const [space = '', first = '', second = ''] = name.split('-')
  if (space === 'color') return first
  if (space === 'spacing') return first === 'pad' ? `pad-${second}` : first
  return space
}

/** The `@theme inline` block of the library's styles.css, one row per group, in the file's order. */
export function themeUtilities(css = readFileSync(join(LIBRARY, 'src', 'styles.css'), 'utf8')): GuidesFile['utilities'] {
  const block = /@theme inline\s*\{([\s\S]*?)\n\}/.exec(css)?.[1] ?? ''
  const rows = new Map<string, { tokens: string[]; utilities: string[] }>()
  for (const [, name = '', value = ''] of block.matchAll(/^\s*--([\w-]+):\s*([^;]+);/gm)) {
    const row = rows.get(groupOf(name)) ?? { tokens: [], utilities: [] }
    row.tokens.push(/^var\((--tc-[\w-]+)\)$/.exec(value.trim())?.[1] ?? `--${name}`)
    row.utilities.push(utilityOf(name))
    rows.set(groupOf(name), row)
  }
  return [...rows.values()]
}

/** The CSP source of the inline theme script: the SHA-256 of the exact string, base64. */
export function hashOf(script: string): string {
  return `sha256-${createHash('sha256').update(script, 'utf8').digest('base64')}`
}

export function guideFacts(): GuidesFile {
  return { provider: providerProps(), utilities: themeUtilities(), themeScript: THEME_SCRIPT, themeScriptHash: hashOf(THEME_SCRIPT) }
}
