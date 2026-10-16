import { describe, expect, it } from 'vitest'

import { attr, classList, markup } from '#test/markup.js'
import { Banner } from '../index.js'
import { BANNER_DEFAULTS, BANNER_TONES } from '../constants.js'
import type { BannerTone } from '../types.js'

const html = (tone: BannerTone) => markup(<Banner aria-label="Notice" tone={tone}>Stored.</Banner>)

/** The row every tone shares: layout, padding, the type step, both wraps and the forced-colours edge. */
const ROW = [
  'flex', 'w-full', 'min-w-0', 'flex-wrap', 'items-center', 'gap-3', 'px-5', 'py-3', 'text-sm', 'font-medium', 'wrap-anywhere',
  'forced-colors:border-b-(length:--tc-line-width)',
]

/** All six written out: the soft fill and the text colour that reaches 4.5:1 on it. */
const PAINT: Record<string, string[]> = {
  primary: ['bg-primary-soft', 'text-primary-on-soft'],
  neutral: ['bg-neutral-soft', 'text-neutral-on-soft'],
  success: ['bg-success-soft', 'text-success-on-soft'],
  warning: ['bg-warning-soft', 'text-warning-on-soft'],
  danger: ['bg-danger-soft', 'text-danger-on-soft'],
  info: ['bg-info-soft', 'text-info-on-soft'],
}

describe('every tone', () => {
  it('covers all six, so the loop cannot look bigger than it is', () => {
    expect(Object.keys(PAINT)).toHaveLength(6)
    expect([...BANNER_TONES]).toEqual(['primary', 'neutral', 'success', 'warning', 'danger', 'info'])
  })

  it('starts at primary, and not dismissible', () => {
    expect(BANNER_DEFAULTS).toEqual({ tone: 'primary', dismissible: false })
  })

  for (const [tone, paint] of Object.entries(PAINT)) {
    it(`${tone} emits exactly the row and its own soft pair, nothing more`, () => {
      expect(classList(html(tone as BannerTone)).sort(), tone).toEqual([...ROW, ...paint].sort())
    })

    it(`${tone} is a region and reports its tone`, () => {
      expect(attr(html(tone as BannerTone), 'role'), tone).toBe('region')
      expect(attr(html(tone as BannerTone), 'data-tone'), tone).toBe(tone)
    })
  }
})

describe('the tone mechanism', () => {
  it('sets no tone-* utility, which only swaps hover variables a banner never reads', () => {
    for (const tone of BANNER_TONES) {
      expect(classList(html(tone)).filter((c) => c.startsWith('tone-')), tone).toEqual([])
    }
  })

  it('never paints the solid fill: the variant prop is not built', () => {
    for (const tone of BANNER_TONES) expect(html(tone), tone).not.toMatch(/-solid/)
  })

  it('still renders a tone no list holds, with the row and no colour', () => {
    const list = classList(markup(<Banner aria-label="Notice" tone={'brand' as never}>Stored.</Banner>))
    expect(list.sort()).toEqual([...ROW].sort())
  })
})
