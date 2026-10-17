// R-9.2-4: a part family has no bare <Name> export, so its README imports the flat names and
// documents each part on its own, and a part that passes no attributes on is not said to.
import type { PropRow } from './readme.js'

/** What a part passes on: every attribute and ref to the element it draws, a className alone, or nothing. */
export type Reach = 'element' | 'className' | 'none'

export interface PartRows {
  /** The flat name, as index.tsx exports it: `DialogPopup`. */
  name: string
  rows: PropRow[]
  /** Null for an export with no `<Name>Props`, such as the `toast` function: no sentence names it. */
  reach: Reach | null
}

export interface PartFamily {
  /** The Root first, then the other parts in the order index.tsx exports them. */
  parts: PartRows[]
}

/** What a README imports and what each name passes on, for a component that is not a part family. */
export type Surface = Omit<PartRows, 'rows'>[]

const ATTRIBUTES = 'standard attributes (`onClick`, `aria-*`, `data-*`, `id`) work'
const MERGE = '`className` is merged last, so yours wins a conflict, and `ref` is a normal prop.'
const code = (name: string) => `\`${name}\``

/** Every flat name on a line of its own, so a long family still reads as a list. */
export function familyImport(family: PartFamily): string {
  return ['import {', ...family.parts.map((part) => `  ${part.name},`), "} from 'topclassui'"].join('\n')
}

/** `a`, `b` and `c`: the names a sentence is about. */
function listOf(names: string[]): string {
  const coded = names.map(code)
  return coded.length < 2 ? coded.join('') : `${coded.slice(0, -1).join(', ')} and ${coded.at(-1) ?? ''}`
}

/** The required props, then each group as `a` or `b`, with the literal that asks for it, each once. */
export function requiredOf(rows: PropRow[]): string[] {
  const groups = new Set<string>()
  for (const row of rows) {
    if (row.required) groups.add(code(row.name))
    else if (row.oneOf !== undefined || row.when !== undefined) {
      const names = [row.name, ...row.oneOf ?? []].sort().map(code).join(' or ')
      groups.add(row.when === undefined ? names : `${names} when ${row.when}`)
    }
  }
  return [...groups]
}

function requiredLine(family: PartFamily): string {
  const required = family.parts.flatMap((part) => requiredOf(part.rows).map((names) => `${names} on \`${part.name}\``))
  return required.length === 0
    ? 'Every prop below is optional and falls back to the default shown.'
    : `Required: ${required.join(', ')}. Every other prop below is optional.`
}

/**
 * What the parts pass on, each sentence true of the type it names. `whole` reads "each part" in a
 * family whose every part draws, "the root" for one component, and the names themselves otherwise.
 */
export function reachLine(parts: Surface, whole: 'family' | 'single' | 'surface'): string {
  const named = (reach: Reach) => parts.filter((part) => part.reach === reach).map((part) => part.name)
  const none = named('none')
  const className = named('className')
  const element = named('element')
  const sentences = [
    none.length === 0 ? '' : `${listOf(none)} ${none.length === 1 ? 'draws no element, so it takes' : 'draw no element, so they take'} no \`className\`, \`style\` or \`ref\`.`,
    className.length === 0 ? '' : `${listOf(className)} ${className.length === 1 ? 'takes' : 'take'} no attribute but \`className\`, which is merged last, and no \`ref\`.`,
  ]
  if (element.length > 0) {
    const every = element.length === parts.length
    const where = whole === 'surface' ? `on ${listOf(element)} is passed to the element it draws`
      : whole === 'single' ? 'is passed to the root element'
        : every ? 'is passed to the element each part draws' : 'on another part is passed to the element it draws'
    sentences.push(`Anything else ${where}, so ${ATTRIBUTES}. ${MERGE}`)
  }
  return sentences.filter((s) => s !== '').join(' ')
}

/** The props section of a family: one table per part, under the part's own name. */
export function familyProps(family: PartFamily, table: (rows: PropRow[]) => string): string[] {
  const sections = family.parts.flatMap((part) => [
    `### ${part.name}`,
    '',
    part.rows.length === 0 ? 'This part takes no design props of its own.' : table(part.rows),
    '',
  ])
  return [requiredLine(family), '', ...sections, reachLine(family.parts, 'family'), '']
}
