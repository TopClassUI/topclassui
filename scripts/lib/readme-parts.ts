// R-9.2-4: a part family has no bare <Name> export, so its README imports the flat names and
// documents each part on its own, and a Root that draws no element is not said to take attributes.
import type { PropRow } from './readme.js'

export interface PartRows {
  /** The flat name, as index.tsx exports it: `DialogPopup`. */
  name: string
  rows: PropRow[]
}

export interface PartFamily {
  /** The Root first, then the other parts in the order index.tsx exports them. */
  parts: PartRows[]
  /** False for a Root that only holds state, such as DialogRoot: it takes no className, style or ref. */
  rootDraws: boolean
}

const ATTRIBUTES = 'standard attributes (`onClick`, `aria-*`, `data-*`, `id`) work'
const MERGE = '`className` is merged last, so yours wins a conflict, and `ref` is a normal prop.'

/** Every flat name on a line of its own, so a long family still reads as a list. */
export function familyImport(family: PartFamily): string {
  return ['import {', ...family.parts.map((part) => `  ${part.name},`), "} from 'topclassui'"].join('\n')
}

function requiredLine(family: PartFamily): string {
  const required = family.parts.flatMap((part) =>
    part.rows.filter((row) => row.required).map((row) => `\`${row.name}\` on \`${part.name}\``))
  return required.length === 0
    ? 'Every prop below is optional and falls back to the default shown.'
    : `Required: ${required.join(', ')}. Every other prop below is optional.`
}

function closingLine(family: PartFamily): string {
  const root = family.parts[0]?.name ?? 'The root'
  return family.rootDraws
    ? `Anything else is passed to the element each part draws, so ${ATTRIBUTES}. ${MERGE}`
    : `\`${root}\` draws no element, so it takes no \`className\`, \`style\` or \`ref\`. Anything else on another part is passed to the element it draws, so ${ATTRIBUTES}. ${MERGE}`
}

/** The props section of a family: one table per part, under the part's own name. */
export function familyProps(family: PartFamily, table: (rows: PropRow[]) => string): string[] {
  const sections = family.parts.flatMap((part) => [
    `### ${part.name}`,
    '',
    part.rows.length === 0 ? 'This part takes no design props of its own.' : table(part.rows),
    '',
  ])
  return [requiredLine(family), '', ...sections, closingLine(family), '']
}
