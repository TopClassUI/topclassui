// The wrappers on the foundation pages read the GFM table an author wrote inside them, then add the generated columns.
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
