import { describe, expect, it } from 'vitest'

import { caretUpDown } from '#icons/data/caret-up-down.js'
import { sortDescending } from '#icons/data/sort-descending.js'
import { sortAscending } from '#icons/data/sort-ascending.js'
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

  it('marks nothing when sort.key names no column: every sortable header keeps its idle pair', () => {
    const html_ = html({ sort: { key: 'customer', direction: 'ascending' } })
    expect(html_).not.toContain('aria-sort')
    expect(html_).not.toContain('role="img"')
    expect(html_.split(caretUpDown.path).length - 1).toBe(2)
  })

  it('reads a direction no list holds as unsorted, instead of crashing on a missing icon', () => {
    const sideways = { key: 'amount', direction: 'sideways' } as unknown as TableSort
    const html_ = html({ sort: sideways })
    expect(html_).not.toContain('aria-sort')
    expect(html_).not.toContain('role="img"')
    expect(html_.split(caretUpDown.path).length - 1).toBe(2)
  })
})

describe('the caret of the sorted column', () => {
  it('points up for ascending and down for descending', () => {
    const up = html({ sort: { key: 'amount', direction: 'ascending' } })
    expect(up).toContain(sortAscending.path)
    expect(up).not.toContain(sortDescending.path)

    const down = html({ sort: { key: 'amount', direction: 'descending' } })
    expect(down).toContain(sortDescending.path)
    expect(down).not.toContain(sortAscending.path)
  })

  it('is drawn once, in the sorted header; the other sortable header keeps the idle pair and a plain one has none', () => {
    const cells = headers(html({ sort: { key: 'amount', direction: 'descending' } }))
    expect(cells.map((th) => th.split('role="img"').length - 1)).toEqual([0, 0, 1])
    expect(cells.map((th) => th.split(caretUpDown.path).length - 1)).toEqual([1, 0, 0])
  })

  it('draws the idle pair muted, hidden from a reader, as the frame does after every sortable header', () => {
    const [number] = headers(html())
    const svg = /<svg [^>]*>/.exec(number ?? '')?.[0] ?? ''
    expect(attr(svg, 'aria-hidden')).toBe('true')
    expect(classList(svg)).toEqual(['inline-block', 'ms-1.25', 'shrink-0', 'text-muted'])
    expect(attr(svg, 'width')).toBe('13')
  })

  it('says the direction in words, because aria-sort is not read out everywhere', () => {
    const svg = /<svg [^>]*role="img"[^>]*>/.exec(html({ sort: { key: 'amount', direction: 'descending' } }))?.[0] ?? ''
    expect(attr(svg, 'role')).toBe('img')
    expect(attr(svg, 'aria-label')).toBe('sorted descending')
    expect(attr(/<svg [^>]*role="img"[^>]*>/.exec(html({ sort: { key: 'amount', direction: 'ascending' } }))?.[0] ?? '', 'aria-label'))
      .toBe('sorted ascending')
  })

  it('sits after the header at the frame\'s 13 px and never mirrors: up and down mean the same in Arabic', () => {
    const svg = /<svg [^>]*role="img"[^>]*>/.exec(html({ sort: { key: 'amount', direction: 'descending' } }))?.[0] ?? ''
    expect(classList(svg)).toEqual(['inline-block', 'ms-1.25', 'shrink-0'])
    expect(attr(svg, 'width')).toBe('13')
  })
})

describe('a header is named by its own words, which are read out with every cell under it', () => {
  /** The id a header cell points at, and the text of the element that carries it. */
  const named = (th: string) => {
    const id = attr(th.slice(0, th.indexOf('>') + 1), 'aria-labelledby')
    return id === undefined ? undefined : new RegExp(`<span id="${id}"[^>]*>(.*?)</span>`).exec(th)?.[1]
  }

  it('points a sortable header at its own text, so "Sort by" stays in the link and out of the column name', () => {
    expect(headers(html()).map(named)).toEqual(['Invoice', undefined, 'Amount'])
  })

  it('keeps the words of the caret out of the name too, on a sorted column with a link or without', () => {
    expect(headers(html({ sort: { key: 'amount', direction: 'descending' } })).map(named)).toEqual(['Invoice', undefined, 'Amount'])
    expect(headers(html({ sort: { key: 'status', direction: 'ascending' } })).map(named)).toEqual(['Invoice', 'Status', 'Amount'])
  })

  it('leaves a plain header alone: its text is its name already', () => {
    const plain = headers(html())[1] ?? ''
    expect(plain).not.toContain('aria-labelledby')
    expect(plain).not.toContain('<span')
  })

  it('gives every column of every table an id of its own', () => {
    const both = markup(
      <>
        <Table caption="First" items={invoices} getKey={(invoice) => invoice.id} columns={columns} />
        <Table caption="Second" items={invoices} getKey={(invoice) => invoice.id} columns={columns} />
      </>,
    )
    const ids = [...both.matchAll(/<span id="([^"]+)"/g)].map((m) => m[1])
    expect(ids).toHaveLength(4)
    expect(new Set(ids).size).toBe(4)
    expect([...both.matchAll(/<th [^>]*aria-labelledby="([^"]+)"/g)].map((m) => m[1])).toEqual(ids)
  })

  it('keeps the whole Arabic name of the link, and only the header in the name of the column', () => {
    const th = headers(html({ labels: ar, sort: { key: 'amount', direction: 'descending' } }))[2] ?? ''
    expect(named(th)).toBe('Amount')
    expect(th.replace(/<svg [^>]*aria-label="([^"]*)".*<\/svg>/, ' $1').replace(/<[^>]+>/g, '')).toBe('ترتيب حسب Amount مرتب تنازليًا')
  })
})

describe('the words come from labels (R-5.11-1)', () => {
  it('are Arabic with the Arabic labels', () => {
    const html_ = html({ labels: ar, sort: { key: 'amount', direction: 'descending' } })
    expect(html_).toContain('<span class="sr-only">ترتيب حسب </span>')
    expect(html_).toContain('aria-label="مرتب تنازليًا"')
    expect(html_).not.toContain('Sort by')
    expect(html({ labels: ar, sort: { key: 'amount', direction: 'ascending' } })).toContain('aria-label="مرتب تصاعديًا"')
  })

  it('follow a caller who changes one string', () => {
    const labels = { ...en, table: { ...en.table, sortBy: 'Order by' } }
    expect(html({ labels })).toContain('<span class="sr-only">Order by </span>')
    expect(html({ labels })).not.toContain('Sort by')
  })
})
