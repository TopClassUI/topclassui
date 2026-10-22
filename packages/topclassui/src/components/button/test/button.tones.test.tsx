import { describe, expect, it } from 'vitest'

import { classList, markup } from '#test/markup.js'
import { Button } from '../index.js'
import { BUTTON_TONES, BUTTON_VARIANTS } from '../constants.js'
import type { ButtonProps } from '../types.js'

const classes = (props: ButtonProps = {}) => classList(markup(<Button {...props}>Save</Button>))

/** The tone's half of each cell: what the fill and the label must be for that variant. */
const cell = (variant: string, tone: string) => {
  if (variant === 'solid') return [`bg-${tone}-solid`, `text-${tone}-on-solid`]
  if (variant === 'soft') return [`bg-${tone}-soft`, `text-${tone}-on-soft`]
  if (variant === 'link') return [`text-${tone}-on-soft`]
  return []
}

describe('every tone against every variant', () => {
  it('covers all thirty cells, so the loop cannot look bigger than it is', () => {
    expect(BUTTON_VARIANTS.length * BUTTON_TONES.length).toBe(30)
  })

  for (const tone of BUTTON_TONES) {
    it(`${tone} applies its own utility, so the hover classes never change`, () => {
      expect(classes({ tone })).toContain(`tone-${tone}`)
    })

    for (const variant of BUTTON_VARIANTS) {
      it(`${variant} + ${tone} paints that tone and no other`, () => {
        const list = classes({ variant, tone })
        const wanted = cell(variant, tone)
        expect(wanted.filter((c) => !list.includes(c)), `${variant}/${tone}`).toEqual([])

        const others = BUTTON_TONES.filter((t) => t !== tone).flatMap((t) => cell(variant, t))
        expect(others.filter((c) => list.includes(c)), `${variant}/${tone}`).toEqual([])
      })
    }
  }
})

describe('outline and ghost, as Figma 64:340 draws them', () => {
  for (const tone of BUTTON_TONES) {
    for (const variant of ['outline', 'ghost'] as const) {
      it(`${variant} + ${tone} keeps body text and wears no tone text`, () => {
        const list = classes({ variant, tone })
        expect(list).toContain('text-body')
        expect(list.filter((c) => c.endsWith('-on-soft'))).toEqual([])
      })
    }
  }
})

describe('the tone mechanism', () => {
  it('reads hover and active from the variables a tone swaps, in every variant', () => {
    const reads: Record<string, string[]> = {
      solid: ['hover:bg-(--tc-hover)', 'active:bg-(--tc-active)'],
      soft: ['hover:bg-(--tc-soft-hover)', 'active:bg-(--tc-soft-active)'],
      outline: ['hover:bg-(--tc-soft)', 'active:bg-(--tc-soft-hover)'],
      ghost: ['hover:bg-(--tc-soft)', 'active:bg-(--tc-soft-hover)'],
      link: ['hover:underline'],
    }
    for (const variant of BUTTON_VARIANTS) {
      const list = classes({ variant })
      expect((reads[variant] ?? []).filter((c) => !list.includes(c)), variant).toEqual([])
    }
  })

  it('never names a tone colour outside the variables, so one swap moves everything', () => {
    for (const tone of BUTTON_TONES) {
      const list = classes({ variant: 'ghost', tone })
      expect(list.filter((c) => /^(hover|active):bg-(?!\()/.test(c)), tone).toEqual([])
    }
  })

  it('names no palette colour anywhere, in any combination', () => {
    const palette = /-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d/
    for (const variant of BUTTON_VARIANTS) {
      for (const tone of BUTTON_TONES) {
        const list = classes({ variant, tone })
        expect(list.filter((c) => palette.test(c)), `${variant}/${tone}`).toEqual([])
      }
    }
  })

  it('lets a consumer override the tone, which needs tone-* to be a merge group', () => {
    const list = classes({ tone: 'primary', className: 'tone-danger' })
    expect(list).toContain('tone-danger')
    expect(list).not.toContain('tone-primary')
  })
})

describe('the pointer', () => {
  it('is a hand on every variant, and disabled stops pointer events so it never shows', () => {
    for (const variant of BUTTON_VARIANTS) expect(classes({ variant })).toContain('cursor-pointer')
    expect(classes({ disabled: true })).toContain('disabled:pointer-events-none')
  })
})
