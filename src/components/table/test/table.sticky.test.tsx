import { describe, expect, it } from 'vitest'

import { classList, markup } from '#test/markup.js'
import { Table } from '../index.js'
import type { TableColumn, TableProps } from '../types.js'

interface Invoice { id: string; number: string; status: string; amount: number }

const invoices: Invoice[] = [
  { id: 'a', number: 'INV-1', status: 'Paid', amount: 120 },
  { id: 'b', number: 'INV-2', status: 'Due', amount: 80 },
  { id: 'c', number: 'INV-3', status: 'Paid', amount: 310 },
  { id: 'd', number: 'INV-4', status: 'Late', amount: 45 },
]

const columns: TableColumn<Invoice>[] = [
  { key: 'number', header: 'Invoice', sortHref: '?sort=number', cell: (invoice) => invoice.number },
  { key: 'status', header: 'Status', cell: (invoice) => invoice.status },
  { key: 'amount', header: 'Amount', align: 'end', sortHref: '?sort=amount', cell: (invoice) => invoice.amount },
]

const html = (props: Partial<TableProps<Invoice>> = {}) =>
  markup(<Table caption="Invoices" items={invoices} getKey={(invoice) => invoice.id} columns={columns} {...props} />)

/** The class list of every opening tag of one element, in document order. */
const classesOf = (source: string, tag: string) =>
  [...source.matchAll(new RegExp(`<${tag}(?: [^>]*)?>`, 'g'))].map((m) => classList(m[0]))

const body = (source: string) => source.slice(source.indexOf('<tbody>'))

/** What a stuck cell adds to its own classes, before its fill. */
const STUCK = ['sticky', 'inset-s-0', 'z-(--tc-z-sticky)', 'max-w-[var(--tc-table-sticky-width,8rem)]', 'truncate']

describe('stickyFirstColumn', () => {
  it('sticks nothing and pads nothing by default', () => {
    expect(html()).not.toContain('sticky')
    expect(html()).not.toContain('inset-s-0')
    expect(html()).not.toContain('scroll-ps-')
    expect(html()).not.toContain('--tc-table-sticky-width')
  })

  it('sticks the first header cell to the inline start, on the fill every header has', () => {
    const [first, ...others] = classesOf(html({ stickyFirstColumn: true }), 'th')
    expect(first).toEqual(expect.arrayContaining(['sticky', 'inset-s-0', 'bg-surface']))
    expect(others.flat().filter((c) => c === 'sticky' || c === 'inset-s-0')).toEqual([])
  })

  it('sticks the first cell of every row and no other', () => {
    const cells = classesOf(body(html({ stickyFirstColumn: true })), 'td')
    expect(cells.map((list) => list.includes('sticky') && list.includes('inset-s-0')))
      .toEqual([true, false, false, true, false, false, true, false, false, true, false, false])
  })

  it('gives the sticky cell an opaque fill of its own, or the columns scrolling under it show through', () => {
    const cells = classesOf(body(html({ stickyFirstColumn: true })), 'td')
    expect(cells.map((list) => list.filter((c) => c.startsWith('bg-')).join()))
      .toEqual(['bg-surface-raised', '', '', 'bg-surface-raised', '', '', 'bg-surface-raised', '', '', 'bg-surface-raised', '', ''])
  })

  it('repeats the tint on the sticky cell of a striped row, and only there', () => {
    const cells = classesOf(body(html({ stickyFirstColumn: true, striped: true })), 'td')
    expect(cells.map((list) => list.filter((c) => c.startsWith('bg-')).join()))
      .toEqual(['bg-surface-raised', '', '', 'bg-surface', '', '', 'bg-surface-raised', '', '', 'bg-surface', '', ''])
  })

  it('lifts every stuck cell with the sticky z-index token, or a dimmed Button in a later cell paints over it', () => {
    const stuck = [...classesOf(html({ stickyFirstColumn: true }), 'th'), ...classesOf(html({ stickyFirstColumn: true }), 'td')]
      .filter((list) => list.includes('sticky'))
    expect(stuck).toHaveLength(5)
    expect(stuck.filter((list) => !list.includes('z-(--tc-z-sticky)'))).toEqual([])
    // Only the stuck cells: a z-index on any other would put it back on top.
    expect(html({ stickyFirstColumn: true }).split('z-(--tc-z-sticky)').length - 1).toBe(5)
  })

  it('caps the stuck column by the variable the box pads its scrolling with, so the pad is never the smaller', () => {
    const html_ = html({ stickyFirstColumn: true })
    expect(classList(html_)).toContain('scroll-ps-[var(--tc-table-sticky-width,8rem)]')
    const [header] = classesOf(html_, 'th')
    const [cell] = classesOf(body(html_), 'td')
    expect(header).toEqual(expect.arrayContaining(STUCK))
    expect(cell?.slice(-6)).toEqual([...STUCK, 'bg-surface-raised'])
  })

  it('pads the scrolling only when a column is stuck: with none, nothing can cover a control', () => {
    expect(classList(html({ stickyFirstColumn: false }))).not.toContain('scroll-ps-[var(--tc-table-sticky-width,8rem)]')
  })
})

describe('a class per column', () => {
  const wrapping: TableColumn<Invoice>[] = [
    columns[0] as TableColumn<Invoice>,
    { ...columns[1], className: 'min-w-40 whitespace-normal' } as TableColumn<Invoice>,
    { ...columns[2], className: 'hidden sm:table-cell' } as TableColumn<Invoice>,
  ]

  it('reaches the header cell and every body cell of that column, and no other', () => {
    const html_ = html({ columns: wrapping })
    const cells = [...classesOf(html_, 'th'), ...classesOf(body(html_), 'td')]
    expect(cells.map((list) => list.includes('min-w-40'))).toEqual([
      false, true, false, false, true, false, false, true, false, false, true, false, false, true, false,
    ])
    expect(cells.map((list) => list.includes('hidden') && list.includes('sm:table-cell'))).toEqual([
      false, false, true, false, false, true, false, false, true, false, false, true, false, false, true,
    ])
  })

  it('is merged last, so whitespace-normal replaces the one line a cell keeps by default', () => {
    const [, status] = classesOf(html({ columns: wrapping }), 'th')
    const [, cell] = classesOf(body(html({ columns: wrapping })), 'td')
    expect(status).toEqual(['px-4', 'py-2.5', 'text-xs', 'font-medium', 'text-muted', 'bg-surface', 'text-start', 'min-w-40', 'whitespace-normal'])
    expect(cell).toEqual([
      'border-t-(length:--tc-line-width)', 'border-line', 'px-4', 'py-3', 'text-sm', 'text-body', 'text-start', 'min-w-40', 'whitespace-normal',
    ])
  })

  it('wins over the alignment and the fill of the stuck cell too', () => {
    const own: TableColumn<Invoice>[] = [{ ...columns[0], className: 'text-center bg-page' } as TableColumn<Invoice>, ...columns.slice(1)]
    const [cell] = classesOf(body(html({ columns: own, stickyFirstColumn: true })), 'td')
    expect(cell).toEqual(expect.arrayContaining(['text-center', 'bg-page', 'sticky']))
    expect(cell?.filter((c) => c === 'text-start' || c === 'bg-surface-raised')).toEqual([])
  })
})
