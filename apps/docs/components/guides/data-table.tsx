import type { ReactNode } from 'react'
import { Table } from 'topclassui/table'
import { getLabels } from 'topclassui/labels/get-labels'

import type { Locale } from '../../content/pages'
import { TABLE_ROWS_ALL, captionOf, columnsOf } from '../../lib/table-of'
import { AUTHORED_CELL, PROSE_COLUMN, PROSE_TABLE } from '../classes'

interface Row {
  key: string
  cells: ReactNode[]
}

/** A table drawn as MdxTable draws a GFM one, from cells a wrapper has already filled in; every row shows, and head="code" sets every header in mono, as Every class is drawn. */
export function DataTable({ header, rows, locale, head = 'auto' }: { header: ReactNode[]; rows: ReactNode[][]; locale: Locale; head?: 'auto' | 'code' }) {
  const items: Row[] = rows.map((cells, index) => ({ key: String(index), cells }))
  const layout = columnsOf(header, rows, head)
  return (
    <Table
      {...getLabels(locale)}
      items={items}
      getKey={(item) => item.key}
      visibleRows={TABLE_ROWS_ALL}
      caption={captionOf(header)}
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
