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

/** A state's caption: its aria-label, else a string title, else its text; empty for a part with nothing to show inline (a portal). */
export function captionOf(node: ReactNode): string {
  if (!isValidElement<Props>(node)) return ''
  const { 'aria-label': label, title } = node.props
  if (typeof label === 'string') return label
  if (typeof title === 'string') return title
  return textOf(node.props.children).trim()
}

export interface StateStripProps {
  /** What dummy/states.tsx returned: a plain element whose children are the states. */
  tree: ReactNode
  heading: string
  /** "n states" for n from 0, since a function cannot reach a client island. */
  counts: string[]
  /** The count read from the source, for a demo whose root is not a plain element. */
  sourceCount: number
}

export function StateStrip({ tree, heading, counts, sourceCount }: StateStripProps) {
  const root = isValidElement<Props>(tree) && typeof tree.type === 'string' ? tree : null
  const parts = root === null ? [] : Children.toArray(root.props.children)
  const cells = parts.filter((part) => captionOf(part) !== '')
  const rest = parts.filter((part) => captionOf(part) === '')
  const count = cells.length === 0 ? sourceCount : cells.length
  return (
    <>
      <div className={PART_ROW}>
        <h3 className={CAPTION}>{heading}</h3>
        <span className="font-mono text-xs text-muted">{counts[count] ?? counts.at(-1)}</span>
      </div>
      <ModeScope className={STATE_SCOPE}>
        {cells.length === 0 ? tree : (
          <>
            <ul className={STATE_GRID}>
              {cells.map((part, index) => (
                <li key={index} className={STATE_CELL}>
                  <div className={STATE_BOX}>{part}</div>
                  <span aria-hidden="true" className={STATE_CAPTION}>{captionOf(part)}</span>
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
