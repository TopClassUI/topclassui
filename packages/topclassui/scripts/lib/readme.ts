// R-8.3-3: the props table is generated, never written by hand, so it cannot tell a
// reader that a prop is optional when the schema says otherwise.
import type { ComponentMeta, Rendering } from '../../src/shared/meta.js'
import { type PartFamily, type Surface, familyImport, familyProps, reachLine, requiredOf } from './readme-parts.js'

export const HAND_START = '<!-- hand-written -->'
export const HAND_END = '<!-- /hand-written -->'

const PLACEHOLDER = `## When to use

TODO(tc): one or two lines. Everything below this block is generated.`

export interface PropRow {
  name: string
  required: boolean
  type: string
  default: string
  description: string
  /** The props that may stand in for this one, such as `aria-labelledby` for `aria-label`. */
  oneOf?: string[] | undefined
  /** The literal that makes this prop required, such as `readOnly={false}`; absent, it always is. */
  when?: string | undefined
}

export interface ReadmeInput {
  meta: ComponentMeta
  props: PropRow[]
  demos: string[]
  /** Kept across a regeneration, so the prose a human wrote is never lost. */
  handWritten: string
  /** A part family (R-9.2-4): its flat names and its props part by part, in place of `props`. */
  family?: PartFamily | undefined
  /** What a single component imports, when index.tsx exports no bare <Name>, as Toast does. */
  surface?: Surface | undefined
}

const RENDERING_LINE: Record<Rendering, string> = {
  server: 'renders on the server and ships no client JavaScript',
  split: 'renders on the server, with only its interactive part in the browser',
  client: 'runs in the browser',
}

/** The slice of JSON Schema that `z.toJSONSchema` emits for one design prop. */
export interface JsonSchemaProp {
  type?: string
  enum?: readonly (string | number | boolean)[]
  default?: unknown
  description?: string
  minimum?: number
  maximum?: number
}

export interface JsonSchemaObject {
  properties?: Record<string, JsonSchemaProp>
  required?: readonly string[]
}

/** `` `a` | `b` `` from an enum, or the plain type with whatever limits it carries. */
export function printType(schema: JsonSchemaProp): string {
  if (schema.enum) return schema.enum.map((v) => `\`${String(v)}\``).join(' | ')
  const type = schema.type ?? 'unknown'
  const limits = [
    schema.minimum === undefined ? null : `min ${String(schema.minimum)}`,
    schema.maximum === undefined ? null : `max ${String(schema.maximum)}`,
  ].filter((part) => part !== null)
  return limits.length === 0 ? `\`${type}\`` : `\`${type}\`, ${limits.join(', ')}`
}

/** The rows of the props table, from the schema's JSON Schema form. */
export function rowsFromJsonSchema(json: JsonSchemaObject): PropRow[] {
  const required = new Set(json.required ?? [])
  return Object.entries(json.properties ?? {}).map(([name, schema]) => ({
    name,
    required: required.has(name),
    type: printType(schema),
    default: schema.default === undefined ? '-' : `\`${JSON.stringify(schema.default)}\``,
    description: schema.description ?? '',
  }))
}

/** Merges the props a type declares on top of the schema rows, by name. */
export function mergeRows(fromSchema: PropRow[], fromTypes: PropRow[]): PropRow[] {
  const byName = new Map(fromSchema.map((r) => [r.name, r]))
  for (const row of fromTypes) {
    const existing = byName.get(row.name)
    // The schema is richer where both describe a prop; the type only adds what it knows.
    if (existing) byName.set(row.name, { ...existing, required: row.required, oneOf: row.oneOf, when: row.when })
    else byName.set(row.name, row)
  }
  const rank = (row: PropRow) => (row.required ? 0 : row.oneOf !== undefined || row.when !== undefined ? 1 : 2)
  return [...byName.values()].sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name))
}

/** Whatever a human wrote between the markers, or the placeholder on a first run. */
export function handWrittenOf(existing: string | null): string {
  if (existing === null) return PLACEHOLDER
  const start = existing.indexOf(HAND_START)
  const end = existing.indexOf(HAND_END)
  if (start === -1 || end === -1 || end < start) return PLACEHOLDER
  const body = existing.slice(start + HAND_START.length, end).trim()
  return body === '' ? PLACEHOLDER : body
}

/** A bare pipe would end the cell, and a printed union type is full of them. */
const cell = (text: string) => text.split('|').join('\\|')

function requiredCell(row: PropRow): string {
  if (row.required) return '**yes**'
  if (row.oneOf === undefined && row.when === undefined) return 'no'
  const or = row.oneOf === undefined ? '' : `, or ${row.oneOf.map((name) => `\`${name}\``).join(' or ')}`
  return `**yes**${or}${row.when === undefined ? '' : ` when ${row.when}`}`
}

function propsTable(rows: PropRow[]): string {
  if (rows.length === 0) return 'This component takes no design props of its own.'
  const head = '| Prop | Required | Type | Default | What it does |\n|---|---|---|---|---|'
  const body = rows.map((r) =>
    `| \`${r.name}\` | ${requiredCell(r)} | ${cell(r.type)} | ${cell(r.default)} | ${cell(r.description)} |`)
  return [head, ...body].join('\n')
}

function singleProps(props: PropRow[], surface: Surface, whole: 'single' | 'surface'): string[] {
  const required = requiredOf(props)
  const reach = reachLine(surface, whole)
  return [
    required.length === 0
      ? 'Every prop below is optional and falls back to the default shown.'
      : `Required: ${required.join(', ')}. Every other prop below is optional.`,
    '',
    propsTable(props),
    '',
    ...(reach === '' ? [] : [reach, '']),
  ]
}

/** One name on one line; several, as Toast's viewport and its calls, on one line too. */
const singleImport = (surface: Surface) => `import { ${surface.map((part) => part.name).join(', ')} } from 'topclassui'`

export function renderReadme(input: ReadmeInput): string {
  const { meta, props, demos, handWritten, family } = input
  const surface = input.surface ?? [{ name: meta.name, reach: 'element' }]
  const whole = surface.length === 1 && surface[0]?.name === meta.name ? 'single' : 'surface'
  const category = meta.category.replace(/-/g, ' ')

  const lines = [
    `# ${meta.name}`,
    '',
    '<!-- Generated by `pnpm readme:build`. Edit only inside the hand-written block. -->',
    '',
    `${category} · tier ${String(meta.tier)} · ${meta.status} · ${RENDERING_LINE[meta.rendering]}.`,
    '',
    HAND_START,
    '',
    handWritten,
    '',
    HAND_END,
    '',
    '## Import',
    '',
    '```tsx',
    family ? familyImport(family) : singleImport(surface),
    '```',
    '',
    '## Props',
    '',
    ...(family ? familyProps(family, propsTable) : singleProps(props, surface, whole)),
  ]

  if (demos.length > 0) {
    lines.push('## Examples', '', ...demos.map((d) => `- \`dummy/${d}.tsx\``), '')
  }

  lines.push(
    '## Verified against',
    '',
    meta.baseUi === null
      ? 'Base UI: not used by this component.'
      : `Base UI \`${meta.baseUi}\`, version ${String(meta.baseUiRange)}.`,
    '',
    meta.optionalDeps.length === 0
      ? 'No optional peer dependency.'
      : `Optional peers: ${meta.optionalDeps.map((d) => `\`${d}\``).join(', ')}.`,
    '',
  )

  return lines.join('\n')
}
