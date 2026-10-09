import { describe, expect, it } from 'vitest'

import { caretDown } from '#icons/data/caret-down.js'
import { caretUp } from '#icons/data/caret-up.js'
import { ar } from '#shared/labels/ar.js'
import { en } from '#shared/labels/en.js'
import { attr, classList, markup } from '#test/markup.js'
import { Table } from '../index.js'
import type { TableColumn, TableProps, TableSort } from '../types.js'

interface Invoice { id: string; number: string; status: string; amount: number }

const invoices: Invoice[] = [
  { id: 'a', number: 'INV-1', status: 'Paid', amount: 120 },
  { id: 'b', number: 'INV-2', status: 'Due', amount: 80 },
]

/** Two sortable columns around one that is not, so each case has a neighbour to leak into. */
const columns: TableColumn<Invoice>[] = [
  { key: 'number', header: 'Invoice', sortHref: '/invoices?sort=number&dir=asc', cell: (invoice) => invoice.number },
  { key: 'status', header: 'Status', cell: (invoice) => invoice.status },
  { key: 'amount', header: 'Amount', align: 'end', sortHref: '/invoices?sort=amount&dir=asc', cell: (invoice) => invoice.amount },
]

const html = (props: Partial<TableProps<Invoice>> = {}) =>
  markup(<Table caption="Invoices" items={invoices} getKey={(invoice) => invoice.id} columns={columns} {...props} />)

/** Each header cell whole: its opening tag and everything inside it. */
const headers = (source: string) => [...source.matchAll(/<th [^>]*>.*?<\/th>/g)].map((m) => m[0])
const sortOf = (source: string) => headers(source).map((th) => attr(th.slice(0, th.indexOf('>') + 1), 'aria-sort'))

describe('aria-sort names the sorted column and no other', () => {
  it('is on no header when the rows are not sorted', () => {
    expect(html()).not.toContain('aria-sort')
  })

  it('is on the one column sort.key names, spelled as the direction', () => {
    expect(sortOf(html({ sort: { key: 'amount', direction: 'descending' } }))).toEqual([undefined, undefined, 'descending'])
    expect(sortOf(html({ sort: { key: 'number', direction: 'ascending' } }))).toEqual(['ascending', undefined, undefined])
  })

  it('never writes aria-sort="none" on the columns that are merely sortable', () => {
    expect(html({ sort: { key: 'amount', direction: 'descending' } })).not.toContain('aria-sort="none"')
  })

  it('marks a sorted column that has no link too: the rows are sorted either way', () => {
    const th = headers(html({ sort: { key: 'status', direction: 'ascending' } }))[1] ?? ''
    expect(attr(th.slice(0, th.indexOf('>') + 1), 'aria-sort')).toBe('ascending')
    expect(th).not.toContain('<a ')
    expect(th).toContain('<svg ')
  })

  it('marks nothing when sort.key names no column', () => {
    const html_ = html({ sort: { key: 'customer', direction: 'ascending' } })
    expect(html_).not.toContain('aria-sort')
    expect(html_).not.toContain('<svg')
  })

  it('reads a direction no list holds as unsorted, instead of crashing on a missing icon', () => {
    const sideways = { key: 'amount', direction: 'sideways' } as unknown as TableSort
    const html_ = html({ sort: sideways })
    expect(html_).not.toContain('aria-sort')
    expect(html_).not.toContain('<svg')
  })
})

describe('the caret of the sorted column', () => {
  it('points up for ascending and down for descending', () => {
    const up = html({ sort: { key: 'amount', direction: 'ascending' } })
    expect(up).toContain(caretUp.path)
    expect(up).not.toContain(caretDown.path)

    const down = html({ sort: { key: 'amount', direction: 'descending' } })
    expect(down).toContain(caretDown.path)
    expect(down).not.toContain(caretUp.path)
  })

  it('is drawn once, in the sorted header and nowhere else', () => {
    const cells = headers(html({ sort: { key: 'amount', direction: 'descending' } }))
    expect(cells.map((th) => th.split('<svg').length - 1)).toEqual([0, 0, 1])
  })

  it('says the direction in words, because aria-sort is not read out everywhere', () => {
    const svg = /<svg [^>]*>/.exec(html({ sort: { key: 'amount', direction: 'descending' } }))?.[0] ?? ''
    expect(attr(svg, 'role')).toBe('img')
    expect(attr(svg, 'aria-label')).toBe('sorted descending')
    expect(attr(/<svg [^>]*>/.exec(html({ sort: { key: 'amount', direction: 'ascending' } }))?.[0] ?? '', 'aria-label'))
      .toBe('sorted ascending')
  })

  it('sits after the header at one em and never mirrors: up and down mean the same in Arabic', () => {
    const svg = /<svg [^>]*>/.exec(html({ sort: { key: 'amount', direction: 'descending' } }))?.[0] ?? ''
    expect(classList(svg)).toEqual(['inline-block', 'shrink-0', 'ms-1'])
    expect(attr(svg, 'width')).toBe('1em')
  })
})

describe('a sortable header is a real link', () => {
  it('wraps the header in an anchor to sortHref, and only where one is given', () => {
    const cells = headers(html())
    expect(cells.map((th) => /<a href="([^"]*)"/.exec(th)?.[1]))
      .toEqual(['/invoices?sort=number&amp;dir=asc', undefined, '/invoices?sort=amount&amp;dir=asc'])
  })

  it('leaves a header with no sortHref as plain text in its cell', () => {
    expect(headers(html())[1]).toMatch(/^<th [^>]*>Status<\/th>$/)
  })

  it('says what the link does before the header, in text only a screen reader gets', () => {
    expect(headers(html())[0]).toMatch(/<a [^>]*><span class="sr-only">Sort by <\/span>Invoice<\/a><\/th>$/)
  })

  it('keeps the caret inside the link, so the whole header is one target', () => {
    const th = headers(html({ sort: { key: 'amount', direction: 'descending' } }))[2] ?? ''
    expect(th).toMatch(/<span class="sr-only">Sort by <\/span>Amount<svg [^>]*>.*<\/svg><\/a><\/th>$/)
  })

  it('has no role, no tabindex and no handler: the browser already knows an anchor', () => {
    const anchor = /<a [^>]*>/.exec(html())?.[0] ?? ''
    expect(anchor).not.toMatch(/ (role|tabindex|onclick|aria-disabled)=/)
  })

  it('is a link whether or not its column is the sorted one', () => {
    const cells = headers(html({ sort: { key: 'number', direction: 'ascending' } }))
    expect(cells.map((th) => th.includes('<a href='))).toEqual([true, false, true])
  })
})

describe('the words come from labels (R-5.11-1)', () => {
  it('are Arabic with the Arabic labels', () => {
    const html_ = html({ labels: ar, sort: { key: 'amount', direction: 'descending' } })
    expect(html_).toContain('<span class="sr-only">ترتيب حسب </span>Invoice')
    expect(html_).toContain('aria-label="مرتب تنازليًا"')
    expect(html_).not.toContain('Sort by')
    expect(html({ labels: ar, sort: { key: 'amount', direction: 'ascending' } })).toContain('aria-label="مرتب تصاعديًا"')
  })

  it('follow a caller who changes one string', () => {
    const labels = { ...en, table: { ...en.table, sortBy: 'Order by' } }
    expect(html({ labels })).toContain('<span class="sr-only">Order by </span>Invoice')
  })
})
