import { describe, expect, it } from 'vitest'

import { attr, classList, markup } from '#test/markup.js'
import { Spinner } from '../index.js'
import { SPINNER_TONES } from '../constants.js'
import type { SpinnerProps } from '../types.js'

const html = (props: SpinnerProps = {}) => markup(<Spinner {...props} />)
const classes = (props: SpinnerProps = {}) => classList(html(props))

/** The Build this table, written out: a derived expectation would shrink with SPINNER_TONE. */
const COLOUR = {
  primary: 'text-primary-on-soft',
  neutral: 'text-neutral-on-soft',
  success: 'text-success-on-soft',
  warning: 'text-warning-on-soft',
  danger: 'text-danger-on-soft',
  info: 'text-info-on-soft',
} as const

const LAYOUT = ['animate-spin', 'forced-colors:text-current', 'inline-block', 'motion-reduce:animate-none', 'shrink-0']

describe('every tone', () => {
  it('is the shared six, in the table above', () => {
    expect([...SPINNER_TONES].sort()).toEqual(['danger', 'info', 'neutral', 'primary', 'success', 'warning'])
  })

  for (const tone of ['primary', 'neutral', 'success', 'warning', 'danger', 'info'] as const) {
    it(`${tone} carries exactly its on-soft colour and the layout, nothing else`, () => {
      expect(classes({ tone }).sort()).toEqual([...LAYOUT, COLOUR[tone]].sort())
    })

    it(`${tone} is reported on data-tone`, () => {
      expect(attr(html({ tone }), 'data-tone')).toBe(tone)
    })

    it(`${tone} gives way to text-current`, () => {
      const list = classes({ tone, className: 'text-current' })
      expect(list).toContain('text-current')
      expect(list).not.toContain(COLOUR[tone])
    })
  }

  it('starts at primary', () => {
    expect(classes()).toContain('text-primary-on-soft')
  })
})

describe('the tone mechanism', () => {
  it('paints the text colour alone, never a fill or a border', () => {
    for (const tone of SPINNER_TONES) {
      expect(classes({ tone }).filter((c) => /^(bg|border|fill|stroke)-/.test(c)), tone).toEqual([])
    }
  })

  it('names no palette colour in any tone', () => {
    const palette = /-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d/
    for (const tone of SPINNER_TONES) {
      expect(classes({ tone }).filter((c) => palette.test(c)), tone).toEqual([])
    }
  })
})
