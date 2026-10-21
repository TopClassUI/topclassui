import type { ReactNode } from 'react'
import { Table } from 'topclassui/table'
import { getLabels } from 'topclassui/labels/get-labels'

import type { Locale } from '../../content/pages'
import { captionOf, columnFit } from '../../lib/table-of'
import { AUTHORED_CELL, PROSE_COLUMN, PROSE_TABLE } from '../classes'

interface Row {
  key: string
  cells: ReactNode[]
}

/** A table drawn as MdxTable draws a GFM one, from cells a wrapper has already filled in. */
export function DataTable({ header, rows, locale }: { header: ReactNode[]; rows: ReactNode[][]; locale: Locale }) {
  const items: Row[] = rows.map((cells, index) => ({ key: String(index), cells }))
  return (
    <Table
      {...getLabels(locale)}
      items={items}
      getKey={(item) => item.key}
      caption={captionOf(header)}
      className={PROSE_TABLE}
      columns={header.map((cell, column) => ({
        key: String(column),
        header: cell,
        rowHeader: column === 0,
        className: `${PROSE_COLUMN[columnFit(cell, rows.map((cells) => cells[column]), column === header.length - 1)]} ${AUTHORED_CELL}`,
        cell: (item: Row) => item.cells[column],
      }))}
    />
  )
}
