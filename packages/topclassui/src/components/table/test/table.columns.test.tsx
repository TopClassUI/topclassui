import { describe, expect, it } from 'vitest'

import { attr, classList, markup } from '#test/markup.js'
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

describe('a column can be the header of its row (WCAG 1.3.1)', () => {
  const withRowHeader: TableColumn<Invoice>[] = [{ ...columns[0], rowHeader: true } as TableColumn<Invoice>, columns[1] as TableColumn<Invoice>]

  it('renders that column as th scope="row" in every row, and the others as td', () => {
    const body = /<tbody>(.*)<\/tbody>/.exec(html({ columns: withRowHeader }))?.[1] ?? ''
    expect(opening(body, 'th').map((tag) => attr(tag, 'scope'))).toEqual(['row', 'row', 'row'])
    expect(texts(body, 'th')).toEqual(['INV-1', 'INV-2', 'INV-3'])
    expect(texts(body, 'td')).toEqual(['120', '80', '310'])
  })

  it('keeps the weight of a cell: a th is bold until told otherwise', () => {
    const body = /<tbody>(.*)<\/tbody>/.exec(html({ columns: withRowHeader }))?.[1] ?? ''
    for (const tag of opening(body, 'th')) expect(classList(tag)).toContain('font-normal')
    for (const tag of opening(body, 'td')) expect(classList(tag)).not.toContain('font-normal')
  })

  it('leaves the column header a column header', () => {
    const head = /<thead>(.*)<\/thead>/.exec(html({ columns: withRowHeader }))?.[1] ?? ''
    expect(opening(head, 'th').map((tag) => attr(tag, 'scope'))).toEqual(['col', 'col'])
  })
})

describe('entries of columns that are not columns', () => {
  const some = (visible: boolean): TableProps<Invoice>['columns'] => [
    columns[0],
    visible && { key: 'id', header: 'Id', cell: (invoice) => invoice.id },
    null,
    undefined,
    columns[1],
  ]

  it('skips false, null and undefined, so a flag can hide a column', () => {
    expect(texts(html({ columns: some(false) }), 'th')).toEqual(['Invoice', 'Amount'])
    expect(texts(html({ columns: some(false) }), 'td')).toEqual(['INV-1', '120', 'INV-2', '80', 'INV-3', '310'])
  })

  it('renders the column when the flag is on, in its place', () => {
    expect(texts(html({ columns: some(true) }), 'th')).toEqual(['Invoice', 'Id', 'Amount'])
    expect(texts(html({ columns: some(true) }), 'td').slice(0, 3)).toEqual(['INV-1', 'a', '120'])
  })

  it('sticks the first column that is there, not the first entry', () => {
    const html_ = html({ columns: [false, ...columns], stickyFirstColumn: true })
    expect(opening(html_, 'th').map((tag) => classList(tag).includes('sticky'))).toEqual([true, false])
  })
})
