import { describe, expect, it } from 'vitest'

import { attr, classList, markup } from '#test/markup.js'
import { Badge } from '../index.js'
import { BadgeSkeleton } from '../skeleton.js'
import type { BadgeSkeletonProps } from '../types.js'

const html = (props: BadgeSkeletonProps = {}) => markup(<BadgeSkeleton {...props} />)
const classes = (props: BadgeSkeletonProps = {}) => classList(html(props))

/** Every class that decides the height, written out per size. */
const HEIGHT = {
  xs: ['py-pad-y-xs', 'text-xs'],
  sm: ['py-pad-y-sm', 'text-sm'],
  md: ['py-pad-y-md', 'text-sm'],
  lg: ['py-pad-y-lg', 'text-base'],
  xl: ['py-pad-y-xl', 'text-lg'],
} as const

/** Written out, so one width repeated across the scale is a failure. */
const WIDTH = { xs: 'w-12', sm: 'w-14', md: 'w-16', lg: 'w-20', xl: 'w-24' } as const

const BOX = ['border-(length:--tc-line-width)', 'border-transparent', 'inline-flex', 'rounded-chip']

describe('BadgeSkeleton', () => {
  it('is hidden from the accessibility tree, and a caller cannot un-hide it', () => {
    expect(attr(html(), 'aria-hidden')).toBe('true')
    const forced = { 'aria-hidden': false } as BadgeSkeletonProps
    expect(attr(html(forced), 'aria-hidden')).toBe('true')
  })

  it('holds one line of nothing, so the type step gives it a real line height', () => {
    expect(html()).toMatch(/>\u00a0<\/span>$/)
  })

  for (const size of ['xs', 'sm', 'md', 'lg', 'xl'] as const) {
    it(`${size} carries the badge box and the classes that set its height`, () => {
      const list = classes({ size })
      expect([...BOX, ...HEIGHT[size]].filter((c) => !list.includes(c)), size).toEqual([])
    })

    it(`${size} reserves the same height classes the badge itself emits`, () => {
      const badge = classList(markup(<Badge size={size}>Paid</Badge>))
      const skeleton = classes({ size })
      expect(HEIGHT[size].filter((c) => !badge.includes(c) || !skeleton.includes(c)), size).toEqual([])
    })
  }

  it('reserves a width that grows with the size, never one width for all five', () => {
    expect(new Set(Object.values(WIDTH)).size).toBe(5)
    for (const size of ['xs', 'sm', 'md', 'lg', 'xl'] as const) {
      expect(classes({ size }).filter((c) => /^w-\d/.test(c)), size).toEqual([WIDTH[size]])
    }
  })

  it('emits no size classes for custom, like the badge', () => {
    expect(classes({ size: 'custom' }).filter((c) => /^(py-|px-|text-|w-\d)/.test(c))).toEqual([])
  })

  it('starts at md, the badge default', () => {
    expect(classes()).toEqual(classes({ size: 'md' }))
  })

  it('wears the fill Figma binds, and pulses unless the reader asked it not to', () => {
    const list = classes()
    expect(list).toContain('bg-neutral-soft')
    // Without the first, the second passes vacuously: nothing would be animating.
    expect(list).toContain('animate-pulse')
    expect(list).toContain('motion-reduce:animate-none')
  })

  it('lets the consumer className win a conflict, because it is passed last', () => {
    const list = classes({ className: 'rounded-box w-full' })
    expect(list).toContain('rounded-box')
    expect(list).toContain('w-full')
    expect(list).not.toContain('rounded-chip')
    expect(list).not.toContain('w-16')
  })

  it('passes className, style and the rest through, as every component must', () => {
    const html_ = markup(<BadgeSkeleton className="ms-2" id="s" data-testid="x" style={{ opacity: 0.5 }} />)
    expect(attr(html_, 'class')).toContain('ms-2')
    expect(attr(html_, 'id')).toBe('s')
    expect(attr(html_, 'data-testid')).toBe('x')
    expect(attr(html_, 'style')).toBe('opacity:0.5')
  })
})
