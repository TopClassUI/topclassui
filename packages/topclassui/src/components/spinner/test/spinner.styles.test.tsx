import { describe, expect, it } from 'vitest'

import { attr, classList, markup } from '#test/markup.js'
import { Spinner } from '../index.js'
import type { SpinnerProps } from '../types.js'

const html = (props: SpinnerProps = {}) => markup(<Spinner {...props} />)
const classes = (props: SpinnerProps = {}) => classList(html(props))

/** The icon scale, written out: a derived expectation would shrink with ICON_SIZE. */
const PIXELS = { xs: '16', sm: '20', md: '24', lg: '32', xl: '40' } as const

/** Every class a primary spinner carries at any size, Svg's layout pair included. */
const PRIMARY = [
  'animate-spin', 'forced-colors:text-current', 'inline-block', 'motion-reduce:animate-none', 'shrink-0',
  'text-primary-on-soft',
]

describe('size', () => {
  for (const size of ['xs', 'sm', 'md', 'lg', 'xl'] as const) {
    it(`${size} is ${PIXELS[size]} px on both axes, from the icon scale`, () => {
      const html_ = html({ size })
      expect(attr(html_, 'width')).toBe(PIXELS[size])
      expect(attr(html_, 'height')).toBe(PIXELS[size])
    })

    it(`${size} adds no class at all, because Svg owns the size`, () => {
      expect(classes({ size }).sort()).toEqual(PRIMARY)
    })
  }

  it('starts at md, 24 px', () => {
    expect(attr(html(), 'width')).toBe('24')
    expect(attr(html(), 'height')).toBe('24')
  })

  it('custom passes no size, so the svg is 1em and follows the text', () => {
    const html_ = html({ size: 'custom' })
    expect(attr(html_, 'width')).toBe('1em')
    expect(attr(html_, 'height')).toBe('1em')
  })

  it('custom adds no size class either, so the type step around it decides', () => {
    expect(classes({ size: 'custom' }).sort()).toEqual(PRIMARY)
  })

  it('aims no class at a descendant, so nothing can override the svg size from outside it', () => {
    for (const size of ['xs', 'md', 'xl', 'custom'] as const) {
      expect(classes({ size }).filter((c) => /^(\*|\[&)|_svg|svg:/.test(c)), size).toEqual([])
    }
  })
})

describe('motion', () => {
  it('spins, unless the reader asked for less motion', () => {
    const list = classes()
    // Without the first, the second passes vacuously: nothing would be animating.
    expect(list).toContain('animate-spin')
    expect(list).toContain('motion-reduce:animate-none')
  })
})

describe('forced colors', () => {
  it('takes the system text colour, because an svg keeps an authored colour there', () => {
    for (const tone of ['primary', 'neutral', 'success', 'warning', 'danger', 'info'] as const) {
      expect(classes({ tone }), tone).toContain('forced-colors:text-current')
    }
  })

  it('still lets a consumer replace it, because className is passed last', () => {
    const list = classes({ className: 'forced-colors:text-danger-on-soft' })
    expect(list).toContain('forced-colors:text-danger-on-soft')
    expect(list).not.toContain('forced-colors:text-current')
  })
})

describe('direction', () => {
  it('never mirrors in RTL, because the ring is not directional', () => {
    expect(classes()).not.toContain('rtl:-scale-x-100')
  })

  it('stays unmirrored when a caller smuggles flipRtl in', () => {
    const forced = { flipRtl: true } as SpinnerProps
    expect(classes(forced)).not.toContain('rtl:-scale-x-100')
  })
})

describe('the box', () => {
  it('is not interactive, so it carries no ring, hover, transition or touch target', () => {
    const interactive = /^(hover:|active:|focus-visible:|outline-|transition|duration-|min-[hw]-|disabled:|data-disabled:)/
    expect(classes().filter((c) => interactive.test(c))).toEqual([])
  })
})

describe('className', () => {
  it('keeps a consumer utility', () => {
    expect(classes({ className: 'ms-2' })).toContain('ms-2')
  })

  it('lets text-current replace the tone, which is how it takes the text colour', () => {
    const list = classes({ className: 'text-current' })
    expect(list).toContain('text-current')
    expect(list).not.toContain('text-primary-on-soft')
  })

  it('lets the consumer replace the animation, which is passed last too', () => {
    const list = classes({ className: 'animate-pulse' })
    expect(list).toContain('animate-pulse')
    expect(list).not.toContain('animate-spin')
  })

  it('lets the consumer win a conflict with the layout Svg sets', () => {
    const list = classes({ className: 'hidden' })
    expect(list).toContain('hidden')
    expect(list).not.toContain('inline-block')
  })
})
