import { describe, expect, it } from 'vitest'

import { attr, classList, markup } from '#test/markup.js'
import { Checkbox } from '../index.js'
import { CheckboxSkeleton } from '../skeleton.js'
import type { CheckboxSkeletonProps } from '../types.js'

const html = (props: CheckboxSkeletonProps = {}) => markup(<CheckboxSkeleton {...props} />)
/** The class list of the outer span, then of the box inside it. */
const outer = (props: CheckboxSkeletonProps = {}) => classList(html(props))
const box = (props: CheckboxSkeletonProps = {}) => (/<span class="([^"]*)"><\/span>/.exec(html(props))?.[1] ?? '').split(' ')
const boxOf = (real: string) => (/<button [^>]*><span class="([^"]*)"/.exec(real)?.[1] ?? '').split(' ')

/** Written out: the square of the toggle scale, 14, 16, 20, 24 and 28 px. */
const BOX = {
  xs: 'size-toggle-xs',
  sm: 'size-toggle-sm',
  md: 'size-toggle-md',
  lg: 'size-toggle-lg',
  xl: 'size-toggle-xl',
} as const

const FLOOR = [
  'min-h-[var(--tc-target-min,24px)]', 'min-w-[var(--tc-target-min,24px)]',
  'pointer-coarse:min-h-[var(--tc-target-coarse,44px)]', 'pointer-coarse:min-w-[var(--tc-target-coarse,44px)]',
]

describe('CheckboxSkeleton', () => {
  it('is hidden from the accessibility tree, and a caller cannot un-hide it', () => {
    expect(attr(html(), 'aria-hidden')).toBe('true')
    expect(attr(html({ 'aria-hidden': false } as CheckboxSkeletonProps), 'aria-hidden')).toBe('true')
  })

  it('renders no button and no input, so nothing in it can take focus: a span around one empty span', () => {
    expect(html()).toMatch(/^<span class="[^"<>]+" aria-hidden="true"><span class="[^"<>]+"><\/span><\/span>$/)
  })

  it('keeps the target floor of the checkbox, 24 px and 44 under a finger, around the box', () => {
    const real = classList(markup(<Checkbox aria-label="Terms" />))
    for (const name of FLOOR) {
      expect(outer(), name).toContain(name)
      expect(real, name).toContain(name)
    }
  })

  for (const size of ['xs', 'sm', 'md', 'lg', 'xl'] as const) {
    it(`${size} draws the box of an ${size} checkbox`, () => {
      expect(box({ size })).toContain(BOX[size])
      expect(boxOf(markup(<Checkbox size={size} aria-label="Terms" />))).toContain(BOX[size])
    })
  }

  it('starts at md, the default size of the checkbox', () => {
    expect(box()).toContain('size-toggle-md')
  })

  it('emits no size class at custom, so the caller sizes the box as they size the checkbox', () => {
    expect(box({ size: 'custom' }).filter((c) => /^(size-|h-|w-)/.test(c))).toEqual([])
  })

  it('has the radius of the drawn box, which Ocean turns to a circle on both', () => {
    expect(box()).toContain('rounded-chip')
    expect(boxOf(markup(<Checkbox aria-label="Terms" />))).toContain('rounded-chip')
  })

  it('wears the neutral fill, keeps an edge in forced colours, and pulses unless the reader asked it not to', () => {
    // Without animate-pulse, the reduced-motion half passes vacuously: nothing would be animating.
    expect(box()).toEqual(expect.arrayContaining([
      'bg-neutral-soft', 'animate-pulse', 'motion-reduce:animate-none', 'forced-colors:outline-(length:--tc-line-width)',
    ]))
  })

  it('passes className, style and the rest to the outer span, as every component must', () => {
    const out = html({ className: 'ms-2', id: 's', style: { ['--tc-x' as string]: '1' } })
    expect(classList(out)).toContain('ms-2')
    expect(attr(out, 'id')).toBe('s')
    expect(attr(out, 'style')).toBe('--tc-x:1')
  })
})
