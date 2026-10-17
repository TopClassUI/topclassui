import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Command } from '../index.js'
import type { CommandProps } from '../types.js'

interface Entry { id: string, label: string }

const many: Entry[] = Array.from({ length: 10_000 }, (_, index) => ({ id: `c${String(index)}`, label: `Command ${String(index + 1)}` }))

function Palette(props: Partial<CommandProps<Entry>>) {
  return <Command defaultOpen items={many} getKey={(entry) => entry.id} getLabel={(entry) => entry.label} onSelect={() => undefined} {...props} />
}

const input = () => screen.getByRole('combobox')
const list = () => screen.getByRole('listbox')

async function ready() {
  await screen.findByRole('dialog', {}, { timeout: 15_000 })
  await waitFor(() => { expect(document.activeElement).toBe(input()) })
}

describe('paging (R-8.5-1, PLAN 8.5): on scroll and on search, never while closed', () => {
  const few = many.slice(0, 30)

  it('loadMore is called once when the open list is at its end, and not again for the same page', async () => {
    const loadMore = vi.fn()
    render(<Palette items={few} hasMore loadMore={loadMore} />)
    await ready()
    await waitFor(() => { expect(loadMore).toHaveBeenCalledTimes(1) })
    fireEvent.change(input(), { target: { value: 'Command 1' } })
    await waitFor(() => { expect(input()).toHaveProperty('value', 'Command 1') })
    expect(loadMore).toHaveBeenCalledTimes(1)
  })

  it('closed, or without hasMore, it never asks', async () => {
    const loadMore = vi.fn()
    const { unmount } = render(<Palette items={few} defaultOpen={false} hasMore loadMore={loadMore} />)
    await new Promise((resolve) => { setTimeout(resolve, 50) })
    expect(loadMore).not.toHaveBeenCalled()
    unmount()
    render(<Palette items={few} loadMore={loadMore} />)
    await ready()
    expect(loadMore).not.toHaveBeenCalled()
  })

  it('kept mounted while closed, the list is still there but asks for nothing until the palette opens again', async () => {
    const loadMore = vi.fn()
    const { rerender } = render(<Palette items={few} keepMounted open />)
    await ready()
    rerender(<Palette items={few} keepMounted open={false} />)
    await waitFor(() => { expect(screen.queryByRole('dialog')).toBeNull() })
    rerender(<Palette items={few} keepMounted open={false} hasMore loadMore={loadMore} />)
    await new Promise((resolve) => { setTimeout(resolve, 50) })
    expect(loadMore).not.toHaveBeenCalled()
  })

  it('a new query reaches onQueryChange, and loading-more sets aria-busy on the list', async () => {
    const onQueryChange = vi.fn<(query: string) => void>()
    render(<Palette items={few} status="loading-more" onQueryChange={onQueryChange} />)
    await ready()
    expect(list().getAttribute('aria-busy')).toBe('true')
    await userEvent.type(input(), 'ab')
    expect(onQueryChange.mock.calls.map((call) => call[0])).toEqual(['a', 'ab'])
  })

  it('visibleRows reaches the window as well as the box, so two rows mount fewer than the seven the knob gives (fourteen)', async () => {
    render(<Palette visibleRows={2} />)
    await ready()
    const two = screen.getAllByRole('option').length
    expect(list().style.getPropertyValue('--tc-list-rows')).toBe('2')
    expect(two).toBeLessThan(10)
  })
})
