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

const RING = [
  'focus-visible:outline-(length:--tc-ring-width)', 'focus-visible:outline-offset-(length:--tc-ring-offset)',
  'focus-visible:outline-ring', 'focus-visible:outline-solid', 'outline-none',
]

describe('each part wears exactly the classes it needs', () => {
  it('the root scrolls sideways on the box radius, with the hairline, the raised fill and a ring', () => {
    expect(classList(html()).sort()).toEqual([
      'bg-surface-raised', 'border-(length:--tc-line-width)', 'border-line', ...RING,
      'grid', 'grid-cols-1', 'isolate', 'overflow-x-auto', 'relative', 'rounded-box',
    ].sort())
  })

  it('the root is a one-column grid, whose track can shrink to nothing: a grid or flex parent is never widened by the table', () => {
    for (const html_ of [html(), html({ items: [] }), html({ stickyFirstColumn: true })]) {
      expect(classList(html_)).toEqual(expect.arrayContaining(['grid', 'grid-cols-1']))
    }
  })

  it('lets a caller take the grid back, as it lets every class of the root be replaced', () => {
    const list = classList(html({ className: 'block' }))
    expect(list).toContain('block')
    expect(list).not.toContain('grid')
  })

  it('the root is the containing block of every sr-only span, or one in a far column widens the page', () => {
    expect(classList(html())).toContain('relative')
    expect(classList(html({ items: [] }))).toContain('relative')
  })

  it('the root is its own stacking context, so the z-index of a stuck cell never rises above a bar of the page', () => {
    expect(classList(html())).toContain('isolate')
  })

  it('the table fills the box and keeps its borders on the cells, where a sticky cell needs them', () => {
    expect(classesOf(html(), 'table')).toEqual([['w-full', 'border-separate', 'border-spacing-0']])
  })

  it('a header cell is 16 by 10 px of padding, the small muted step, on the surface, on one line', () => {
    const [, status, amount] = classesOf(html(), 'th')
    expect(status).toEqual(['px-4', 'py-2.5', 'text-xs', 'font-medium', 'whitespace-nowrap', 'text-muted', 'bg-surface', 'text-start'])
    expect(amount).toEqual([
      'px-4', 'py-2.5', 'text-xs', 'font-medium', 'whitespace-nowrap', 'text-muted', 'bg-surface', 'text-end', 'tabular-nums',
    ])
  })

  it('a body cell is 16 by 12 px of padding at the body step, on one line, with the line above it', () => {
    const [number, , amount] = classesOf(body(html()), 'td')
    expect(number).toEqual([
      'border-t-(length:--tc-line-width)', 'border-line', 'px-4', 'py-3', 'text-sm', 'whitespace-nowrap', 'text-body', 'text-start',
    ])
    expect(amount).toEqual([
      'border-t-(length:--tc-line-width)', 'border-line', 'px-4', 'py-3', 'text-sm', 'whitespace-nowrap', 'text-body',
      'text-end', 'tabular-nums',
    ])
  })

  it('keeps every header and every cell on one line, so a narrow box scrolls instead of stacking words', () => {
    const cells = [...classesOf(html(), 'th'), ...classesOf(html(), 'td')]
    expect(cells).toHaveLength(15)
    expect(cells.filter((list) => !list.includes('whitespace-nowrap'))).toEqual([])
  })

  it('divides every row from the one above, the first from the header included', () => {
    const cells = classesOf(body(html()), 'td')
    expect(cells).toHaveLength(12)
    expect(cells.filter((list) => !list.includes('border-t-(length:--tc-line-width)') || !list.includes('border-line'))).toEqual([])
  })

  it('draws the visible caption above the header with a line under it', () => {
    expect(classesOf(html({ captionVisible: true }), 'caption')).toEqual([[
      'border-b-(length:--tc-line-width)', 'border-line', 'px-4', 'py-3', 'text-start', 'text-sm', 'font-medium', 'text-body',
    ]])
  })
})

describe('alignment is logical (R-5.3-1)', () => {
  it('aligns a column by its header and by every one of its cells', () => {
    const rows = classesOf(body(html()), 'td')
    expect(rows.map((list) => list.filter((c) => c === 'text-start' || c === 'text-end').join())).toEqual([
      'text-start', 'text-start', 'text-end', 'text-start', 'text-start', 'text-end',
      'text-start', 'text-start', 'text-end', 'text-start', 'text-start', 'text-end',
    ])
  })

  it('gives an end-aligned column digits of one width, whatever font the page brings', () => {
    const rows = classesOf(body(html()), 'td')
    expect(rows.map((list) => list.includes('tabular-nums')))
      .toEqual([false, false, true, false, false, true, false, false, true, false, false, true])
  })

  it('names no physical side anywhere, in any mode of the table', () => {
    const everything = html({ striped: true, stickyFirstColumn: true, captionVisible: true, sort: { key: 'amount', direction: 'ascending' } })
      + html({ items: [] })
    const names = [...everything.matchAll(/class="([^"]*)"/g)].flatMap((m) => (m[1] ?? '').split(' '))
    expect(names.filter((c) => /(^|:)-?(left|right|pl|pr|ml|mr|start|end)-|text-(left|right)|border-[lr](-|$)|rounded-[lr]|scroll-p[lr]/.test(c))).toEqual([])
    expect(names).toEqual(expect.arrayContaining(['inset-s-0', 'inset-s-4', 'inset-e-4', 'scroll-ps-[var(--tc-table-sticky-width,8rem)]']))
  })
})

describe('striped', () => {
  it('leaves every row unfilled by default, so the frame shows through', () => {
    expect(classesOf(body(html()), 'tr')).toEqual([[], [], [], []])
  })

  it('tints every second row, counting from the first', () => {
    expect(classesOf(body(html({ striped: true })), 'tr')).toEqual([[], ['bg-surface'], [], ['bg-surface']])
  })

  it('fills the row and not its cells, which have no background to paint over it', () => {
    const cells = classesOf(body(html({ striped: true })), 'td')
    expect(cells.flat().filter((c) => c.startsWith('bg-'))).toEqual([])
  })
})

describe('className is merged last, so the consumer wins every conflict', () => {
  it('keeps a consumer utility that conflicts with nothing', () => {
    expect(classList(html({ className: 'mt-4' }))).toContain('mt-4')
  })

  it('replaces the radius and the fill', () => {
    const list = classList(html({ className: 'rounded-control bg-page' }))
    expect(list).toEqual(expect.arrayContaining(['rounded-control', 'bg-page']))
    expect(list.filter((c) => c === 'rounded-box' || c === 'bg-surface-raised')).toEqual([])
  })

  it('replaces the border colour and keeps the width knob', () => {
    const list = classList(html({ className: 'border-line-strong' }))
    expect(list).toContain('border-line-strong')
    expect(list).not.toContain('border-line')
    expect(list).toContain('border-(length:--tc-line-width)')
  })

  it('replaces the scroll padding of a stuck column, for a caller who measured its own', () => {
    const list = classList(html({ stickyFirstColumn: true, className: 'scroll-ps-40' }))
    expect(list).toContain('scroll-ps-40')
    expect(list).not.toContain('scroll-ps-[var(--tc-table-sticky-width,8rem)]')
  })
})
