import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Command } from '../index.js'
import type { CommandProps } from '../types.js'

interface Entry { id: string, label: string, area: string }

/** Ten thousand items, a hundred to an area. */
const many: Entry[] = Array.from({ length: 10_000 }, (_, index) => ({
  id: `c${String(index)}`,
  label: `Command ${String(index + 1)}`,
  area: `Area ${String(Math.floor(index / 100) + 1)}`,
}))

function Palette(props: Partial<CommandProps<Entry>>) {
  return <Command defaultOpen items={many} getKey={(entry) => entry.id} getLabel={(entry) => entry.label} onSelect={() => undefined} {...props} />
}

const input = () => screen.getByRole('combobox')
const list = () => screen.getByRole('listbox')
const spacers = () => [...list().querySelectorAll('[role="presentation"]')] as HTMLElement[]

async function ready() {
  await screen.findByRole('dialog', {}, { timeout: 15_000 })
  await waitFor(() => { expect(document.activeElement).toBe(input()) })
}

// happy-dom lays nothing out, so the window is the overscan alone; the browser spec measures the rest.
describe('windowing, above the threshold', () => {
  it('mounts a handful of ten thousand rows, and a spacer that stands for the rest by their count', async () => {
    render(<Palette />)
    await ready()
    const rows = screen.getAllByRole('option')
    expect(rows.length).toBeGreaterThan(0)
    expect(rows.length).toBeLessThan(20)
    expect(spacers()).toHaveLength(1)
    expect(spacers()[0]?.style.getPropertyValue('--tc-list-rows')).toBe(String(10_000 - rows.length))
  })

  it('every mounted row carries Base UI index of its item, so the id aria-activedescendant names is the right one', async () => {
    render(<Palette />)
    await ready()
    const first = screen.getAllByRole('option')[0]
    expect(first?.id.endsWith('-0')).toBe(true)
    expect(first?.getAttribute('data-command-row')).toBe('0')
  })

  it('ArrowUp from the first row reaches the last of ten thousand, which is not mounted, and brings it in', async () => {
    const scrollIntoView = vi.fn()
    Element.prototype.scrollIntoView = scrollIntoView
    render(<Palette />)
    await ready()
    await userEvent.type(input(), 'command')
    await userEvent.keyboard('{ArrowUp}')
    const active = () => input().getAttribute('aria-activedescendant') ?? ''
    expect(active().endsWith('-9999')).toBe(true)
    // happy-dom fires no scroll event for a scrollTop it is given, so the test fires the one a browser would.
    expect(list().scrollTop).toBeGreaterThan(300_000)
    fireEvent.scroll(list())
    await waitFor(() => { expect(document.getElementById(active())?.textContent).toBe('Command 10000') })
    await waitFor(() => { expect(scrollIntoView).toHaveBeenCalledWith({ block: 'nearest' }) })
    // At the end there is a spacer above alone, standing for every row before the first one mounted.
    const first = list().querySelector('[data-command-row]')?.getAttribute('data-command-row')
    expect(Number(first)).toBeGreaterThan(9900)
    expect(spacers().map((spacer) => spacer.style.getPropertyValue('--tc-list-rows'))).toEqual([first])
  })

  it('virtualize false mounts every row; true windows even a short list', async () => {
    const { unmount } = render(<Palette items={many.slice(0, 300)} virtualize={false} />)
    await ready()
    expect(screen.getAllByRole('option')).toHaveLength(300)
    expect(spacers()).toHaveLength(0)
    unmount()
    render(<Palette items={many.slice(0, 50)} virtualize />)
    await ready()
    expect(screen.getAllByRole('option').length).toBeLessThan(50)
  })

  it('grouped, a heading is a row of the window too, and a group whose heading is gone keeps its name', async () => {
    render(<Palette getGroup={(entry) => entry.area} />)
    await ready()
    const group = screen.getAllByRole('group')[0]
    expect(group?.getAttribute('aria-labelledby')).toBe(screen.getByText('Area 1').closest('[id]')?.id)
    expect(screen.getByText('Area 1').closest('[data-command-row]')?.getAttribute('data-command-row')).toBe('0')
    // 10,000 items and 100 headings: what the spacer stands for counts both.
    const mounted = list().querySelectorAll('[data-command-row]').length
    expect(spacers()[0]?.style.getPropertyValue('--tc-list-rows')).toBe(String(10_100 - mounted))

    // The last item: its group's heading is a hundred rows up, out of the window, so the group names itself.
    await userEvent.type(input(), 'command')
    await userEvent.keyboard('{ArrowUp}')
    fireEvent.scroll(list())
    await waitFor(() => { expect(screen.getByRole('option', { name: 'Command 10000' })).toBeTruthy() })
    const last = screen.getByRole('option', { name: 'Command 10000' }).closest('[role="group"]')
    expect(last?.getAttribute('aria-label')).toBe('Area 100')
    expect(last?.hasAttribute('aria-labelledby')).toBe(false)
  })

  it('a scroll that is not the keyboard leaves the active row mounted in its place: aria-activedescendant names it and Enter runs it', async () => {
    const onSelect = vi.fn()
    render(<Palette onSelect={onSelect} />)
    await ready()
    await userEvent.keyboard('{ArrowDown}{ArrowDown}')
    const active = () => document.getElementById(input().getAttribute('aria-activedescendant') ?? '')
    await waitFor(() => { expect(active()?.textContent).toBe('Command 2') })
    // A finger or the scrollbar: the window moves a hundred rows down, the highlight stays.
    list().scrollTop = 4000
    fireEvent.scroll(list())
    await waitFor(() => { expect(screen.getAllByRole('option')[1]?.getAttribute('data-command-row')).not.toBe('2') })
    expect(active()?.textContent).toBe('Command 2')
    expect(active()?.hasAttribute('data-highlighted')).toBe(true)
    expect(screen.getAllByRole('option')[0]).toBe(active())
    // One unit above it stands for Command 1, and the spacers and the rows still count ten thousand.
    const counts = spacers().map((spacer) => Number(spacer.style.getPropertyValue('--tc-list-rows')))
    expect(counts[0]).toBe(1)
    expect(counts.reduce((sum, count) => sum + count, 0) + screen.getAllByRole('option').length).toBe(10_000)
    await userEvent.keyboard('{Enter}')
    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onSelect).toHaveBeenCalledWith({ id: 'c1', label: 'Command 2', area: 'Area 1' })
  })

  it('the first match a query highlights stays mounted too, so Enter runs it after the list is scrolled', async () => {
    const onSelect = vi.fn()
    render(<Palette onSelect={onSelect} />)
    await ready()
    await userEvent.type(input(), 'command 1')
    await waitFor(() => { expect(screen.getAllByRole('option')[0]?.hasAttribute('data-highlighted')).toBe(true) })
    list().scrollTop = 4000
    fireEvent.scroll(list())
    await waitFor(() => { expect(screen.getAllByRole('option')[1]?.getAttribute('data-command-row')).not.toBe('1') })
    expect(document.getElementById(input().getAttribute('aria-activedescendant') ?? '')?.textContent).toBe('Command 1')
    await userEvent.keyboard('{Enter}')
    expect(onSelect).toHaveBeenCalledWith({ id: 'c0', label: 'Command 1', area: 'Area 1' })
  })

  it('every mounted option says its place and the size of its set, which a reader cannot count from the rows mounted', async () => {
    render(<Palette />)
    await ready()
    const place = (option: Element | undefined) => `${option?.getAttribute('aria-posinset') ?? '-'} of ${option?.getAttribute('aria-setsize') ?? '-'}`
    expect(place(screen.getAllByRole('option')[0])).toBe('1 of 10000')
    await userEvent.type(input(), 'command')
    await userEvent.keyboard('{ArrowUp}')
    fireEvent.scroll(list())
    await waitFor(() => { expect(place(screen.queryByRole('option', { name: 'Command 10000' }) ?? undefined)).toBe('10000 of 10000') })
  })

  it('grouped, an option counts its place in its own group', async () => {
    render(<Palette getGroup={(entry) => entry.area} />)
    await ready()
    const place = (name: string) => {
      const option = screen.getByRole('option', { name })
      return `${option.getAttribute('aria-posinset') ?? '-'} of ${option.getAttribute('aria-setsize') ?? '-'}`
    }
    expect(place('Command 1')).toBe('1 of 100')
    expect(place('Command 2')).toBe('2 of 100')
  })

  it('a new query starts the list from its top again', async () => {
    render(<Palette />)
    await ready()
    list().scrollTop = 4000
    await userEvent.type(input(), '9')
    expect(list().scrollTop).toBe(0)
  })
})
