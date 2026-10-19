import { describe, expect, it } from 'vitest'

import { attr, classList, markup } from '#test/markup.js'
import { Progress } from '../index.js'
import { PROGRESS_TONES } from '../constants.js'
import type { ProgressDesignProps } from '../types.js'

const html = (props: ProgressDesignProps = {}) => markup(<Progress aria-label="Upload" value={60} {...props} />)
const bar = (props: ProgressDesignProps = {}) =>
  (/<div class="([^"]*)"><\/div><\/div>$/.exec(html(props))?.[1] ?? '').split(/\s+/).filter(Boolean).sort()

/** The fill each tone paints, written out: a derived one would shrink with BAR_FILL. The text colour, 3:1 on the track. */
const FILL = {
  primary: 'bg-primary-on-soft',
  neutral: 'bg-neutral-on-soft',
  success: 'bg-success-on-soft',
  warning: 'bg-warning-on-soft',
  danger: 'bg-danger-on-soft',
  info: 'bg-info-on-soft',
} as const

describe('every tone paints its bar and nothing else', () => {
  it('offers the shared six, so every toned component has the same set', () => {
    expect([...PROGRESS_TONES]).toEqual(['primary', 'neutral', 'success', 'warning', 'danger', 'info'])
  })

  for (const tone of ['primary', 'neutral', 'success', 'warning', 'danger', 'info'] as const) {
    it(`${tone} gives the bar exactly its fill and the bar's own classes`, () => {
      expect(bar({ tone }), tone).toEqual([FILL[tone], 'forced-colors:bg-[CanvasText]', 'h-full', 'rounded-control', 'w-(--tc-progress-value)'])
    })

    it(`${tone} keeps its fill when indeterminate`, () => {
      expect(bar({ tone, indeterminate: true }), tone).toEqual([
        'animate-pulse', FILL[tone], 'forced-colors:bg-[CanvasText]', 'h-full', 'motion-reduce:animate-none', 'rounded-control', 'w-1/3',
      ])
    })

    it(`${tone}, chosen, keeps its fill at 100, so complete never turns a chosen tone success`, () => {
      expect(bar({ tone, value: 100 }).filter((c) => c.startsWith('bg-')), tone).toEqual([FILL[tone]])
    })

    it(`${tone} is reported on data-tone`, () => {
      expect(attr(html({ tone }), 'data-tone')).toBe(tone)
    })
  }
})

describe('a bar with no tone asked for', () => {
  it('fills in success once complete, as the previewer draws it, and keeps primary below 100 and while indeterminate', () => {
    expect(bar({ value: 100 }).filter((c) => c.startsWith('bg-'))).toEqual(['bg-success-on-soft'])
    expect(bar({ value: 99 }).filter((c) => c.startsWith('bg-'))).toEqual(['bg-primary-on-soft'])
    expect(bar({ value: 100, indeterminate: true }).filter((c) => c.startsWith('bg-'))).toEqual(['bg-primary-on-soft'])
  })

  it('still reports primary on data-tone, the tone it was given by default', () => {
    expect(attr(html({ value: 100 }), 'data-tone')).toBe('primary')
  })
})

describe('the tone mechanism', () => {
  it('paints no text colour, because Progress renders no text', () => {
    for (const tone of PROGRESS_TONES) {
      expect([...classList(html({ tone })), ...bar({ tone })].filter((c) => c.startsWith('text-')), tone).toEqual([])
    }
  })

  it('sets no tone-* utility, which only swaps hover variables a progress bar never reads', () => {
    for (const tone of PROGRESS_TONES) {
      expect([...classList(html({ tone })), ...bar({ tone })].filter((c) => c.startsWith('tone-')), tone).toEqual([])
    }
  })

  it('names no palette colour anywhere, in any tone or state', () => {
    const palette = /-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d/
    for (const tone of PROGRESS_TONES) {
      for (const indeterminate of [false, true]) {
        const all = [...classList(html({ tone, indeterminate })), ...bar({ tone, indeterminate })]
        expect(all.filter((c) => palette.test(c)), tone).toEqual([])
      }
    }
  })
})
