import { Children, isValidElement, type ReactNode } from 'react'
import { Table } from 'topclassui/table'
import { getLabels } from 'topclassui/labels/get-labels'

import type { Locale } from '../../content/pages'
import { TABLE_ROWS_ALL, columnsOf } from '../../lib/table-of'
import { textOf } from '../../lib/text-of'
import { AUTHORED_CELL, PROSE_COLUMN, PROSE_TABLE } from '../classes'

type Row = { key: string; cells: ReactNode[] }

/** The rows of a GFM table's thead or tbody, as cells. */
function rowsOf(section: ReactNode): ReactNode[][] {
  const rows: ReactNode[][] = []
  Children.forEach(section, (row) => {
    if (!isValidElement<{ children?: ReactNode }>(row)) return
    const cells: ReactNode[] = []
    Children.forEach(row.props.children, (cell) => {
      if (isValidElement<{ children?: ReactNode }>(cell)) cells.push(cell.props.children)
    })
    rows.push(cells)
  })
  return rows
}

/** A GFM table drawn by the library's Table; the header row names the columns and the caption, and every row shows. */
export function MdxTable({ children, locale }: { children?: ReactNode; locale: Locale }) {
  let header: ReactNode[] = []
  let body: ReactNode[][] = []
  Children.forEach(children, (part) => {
    if (!isValidElement<{ children?: ReactNode }>(part)) return
    if (part.type === 'thead') header = rowsOf(part.props.children)[0] ?? []
    if (part.type === 'tbody') body = rowsOf(part.props.children)
  })
  const items: Row[] = body.map((cells, index) => ({ key: String(index), cells }))
  const layout = columnsOf(header, body)
  const caption = header.map(textOf).join(', ')
  return (
    <Table
      {...getLabels(locale)}
      items={items}
      getKey={(item) => item.key}
      visibleRows={TABLE_ROWS_ALL}
      caption={caption === '' ? '-' : caption}
      className={PROSE_TABLE}
      columns={header.map((cell, column) => ({
        key: String(column),
        header: cell,
        rowHeader: column === 0,
        className: `${PROSE_COLUMN[layout[column]?.fit ?? 'prose']} ${AUTHORED_CELL}${layout[column]?.fill === true ? ' w-full' : ''}`,
        cell: (item: Row) => item.cells[column],
      }))}
    />
  )
}
