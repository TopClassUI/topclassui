import { createElement, type ReactElement } from 'react'
import { renderToString } from 'react-dom/server'
import { beforeEach, describe, expect, expectTypeOf, it, vi } from 'vitest'

import type { TableProps, TableRowsProps } from '../types.js'

// R-5.1-3: what the server hands the one client part, the body. Recorded instead of rendered.
const seen: TableRowsProps[] = []
vi.mock('../client.js', () => ({ TableRows: (props: TableRowsProps) => { seen.push(props); return null } }))
const { Table } = await import('../index.js')

interface Row { id: string; n: number }
const items: Row[] = [{ id: 'a', n: 1 }, { id: 'b', n: 2 }]
const columns = [{ key: 'n', header: 'N', className: 'min-w-40', cell: (row: Row) => createElement('b', null, row.n) }]

function body(extra: Partial<TableProps<Row>> = {}): TableRowsProps | undefined {
  seen.length = 0
  renderToString(createElement(Table<Row>, { items, getKey: (row) => row.id, columns, caption: 'Rows', ...extra }))
  return seen[0]
}

beforeEach(() => { seen.length = 0 })

describe('the body is the one client part', () => {
  it('the server ran getKey and every cell: rows cross as keys and rendered nodes, columns as plain data', () => {
    const rows = body()?.rows ?? []
    expect(rows.map((row) => row.key)).toEqual(['a', 'b'])
    expect((rows[1]?.cells[0] as ReactElement | undefined)?.type).toBe('b')
    expect(body()?.columns).toEqual([{ key: 'n', rowHeader: false, className: expect.stringContaining('border-t') as string, sticky: false, own: 'min-w-40' }])
  })

  it('no function crosses but loadMore, which a server page passes as a Server Action', () => {
    expectTypeOf<Pick<TableProps<Row>, 'hasMore' | 'loadMore'>>().toEqualTypeOf<{ hasMore?: boolean | undefined; loadMore?: (() => void | Promise<void>) | undefined }>()
    const props = body({ hasMore: true, loadMore: () => Promise.resolve() }) ?? {}
    expect(Object.entries(props).filter(([, value]) => typeof value === 'function').map(([key]) => key)).toEqual(['loadMore'])
  })

  it('clamps visibleRows and loadMoreThreshold before they cross (R-5.7-7), and leaves visibleRows out when it is', () => {
    expect(body()?.visibleRows).toBeUndefined()
    expect(body({ visibleRows: 99 })?.visibleRows).toBe(20)
    expect(body({ visibleRows: 0 })?.visibleRows).toBe(1)
    expect(body({ loadMoreThreshold: 999 })?.loadMoreThreshold).toBe(200)
    expect(body()?.loadMoreThreshold).toBe(10)
  })

  it('an empty table renders its empty row on the server and mounts no client part', () => {
    expect(body({ items: [] })).toBeUndefined()
  })
})
