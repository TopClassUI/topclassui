import { describe, expect, it, vi } from 'vitest'

import { attr, markup } from '#test/markup.js'
import * as entry from '../index.js'
import { Table } from '../index.js'
import type { TableColumn, TableProps } from '../types.js'

interface Invoice { id: string; number: string; amount: number }

const invoices: Invoice[] = [
  { id: 'a', number: 'INV-1', amount: 120 },
  { id: 'b', number: 'INV-2', amount: 80 },
  { id: 'c', number: 'INV-3', amount: 310 },
]

const columns: TableColumn<Invoice>[] = [
  { key: 'number', header: 'Invoice', cell: (invoice) => invoice.number },
  { key: 'amount', header: 'Amount', align: 'end', cell: (invoice) => invoice.amount },
]

const html = (props: Partial<TableProps<Invoice>> = {}) =>
  markup(<Table caption="Invoices" items={invoices} getKey={(invoice) => invoice.id} columns={columns} {...props} />)

/** Every opening tag of one element, so each is checked rather than the first. */
const opening = (source: string, tag: string) =>
  [...source.matchAll(new RegExp(`<${tag}(?: [^>]*)?>`, 'g'))].map((m) => m[0])

/** The text of every element of one tag, in document order. */
const texts = (source: string, tag: string) =>
  [...source.matchAll(new RegExp(`<${tag}(?: [^>]*)?>(.*?)</${tag}>`, 'g'))].map((m) => m[1])

describe('the element it renders', () => {
  it('is a div holding one real table, with nothing beside it', () => {
    const html_ = html()
    expect(html_).toMatch(/^<div [^>]*><table [^>]*>.*<\/table><\/div>$/)
    expect(opening(html_, 'table')).toHaveLength(1)
  })

  it('puts the caption first, then one thead and one tbody', () => {
    expect(html()).toMatch(/<table [^>]*><caption [^>]*>Invoices<\/caption><thead [^>]*><tr [^>]*>.*<\/tr><\/thead><tbody>.*<\/tbody><\/table>/)
  })

  it('makes every header a column header, in the order of the columns', () => {
    const html_ = html()
    expect(opening(html_, 'th').map((tag) => attr(tag, 'scope'))).toEqual(['col', 'col'])
    expect(texts(html_, 'th')).toEqual(['Invoice', 'Amount'])
  })

  it('renders one row per item and reads each cell out of its item', () => {
    const html_ = html()
    expect(opening(html_.slice(html_.indexOf('<tbody>')), 'tr')).toHaveLength(3)
    expect(texts(html_, 'td')).toEqual(['INV-1', '120', 'INV-2', '80', 'INV-3', '310'])
  })

  it('uses no row header and no cell role of its own: the elements carry the semantics', () => {
    const html_ = html()
    expect(html_).not.toContain('scope="row"')
    expect(html_).not.toMatch(/role="(table|row|cell|columnheader|grid)"/)
  })

  it('asks getKey for the identity of every item, once each', () => {
    const getKey = vi.fn((invoice: Invoice) => invoice.id)
    html({ getKey })
    expect(getKey.mock.calls.map(([invoice]) => invoice.id)).toEqual(['a', 'b', 'c'])
  })

  it('renders what it is given, in the order it is given: sorting is the caller job', () => {
    const reversed = [...invoices].reverse()
    expect(texts(html({ items: reversed }), 'td')).toEqual(['INV-3', '310', 'INV-2', '80', 'INV-1', '120'])
  })

  it('exports the table and its placeholder, and no variants helper, because it has no variants', () => {
    expect(Object.keys(entry).sort()).toEqual(['Table', 'TableSkeleton'])
  })
})

describe('the scrolling box is a named tab stop (axe scrollable-region-focusable)', () => {
  it('is a region a keyboard can reach, so a table wider than its box can be scrolled', () => {
    const html_ = html()
    expect(attr(html_, 'role')).toBe('region')
    expect(attr(html_, 'tabindex')).toBe('0')
  })

  it('is named by the caption, whatever node the caption is', () => {
    const html_ = html({ caption: <strong>Open invoices</strong> })
    const id = attr(opening(html_, 'caption')[0] ?? '', 'id')
    expect(id).toMatch(/\S/)
    expect(attr(html_, 'aria-labelledby')).toBe(id)
    expect(html_).toContain('<strong>Open invoices</strong></caption>')
  })

  it('gives two tables on one page two different ids', () => {
    const both = markup(
      <>
        <Table caption="First" items={invoices} getKey={(invoice) => invoice.id} columns={columns} />
        <Table caption="Second" items={invoices} getKey={(invoice) => invoice.id} columns={columns} />
      </>,
    )
    const ids = opening(both, 'caption').map((tag) => attr(tag, 'id'))
    expect(ids).toHaveLength(2)
    expect(ids[0]).not.toBe(ids[1])
    expect(opening(both, 'div').map((tag) => attr(tag, 'aria-labelledby'))).toEqual(ids)
  })

  it('keeps the role, the name and the tab stop when a JS caller passes its own', () => {
    const forced = { role: 'presentation', tabIndex: -1, 'aria-labelledby': 'elsewhere' } as Partial<TableProps<Invoice>>
    const html_ = html(forced)
    expect(attr(html_, 'role')).toBe('region')
    expect(attr(html_, 'tabindex')).toBe('0')
    expect(attr(html_, 'aria-labelledby')).toBe(attr(opening(html_, 'caption')[0] ?? '', 'id'))
    expect(html_).not.toContain('elsewhere')
  })

  it('is named by the caption alone: an aria-label, which JSX lets through, never reaches the box', () => {
    const html_ = markup(<Table aria-label="Mine" caption="Invoices" items={invoices} getKey={(invoice) => invoice.id} columns={columns} />)
    expect(html_).not.toContain('aria-label=')
    expect(html_).not.toContain('Mine')
  })

  it('is no tab stop when there is no column: one cell of words cannot need scrolling', () => {
    const html_ = html({ columns: [] })
    expect(html_).not.toContain('tabindex')
    expect(attr(html_, 'role')).toBe('region')
    expect(attr(html_, 'aria-labelledby')).toBe(attr(opening(html_, 'caption')[0] ?? '', 'id'))
  })
})

describe('the caption', () => {
  it('is read out but not drawn by default, as the frame draws none', () => {
    expect(attr(opening(html(), 'caption')[0] ?? '', 'class')).toBe('sr-only')
  })

  it('is drawn when captionVisible is set, and still the same element', () => {
    const tag = opening(html({ captionVisible: true }), 'caption')[0] ?? ''
    expect(attr(tag, 'class')).not.toContain('sr-only')
    expect(attr(tag, 'class')).toContain('text-start')
    expect(opening(html({ captionVisible: true }), 'caption')).toHaveLength(1)
  })
})

describe('what reaches the root', () => {
  it('spreads the rest onto the scrolling box', () => {
    const html_ = markup(
      <Table id="invoices" data-testid="x" aria-describedby="help" caption="Invoices" items={invoices} getKey={(invoice) => invoice.id} columns={columns} />,
    )
    expect(html_).toMatch(/^<div [^>]*id="invoices"/)
    expect(attr(html_, 'data-testid')).toBe('x')
    expect(attr(html_, 'aria-describedby')).toBe('help')
  })

  it('passes style through to the root', () => {
    expect(html({ style: { opacity: 0.5 } })).toMatch(/^<div [^>]*style="opacity:0.5"/)
  })

  it('reads its own props and never forwards one as an attribute', () => {
    expect(html({ striped: true, stickyFirstColumn: true, captionVisible: true, sort: { key: 'amount', direction: 'ascending' } }))
      .not.toMatch(/ (items|columns|labels|caption|sort|striped|stickyfirstcolumn|captionvisible|emptyfallback|getkey|link|rowheader)=/i)
  })
})

describe('the design attributes', () => {
  it('carries none at rest: a boolean is present or absent, never "false"', () => {
    expect(opening(html(), 'div')[0]).not.toMatch(/data-/)
  })

  it('reports striped and the sticky column as presence attributes (R-5.7-6)', () => {
    const root = opening(html({ striped: true, stickyFirstColumn: true }), 'div')[0] ?? ''
    expect(attr(root, 'data-striped')).toBe('')
    expect(attr(root, 'data-sticky-first-column')).toBe('')
    expect(root).not.toContain('data-empty')
  })

  it('has no variant, tone or size to report', () => {
    expect(html()).not.toMatch(/data-(variant|tone|size|state)/)
  })
})
