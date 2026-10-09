import { describe, expect, it } from 'vitest'

import { attr, classList, markup } from '#test/markup.js'
import { CardSkeleton } from '../index.js'
import type { CardSkeletonProps } from '../types.js'

const html = (props: CardSkeletonProps = {}) => markup(<CardSkeleton {...props} />)
const classes = (props: CardSkeletonProps = {}) => classList(html(props)).sort()

/** The Build this classes plus the skeleton fill and pulse, sorted and written out. */
const EXACT = [
  'animate-pulse', 'aspect-5/2', 'bg-neutral-soft', 'block',
  'motion-reduce:animate-none', 'rounded-box', 'w-full',
]

describe('CardSkeleton', () => {
  it('carries exactly the card box, the fill Figma binds and the pulse', () => {
    expect(classes()).toEqual(EXACT)
  })

  it('is one empty div, because the ratio and not a line of text gives it its height', () => {
    expect(html()).toMatch(/^<div class="[^"]+" aria-hidden="true"><\/div>$/)
  })

  it('is hidden from the accessibility tree, and a caller cannot un-hide it', () => {
    expect(attr(html(), 'aria-hidden')).toBe('true')
    const forced = { 'aria-hidden': false } as CardSkeletonProps
    expect(attr(html(forced), 'aria-hidden')).toBe('true')
  })

  it('takes the real height from className and keeps the ratio as the fallback', () => {
    expect(classes({ className: 'h-40' })).toEqual([
      'animate-pulse', 'aspect-5/2', 'bg-neutral-soft', 'block',
      'h-40', 'motion-reduce:animate-none', 'rounded-box', 'w-full',
    ])
  })

  it('lets every conflicting consumer class win, because className is passed last', () => {
    expect(classes({ className: 'rounded-chip w-16 aspect-video bg-surface' })).toEqual([
      'animate-pulse', 'aspect-video', 'bg-surface', 'block',
      'motion-reduce:animate-none', 'rounded-chip', 'w-16',
    ])
  })

  it('passes className, style and the rest through, as every component must', () => {
    const out = markup(<CardSkeleton className="ms-2" id="s" data-testid="x" style={{ opacity: 0.5 }} />)
    expect(classList(out)).toContain('ms-2')
    expect(attr(out, 'id')).toBe('s')
    expect(attr(out, 'data-testid')).toBe('x')
    expect(attr(out, 'style')).toBe('opacity:0.5')
  })
})
