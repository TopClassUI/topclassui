import { describe, expect, it } from 'vitest'

import { attr, classList, markup } from '#test/markup.js'
import { Badge } from '../index.js'
import { BADGE_SIZES, BADGE_VARIANTS } from '../constants.js'
import type { BadgeProps } from '../types.js'

const html = (props: BadgeProps = {}) => markup(<Badge {...props}>Paid</Badge>)
const classes = (props: BadgeProps = {}) => classList(html(props))

/** The Build this table, written out: a derived expectation would shrink with BADGE_SIZE. */
const SIZE = {
  xs: ['px-1', 'py-pad-y-xs', 'gap-1', 'text-xs'],
  sm: ['px-2', 'py-pad-y-sm', 'gap-1.5', 'text-sm'],
  md: ['px-3', 'py-pad-y-md', 'gap-2', 'text-sm'],
  lg: ['px-4', 'py-pad-y-lg', 'gap-2', 'text-base'],
  xl: ['px-5', 'py-pad-y-xl', 'gap-3', 'text-lg'],
} as const

const BORDER_WIDTH = 'border-(length:--tc-line-width)'

describe('size', () => {
  for (const size of ['xs', 'sm', 'md', 'lg', 'xl'] as const) {
    it(`${size} emits its padding, gap and type step`, () => {
      const list = classes({ size })
      expect(SIZE[size].filter((c) => !list.includes(c)), size).toEqual([])
    })

    it(`${size} emits no other size's padding, gap or type step`, () => {
      const list = classes({ size })
      const foreign = Object.entries(SIZE)
        .filter(([other]) => other !== size)
        .flatMap(([, cls]) => [...cls])
        .filter((c) => !(SIZE[size] as readonly string[]).includes(c))
      expect([...new Set(foreign)].filter((c) => list.includes(c)), size).toEqual([])
    })
  }

  it('reports every size on data-size, custom included', () => {
    for (const size of BADGE_SIZES) expect(attr(html({ size }), 'data-size'), size).toBe(size)
  })

  it('pads inline at twice padding-y, tighter than a control, so it is never pad-x', () => {
    expect(classes().filter((c) => c.startsWith('px-pad-x-'))).toEqual([])
  })

  it('takes xl to text-lg, the Size collection step, not Button\'s text-base', () => {
    expect(classes({ size: 'xl' })).toContain('text-lg')
  })

  it('custom opts out of the scale entirely, which is what it is for', () => {
    const list = classes({ size: 'custom' })
    expect(list.filter((c) => /^(px-|py-|gap-|text-(xs|sm|base|lg)$)/.test(c))).toEqual([])
  })
})

describe('the box', () => {
  it('is an inline flex row on the chip radius at its own weight', () => {
    const list = classes()
    for (const cls of ['inline-flex', 'items-center', 'rounded-chip', 'font-medium']) {
      expect(list, cls).toContain(cls)
    }
  })

  it('carries the border width on every variant, so changing the variant never moves it', () => {
    for (const variant of BADGE_VARIANTS) expect(classes({ variant }), variant).toContain(BORDER_WIDTH)
  })

  it('never outgrows its container, which is half of the truncation', () => {
    expect(classes()).toContain('max-w-full')
  })

  it('is not interactive, so it carries no ring, hover, transition or touch target', () => {
    const list = classes()
    const interactive = /^(hover:|active:|focus-visible:|outline-|transition|duration-|min-[hw]-|disabled:|data-disabled:)/
    expect(list.filter((c) => interactive.test(c))).toEqual([])
  })
})

describe('className', () => {
  it('keeps a consumer utility', () => {
    expect(classes({ className: 'ms-2' })).toContain('ms-2')
  })

  it('lets the consumer replace the radius, so a pill is one class away', () => {
    const list = classes({ className: 'rounded-box' })
    expect(list).toContain('rounded-box')
    expect(list).not.toContain('rounded-chip')
  })

  it('lets the consumer override the type step', () => {
    const list = classes({ size: 'md', className: 'text-xs' })
    expect(list).toContain('text-xs')
    expect(list).not.toContain('text-sm')
  })
})
