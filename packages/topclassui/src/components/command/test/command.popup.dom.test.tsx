import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Command } from '../index.js'
import type { CommandProps } from '../types.js'

interface Entry { id: string, label: string }

const ITEMS: Entry[] = [{ id: 'button', label: 'Button' }, { id: 'dialog', label: 'Dialog' }]

function Palette(props: Partial<CommandProps<Entry>>) {
  return <Command defaultOpen items={ITEMS} getKey={(entry) => entry.id} getLabel={(entry) => entry.label} onSelect={() => undefined} {...props} />
}

const input = () => screen.getByRole('combobox')
const list = () => screen.getByRole('listbox')

async function opened() {
  const popup = await screen.findByRole('dialog', {}, { timeout: 15_000 })
  await waitFor(() => { expect(document.activeElement).toBe(input()) })
  return popup
}

describe('the popup', () => {
  it('takes className last, and passes the rest of its props on', async () => {
    render(<Palette className="max-w-80" data-testid="palette" id="palette" />)
    const popup = await opened()
    expect(popup.getAttribute('data-testid')).toBe('palette')
    expect(popup.id).toBe('palette')
    expect(popup.className).toContain('max-w-80')
    expect(popup.className).not.toContain('max-w-100')
  })

  it('visibleRows sets the row knob on the list, clamped to 1 to 100, and nothing when left out', async () => {
    const { unmount } = render(<Palette visibleRows={4} />)
    await opened()
    expect(list().style.getPropertyValue('--tc-list-rows')).toBe('4')
    unmount()
    const second = render(<Palette visibleRows={100000} />)
    await opened()
    expect(list().style.getPropertyValue('--tc-list-rows')).toBe('100')
    second.unmount()
    render(<Palette />)
    await opened()
    expect(list().style.getPropertyValue('--tc-list-rows')).toBe('')
  })

  it('hands the rows the Enter hint of the labels with an empty alternative, so it is drawn and never read', async () => {
    render(<Palette />)
    await opened()
    expect(list().style.getPropertyValue('--tc-command-enter')).toBe('"Enter" / ""')
  })

  it('caps what can be typed at the search field cap of 256 characters', async () => {
    render(<Palette />)
    await opened()
    expect(input().getAttribute('maxlength')).toBe('256')
  })

  // Base UI 1.8.0 fills the input on a press only when it owns a popup; an inline list has none.
  it('a chosen row leaves the query as typed: the inline list writes no label into the input', async () => {
    const onSelect = vi.fn()
    render(<Palette open onOpenChange={() => undefined} onSelect={onSelect} />)
    await opened()
    await userEvent.type(input(), 'dia')
    await userEvent.keyboard('{Enter}')
    expect(onSelect).toHaveBeenCalledTimes(1)
    expect((input() as HTMLInputElement).value).toBe('dia')
    expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual(['Dialog'])
  })

  it('the first open fades in as later ones do: the popup mounts in its starting style, not already open', async () => {
    const starts: boolean[] = []
    const watch = new MutationObserver(() => {
      const popup = document.querySelector('[role="dialog"]')
      if (popup && starts.length === 0) starts.push(popup.hasAttribute('data-starting-style'))
    })
    watch.observe(document.body, { childList: true, subtree: true })
    render(<Palette />)
    await opened()
    watch.disconnect()
    expect(starts).toEqual([true])
  })

  it('a row draws its label in a span that truncates, and renderItem replaces what the row holds', async () => {
    const { unmount } = render(<Palette />)
    await opened()
    expect(screen.getByRole('option', { name: 'Button' }).innerHTML).toBe('<span class="truncate min-w-0">Button</span>')
    unmount()
    render(<Palette renderItem={(entry) => <b>{entry.id}</b>} />)
    await opened()
    expect(screen.getAllByRole('option').map((option) => option.innerHTML)).toEqual(['<b>button</b>', '<b>dialog</b>'])
  })
})
