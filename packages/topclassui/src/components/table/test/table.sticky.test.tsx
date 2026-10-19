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

/** The line down the inline end of the stuck column, drawn on a pseudo-element of each stuck cell. */
const LINE = ['after:absolute', 'after:inset-y-0', 'after:inset-e-0', 'after:border-e-(length:--tc-line-width)', 'after:border-line-strong']

/** What a stuck cell adds to its own classes, before its fill. */
const STUCK = [
  'sticky', 'inset-s-0', 'z-(--tc-z-sticky)', 'max-w-[var(--tc-table-sticky-width,8rem)]', 'truncate', ...LINE, '**:scroll-mx-[100vw]',
]

/** Every header cell and every body cell of a table with a stuck column, in document order. */
const stuckCells = () => [...classesOf(html({ stickyFirstColumn: true }), 'th'), ...classesOf(html({ stickyFirstColumn: true }), 'td')]

/** Which of those fifteen cells are in the first column. */
const FIRST_COLUMN = [true, false, false, true, false, false, true, false, false, true, false, false, true, false, false]

describe('stickyFirstColumn', () => {
  it('sticks no column, draws no edge and keeps no room for a stuck column by default; the header row always sticks', () => {
    expect([...classesOf(html(), 'th'), ...classesOf(html(), 'td')].flat().filter((c) => c.includes('sticky'))).toEqual([])
    expect(html()).toContain('<thead class="sticky top-0 z-[calc(var(--tc-z-sticky)+1)]">')
    expect(html()).not.toContain('inset-s-0')
    expect(html()).not.toContain('--tc-table-sticky-width')
    expect(html()).not.toContain('after:')
    expect(html()).not.toContain('scroll-mx-')
    expect(classList(html()).filter((c) => c.startsWith('scroll-p'))).toEqual(['scroll-ps-8', 'scroll-pe-8', 'scroll-pt-[calc(var(--spacing)*9)]'])
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
    // The cap and 2rem more: a focused control shows that much clear of the column, or is scrolled to.
    expect(classList(html_).filter((c) => c.startsWith('scroll-p')))
      .toEqual(['scroll-pe-8', 'scroll-pt-[calc(var(--spacing)*9)]', 'scroll-ps-[calc(var(--tc-table-sticky-width,8rem)+2rem)]'])
    const [header] = classesOf(html_, 'th')
    const [cell] = classesOf(body(html_), 'td')
    expect(header).toEqual(expect.arrayContaining(STUCK))
    expect(cell?.slice(-14)).toEqual([...STUCK, 'bg-surface-raised', 'group-hover/row:bg-surface', 'group-data-selected/row:bg-primary-soft'])
  })

  it('pads the scrolling by the stuck column only when a column is stuck: with none, nothing can cover a control', () => {
    expect(classList(html({ stickyFirstColumn: false })).filter((c) => c.includes('--tc-table-sticky-width'))).toEqual([])
  })

  it('draws the edge of the stuck column with the strong line, on the inline end of every stuck cell and of no other', () => {
    expect(stuckCells().map((list) => LINE.every((c) => list.includes(c)))).toEqual(FIRST_COLUMN)
    expect(stuckCells().flat().filter((c) => c.startsWith('after:'))).toHaveLength(25)
    // Not the hairline of the row lines: in dark that is the fill of a raised cell, and a line of it paints nothing.
    expect(stuckCells().flat()).not.toContain('after:border-line')
  })

  it('puts that edge on a pseudo-element: a border on the cell itself would widen the column by its own width', () => {
    expect(stuckCells().flat().filter((c) => /^border-[se]-/.test(c))).toEqual([])
    // absolute against the cell that sticky positions, so nothing in the row is laid out around it.
    expect(stuckCells().filter((list) => list.includes('after:absolute')).every((list) => list.includes('sticky'))).toBe(true)
  })

  it('takes every control of the stuck column out of the scrolling, or focusing one pulls the box back on every row', () => {
    expect(stuckCells().map((list) => list.includes('**:scroll-mx-[100vw]'))).toEqual(FIRST_COLUMN)
    // On what the cell holds, never on the cell: a margin of its own would move nothing a keyboard reaches.
    expect(stuckCells().flat().filter((c) => c.startsWith('scroll-m'))).toEqual([])
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
    expect(status).toEqual(['px-3.5', 'text-xs', 'font-medium', 'text-muted', 'bg-surface', 'py-2', 'text-start', 'min-w-40', 'whitespace-normal'])
    expect(cell).toEqual([
      'border-t-(length:--tc-line-width)', 'border-line', 'px-3.5', 'text-sm', 'text-muted', 'group-data-selected/row:text-primary-on-soft', 'py-3', 'text-start',
      'min-w-40', 'whitespace-normal',
    ])
  })

  it('wins over the alignment and the fill of the stuck cell too', () => {
    const own: TableColumn<Invoice>[] = [{ ...columns[0], className: 'text-center bg-page' } as TableColumn<Invoice>, ...columns.slice(1)]
    const [cell] = classesOf(body(html({ columns: own, stickyFirstColumn: true })), 'td')
    expect(cell).toEqual(expect.arrayContaining(['text-center', 'bg-page', 'sticky']))
    expect(cell?.filter((c) => c === 'text-start' || c === 'bg-surface-raised')).toEqual([])
  })
})
