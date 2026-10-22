// The Every state strip (S8) as the Previewer frames draw it: each state of dummy/states.tsx in a cell of its own, its caption under it.
import { Children, type ReactNode, isValidElement } from 'react'

import { CAPTION, PART_ROW, STATE_BOX, STATE_CAPTION, STATE_CELL, STATE_GRID, STATE_SCOPE } from '../classes'
import { ModeScope } from './previewer-mode'

type Props = { 'aria-label'?: unknown; title?: unknown; children?: ReactNode }

/** The words inside a node, as a screen reader would meet them. */
function textOf(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(textOf).join('')
  if (isValidElement<Props>(node)) return textOf(node.props.children)
  return ''
}

/** Longer text is the state's content, not its name, so the cell goes uncaptioned. */
const CAPTION_MAX = 40

/** What names a state: its aria-label, else a string title, else its text; empty for a part with nothing to show inline (a portal). */
export function nameOf(node: ReactNode): string {
  if (!isValidElement<Props>(node)) return ''
  const { 'aria-label': label, title } = node.props
  if (typeof label === 'string') return label
  if (typeof title === 'string') return title
  return textOf(node.props.children).trim()
}

/** The caption under a cell: its name when short enough to read as one. */
export const captionOf = (node: ReactNode): string => {
  const name = nameOf(node)
  return name.length <= CAPTION_MAX ? name : ''
}

export interface StateStripProps {
  /** What dummy/states.tsx returned: a plain element whose children are the states. */
  tree: ReactNode
  heading: string
  /** "n states" for n from 0, since a function cannot reach a client island. */
  counts: string[]
  /** The count read from the source, for a demo whose root is not a plain element. */
  sourceCount: number
  /** The caption in the page's language by state id; an id missing here is printed as it is. */
  names: Record<string, string>
}

export function StateStrip({ tree, heading, counts, sourceCount, names }: StateStripProps) {
  const root = isValidElement<Props>(tree) && typeof tree.type === 'string' ? tree : null
  const parts = root === null ? [] : Children.toArray(root.props.children)
  const cells = parts.filter((part) => nameOf(part) !== '')
  const rest = parts.filter((part) => nameOf(part) === '')
  const count = cells.length === 0 ? sourceCount : cells.length
  return (
    <>
      <div className={PART_ROW}>
        <h3 className={CAPTION}>{heading}</h3>
        <span className="font-mono text-xs/3 text-muted">{counts[count] ?? counts.at(-1)}</span>
      </div>
      <ModeScope className={STATE_SCOPE}>
        {cells.length === 0 ? tree : (
          <>
            <ul className={STATE_GRID}>
              {cells.map((part, index) => (
                <li key={index} className={STATE_CELL}>
                  <div className={STATE_BOX}>{part}</div>
                  {captionOf(part) === '' ? null : <span aria-hidden="true" className={STATE_CAPTION}>{names[captionOf(part)] ?? captionOf(part)}</span>}
                </li>
              ))}
            </ul>
            {rest}
          </>
        )}
      </ModeScope>
    </>
  )
}
