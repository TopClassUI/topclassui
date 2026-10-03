import { act, render, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createAdaptive } from './create-adaptive.js'
import { useAdaptiveMode } from './use-adaptive-mode.js'

/** A matchMedia we can drive, since happy-dom never actually resizes. */
let matches = false
const listeners = new Set<() => void>()

function setViewport(mobile: boolean) {
  matches = mobile
  for (const l of [...listeners]) l()
}

beforeEach(() => {
  matches = false
  listeners.clear()
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches,
    media: query,
    addEventListener: (_: string, cb: () => void) => listeners.add(cb),
    removeEventListener: (_: string, cb: () => void) => listeners.delete(cb),
  }))
})

describe('useAdaptiveMode', () => {
  it('reads the viewport', () => {
    const { result, rerender } = renderHook(() => useAdaptiveMode())
    expect(result.current).toBe('desktop')
    act(() => { setViewport(true) })
    rerender()
    expect(result.current).toBe('mobile')
  })

  it('an explicit mode wins over the viewport', () => {
    setViewport(true)
    expect(renderHook(() => useAdaptiveMode('desktop')).result.current).toBe('desktop')
    setViewport(false)
    expect(renderHook(() => useAdaptiveMode('mobile')).result.current).toBe('mobile')
  })

  it('unsubscribes on unmount, so a listener does not leak', () => {
    const { unmount } = renderHook(() => useAdaptiveMode())
    expect(listeners.size).toBe(1)
    unmount()
    expect(listeners.size).toBe(0)
  })
})

const Desktop = (p: { label: string; onOpenChange?: (o: boolean) => void }) => (
  <button type="button" onClick={() => p.onOpenChange?.(true)}>desktop:{p.label}</button>
)
const Mobile = (p: { label: string; onOpenChange?: (o: boolean) => void }) => (
  <button type="button" onClick={() => p.onOpenChange?.(true)}>mobile:{p.label}</button>
)

describe('createAdaptive', () => {
  const Adaptive = createAdaptive<{ label: string; onOpenChange?: (o: boolean) => void }>(Desktop, Mobile)

  it('renders the desktop half above the breakpoint', () => {
    const { getByRole } = render(<Adaptive label="x" />)
    expect(getByRole('button').textContent).toBe('desktop:x')
  })

  it('renders the mobile half below it', () => {
    setViewport(true)
    const { getByRole } = render(<Adaptive label="x" />)
    expect(getByRole('button').textContent).toBe('mobile:x')
  })

  it('swaps when the viewport changes while closed', () => {
    const { getByRole } = render(<Adaptive label="x" />)
    act(() => { setViewport(true) })
    expect(getByRole('button').textContent).toBe('mobile:x')
  })

  it('holds the half it opened with when the viewport changes while open', () => {
    const { getByRole } = render(<Adaptive label="x" />)
    act(() => { getByRole('button').click() })
    act(() => { setViewport(true) })
    expect(getByRole('button').textContent).toBe('desktop:x')
  })

  it('releases the latch on close, then follows the viewport again', () => {
    const onOpenChange = vi.fn()
    function Harness() {
      return <Adaptive label="x" onOpenChange={onOpenChange} />
    }
    const { getByRole, rerender } = render(<Harness />)
    act(() => { getByRole('button').click() })
    act(() => { setViewport(true) })
    expect(getByRole('button').textContent).toBe('desktop:x')
    rerender(<Harness />)
    expect(onOpenChange).toHaveBeenCalledWith(true)
  })

  it('passes the consumer onOpenChange through', () => {
    const onOpenChange = vi.fn()
    const { getByRole } = render(<Adaptive label="x" onOpenChange={onOpenChange} />)
    act(() => { getByRole('button').click() })
    expect(onOpenChange).toHaveBeenCalledWith(true)
  })

  it('mode="mobile" pins the mobile half on a desktop viewport', () => {
    const { getByRole } = render(<Adaptive label="x" mode="mobile" />)
    expect(getByRole('button').textContent).toBe('mobile:x')
  })

  it('does not leak mode or onOpenChange as unknown props to the half', () => {
    const seen: Record<string, unknown>[] = []
    const Spy = (p: Record<string, unknown>) => { seen.push(p); return null }
    const A = createAdaptive<{ label: string }>(Spy, Spy)
    render(<A label="x" mode="desktop" />)
    expect(seen[0]).not.toHaveProperty('mode')
    expect(seen[0]).toHaveProperty('label', 'x')
  })
})
