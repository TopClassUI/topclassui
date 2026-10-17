import { describe, expect, it } from 'vitest'

import { attr, markup } from '#test/markup.js'
import { Spinner } from '../index.js'
import type { SpinnerProps } from '../types.js'

const html = (props: SpinnerProps = {}) => markup(<Spinner {...props} />)

/** The circle-notch path, written out, so any other glyph is a failure. */
const RING =
  'M232,128a104,104,0,0,1-208,0c0-41,23.81-78.36,60.66-95.27a8,8,0,0,1,6.68,14.54C60.15,61.59,40,93.27,40,128'
  + 'a88,88,0,0,0,176,0c0-34.73-20.15-66.41-51.34-80.73a8,8,0,0,1,6.68-14.54C208.19,49.64,232,87,232,128Z'

describe('the element it renders', () => {
  it('is the svg itself, one path and no wrapper around it', () => {
    expect(html()).toMatch(/^<svg [^>]*><path [^>]*><\/path><\/svg>$/)
  })

  it('draws circle-notch, the open ring Figma draws, in currentColor', () => {
    const html_ = html()
    expect(attr(html_, 'viewBox')).toBe('0 0 256 256')
    expect(attr(html_, 'd')).toBe(RING)
    expect(attr(html_, 'fill')).toBe('currentColor')
  })

  it('keeps its own glyph when a caller smuggles an icon in', () => {
    const forced = { icon: { viewBox: '0 0 8 8', path: 'M0 0h8v8H0z', directional: false } } as SpinnerProps
    const html_ = html(forced)
    expect(attr(html_, 'd')).toBe(RING)
    expect(attr(html_, 'viewBox')).toBe('0 0 256 256')
  })

  it('spreads the rest onto the root', () => {
    // JSX, not an object: TypeScript accepts a data-* key only as an attribute.
    const html_ = markup(<Spinner id="busy" data-testid="x" aria-describedby="hint" />)
    expect(attr(html_, 'id')).toBe('busy')
    expect(attr(html_, 'data-testid')).toBe('x')
    expect(attr(html_, 'aria-describedby')).toBe('hint')
  })

  it('passes style through to the root', () => {
    expect(attr(html({ style: { opacity: 0.5 } }), 'style')).toBe('opacity:0.5')
  })
})

describe('the design attributes', () => {
  it('reports its tone and size, which the docs and tests read', () => {
    const html_ = html({ tone: 'danger', size: 'lg' })
    expect(attr(html_, 'data-tone')).toBe('danger')
    expect(attr(html_, 'data-size')).toBe('lg')
  })

  it('defaults to primary and md, the tone and size the docs playground shows', () => {
    const html_ = html()
    expect(attr(html_, 'data-tone')).toBe('primary')
    expect(attr(html_, 'data-size')).toBe('md')
  })

  it('reports custom on data-size even though it passes no size to the svg', () => {
    expect(attr(html({ size: 'custom' }), 'data-size')).toBe('custom')
  })

  it('carries no variant and no state attribute, because a spinner has neither', () => {
    expect(html()).not.toMatch(/data-(variant|state|disabled|loading|open)/)
  })
})
