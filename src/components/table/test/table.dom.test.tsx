import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { Table, TableSkeleton } from '../index.js'
import type { TableColumn } from '../types.js'

interface Invoice { id: string; number: string; amount: number }

const invoices: Invoice[] = [
  { id: 'a', number: 'INV-1', amount: 120 },
  { id: 'b', number: 'INV-2', amount: 80 },
]

const columns: TableColumn<Invoice>[] = [
  { key: 'number', header: 'Invoice', sortHref: '/invoices?sort=number', cell: (invoice) => invoice.number },
  { key: 'amount', header: 'Amount', align: 'end', sortHref: '/invoices?sort=amount', cell: (invoice) => invoice.amount },
]

const table = (props: { items?: Invoice[] } = {}) => (
  <Table
    caption="Invoices"
    items={props.items ?? invoices}
    getKey={(invoice) => invoice.id}
    columns={columns}
    sort={{ key: 'amount', direction: 'descending' }}
  />
)

describe('in a real tree', () => {
  it('is a region and a table, both named by the caption', () => {
    render(table())
    const region = screen.getByRole('region', { name: 'Invoices' })
    expect(within(region).getByRole('table', { name: 'Invoices' }).tagName).toBe('TABLE')
  })

  it('exposes a column header per column and a row per item under the header row', () => {
    render(table())
    expect(screen.getAllByRole('columnheader')).toHaveLength(2)
    expect(screen.getAllByRole('row')).toHaveLength(3)
    expect(screen.getAllByRole('cell').map((cell) => cell.textContent)).toEqual(['INV-1', '120', 'INV-2', '80'])
  })

  it('puts aria-sort on the sorted column header and on no other', () => {
    render(table())
    const [number, amount] = screen.getAllByRole('columnheader')
    expect(amount?.getAttribute('aria-sort')).toBe('descending')
    expect(number?.hasAttribute('aria-sort')).toBe(false)
  })

  it('makes each sortable header a link that says what it does and where it goes', () => {
    render(table())
    const links = screen.getAllByRole('link')
    expect(links.map((link) => link.getAttribute('href'))).toEqual(['/invoices?sort=number', '/invoices?sort=amount'])
    expect(links[0]?.textContent).toBe('Sort by Invoice')
    expect(within(links[1] as HTMLElement).getByRole('img', { name: 'sorted descending' }).tagName).toBe('svg')
  })

  it('names each column header by its own words, with "Sort by" and the caret left to the link', () => {
    render(table())
    expect(screen.getByRole('columnheader', { name: 'Invoice' }).tagName).toBe('TH')
    expect(screen.getByRole('columnheader', { name: 'Amount' }).getAttribute('aria-sort')).toBe('descending')
    expect(screen.queryByRole('columnheader', { name: /Sort by|sorted/ })).toBeNull()
    expect(screen.getAllByRole('link').map((link) => link.textContent)).toEqual(['Sort by Invoice', 'Sort by Amount'])
  })

  it('exposes a row header per row when a column asks to be one', () => {
    const withRowHeader: TableColumn<Invoice>[] = [{ ...columns[0], rowHeader: true } as TableColumn<Invoice>, columns[1] as TableColumn<Invoice>]
    render(<Table caption="Invoices" items={invoices} getKey={(invoice) => invoice.id} columns={withRowHeader} />)
    expect(screen.getAllByRole('rowheader').map((cell) => cell.textContent)).toEqual(['INV-1', 'INV-2'])
    expect(screen.getAllByRole('cell').map((cell) => cell.textContent)).toEqual(['120', '80'])
    expect(screen.getAllByRole('columnheader')).toHaveLength(2)
  })

  it('renders its sort links through the element in link, with the href of each column', () => {
    render(
      <Table
        caption="Invoices"
        items={invoices}
        getKey={(invoice) => invoice.id}
        columns={columns}
        link={<a data-soft-navigation="" href="" />}
      />,
    )
    const links = screen.getAllByRole('link')
    expect(links.map((link) => link.getAttribute('href'))).toEqual(['/invoices?sort=number', '/invoices?sort=amount'])
    expect(links.map((link) => link.hasAttribute('data-soft-navigation'))).toEqual([true, true])
  })

  it('is one tab stop for scrolling, then the sort links in reading order', async () => {
    render(table())
    const [number, amount] = screen.getAllByRole('link')
    await userEvent.tab()
    expect(document.activeElement).toBe(screen.getByRole('region'))
    await userEvent.tab()
    expect(document.activeElement).toBe(number)
    await userEvent.tab()
    expect(document.activeElement).toBe(amount)
  })

  it('follows new items on re-render and falls back to the empty row when they are gone', () => {
    const { rerender } = render(table())
    rerender(table({ items: [] }))
    const region = screen.getByRole('region')
    expect(region.hasAttribute('data-empty')).toBe(true)
    expect(screen.getByRole('cell').textContent).toBe('Nothing here yet')
    expect(screen.getByRole('cell').getAttribute('colspan')).toBe('2')
  })
})

describe('ref', () => {
  it('is a normal prop and receives the scrolling box', () => {
    const ref = { current: null as HTMLDivElement | null }
    render(<Table ref={ref} caption="Invoices" items={invoices} getKey={(invoice) => invoice.id} columns={columns} />)
    expect(ref.current?.tagName).toBe('DIV')
    expect(ref.current?.getAttribute('role')).toBe('region')
    expect(ref.current?.firstElementChild?.tagName).toBe('TABLE')
  })

  it('is cleared on unmount', () => {
    const ref = { current: null as HTMLDivElement | null }
    const { unmount } = render(
      <Table ref={ref} caption="Invoices" items={invoices} getKey={(invoice) => invoice.id} columns={columns} />,
    )
    unmount()
    expect(ref.current).toBeNull()
  })
})

describe('the placeholder in a real tree', () => {
  it('is out of the accessibility tree: no table, no row and no cell to read out', () => {
    render(<TableSkeleton rows={3} columns={2} />)
    expect(screen.queryByRole('table')).toBeNull()
    expect(screen.queryAllByRole('row')).toEqual([])
    expect(screen.queryAllByRole('cell')).toEqual([])
  })

  it('takes a ref to its box, and is no tab stop', async () => {
    const ref = { current: null as HTMLDivElement | null }
    render(<TableSkeleton ref={ref} />)
    expect(ref.current?.tagName).toBe('DIV')
    expect(ref.current?.getAttribute('aria-hidden')).toBe('true')
    await userEvent.tab()
    expect(document.activeElement).toBe(document.body)
  })
})
