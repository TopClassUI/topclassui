import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { Command } from '../index.js'
import type { CommandProps } from '../types.js'

interface Entry { id: string, label: string }

const ITEMS: Entry[] = [
  { id: 'button', label: 'Button' },
  { id: 'button-group', label: 'Button group' },
  { id: 'icon-button', label: 'Icon button' },
  { id: 'dialog', label: 'Dialog' },
]

type Given = Partial<CommandProps<Entry>>

/** The palette over ITEMS, uncontrolled unless the test passes open. */
function Palette(props: Given) {
  return <Command items={ITEMS} getKey={(entry) => entry.id} getLabel={(entry) => entry.label} onSelect={() => undefined} {...props} />
}

/** The docs sample: a button holds the open state the palette shares. */
function Sample(props: Given) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" onClick={() => { setOpen(true) }}>Search</button>
      <Palette {...props} open={open} onOpenChange={setOpen} />
    </>
  )
}

const dialog = () => screen.queryByRole('dialog')
const input = () => screen.getByRole('combobox')
const options = () => screen.queryAllByRole('option').map((option) => option.textContent)
/** The live region's text. Base UI ends it with a word joiner, U+2060, so a reader hears a repeated text again. */
const status = () => screen.getByRole('status').textContent.replace('⁠', '')

/** Waits for the lazy panel, whose first load can take seconds on a busy machine, and the focus in its input. */
async function opened() {
  const popup = await screen.findByRole('dialog', {}, { timeout: 15_000 })
  await waitFor(() => { expect(document.activeElement).toBe(input()) })
  return popup
}

const closed = () => waitFor(() => { expect(dialog()).toBeNull() })

describe('the shortcut', () => {
  it('Ctrl+K opens it, and the input holds the focus', async () => {
    render(<Palette />)
    expect(dialog()).toBeNull()
    fireEvent.keyDown(document.body, { key: 'k', code: 'KeyK', ctrlKey: true })
    await opened()
  })

  it('Cmd+K opens it too', async () => {
    render(<Palette />)
    fireEvent.keyDown(document.body, { key: 'k', code: 'KeyK', metaKey: true })
    await opened()
  })

  it('K alone does not, and neither does Ctrl with another key', async () => {
    render(<Palette />)
    fireEvent.keyDown(document.body, { key: 'k', code: 'KeyK' })
    fireEvent.keyDown(document.body, { key: 'j', code: 'KeyJ', ctrlKey: true })
    await act(() => new Promise((resolve) => { setTimeout(resolve, 50) }))
    expect(dialog()).toBeNull()
  })

  it('takes the key from the browser, whose own Ctrl+K moves to its search bar', () => {
    render(<Palette />)
    const event = new KeyboardEvent('keydown', { key: 'k', code: 'KeyK', ctrlKey: true, cancelable: true, bubbles: true })
    act(() => { document.body.dispatchEvent(event) })
    expect(event.defaultPrevented).toBe(true)
  })

  it('another shortcut replaces k, and null turns it off', async () => {
    const { unmount } = render(<Palette shortcut="p" />)
    fireEvent.keyDown(document.body, { key: 'k', code: 'KeyK', ctrlKey: true })
    fireEvent.keyDown(document.body, { key: 'p', code: 'KeyP', ctrlKey: true })
    await opened()
    unmount()
    render(<Palette shortcut={null} />)
    const event = new KeyboardEvent('keydown', { key: 'k', code: 'KeyK', ctrlKey: true, cancelable: true, bubbles: true })
    act(() => { document.body.dispatchEvent(event) })
    await act(() => new Promise((resolve) => { setTimeout(resolve, 50) }))
    expect(event.defaultPrevented).toBe(false)
    expect(dialog()).toBeNull()
  })

  it('tells onOpenChange, and a controlled palette opens only when its owner says so', async () => {
    const onOpenChange = vi.fn()
    render(<Palette open={false} onOpenChange={onOpenChange} />)
    fireEvent.keyDown(document.body, { key: 'k', code: 'KeyK', ctrlKey: true })
    expect(onOpenChange).toHaveBeenCalledWith(true)
    await act(() => new Promise((resolve) => { setTimeout(resolve, 50) }))
    expect(dialog()).toBeNull()
  })
})

describe('the list', () => {
  it('opens on defaultOpen with every item, named by its title, and the input named by its placeholder', async () => {
    render(<Palette defaultOpen />)
    const popup = await opened()
    expect(options()).toEqual(['Button', 'Button group', 'Icon button', 'Dialog'])
    expect(popup.getAttribute('aria-labelledby')).toBe(screen.getByText('Command palette').id)
    expect(input().getAttribute('aria-label')).toBe('Type a command or search')
    expect(input().getAttribute('placeholder')).toBe('Type a command or search')
    expect(input().getAttribute('aria-controls')).toBe(screen.getByRole('listbox').id)
  })

  it('typing narrows it, word by word, in any case', async () => {
    render(<Palette defaultOpen />)
    await opened()
    await userEvent.type(input(), 'BUT')
    expect(options()).toEqual(['Button', 'Button group', 'Icon button'])
    await userEvent.type(input(), ' grou')
    expect(options()).toEqual(['Button group'])
  })

  it('a query that matches nothing shows No results, and hides the empty listbox', async () => {
    render(<Palette defaultOpen />)
    await opened()
    expect(status()).toBe('')
    await userEvent.type(input(), 'zebra')
    expect(options()).toEqual([])
    expect(status()).toBe('No results')
    expect(screen.getByRole('listbox', { hidden: true }).hasAttribute('data-empty')).toBe(true)
  })

  it('the caller replaces the empty text with emptyFallback', async () => {
    render(<Palette defaultOpen items={[]} emptyFallback={<em>Nothing to run</em>} />)
    await opened()
    expect(screen.getByRole('status').innerHTML.replace('⁠', '')).toBe('<em>Nothing to run</em>')
  })

  it('while loading with nothing yet, it says Loading, or the caller loadingFallback', async () => {
    const { unmount } = render(<Palette defaultOpen items={[]} status="loading" />)
    await opened()
    expect(status()).toBe('Loading')
    unmount()
    render(<Palette defaultOpen items={[]} status="loading" loadingFallback="Fetching commands" />)
    await opened()
    expect(status()).toBe('Fetching commands')
  })
})

describe('choosing', () => {
  it('Enter runs the first match once, closes the palette and returns the focus to the button that opened it', async () => {
    const onSelect = vi.fn()
    render(<Sample onSelect={onSelect} />)
    await userEvent.click(screen.getByText('Search'))
    await opened()
    await userEvent.type(input(), 'icon')
    await userEvent.keyboard('{Enter}')
    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onSelect).toHaveBeenCalledWith({ id: 'icon-button', label: 'Icon button' })
    await closed()
    await waitFor(() => { expect(document.activeElement?.textContent).toBe('Search') })
  })

  it('ArrowDown moves the active row, and Enter runs that one', async () => {
    const onSelect = vi.fn()
    render(<Palette defaultOpen onSelect={onSelect} />)
    await opened()
    await userEvent.type(input(), 'button')
    await userEvent.keyboard('{ArrowDown}')
    const active = input().getAttribute('aria-activedescendant')
    expect(active === null ? null : document.getElementById(active)?.textContent).toBe('Button group')
    await userEvent.keyboard('{Enter}')
    expect(onSelect.mock.calls).toEqual([[{ id: 'button-group', label: 'Button group' }]])
  })

  it('a press on a row runs it', async () => {
    const onSelect = vi.fn()
    render(<Palette defaultOpen onSelect={onSelect} />)
    await opened()
    await userEvent.click(screen.getByRole('option', { name: 'Dialog' }))
    expect(onSelect.mock.calls).toEqual([[{ id: 'dialog', label: 'Dialog' }]])
    await closed()
  })

  it('Escape closes it, and the next open starts from an empty query', async () => {
    render(<Sample />)
    await userEvent.click(screen.getByText('Search'))
    await opened()
    await userEvent.type(input(), 'dia')
    expect(options()).toEqual(['Dialog'])
    await userEvent.keyboard('{Escape}')
    await closed()
    await userEvent.click(screen.getByText('Search'))
    await opened()
    expect((input() as HTMLInputElement).value).toBe('')
    expect(options()).toEqual(['Button', 'Button group', 'Icon button', 'Dialog'])
  })
})
