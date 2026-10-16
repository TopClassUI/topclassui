import { describe, expect, it } from 'vitest'

import { attr, markup } from '#test/markup.js'
import { Progress } from '../index.js'
import type { ProgressDesignProps } from '../types.js'

const html = (props: ProgressDesignProps = {}) => markup(<Progress aria-label="Upload" {...props} />)

/** The whole default render, written out, so an extra attribute or element also fails. */
const DEFAULT = '<div aria-label="Upload" role="progressbar" aria-valuemin="0" aria-valuemax="100"'
  + ' aria-valuenow="0" data-tone="primary" data-size="md" style="--tc-progress-value:0%"'
  + ' class="w-full overflow-hidden rounded-control bg-neutral-soft outline-solid outline-(length:--tc-line-width)'
  + ' outline-line-strong forced-color-adjust-none forced-colors:bg-[Canvas] forced-colors:outline-[CanvasText] h-pad-y-md">'
  + '<div class="h-full rounded-control forced-colors:bg-[CanvasText] w-(--tc-progress-value) bg-primary-on-soft"></div></div>'

describe('the element it renders', () => {
  it('is a track div holding exactly one bar div, and nothing else', () => {
    expect(html()).toBe(DEFAULT)
  })

  it('is a progressbar from 0 to 100, which is what a screen reader announces', () => {
    const html_ = html({ value: 40 })
    expect(attr(html_, 'role')).toBe('progressbar')
    expect(attr(html_, 'aria-valuemin')).toBe('0')
    expect(attr(html_, 'aria-valuemax')).toBe('100')
    expect(attr(html_, 'aria-valuenow')).toBe('40')
  })

  it('is not a native progress element, which cannot take the tone or the pill', () => {
    expect(html()).not.toContain('<progress')
  })

  it('renders no text, so its name must come from aria-label or aria-labelledby', () => {
    expect(html({ value: 72 }).replace(/<[^>]*>/g, '')).toBe('')
  })

  it('takes its name from aria-label', () => {
    expect(attr(html(), 'aria-label')).toBe('Upload')
  })

  it('takes its name from aria-labelledby, with no aria-label of its own', () => {
    const html_ = markup(<Progress aria-labelledby="storage-label" value={72} />)
    expect(attr(html_, 'aria-labelledby')).toBe('storage-label')
    expect(html_).not.toContain('aria-label=')
  })

  it('spreads the rest onto the root', () => {
    // JSX, not an object: TypeScript accepts a data-* key only as an attribute.
    const html_ = markup(<Progress aria-label="Upload" id="upload" data-testid="x" title="Upload progress" />)
    expect(attr(html_, 'id')).toBe('upload')
    expect(attr(html_, 'data-testid')).toBe('x')
    expect(attr(html_, 'title')).toBe('Upload progress')
  })

  it('passes style through to the root, beside the variable it sets', () => {
    const html_ = markup(<Progress aria-label="Upload" value={40} style={{ opacity: 0.5 }} />)
    expect(attr(html_, 'style')).toBe('opacity:0.5;--tc-progress-value:40%')
  })
})

describe('the design attributes', () => {
  it('reports its tone and size, which the docs and tests read', () => {
    const html_ = html({ tone: 'danger', size: 'lg' })
    expect(attr(html_, 'data-tone')).toBe('danger')
    expect(attr(html_, 'data-size')).toBe('lg')
  })

  it('defaults to primary and md, which the playground shows', () => {
    const html_ = html()
    expect(attr(html_, 'data-tone')).toBe('primary')
    expect(attr(html_, 'data-size')).toBe('md')
  })

  it('reports every size on data-size, custom included', () => {
    for (const size of ['xs', 'sm', 'md', 'lg', 'xl', 'custom'] as const) {
      expect(attr(html({ size }), 'data-size'), size).toBe(size)
    }
  })

  it('has no variant, so it carries no data-variant', () => {
    expect(html()).not.toContain('data-variant')
  })

  it('carries no state attribute Progress does not have', () => {
    expect(html({ value: 100 })).not.toMatch(/data-(state|disabled|loading|open|value)/)
  })
})

describe('data-complete', () => {
  const CASES = [
    [0, false], [50, false], [99, false], [99.9, false], [100, true], [150, true],
  ] as const

  for (const [value, complete] of CASES) {
    it(`is ${complete ? 'present' : 'absent'} at ${String(value)}`, () => {
      expect(attr(html({ value }), 'data-complete'), String(value)).toBe(complete ? '' : undefined)
    })
  }

  it('is absent on an indeterminate bar, even one given 100, because an unknown wait is never done', () => {
    expect(html({ value: 100, indeterminate: true })).not.toContain('data-complete')
  })
})

describe('data-indeterminate', () => {
  it('is a presence attribute when indeterminate', () => {
    expect(attr(html({ indeterminate: true }), 'data-indeterminate')).toBe('')
  })

  it('is absent by default and when false', () => {
    expect(html()).not.toContain('data-indeterminate')
    expect(html({ indeterminate: false })).not.toContain('data-indeterminate')
  })
})
