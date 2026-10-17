import { describe, expect, it } from 'vitest'

import { classList, markup } from '#test/markup.js'
import { Badge } from '../index.js'
import { BADGE_TONES, BADGE_VARIANTS } from '../constants.js'
import type { BadgeProps } from '../types.js'

const classes = (props: BadgeProps = {}) => classList(markup(<Badge {...props}>Paid</Badge>))

/** The tone's half of each cell: what the fill and the label must be. */
const cell = (variant: string, tone: string) => {
  if (variant === 'solid') return [`bg-${tone}-solid`, `text-${tone}-on-solid`]
  if (variant === 'soft') return [`bg-${tone}-soft`, `text-${tone}-on-soft`]
  return [`text-${tone}-on-soft`]
}

/** Written per variant, because classes.ts repeats it in every tone's cell. */
const EDGE: Record<string, string> = {
  solid: 'border-transparent', soft: 'border-transparent', outline: 'border-current',
}

/** Every colour class on the root: the fill, the label and the border, without the size step. */
const paint = (list: string[]) => list.filter((c) =>
  /^(bg|text|border)-/.test(c) && !/^(text-(xs|sm|base|lg)|border-\(length)/.test(c))

describe('every tone against every variant', () => {
  it('covers all eighteen cells, so the loop cannot look bigger than it is', () => {
    expect(BADGE_VARIANTS.length * BADGE_TONES.length).toBe(18)
  })

  for (const tone of BADGE_TONES) {
    for (const variant of BADGE_VARIANTS) {
      it(`${variant} + ${tone} paints that tone and no other`, () => {
        const list = classes({ variant, tone })
        const wanted = cell(variant, tone)
        expect(wanted.filter((c) => !list.includes(c)), `${variant}/${tone}`).toEqual([])

        const others = BADGE_TONES.filter((t) => t !== tone).flatMap((t) => cell(variant, t))
        expect(others.filter((c) => list.includes(c)), `${variant}/${tone}`).toEqual([])
      })

      it(`${variant} + ${tone} carries its border colour and no other colour class`, () => {
        const wanted = [...cell(variant, tone), EDGE[variant] ?? ''].sort()
        expect(paint(classes({ variant, tone })).sort(), `${variant}/${tone}`).toEqual(wanted)
      })
    }
  }
})

describe('the tone mechanism', () => {
  it('outlines in the label colour, so one token paints both', () => {
    for (const tone of BADGE_TONES) {
      expect(classes({ variant: 'outline', tone }), tone).toContain('border-current')
    }
  })

  it('sets no tone-* utility, which only swaps hover variables a badge never reads', () => {
    for (const tone of BADGE_TONES) {
      expect(classes({ tone }).filter((c) => c.startsWith('tone-')), tone).toEqual([])
    }
  })

  it('names no palette colour anywhere, in any combination', () => {
    const palette = /-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d/
    for (const variant of BADGE_VARIANTS) {
      for (const tone of BADGE_TONES) {
        const list = classes({ variant, tone })
        expect(list.filter((c) => palette.test(c)), `${variant}/${tone}`).toEqual([])
      }
    }
  })

  it('lets a consumer override the fill, which is what cn() is for', () => {
    const list = classes({ variant: 'soft', className: 'bg-surface' })
    expect(list).toContain('bg-surface')
    expect(list).not.toContain('bg-primary-soft')
  })
})
