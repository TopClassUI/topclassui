import type { ReactNode } from 'react'
import { Table } from 'topclassui/table'
import { getLabels } from 'topclassui/labels/get-labels'

import type { Locale } from '../../content/pages'
import { captionOf } from '../../lib/table-of'

interface Row {
  key: string
  cells: ReactNode[]
}

/** A table drawn as MdxTable draws a GFM one, from cells a wrapper has already filled in; every row shows, as the frames draw them. */
export function DataTable({ header, rows, locale }: { header: ReactNode[]; rows: ReactNode[][]; locale: Locale }) {
  const items: Row[] = rows.map((cells, index) => ({ key: String(index), cells }))
  return (
    <Table
      {...getLabels(locale)}
      items={items}
      getKey={(item) => item.key}
      visibleRows={items.length}
      caption={captionOf(header)}
      columns={header.map((cell, column) => ({
        key: String(column),
        header: cell,
        rowHeader: column === 0,
        className: 'whitespace-normal',
        cell: (item: Row) => item.cells[column],
      }))}
    />
  )
}
