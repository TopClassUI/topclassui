import { describe, expect, it } from 'vitest'

import { attr, markup } from '#test/markup.js'
import { Meter } from '../index.js'
import type { MeterDesignProps } from '../types.js'

const html = (props: MeterDesignProps = {}) => markup(<Meter aria-label="Battery" {...props} />)

/** The whole default render, written out, so an extra attribute or element also fails. */
const DEFAULT = '<div aria-label="Battery" role="meter" aria-valuemin="0" aria-valuemax="100"'
  + ' aria-valuenow="0" data-tone="primary" data-size="md" style="--tc-meter-value:0%"'
  + ' class="w-full overflow-hidden rounded-control bg-neutral-soft outline-solid outline-(length:--tc-line-width)'
  + ' outline-line-strong forced-color-adjust-none forced-colors:bg-[Canvas] forced-colors:outline-[CanvasText] h-pad-y-md">'
  + '<div class="h-full w-(--tc-meter-value) rounded-control forced-colors:bg-[CanvasText] bg-primary-on-soft"></div></div>'

describe('the element it renders', () => {
  it('is a track div holding exactly one bar div, and nothing else', () => {
    expect(html()).toBe(DEFAULT)
  })

  it('is a meter from min to max, which is what a screen reader announces', () => {
    const html_ = html({ value: 40, min: 10, max: 90 })
    expect(attr(html_, 'role')).toBe('meter')
    expect(attr(html_, 'aria-valuemin')).toBe('10')
    expect(attr(html_, 'aria-valuemax')).toBe('90')
    expect(attr(html_, 'aria-valuenow')).toBe('40')
  })

  it('is not a native meter element, whose bar the browser draws and the tokens cannot reach', () => {
    expect(html()).not.toContain('<meter')
  })

  it('is not a progressbar: a reading is not a task moving towards done', () => {
    expect(html()).not.toContain('progressbar')
  })

  it('renders no text, so its name must come from aria-label or aria-labelledby', () => {
    expect(html({ value: 72 }).replace(/<[^>]*>/g, '')).toBe('')
  })

  it('takes its name from aria-labelledby, with no aria-label of its own', () => {
    const html_ = markup(<Meter aria-labelledby="disk-label" value={72} />)
    expect(attr(html_, 'aria-labelledby')).toBe('disk-label')
    expect(html_).not.toContain('aria-label=')
  })

  it('passes aria-valuetext through, for a reading said in units', () => {
    const html_ = markup(<Meter aria-label="Disk" max={1024} value={512} aria-valuetext="512 GB of 1 TB" />)
    expect(attr(html_, 'aria-valuetext')).toBe('512 GB of 1 TB')
  })

  it('writes no aria-valuetext of its own, because Meter formats no number', () => {
    expect(html({ value: 50 })).not.toContain('aria-valuetext')
  })

  it('spreads the rest onto the root', () => {
    // JSX, not an object: TypeScript accepts a data-* key only as an attribute.
    const html_ = markup(<Meter aria-label="Battery" id="battery" data-testid="x" title="Battery level" />)
    expect(attr(html_, 'id')).toBe('battery')
    expect(attr(html_, 'data-testid')).toBe('x')
    expect(attr(html_, 'title')).toBe('Battery level')
  })

  it('passes style through to the root, beside the variable it sets', () => {
    const html_ = markup(<Meter aria-label="Battery" value={40} style={{ opacity: 0.5 }} />)
    expect(attr(html_, 'style')).toBe('opacity:0.5;--tc-meter-value:40%')
  })
})

describe('the design attributes', () => {
  it('reports its tone and size, which the docs and tests read', () => {
    const html_ = html({ tone: 'danger', size: 'lg' })
    expect(attr(html_, 'data-tone')).toBe('danger')
    expect(attr(html_, 'data-size')).toBe('lg')
  })

  it('defaults to primary and md, as Progress does', () => {
    const html_ = html()
    expect(attr(html_, 'data-tone')).toBe('primary')
    expect(attr(html_, 'data-size')).toBe('md')
  })

  it('reports every size on data-size, custom included', () => {
    for (const size of ['xs', 'sm', 'md', 'lg', 'xl', 'custom'] as const) {
      expect(attr(html({ size }), 'data-size'), size).toBe(size)
    }
  })

  it('has no variant and no state, so it carries neither', () => {
    expect(html({ value: 100 })).not.toMatch(/data-(variant|state|disabled|loading|open|value|complete|indeterminate)/)
  })
})
