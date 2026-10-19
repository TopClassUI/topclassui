import { act, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { Table } from '../index.js'
import type { TableColumn } from '../types.js'

// R-8.5-1: the body windows through useCollection. happy-dom lays nothing out, so the window is the overscan alone.
interface Line { id: string; n: number }
const lines = (count: number): Line[] => Array.from({ length: count }, (_, at) => ({ id: `l${String(at + 1)}`, n: at + 1 }))
const columns: TableColumn<Line>[] = [
  { key: 'n', header: 'Line', rowHeader: true, cell: (line) => `Line ${String(line.n)}` },
  { key: 'twice', header: 'Twice', align: 'end', cell: (line) => line.n * 2 },
]
const body = () => document.querySelector('tbody') as HTMLTableSectionElement
const mounted = () => [...body().querySelectorAll('tr:not([aria-hidden])')]
const spacers = () => [...body().querySelectorAll('tr[aria-hidden="true"]')]

describe('ten thousand rows', () => {
  it('mount a handful, and a spacer row across every column stands for the rest', () => {
    render(<Table items={lines(10_000)} getKey={(line) => line.id} columns={columns} caption="Lines" />)
    expect(mounted().length).toBeGreaterThan(0)
    expect(mounted().length).toBeLessThan(40)
    expect(spacers()).toHaveLength(1)
    expect(spacers()[0]?.querySelector('td')?.getAttribute('colspan')).toBe('2')
    expect(body().style.getPropertyValue('--tc-list-pad-end')).toMatch(/^\d+px$/)
  })

  it('the table counts every row, the header among them, and each mounted row says where it stands', () => {
    render(<Table items={lines(10_000)} getKey={(line) => line.id} columns={columns} caption="Lines" />)
    expect(screen.getByRole('table').getAttribute('aria-rowcount')).toBe('10001')
    expect(document.querySelector('thead tr')?.getAttribute('aria-rowindex')).toBe('1')
    expect(mounted()[0]?.getAttribute('aria-rowindex')).toBe('2')
    expect(mounted()[0]?.querySelector('th')?.textContent).toBe('Line 1')
  })

  it('while more pages may come the count is -1, as ARIA has it for a count not known yet', () => {
    render(<Table items={lines(5)} getKey={(line) => line.id} columns={columns} caption="Lines" hasMore loadMore={() => undefined} />)
    expect(screen.getByRole('table').getAttribute('aria-rowcount')).toBe('-1')
  })

  it('virtualize={false} keeps every row, with no spacer', () => {
    render(<Table items={lines(300)} getKey={(line) => line.id} columns={columns} caption="Lines" virtualize={false} />)
    expect(mounted()).toHaveLength(300)
    expect(spacers()).toHaveLength(0)
  })

  it('striped tints by the row\'s place in the whole table, not in the window', () => {
    render(<Table items={lines(10)} getKey={(line) => line.id} columns={columns} caption="Lines" striped />)
    const row = 'group/row hover:bg-surface data-selected:bg-primary-soft'
    const tint = 'group/row data-selected:bg-primary-soft bg-surface hover:bg-neutral-soft group-hover/row:bg-neutral-soft group-data-selected/row:bg-primary-soft'
    expect(mounted().map((line) => line.className)).toEqual([row, tint, row, tint, row, tint, row, tint, row, tint])
  })
})

describe('paging (R-8.5-2): the body asks once per page, never in a loop', () => {
  it('asks once at the end, and not again until the page lands', async () => {
    const loadMore = vi.fn(() => new Promise<void>(() => undefined))
    render(<Table items={lines(5)} getKey={(line) => line.id} columns={columns} caption="Lines" hasMore loadMore={loadMore} />)
    await act(async () => { await Promise.resolve() })
    expect(loadMore).toHaveBeenCalledTimes(1)
    await act(async () => { await new Promise((resolve) => { setTimeout(resolve, 30) }) })
    expect(loadMore).toHaveBeenCalledTimes(1)
  })

  it('a page that lands is asked for once more, and without hasMore nothing is asked', async () => {
    const loadMore = vi.fn()
    const { rerender } = render(<Table items={lines(5)} getKey={(line) => line.id} columns={columns} caption="Lines" hasMore loadMore={loadMore} />)
    await act(async () => { await Promise.resolve() })
    rerender(<Table items={lines(10)} getKey={(line) => line.id} columns={columns} caption="Lines" hasMore={false} loadMore={loadMore} />)
    await act(async () => { await Promise.resolve() })
    expect(loadMore).toHaveBeenCalledTimes(1)
  })

  it('the box holds the --tc-list-rows knob only when visibleRows is passed, clamped', () => {
    const { rerender } = render(<Table items={lines(5)} getKey={(line) => line.id} columns={columns} caption="Lines" />)
    const box = screen.getByRole('region')
    expect(box.style.getPropertyValue('--tc-list-rows')).toBe('')
    rerender(<Table items={lines(5)} getKey={(line) => line.id} columns={columns} caption="Lines" visibleRows={50} />)
    expect(box.style.getPropertyValue('--tc-list-rows')).toBe('20')
  })
})
