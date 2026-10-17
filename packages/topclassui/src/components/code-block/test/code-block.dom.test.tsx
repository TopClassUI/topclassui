import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { getLabels } from '#shared/labels/get-labels.js'
import { CodeBlock } from '../index.js'

const CODE = 'const a = 1\n\tconst b = "two"\n'

/** The clipboard as a page sees it: a stub, or nothing at all outside a secure context. */
function stubClipboard(writeText: ((text: string) => Promise<void>) | undefined) {
  const clipboard = writeText === undefined ? undefined : { writeText: vi.fn(writeText) }
  Object.defineProperty(navigator, 'clipboard', { configurable: true, get: () => clipboard })
  return clipboard?.writeText
}

const statusText = () => screen.getByRole('status').textContent

/** A press, then the microtasks of the write, inside act so React has rendered the result. */
async function press(button: HTMLElement) {
  await act(async () => {
    fireEvent.click(button)
    await Promise.resolve()
  })
}

beforeEach(() => { vi.useFakeTimers() })
afterEach(() => { vi.useRealTimers() })

describe('a press that the clipboard takes', () => {
  it('writes exactly children, never the highlighted nodes', async () => {
    const write = stubClipboard(() => Promise.resolve())
    render(<CodeBlock title="page.tsx" highlighted={<b>shown</b>}>{CODE}</CodeBlock>)
    await press(screen.getByRole('button'))
    expect(write).toHaveBeenCalledTimes(1)
    expect(write).toHaveBeenCalledWith(CODE)
  })

  it('says Copied, shows the tick, and both are gone again after 2000 ms', async () => {
    stubClipboard(() => Promise.resolve())
    render(<CodeBlock>{CODE}</CodeBlock>)
    const button = screen.getByRole('button')
    expect(statusText()).toBe('')
    await press(button)
    expect(statusText()).toBe('Copied')
    expect(button.hasAttribute('data-copied')).toBe(true)
    act(() => { vi.advanceTimersByTime(1999) })
    expect(statusText()).toBe('Copied')
    act(() => { vi.advanceTimersByTime(1) })
    expect(statusText()).toBe('')
    expect(button.hasAttribute('data-copied')).toBe(false)
  })

  it('swaps the copy icon for the tick and back, which is the cue to the eye', async () => {
    stubClipboard(() => Promise.resolve())
    render(<CodeBlock>{CODE}</CodeBlock>)
    const button = screen.getByRole('button')
    const path = () => button.querySelector('path')?.getAttribute('d')
    const atRest = path()
    await press(button)
    expect(path()).not.toBe(atRest)
    act(() => { vi.advanceTimersByTime(2000) })
    expect(path()).toBe(atRest)
  })

  it('never changes the name of the button: "Copy page.tsx" before, during and after', async () => {
    stubClipboard(() => Promise.resolve())
    render(<CodeBlock title="page.tsx">{CODE}</CodeBlock>)
    expect(screen.getByRole('button', { name: 'Copy page.tsx' })).toBeTruthy()
    await press(screen.getByRole('button'))
    expect(screen.getByRole('button', { name: 'Copy page.tsx' })).toBeTruthy()
    act(() => { vi.advanceTimersByTime(2000) })
    expect(screen.getByRole('button', { name: 'Copy page.tsx' })).toBeTruthy()
  })

  it('a second press within the time empties the status first, then says it again, and restarts the time', async () => {
    stubClipboard(() => Promise.resolve())
    render(<CodeBlock>{CODE}</CodeBlock>)
    const button = screen.getByRole('button')
    await press(button)
    act(() => { vi.advanceTimersByTime(1500) })
    const seen: string[] = []
    const watch = new MutationObserver(() => { seen.push(statusText()) })
    watch.observe(screen.getByRole('status'), { childList: true, characterData: true, subtree: true })
    await press(button)
    await act(() => Promise.resolve())
    watch.disconnect()
    expect(seen).toEqual(['', 'Copied'])
    act(() => { vi.advanceTimersByTime(1999) })
    expect(statusText()).toBe('Copied')
  })

  it('a block in Arabic says it in Arabic', async () => {
    stubClipboard(() => Promise.resolve())
    render(<CodeBlock {...getLabels('ar')}>{CODE}</CodeBlock>)
    await press(screen.getByRole('button', { name: 'نسخ' }))
    expect(statusText()).toBe('تم النسخ')
  })
})

describe('a press that fails', () => {
  it('a refused write says Could not copy and keeps the copy icon', async () => {
    stubClipboard(() => Promise.reject(new Error('NotAllowedError')))
    render(<CodeBlock title="page.tsx">{CODE}</CodeBlock>)
    const button = screen.getByRole('button')
    const atRest = button.querySelector('path')?.getAttribute('d')
    await press(button)
    expect(statusText()).toBe('Could not copy')
    expect(button.hasAttribute('data-copied')).toBe(false)
    expect(button.querySelector('path')?.getAttribute('d')).toBe(atRest)
    expect(screen.getByRole('button', { name: 'Copy page.tsx' })).toBeTruthy()
    act(() => { vi.advanceTimersByTime(2000) })
    expect(statusText()).toBe('')
  })

  it('a write that throws at once says Could not copy', async () => {
    stubClipboard(() => { throw new Error('thrown') })
    render(<CodeBlock>{CODE}</CodeBlock>)
    await press(screen.getByRole('button'))
    expect(statusText()).toBe('Could not copy')
  })

  it('with navigator.clipboard undefined, as on plain http, says Could not copy and throws nothing', async () => {
    stubClipboard(undefined)
    const thrown: unknown[] = []
    const onError = (event: ErrorEvent) => { thrown.push(event.error) }
    window.addEventListener('error', onError)
    render(<CodeBlock>{CODE}</CodeBlock>)
    await press(screen.getByRole('button'))
    window.removeEventListener('error', onError)
    expect(statusText()).toBe('Could not copy')
    expect(thrown).toEqual([])
  })

  // No await runs on these two, so the empty status and the result land in one render: the words come back as a new node.
  for (const [how, write] of [['no clipboard', undefined], ['a write that throws at once', () => { throw new Error('thrown') }]] as const) {
    it(`with ${how}, a second press within the time puts the words back as a new node, which a live region reads again`, async () => {
      stubClipboard(write)
      render(<CodeBlock>{CODE}</CodeBlock>)
      const button = screen.getByRole('button')
      await press(button)
      act(() => { vi.advanceTimersByTime(1500) })
      const added: (string | null)[] = []
      const watch = new MutationObserver((records) => { added.push(...records.flatMap((record) => [...record.addedNodes].map((node) => node.textContent))) })
      watch.observe(screen.getByRole('status'), { childList: true, characterData: true, subtree: true })
      await press(button)
      await act(() => Promise.resolve())
      watch.disconnect()
      expect(added).toEqual(['Could not copy'])
      expect(statusText()).toBe('Could not copy')
    })
  }
})

describe('the timer', () => {
  it('is cleared on unmount, so no update reaches a block that is gone', async () => {
    stubClipboard(() => Promise.resolve())
    const { unmount } = render(<CodeBlock>{CODE}</CodeBlock>)
    await press(screen.getByRole('button'))
    expect(vi.getTimerCount()).toBe(1)
    unmount()
    expect(vi.getTimerCount()).toBe(0)
  })
})
