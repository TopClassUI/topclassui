import { describe, expect, it } from 'vitest'

import { AvatarRoot } from '#components/avatar/index.js'
import { attr, classList, markup } from '#test/markup.js'
import { AvatarGroup } from '../index.js'
import type { AvatarGroupProps } from '../types.js'

const group = (props: AvatarGroupProps = {}) => markup(
  <AvatarGroup max={1} {...props}>
    <span>m</span>
    <span>m</span>
  </AvatarGroup>,
)

/** The opening tag of the counter, the one img the group renders itself. */
const counter = (html: string) => /<span [^>]*role="img"[^>]*>/.exec(html)?.[0] ?? ''

/** The box an Avatar draws at each size: the control height on both axes. */
const BOX = {
  xs: 'size-control-xs',
  sm: 'size-control-sm',
  md: 'size-control-md',
  lg: 'size-control-lg',
  xl: 'size-control-xl',
} as const

describe('the root', () => {
  it('lays its children in a row and centres them', () => {
    expect(classList(group())).toContain('inline-flex')
    expect(classList(group())).toContain('items-center')
  })

  it('overlaps every child after the first with a logical margin, so the row mirrors (R-5.3-1)', () => {
    expect(classList(group())).toContain('*:not-first:-ms-2')
    expect(attr(group(), 'class')).not.toMatch(/-m[lrx]-|space-x|left|right/)
  })

  it('rings every child in the page colour, the counter included', () => {
    expect(classList(group())).toContain('*:ring-2')
    expect(classList(group())).toContain('*:ring-page')
  })

  it('names no palette colour and no dark: variant (R-5.2-1)', () => {
    expect(group()).not.toMatch(/-(slate|gray|zinc|neutral|violet|red|blue|sky)-\d|dark:/)
  })
})

describe('the counter is an Avatar of the same size', () => {
  for (const size of ['xs', 'sm', 'md', 'lg', 'xl'] as const) {
    it(`${size} carries every class an AvatarRoot at ${size} carries, and no other`, () => {
      const classes = classList(counter(group({ size })))
      expect(classes, size).toEqual(classList(markup(<AvatarRoot size={size} />)))
      expect(classes, size).toContain(BOX[size])
    })

    it(`${size} reports the size it was given`, () => {
      expect(attr(counter(group({ size })), 'data-size'), size).toBe(size)
    })
  }

  it('is a circle with the soft fill an Avatar has, so +N reads as one more face', () => {
    const classes = classList(counter(group()))
    expect(classes).toContain('rounded-full')
    expect(classes).toContain('bg-primary-soft')
    expect(classes).toContain('text-primary-on-soft')
    expect(classes).toContain('shrink-0')
  })

  it('is md by default, the size an AvatarRoot defaults to', () => {
    expect(classList(counter(group()))).toContain('size-control-md')
    expect(attr(counter(group()), 'data-size')).toBe('md')
  })

  it('emits no box for custom, so the caller sizes it with the children', () => {
    const classes = classList(counter(group({ size: 'custom' })))
    expect(classes.filter((cls) => cls.startsWith('size-'))).toEqual([])
    expect(classes).toEqual(classList(markup(<AvatarRoot size="custom" />)))
    expect(classes).toContain('rounded-full')
  })

  it('is a direct child of the group, so the ring and the overlap reach it', () => {
    expect(group()).toMatch(/^<span role="group"[^>]*><span>m<\/span><span [^>]*role="img"/)
  })
})
