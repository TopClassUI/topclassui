import { describe, expect, it } from 'vitest'

import { classList, markup } from '#test/markup.js'
import { Tag } from '../index.js'
import { TAG_TONES } from '../constants.js'
import type { TagProps } from '../types.js'

const classes = (props: TagProps = {}) => classList(markup(<Tag {...props}>React</Tag>))

/** The soft pair of each tone, written out, with the transparent border that holds the height. */
const PAINT: Record<string, string[]> = {
  primary: ['bg-primary-soft', 'border-transparent', 'text-primary-on-soft'],
  neutral: ['bg-neutral-soft', 'border-transparent', 'text-neutral-on-soft'],
  success: ['bg-success-soft', 'border-transparent', 'text-success-on-soft'],
  warning: ['bg-warning-soft', 'border-transparent', 'text-warning-on-soft'],
  danger: ['bg-danger-soft', 'border-transparent', 'text-danger-on-soft'],
  info: ['bg-info-soft', 'border-transparent', 'text-info-on-soft'],
}

/** Every colour class on the root: the fill, the label and the border, without the size step. */
const paint = (list: string[]) => list.filter((c) =>
  /^(bg|text|border)-/.test(c) && !/^(text-(xs|sm|base|lg)$|border-\(length)/.test(c))

describe('every tone paints its soft pair', () => {
  it('names all six tones in the table, so adding one cannot skip coverage', () => {
    expect(Object.keys(PAINT).sort()).toEqual([...TAG_TONES].sort())
    expect(TAG_TONES.length).toBe(6)
  })

  for (const tone of TAG_TONES) {
    it(`${tone} carries its fill, its label colour, a transparent border and no other colour class`, () => {
      expect(paint(classes({ tone })).sort(), tone).toEqual(PAINT[tone])
    })
  }

  it('paints neutral when no tone is given', () => {
    expect(paint(classes()).sort())
      .toEqual(['bg-neutral-soft', 'border-transparent', 'text-neutral-on-soft'])
  })

  it('never reaches for a solid fill, because a tag is soft only', () => {
    for (const tone of TAG_TONES) {
      expect(classes({ tone }).filter((c) => c.includes('-solid')), tone).toEqual([])
    }
  })

  it('sets no tone-* utility, which only swaps hover variables a tag never reads', () => {
    for (const tone of TAG_TONES) {
      expect(classes({ tone }).filter((c) => c.startsWith('tone-')), tone).toEqual([])
    }
  })

  it('names no palette colour in any tone', () => {
    const palette = /-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d/
    for (const tone of TAG_TONES) {
      expect(classes({ tone }).filter((c) => palette.test(c)), tone).toEqual([])
    }
  })
})
