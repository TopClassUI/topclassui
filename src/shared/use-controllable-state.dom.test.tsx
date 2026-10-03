import { act, render, renderHook } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { useControllableState } from './use-controllable-state.js'

describe('uncontrolled', () => {
  it('starts at the default and keeps its own state', () => {
    const { result } = renderHook(() => useControllableState({ defaultValue: 'a' }))
    expect(result.current[0]).toBe('a')
    act(() => { result.current[1]('b') })
    expect(result.current[0]).toBe('b')
  })

  it('still calls onChange', () => {
    const onChange = vi.fn()
    const { result } = renderHook(() => useControllableState({ defaultValue: 0, onChange }))
    act(() => { result.current[1](5) })
    expect(onChange).toHaveBeenCalledWith(5)
    expect(result.current[0]).toBe(5)
  })
})

describe('controlled', () => {
  it('ignores its own state and reports the prop', () => {
    const onChange = vi.fn()
    const { result } = renderHook(() => useControllableState({ value: 'x', defaultValue: 'a', onChange }))
    act(() => { result.current[1]('y') })
    expect(onChange).toHaveBeenCalledWith('y')
    expect(result.current[0]).toBe('x')
  })

  it('follows the prop when the parent updates it', () => {
    function Parent() {
      const [outer, setOuter] = useState('one')
      const [value, setValue] = useControllableState({ value: outer, defaultValue: 'one' })
      return (
        <button type="button" onClick={() => { setOuter('two'); setValue('two') }}>
          {value}
        </button>
      )
    }
    const { getByRole } = render(<Parent />)
    const button = getByRole('button')
    expect(button.textContent).toBe('one')
    act(() => { button.click() })
    expect(button.textContent).toBe('two')
  })

  it('treats false and empty string as controlled, not as missing', () => {
    const a = renderHook(() => useControllableState({ value: false, defaultValue: true }))
    expect(a.result.current[0]).toBe(false)
    const b = renderHook(() => useControllableState({ value: '', defaultValue: 'x' }))
    expect(b.result.current[0]).toBe('')
  })
})

describe('identity and warnings', () => {
  it('keeps the setter stable across renders, so a memoised child does not re-render', () => {
    const { result, rerender } = renderHook(() => useControllableState({ defaultValue: 1 }))
    const first = result.current[1]
    rerender()
    act(() => { result.current[1](2) })
    expect(result.current[1]).toBe(first)
  })

  it('always calls the latest onChange, not the one from the first render', () => {
    const first = vi.fn()
    const second = vi.fn()
    const { result, rerender } = renderHook(
      ({ cb }: { cb: () => void }) => useControllableState({ defaultValue: 0, onChange: cb }),
      { initialProps: { cb: first } },
    )
    rerender({ cb: second })
    act(() => { result.current[1](9) })
    expect(first).not.toHaveBeenCalled()
    expect(second).toHaveBeenCalledWith(9)
  })

  it('warns when a component switches between controlled and uncontrolled', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const { rerender } = renderHook(
      ({ value }: { value?: string }) => useControllableState({ value, defaultValue: 'a' }),
      { initialProps: { value: undefined as string | undefined } },
    )
    rerender({ value: 'b' })
    expect(warn).toHaveBeenCalledOnce()
    expect(warn.mock.calls[0]?.[0]).toContain('uncontrolled to controlled')
    warn.mockRestore()
  })
})
