// The wrappers on the foundation pages read the GFM table an author wrote inside them, then add the generated columns; and how every guide table lays out.
import { Children, isValidElement, type ReactNode } from 'react'

import { textOf } from './text-of'

export interface TableOf {
  header: ReactNode[]
  rows: ReactNode[][]
}

/** Table's highest row cap: a docs table is short and shows whole, as the frames draw every table, even when its cells wrap. */
export const TABLE_ROWS_ALL = 20

type WithChildren = { children?: ReactNode }

function cellsOf(row: ReactNode): ReactNode[] {
  const cells: ReactNode[] = []
  if (!isValidElement<WithChildren>(row)) return cells
  Children.forEach(row.props.children, (cell) => {
    if (isValidElement<WithChildren>(cell)) cells.push(cell.props.children)
  })
  return cells
}

/** The first table among the children: its header cells and its body rows, as written. */
export function tableOf(children: ReactNode): TableOf {
  const found: TableOf = { header: [], rows: [] }
  const walk = (node: ReactNode) => {
    Children.forEach(node, (child) => {
      if (!isValidElement<WithChildren>(child)) return
      if (child.type === 'thead') found.header = cellsOf(Children.toArray(child.props.children).find((row) => isValidElement(row)))
      else if (child.type === 'tbody') Children.forEach(child.props.children, (row) => { if (isValidElement(row)) found.rows.push(cellsOf(row)) })
      else if (found.header.length === 0) walk(child.props.children)
    })
  }
  walk(children)
  if (found.header.length === 0) throw new Error('expected a GFM table inside the wrapper')
  return found
}

/** The table's caption: its column names, as MdxTable gives every table. */
export function captionOf(header: readonly ReactNode[]): string {
  return header.map(textOf).join(', ')
}

/** Longer than this, a cell reads as prose and its column wraps; "Next.js 15 or 16, App Router" and the 33-character split chip stay on one line. */
const ONE_LINE = 34

/** How a column of a guide table lays out: on one line when its header and every cell are short, wrapping otherwise; a long last column reads as prose, so a short one (a ratio, "Every pnpm check") sits at the end as the frames draw it. */
export function columnFit(header: ReactNode, cells: readonly ReactNode[], last: boolean): 'fit' | 'wrap' | 'prose' {
  const short = [header, ...cells].every((cell) => textOf(cell).length <= ONE_LINE)
  if (short) return 'fit'
  return last ? 'prose' : 'wrap'
}

/** A default as docs:data prints it, one object entry per line so a narrow column never wraps inside one: `{ a: 1,` `b: 2 }`. */
export function defaultLines(text: string): string[] {
  if (!text.startsWith('{ ') || !text.endsWith(' }')) return [text]
  const inner = text.slice(2, -2)
  const entries: string[] = []
  let depth = 0
  let quote = ''
  let start = 0
  for (let at = 0; at < inner.length; at += 1) {
    const char = inner.charAt(at)
    if (quote !== '') quote = char === quote ? '' : quote
    else if (char === "'" || char === '"') quote = char
    else if ('{[('.includes(char)) depth += 1
    else if ('}])'.includes(char)) depth -= 1
    else if (char === ',' && depth === 0) {
      entries.push(inner.slice(start, at).trim())
      start = at + 1
    }
  }
  entries.push(inner.slice(start).trim())
  return entries.map((entry, at) => `${at === 0 ? '{ ' : ''}${entry}${at === entries.length - 1 ? ' }' : ','}`)
}
