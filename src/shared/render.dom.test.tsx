import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { renderElement } from './render.js'

describe('refs are composed, not dropped', () => {
  it('runs the component ref and the element ref both', () => {
    const fromComponent = vi.fn()
    const fromElement = vi.fn()
    const el = renderElement(<div ref={fromElement} />, { ref: fromComponent })
    const { unmount } = render(el)
    expect(fromComponent).toHaveBeenCalledTimes(1)
    expect(fromElement).toHaveBeenCalledTimes(1)
    expect(fromComponent.mock.calls[0]?.[0]).toBe(fromElement.mock.calls[0]?.[0])
    unmount()
  })

  it('fills an object ref on either side', () => {
    const component = { current: null as HTMLDivElement | null }
    const element = { current: null as HTMLDivElement | null }
    render(renderElement(<div ref={element} />, { ref: component }))
    expect(component.current).not.toBeNull()
    expect(component.current).toBe(element.current)
  })

  it('passes a single ref straight through', () => {
    const only = { current: null as HTMLDivElement | null }
    render(renderElement(<div />, { ref: only }))
    expect(only.current).not.toBeNull()
  })

  it('clears both object refs on unmount', () => {
    const component = { current: null as HTMLDivElement | null }
    const element = { current: null as HTMLDivElement | null }
    const { unmount } = render(renderElement(<div ref={element} />, { ref: component }))
    unmount()
    expect(component.current).toBeNull()
    expect(element.current).toBeNull()
  })
})

