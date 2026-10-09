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
  'focus-visible:outline-ring', 'focus-visible:outline-solid', 'outline-hidden',
]

describe('each part wears exactly the classes the spec names', () => {
  it('the root scrolls sideways on the box radius, with the hairline, the raised fill and a ring', () => {
    expect(classList(html()).sort()).toEqual([
      'bg-surface-raised', 'border-(length:--tc-line-width)', 'border-line', ...RING,
      'overflow-x-auto', 'rounded-box',
    ].sort())
  })

  it('the table fills the box and keeps its borders on the cells, where a sticky cell needs them', () => {
    expect(classesOf(html(), 'table')).toEqual([['w-full', 'border-separate', 'border-spacing-0']])
  })

  it('a header cell is 16 by 10 px of padding, the small muted step, on the surface', () => {
    const [, status, amount] = classesOf(html(), 'th')
    expect(status).toEqual(['px-4', 'py-2.5', 'text-xs', 'font-medium', 'text-muted', 'bg-surface', 'text-start'])
    expect(amount).toEqual(['px-4', 'py-2.5', 'text-xs', 'font-medium', 'text-muted', 'bg-surface', 'text-end'])
  })

  it('a body cell is 16 by 12 px of padding at the body step, with the line above it', () => {
    const [number, , amount] = classesOf(body(html()), 'td')
    expect(number).toEqual([
      'border-t-(length:--tc-line-width)', 'border-line', 'px-4', 'py-3', 'text-sm', 'text-body', 'text-start',
    ])
    expect(amount).toEqual([
      'border-t-(length:--tc-line-width)', 'border-line', 'px-4', 'py-3', 'text-sm', 'text-body', 'text-end',
    ])
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

  it('names no physical side anywhere, in any mode of the table', () => {
    const everything = html({ striped: true, stickyFirstColumn: true, captionVisible: true, sort: { key: 'amount', direction: 'ascending' } })
    const names = [...everything.matchAll(/class="([^"]*)"/g)].flatMap((m) => (m[1] ?? '').split(' '))
    expect(names.filter((c) => /(^|:)-?(left|right|pl|pr|ml|mr|start|end)-|text-(left|right)|border-[lr](-|$)|rounded-[lr]/.test(c))).toEqual([])
    expect(names).toContain('inset-s-0')
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

describe('stickyFirstColumn', () => {
  it('sticks nothing by default', () => {
    expect(html()).not.toContain('sticky')
    expect(html()).not.toContain('inset-s-0')
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
})

describe('the sort link is the only interactive part', () => {
  const link = () => classesOf(html(), 'a')

  it('carries the shared focus ring and the shared touch target, 24 px and 44 under a coarse pointer', () => {
    for (const list of link()) {
      expect(list).toEqual(expect.arrayContaining(RING))
      expect(list).toEqual(expect.arrayContaining([
        'min-h-[var(--tc-target-min,24px)]', 'min-w-[var(--tc-target-min,24px)]',
        'pointer-coarse:min-h-[var(--tc-target-coarse,44px)]', 'pointer-coarse:min-w-[var(--tc-target-coarse,44px)]',
      ]))
    }
    expect(link()).toHaveLength(2)
  })

  it('fills its cell as a row, pulled back 4 px each way so the header row is no taller for it', () => {
    for (const list of link()) {
      expect(list).toEqual(expect.arrayContaining(['flex', 'items-center', '-my-1', 'rounded-chip', 'hover:underline']))
    }
  })

  it('follows the alignment of its column, which text-align cannot do inside a flex row', () => {
    const [number, amount] = link()
    expect(number).toContain('justify-start')
    expect(number).not.toContain('justify-end')
    expect(amount).toContain('justify-end')
    expect(amount).not.toContain('justify-start')
  })

  it('puts no ring, hover or target on a cell or a row: none of them can be activated', () => {
    const interactive = /(^|:)(hover|active|focus-visible):|^(min-h-|cursor-|transition)/
    for (const tag of ['table', 'thead', 'tbody', 'tr', 'th', 'td', 'caption']) {
      expect(classesOf(html({ striped: true }), tag).flat().filter((c) => interactive.test(c)), tag).toEqual([])
    }
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
})
