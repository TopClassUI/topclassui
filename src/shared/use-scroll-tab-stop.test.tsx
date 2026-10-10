import { useRef } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { useScrollTabStop } from './use-scroll-tab-stop.js'

function Region() {
  const ref = useRef<HTMLDivElement>(null)
  return <div ref={ref} tabIndex={useScrollTabStop(ref)}>Rows</div>
}

// The ssr project: no document, no ResizeObserver and no MutationObserver exist here at all.
describe('on the server', () => {
  it('runs where no browser API exists, so it reaches for none while rendering', () => {
    expect(typeof ResizeObserver).toBe('undefined')
    expect(typeof MutationObserver).toBe('undefined')
    expect(() => renderToStaticMarkup(<Region />)).not.toThrow()
  })

  it('writes no tabindex, since nothing was measured', () => {
    expect(renderToStaticMarkup(<Region />)).toBe('<div>Rows</div>')
  })
})
