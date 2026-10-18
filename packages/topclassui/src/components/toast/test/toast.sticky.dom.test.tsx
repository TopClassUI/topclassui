import { act, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { TopClassProvider } from '#shared/provider/provider.js'
import { toast } from '../index.js'

/** happy-dom lays nothing out, so the observer is a stub the test fires by hand. */
class Observer {
  static made: Observer[] = []
  disconnected = false
  constructor(readonly fire: () => void) { Observer.made.push(this) }
  observe() { return undefined }
  unobserve() { return undefined }
  disconnect() { this.disconnected = true }
}

/** The height the stubbed layout gives the viewport; anything else measures 0, as in happy-dom. */
let height = 96
let screenHeight = 768

const variable = () => document.documentElement.style.getPropertyValue('--tc-sticky-bottom')
const live = () => Observer.made.filter((observer) => !observer.disconnected)

beforeEach(() => {
  height = 96
  screenHeight = 768
  Observer.made = []
  vi.stubGlobal('ResizeObserver', Observer)
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function measure(this: HTMLElement) {
    const tall = this.getAttribute('role') === 'region' ? height : 0
    return { x: 0, y: 0, left: 0, top: 0, width: 360, right: 360, height: tall, bottom: tall, toJSON: () => ({}) }
  })
  vi.spyOn(document.documentElement, 'clientHeight', 'get').mockImplementation(() => screenHeight)
})

afterEach(async () => {
  act(() => { toast.close() })
  await waitFor(() => { expect(screen.queryAllByRole('dialog')).toEqual([]) })
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  document.documentElement.removeAttribute('style')
})

// R-10.5-3: a stack at the bottom is a bar, so the page keeps its height clear while it shows.
describe('the toast viewport publishes its height at the bottom', () => {
  it('writes nothing while no toast shows, then the height of the viewport in px, and removes it once the stack is empty', async () => {
    render(<TopClassProvider direction="ltr" locale="en" />)
    expect(variable()).toBe('')
    act(() => { toast.add({ title: 'Saved', duration: 0 }) })
    await screen.findByRole('heading', { name: 'Saved' })
    expect(variable()).toBe('96px')
    act(() => { toast.close() })
    await waitFor(() => { expect(variable()).toBe('') })
    expect(live()).toEqual([])
  })

  it('follows the stack as it grows, rounded up to a whole pixel', async () => {
    render(<TopClassProvider direction="ltr" locale="en" />)
    act(() => { toast.add({ title: 'Saved', duration: 0 }) })
    await screen.findByRole('heading', { name: 'Saved' })
    act(() => {
      height = 180.2
      for (const observer of live()) observer.fire()
    })
    expect(variable()).toBe('181px')
  })

  it('claims nothing for a stack taller than a third of the screen', async () => {
    screenHeight = 240
    render(<TopClassProvider direction="ltr" locale="en" />)
    act(() => { toast.add({ title: 'Saved', duration: 0 }) })
    await screen.findByRole('heading', { name: 'Saved' })
    expect(variable()).toBe('0px')
  })

  it('writes nothing at a top placement, where --tc-sticky-top is the Navbar\'s', async () => {
    render(<TopClassProvider direction="ltr" locale="en" toast={{ placement: 'top-end' }} />)
    act(() => { toast.add({ title: 'Saved', duration: 0 }) })
    await screen.findByRole('heading', { name: 'Saved' })
    expect(variable()).toBe('')
    expect(document.documentElement.style.getPropertyValue('--tc-sticky-top')).toBe('')
  })

  it('removes it when the provider unmounts with toasts still showing', async () => {
    const { unmount } = render(<TopClassProvider direction="ltr" locale="en" />)
    act(() => { toast.add({ title: 'Saved', duration: 0 }) })
    await screen.findByRole('heading', { name: 'Saved' })
    unmount()
    expect(variable()).toBe('')
  })
})
