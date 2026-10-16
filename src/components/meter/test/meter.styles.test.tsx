import { describe, expect, it } from 'vitest'

import { classList, markup } from '#test/markup.js'
import { Meter } from '../index.js'
import type { MeterDesignProps } from '../types.js'

type Props = MeterDesignProps & { className?: string }

const html = (props: Props = {}) => markup(<Meter aria-label="Battery" value={60} {...props} />)
const track = (props: Props = {}) => classList(html(props)).sort()
/** The one inner div: the bar, which takes no className of its own. */
const bar = (props: Props = {}) =>
  (/<div class="([^"]*)"><\/div><\/div>$/.exec(html(props))?.[1] ?? '').split(/\s+/).filter(Boolean).sort()

/** Every class on the track, per size and sorted: an extra or a missing one both fail. */
const TRACK = {
  xs: ['bg-neutral-soft', 'forced-color-adjust-none', 'forced-colors:bg-[Canvas]', 'forced-colors:outline-[CanvasText]', 'h-pad-y-xs', 'min-w-16', 'outline-(length:--tc-line-width)', 'outline-line-strong', 'outline-solid', 'overflow-hidden', 'rounded-control', 'w-full'],
  sm: ['bg-neutral-soft', 'forced-color-adjust-none', 'forced-colors:bg-[Canvas]', 'forced-colors:outline-[CanvasText]', 'h-pad-y-sm', 'min-w-16', 'outline-(length:--tc-line-width)', 'outline-line-strong', 'outline-solid', 'overflow-hidden', 'rounded-control', 'w-full'],
  md: ['bg-neutral-soft', 'forced-color-adjust-none', 'forced-colors:bg-[Canvas]', 'forced-colors:outline-[CanvasText]', 'h-pad-y-md', 'min-w-16', 'outline-(length:--tc-line-width)', 'outline-line-strong', 'outline-solid', 'overflow-hidden', 'rounded-control', 'w-full'],
  lg: ['bg-neutral-soft', 'forced-color-adjust-none', 'forced-colors:bg-[Canvas]', 'forced-colors:outline-[CanvasText]', 'h-pad-y-lg', 'min-w-16', 'outline-(length:--tc-line-width)', 'outline-line-strong', 'outline-solid', 'overflow-hidden', 'rounded-control', 'w-full'],
  xl: ['bg-neutral-soft', 'forced-color-adjust-none', 'forced-colors:bg-[Canvas]', 'forced-colors:outline-[CanvasText]', 'h-pad-y-xl', 'min-w-16', 'outline-(length:--tc-line-width)', 'outline-line-strong', 'outline-solid', 'overflow-hidden', 'rounded-control', 'w-full'],
  custom: ['bg-neutral-soft', 'forced-color-adjust-none', 'forced-colors:bg-[Canvas]', 'forced-colors:outline-[CanvasText]', 'min-w-16', 'outline-(length:--tc-line-width)', 'outline-line-strong', 'outline-solid', 'overflow-hidden', 'rounded-control', 'w-full'],
} as const

/** The fill each tone paints, written out: a derived one would shrink with METER_FILL. The text colour, 3:1 on the track. */
const FILL = {
  primary: 'bg-primary-on-soft',
  neutral: 'bg-neutral-on-soft',
  success: 'bg-success-on-soft',
  warning: 'bg-warning-on-soft',
  danger: 'bg-danger-on-soft',
  info: 'bg-info-on-soft',
} as const

const TONES = ['primary', 'neutral', 'success', 'warning', 'danger', 'info'] as const

describe('the track', () => {
  for (const size of ['xs', 'sm', 'md', 'lg', 'xl', 'custom'] as const) {
    it(`${size} carries exactly its own classes`, () => {
      expect(track({ size }), size).toEqual(TRACK[size])
    })
  }

  it('keeps both fills when forced colours would repaint them to nothing, in system colours that hold in every palette', () => {
    expect(track().filter((c) => c.startsWith('forced-'))).toEqual(['forced-color-adjust-none', 'forced-colors:bg-[Canvas]', 'forced-colors:outline-[CanvasText]'])
    expect(bar().filter((c) => c.startsWith('forced-'))).toEqual(['forced-colors:bg-[CanvasText]'])
  })

  it('never shrinks below 4rem, so a w-fit parent cannot hide a reading a reader still hears', () => {
    expect(track().filter((c) => c.startsWith('min-'))).toEqual(['min-w-16'])
  })

  it('marks the full range with a line-strong outline, which takes no room from a 2 px track', () => {
    expect(track({ size: 'xs' }).filter((c) => c.startsWith('outline-') || c.startsWith('border'))).toEqual([
      'outline-(length:--tc-line-width)', 'outline-line-strong', 'outline-solid',
    ])
  })

  it('is the same neutral track under every tone; only the bar changes', () => {
    for (const tone of TONES) expect(track({ tone }), tone).toEqual(TRACK.md)
  })
})

describe('the bar', () => {
  for (const tone of TONES) {
    it(`${tone} gives the bar exactly its fill and the bar's own classes`, () => {
      expect(bar({ tone }), tone).toEqual([FILL[tone], 'forced-colors:bg-[CanvasText]', 'h-full', 'rounded-control', 'w-(--tc-meter-value)'])
    })
  }

  it('is the same at every size, because the height comes from the track', () => {
    for (const size of ['xs', 'sm', 'md', 'lg', 'xl', 'custom'] as const) {
      expect(bar({ size }), size).toEqual(['bg-primary-on-soft', 'forced-colors:bg-[CanvasText]', 'h-full', 'rounded-control', 'w-(--tc-meter-value)'])
    }
  })

  it('keeps its tone at the top of the range: a full meter is not a finished task', () => {
    for (const tone of TONES) expect(bar({ tone, value: 100 }).filter((c) => c.startsWith('bg-')), tone).toEqual([FILL[tone]])
  })
})

describe('the parts stay simple', () => {
  it('starts the bar at the inline-start edge with no positioning class, so RTL needs nothing', () => {
    const positioned = /^(-?translate|absolute|relative|inset-|start-|end-|left-|right-|ms-|me-|float-|justify-|flex)/
    expect([...track(), ...bar()].filter((c) => positioned.test(c))).toEqual([])
  })

  it('is not interactive, so it carries no ring, hover, transition or touch target', () => {
    const interactive = /^(hover:|active:|focus-visible:|outline-offset|outline-ring|transition|duration-|animate-|min-h-|min-w-\[|pointer-coarse:|disabled:|data-disabled:)/
    expect([...track(), ...bar()].filter((c) => interactive.test(c))).toEqual([])
    expect(html()).not.toContain('tabindex')
  })

  it('paints no text colour and sets no tone-* utility, because it renders no text and has no hover', () => {
    for (const tone of TONES) {
      expect([...track({ tone }), ...bar({ tone })].filter((c) => /^(text-|tone-)/.test(c)), tone).toEqual([])
    }
  })

  it('names no palette colour anywhere, in any tone', () => {
    const palette = /-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d/
    for (const tone of TONES) expect([...track({ tone }), ...bar({ tone })].filter((c) => palette.test(c)), tone).toEqual([])
  })
})

describe('className lands on the track, last', () => {
  it('keeps a consumer utility beside every class of its own, so it merges and never replaces', () => {
    expect(track({ className: 'ms-2' })).toEqual([
      'bg-neutral-soft', 'forced-color-adjust-none', 'forced-colors:bg-[Canvas]', 'forced-colors:outline-[CanvasText]', 'h-pad-y-md',
      'min-w-16', 'ms-2', 'outline-(length:--tc-line-width)', 'outline-line-strong', 'outline-solid', 'overflow-hidden', 'rounded-control', 'w-full',
    ])
  })

  it('lets a fixed width replace w-full', () => {
    const list = track({ className: 'w-16' })
    expect(list).toContain('w-16')
    expect(list).not.toContain('w-full')
  })

  it('lets the consumer replace the height, the radius and the track fill', () => {
    const list = track({ size: 'md', className: 'h-2 rounded-box bg-surface' })
    expect(list).toEqual([
      'bg-surface', 'forced-color-adjust-none', 'forced-colors:bg-[Canvas]', 'forced-colors:outline-[CanvasText]', 'h-2',
      'min-w-16', 'outline-(length:--tc-line-width)', 'outline-line-strong', 'outline-solid', 'overflow-hidden', 'rounded-box', 'w-full',
    ])
  })

  it('never reaches the bar, which keeps its own look', () => {
    expect(bar({ className: 'rounded-box bg-surface w-16' }))
      .toEqual(['bg-primary-on-soft', 'forced-colors:bg-[CanvasText]', 'h-full', 'rounded-control', 'w-(--tc-meter-value)'])
  })
})
