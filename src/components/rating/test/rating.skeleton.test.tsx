import { describe, expect, it } from 'vitest'

import { attr, classList, markup } from '#test/markup.js'
import { Rating } from '../index.js'
import { RatingSkeleton } from '../skeleton.js'
import type { RatingSkeletonProps } from '../types.js'

const html = (props: RatingSkeletonProps = {}) => markup(<RatingSkeleton {...props} />)
const stars = (out: string) => [...out.matchAll(/<span class="block[^"]*"><\/span>/g)].map((m) => classList(m[0]))

/** The px Svg writes for each size, written out, so one size repeated across the scale is a failure. */
const BOX = {
  xs: 'size-[16px]', sm: 'size-[20px]', md: 'size-[24px]', lg: 'size-[32px]', xl: 'size-[40px]', custom: 'size-[1em]',
} as const
const PX = { xs: '16', sm: '20', md: '24', lg: '32', xl: '40' } as const

const STAR = [
  'animate-pulse', 'bg-neutral-soft', 'block', 'forced-colors:outline-(length:--tc-line-width)',
  'motion-reduce:animate-none', 'rounded-full', 'shrink-0',
]

describe('RatingSkeleton', () => {
  it('is hidden from the accessibility tree, and a caller cannot un-hide it', () => {
    expect(attr(html(), 'aria-hidden')).toBe('true')
    const forced = { 'aria-hidden': false } as RatingSkeletonProps
    expect(attr(html(forced), 'aria-hidden')).toBe('true')
  })

  it('holds no role, no radio and no name: nothing in it is read or reached', () => {
    expect(html()).not.toMatch(/role=|<input|aria-label|tabindex/)
  })

  it('wears the read-only row of the rating, so it wraps where the rating wraps', () => {
    expect(classList(html())).toEqual(['inline-flex', 'flex-wrap', 'items-center', 'gap-1', 'max-w-full'])
  })

  it('starts with five stars at md, the rating defaults, each one fill that pulses unless asked not to', () => {
    const out = html()
    expect(stars(out).map((star) => star.sort())).toEqual(Array.from({ length: 5 }, () => [...STAR, 'size-[24px]'].sort()))
    expect(out).toBe(html({ max: 5, size: 'md' }))
    expect(attr(out, 'data-size')).toBe('md')
  })

  it('clamps max to 1 and 10 and rounds it, as the rating does', () => {
    expect(stars(html({ max: 0 }))).toHaveLength(1)
    expect(stars(html({ max: -3 }))).toHaveLength(1)
    expect(stars(html({ max: 7.4 }))).toHaveLength(7)
    expect(stars(html({ max: 99 }))).toHaveLength(10)
  })

  for (const size of ['xs', 'sm', 'md', 'lg', 'xl', 'custom'] as const) {
    it(`${size}: every star is the box of the icon at that size, and only that box`, () => {
      for (const star of stars(html({ size }))) expect(star.filter((c) => c.startsWith('size-')), size).toEqual([BOX[size]])
    })
  }

  for (const size of ['xs', 'sm', 'md', 'lg', 'xl'] as const) {
    it(`${size}: the rating's own star icon is the same px`, () => {
      expect(attr(markup(<Rating size={size} />).match(/<svg[^>]*>/)?.[0] ?? '', 'width'), size).toBe(PX[size])
    })
  }

  it('lets the consumer className win a conflict, because it is passed last', () => {
    const list = classList(html({ className: 'gap-3 ms-2' }))
    expect(list).toEqual(['inline-flex', 'flex-wrap', 'items-center', 'max-w-full', 'gap-3', 'ms-2'])
  })

  it('passes className, style and the rest through, as every component must', () => {
    const out = markup(<RatingSkeleton className="ms-2" id="s" data-testid="x" style={{ opacity: 0.5 }} />)
    expect(attr(out, 'class')).toContain('ms-2')
    expect(attr(out, 'id')).toBe('s')
    expect(attr(out, 'data-testid')).toBe('x')
    expect(attr(out, 'style')).toBe('opacity:0.5')
  })
})
