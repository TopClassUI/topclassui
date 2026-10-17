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

/** The box an Avatar draws at each size, and the floor the counter may widen from. */
const BOX = {
  xs: ['size-control-xs', 'min-w-control-xs'],
  sm: ['size-control-sm', 'min-w-control-sm'],
  md: ['size-control-md', 'min-w-control-md'],
  lg: ['size-control-lg', 'min-w-control-lg'],
  xl: ['size-control-xl', 'min-w-control-xl'],
} as const

describe('the root', () => {
  it('lays its children in a row and centres them', () => {
    expect(classList(group())).toContain('inline-flex')
    expect(classList(group())).toContain('items-center')
  })

  it('wraps instead of pushing the page, is never wider than its container, and keeps rows a ring apart', () => {
    expect(classList(group())).toContain('flex-wrap')
    expect(classList(group())).toContain('max-w-full')
    expect(classList(group())).toContain('gap-y-1')
  })

  it('asks for its natural width, so a table cell cannot size its column from one face', () => {
    expect(classList(group())).toContain('w-max')
  })

  it('does not shrink in a flex row, so the text beside it gives way before the faces wrap', () => {
    expect(classList(group())).toContain('shrink-0')
  })

  it('overlaps every child with a logical margin and pads the root back, so the row mirrors (R-5.3-1)', () => {
    expect(classList(group())).toContain('*:-ms-2')
    expect(classList(group())).toContain('ps-2')
    expect(attr(group(), 'class')).not.toMatch(/-m[lrx]-|p[lrx]-|space-x|left|right/)
  })

  it('no longer skips the first child: a wrapped row would start a step outside the box', () => {
    expect(attr(group(), 'class')).not.toContain('not-first')
  })

  it('rings every child in the page colour, the counter included', () => {
    expect(classList(group())).toContain('*:ring-2')
    expect(classList(group())).toContain('*:ring-page')
  })

  it('makes every child a circle that paints whole, so a link around an avatar is ringed like one', () => {
    expect(classList(group())).toContain('*:rounded-full')
    expect(classList(group())).toContain('*:isolate')
  })

  it('lifts a focused child over the next one, so its focus ring is not half hidden', () => {
    expect(classList(group())).toContain('*:focus-visible:z-1')
  })

  it('names no palette colour and no dark: variant (R-5.2-1)', () => {
    expect(group()).not.toMatch(/-(slate|gray|zinc|neutral|violet|red|blue|sky)-\d|dark:/)
  })
})

describe('the counter is an Avatar of the same size that may widen', () => {
  for (const size of ['xs', 'sm', 'md', 'lg', 'xl'] as const) {
    it(`${size} carries every class an AvatarRoot at ${size} carries, then the three that let it widen`, () => {
      const classes = classList(counter(group({ size })))
      const [box, floor] = BOX[size]
      expect(classes, size).toEqual([...classList(markup(<AvatarRoot size={size} />)), 'w-auto', floor, 'px-1'])
      expect(classes, size).toContain(box)
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

  it('emits no box and no floor for custom, so the caller sizes it with the children', () => {
    const classes = classList(counter(group({ size: 'custom' })))
    expect(classes.filter((cls) => /^(size|w|min-w|px)-/.test(cls))).toEqual([])
    expect(classes).toEqual(classList(markup(<AvatarRoot size="custom" />)))
    expect(classes).toContain('rounded-full')
  })

  it('is a direct child of the group, so the ring and the overlap reach it', () => {
    expect(group()).toMatch(/^<span role="group"[^>]*><span>m<\/span><span [^>]*role="img"/)
  })
})
