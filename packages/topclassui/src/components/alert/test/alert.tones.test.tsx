import { describe, expect, it } from 'vitest'

import { classList, markup } from '#test/markup.js'
import { Alert } from '../index.js'
import { ALERT_TONES } from '../constants.js'
import type { AlertProps } from '../types.js'

type Cell = Required<Pick<AlertProps, 'variant' | 'tone'>>

const classes = (props: Cell) => classList(markup(<Alert {...props} title="Saved">Stored.</Alert>))

/** The box every cell shares: layout, radius, padding and the border width. */
const BOX = [
  'flex', 'items-start', 'gap-2', 'rounded-box', 'px-pad-x-md', 'py-3',
  'border-(length:--tc-line-width)',
]

/** All eighteen cells written out, because classes.ts repeats the border in every one. */
const CELLS: Record<string, Record<string, string[]>> = {
  soft: {
    primary: ['bg-primary-soft', 'text-primary-on-soft', 'border-transparent'],
    neutral: ['bg-neutral-soft', 'text-neutral-on-soft', 'border-transparent'],
    success: ['bg-success-soft', 'text-success-on-soft', 'border-transparent'],
    warning: ['bg-warning-soft', 'text-warning-on-soft', 'border-transparent'],
    danger: ['bg-danger-soft', 'text-danger-on-soft', 'border-transparent'],
    info: ['bg-info-soft', 'text-info-on-soft', 'border-transparent'],
  },
  solid: {
    primary: ['bg-primary-solid', 'text-primary-on-solid', 'border-transparent'],
    neutral: ['bg-neutral-solid', 'text-neutral-on-solid', 'border-transparent'],
    success: ['bg-success-solid', 'text-success-on-solid', 'border-transparent'],
    warning: ['bg-warning-solid', 'text-warning-on-solid', 'border-transparent'],
    danger: ['bg-danger-solid', 'text-danger-on-solid', 'border-transparent'],
    info: ['bg-info-solid', 'text-info-on-solid', 'border-transparent'],
  },
  outline: {
    primary: ['text-primary-on-soft', 'border-current'],
    neutral: ['text-neutral-on-soft', 'border-current'],
    success: ['text-success-on-soft', 'border-current'],
    warning: ['text-warning-on-soft', 'border-current'],
    danger: ['text-danger-on-soft', 'border-current'],
    info: ['text-info-on-soft', 'border-current'],
  },
}

describe('every tone against every variant', () => {
  it('covers all eighteen cells, so the loop cannot look bigger than it is', () => {
    expect(Object.values(CELLS).flatMap((row) => Object.keys(row))).toHaveLength(18)
    expect([...ALERT_TONES]).toEqual(['primary', 'neutral', 'success', 'warning', 'danger', 'info'])
  })

  for (const [variant, row] of Object.entries(CELLS)) {
    for (const [tone, paint] of Object.entries(row)) {
      it(`${variant} + ${tone} emits exactly the box and its own colour, nothing more`, () => {
        const list = classes({ variant, tone } as Cell)
        expect(list.sort(), `${variant}/${tone}`).toEqual([...BOX, ...paint].sort())
      })

      it(`${variant} + ${tone} is page content, with no role and no live region`, () => {
        const html = markup(<Alert {...({ variant, tone } as Cell)} title="Saved">Stored.</Alert>)
        expect(html, `${variant}/${tone}`).not.toMatch(/ (role|aria-live)=/)
      })
    }
  }
})

describe('the tone mechanism', () => {
  it('outlines in the text colour, so one token paints the line and the words', () => {
    for (const tone of ALERT_TONES) {
      expect(classes({ variant: 'outline', tone }), tone).toContain('border-current')
    }
  })

  it('sets no tone-* utility, which only swaps hover variables an alert never reads', () => {
    for (const tone of ALERT_TONES) {
      expect(classes({ variant: 'soft', tone }).filter((c) => c.startsWith('tone-')), tone).toEqual([])
    }
  })

  it('puts no opacity anywhere, which would take white on the danger solid under 4.5:1', () => {
    const html = markup(<Alert variant="solid" tone="danger" title="Failed" actions="Retry">The deploy stopped.</Alert>)
    expect(html).not.toMatch(/opacity-/)
  })
})
