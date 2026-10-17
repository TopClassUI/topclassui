// PLAN section 20: the server render must hydrate with no recoverable error.
import { act } from '@testing-library/react'
import { useRef } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useScrollTabStop } from './use-scroll-tab-stop.js'

/** Every value the hook returned, render by render. */
const returned: (0 | undefined)[] = []

function Region() {
  const ref = useRef<HTMLDivElement>(null)
  const tabIndex = useScrollTabStop(ref)
  returned.push(tabIndex)
  return <div ref={ref} data-region="" tabIndex={tabIndex}><p>One</p></div>
}

beforeEach(() => {
  returned.length = 0
  // The content is three times the box from the first measure on: the worst case for a mismatch.
  vi.spyOn(Element.prototype, 'scrollHeight', 'get').mockImplementation(function (this: Element) {
    return this.hasAttribute('data-region') ? 300 : 0
  })
  vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(function (this: Element) {
    return this.hasAttribute('data-region') ? 100 : 0
  })
})

afterEach(() => { vi.restoreAllMocks() })

describe('a region that overflows from the start still hydrates cleanly', () => {
  it('writes no tabindex on the server, which cannot measure', () => {
    expect(renderToString(<Region />)).toBe('<div data-region=""><p>One</p></div>')
    expect(returned).toEqual([undefined])
  })

  it('reports nothing on hydration, and is a tab stop once the browser has measured', async () => {
    const errors: unknown[] = []
    const onError = vi.spyOn(console, 'error').mockImplementation((...args) => { errors.push(args[0]) })
    const container = document.createElement('div')
    container.innerHTML = renderToString(<Region />)
    document.body.appendChild(container)
    returned.length = 0

    const root = await act(() => Promise.resolve(
      hydrateRoot(container, <Region />, { onRecoverableError: (error) => { errors.push(error) } }),
    ))

    expect(errors).toEqual([])
    expect(container.innerHTML).toBe('<div data-region="" tabindex="0"><p>One</p></div>')
    // The first client render agrees with the server; the measured value arrives in the second.
    expect(returned).toEqual([undefined, 0])

    onError.mockRestore()
    act(() => { root.unmount() })
    container.remove()
  })
})
