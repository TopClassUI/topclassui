import { Toast } from '@base-ui/react/toast'
import { act, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { toastManager } from '../toast/manager.js'
import { TopClassProvider, type TopClassProviderProps } from './provider.js'

afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks() })

/** The list each probe last read, so two probes can be compared by identity. */
const read = new Map<string, unknown>()

/** What Base UI holds, read with its own hook: the Toast component does not exist yet. */
function Toasts({ id = 'toasts' }: { id?: string }) {
  const { toasts } = Toast.useToastManager()
  read.set(id, toasts)
  return (
    <ul data-testid={id}>
      {toasts.map((toast) => (
        <li key={toast.id} data-limited={toast.limited ? '' : undefined} data-status={toast.transitionStatus}>
          {toast.title}
        </li>
      ))}
    </ul>
  )
}

const rows = (id = 'toasts') => [...screen.getByTestId(id).querySelectorAll('li')]
/** Newest first, as Base UI keeps them. */
const titles = (id = 'toasts') => rows(id).map((row) => row.textContent)
const limited = (id = 'toasts') => rows(id).filter((row) => row.hasAttribute('data-limited')).map((row) => row.textContent)
const closing = (id = 'toasts') => rows(id).filter((row) => row.dataset['status'] === 'ending').map((row) => row.textContent)

const add = (...names: string[]) => { act(() => { for (const title of names) toastManager.add({ title }) }) }

const provider = (toast?: TopClassProviderProps['toast']) => (
  <TopClassProvider direction="ltr" locale="en" toast={toast}><Toasts /></TopClassProvider>
)

describe('toastManager reaches the provider', () => {
  it('add() from outside React shows up in useToastManager().toasts, newest first', () => {
    render(provider())
    expect(titles()).toEqual([])
    add('Saved')
    expect(titles()).toEqual(['Saved'])
    add('Sent')
    expect(titles()).toEqual(['Sent', 'Saved'])
  })

  it('update() and close() reach the same toast by the id add() returned', () => {
    render(provider())
    // act() hands back a thenable, never the callback's own value.
    let id = ''
    act(() => { id = toastManager.add({ title: 'Uploading' }) })
    expect(id).toMatch(/^toast-/)
    act(() => { toastManager.update(id, { title: 'Uploaded' }) })
    expect(titles()).toEqual(['Uploaded'])
    expect(closing()).toEqual([])
    act(() => { toastManager.close(id) })
    expect(closing()).toEqual(['Uploaded'])
  })

  it('without the provider there is no store to read, which is what it adds', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    expect(() => render(<Toasts />)).toThrow('useToastManager must be used within <Toast.Provider>')
  })
})

describe('Base UI runs on the clamped settings', () => {
  it('marks the fourth toast limited at the default limit of 3', () => {
    render(provider())
    add('One', 'Two', 'Three', 'Four')
    expect(titles()).toEqual(['Four', 'Three', 'Two', 'One'])
    expect(limited()).toEqual(['One'])
  })

  it('shows ten at a limit of 99, not ninety-nine', () => {
    render(provider({ limit: 99 }))
    add('1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11')
    expect(limited()).toEqual(['1'])
  })

  it('shows one at a limit of 0, not none', () => {
    render(provider({ limit: 0 }))
    add('One', 'Two')
    expect(limited()).toEqual(['One'])
  })

  it('applies a limit that changes after mount to the toasts already there', () => {
    const view = render(provider({ limit: 3 }))
    add('One', 'Two', 'Three')
    expect(limited()).toEqual([])
    view.rerender(provider({ limit: 1 }))
    expect(limited()).toEqual(['Two', 'One'])
  })

  it('closes a toast after the default five seconds, and not a millisecond before', () => {
    vi.useFakeTimers()
    render(provider())
    add('Saved')
    act(() => { vi.advanceTimersByTime(4999) })
    expect(closing()).toEqual([])
    act(() => { vi.advanceTimersByTime(1) })
    expect(closing()).toEqual(['Saved'])
  })

  it('closes after ten minutes when asked for longer: the high end of the clamp reaches the timer', () => {
    vi.useFakeTimers()
    render(provider({ duration: 9_000_000_000 }))
    add('Saved')
    act(() => { vi.advanceTimersByTime(599_999) })
    expect(closing()).toEqual([])
    act(() => { vi.advanceTimersByTime(1) })
    expect(closing()).toEqual(['Saved'])
  })

  it('takes the duration the prop gives', () => {
    vi.useFakeTimers()
    render(provider({ duration: 1200 }))
    add('Saved')
    act(() => { vi.advanceTimersByTime(1199) })
    expect(closing()).toEqual([])
    act(() => { vi.advanceTimersByTime(1) })
    expect(closing()).toEqual(['Saved'])
  })

  it('never closes at a negative duration, which clamps to 0, the value that keeps a toast', () => {
    vi.useFakeTimers()
    render(provider({ duration: -5 }))
    add('Saved')
    act(() => { vi.advanceTimersByTime(700_000) })
    expect(titles()).toEqual(['Saved'])
    expect(closing()).toEqual([])
  })
})

describe('a nested provider, such as an RTL island', () => {
  const island = (
    <TopClassProvider direction="ltr" locale="en" toast={{ limit: 1 }}>
      <Toasts id="outer" />
      <TopClassProvider direction="rtl" locale="ar" toast={{ limit: 5 }}><Toasts id="inner" /></TopClassProvider>
    </TopClassProvider>
  )

  it('adds no second Toast.Provider: the island reads the very list the page reads', () => {
    render(island)
    add('One', 'Two')
    expect(titles('inner')).toEqual(['Two', 'One'])
    expect(titles('outer')).toEqual(['Two', 'One'])
    expect(read.get('inner')).toBe(read.get('outer'))
  })

  it('runs on the outer limit: its own toast prop is not read', () => {
    render(island)
    add('One', 'Two')
    expect(limited('inner')).toEqual(['One'])
  })
})
