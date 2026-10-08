import { describe, expect, it } from 'vitest'

import { classList, markup } from '#test/markup.js'
import { Progress } from '../index.js'
import type { ProgressDesignProps } from '../types.js'

type Props = ProgressDesignProps & { className?: string }

const html = (props: Props = {}) => markup(<Progress aria-label="Upload" value={60} {...props} />)
const track = (props: Props = {}) => classList(html(props)).sort()
/** The one inner div: the bar, which takes no className of its own. */
const bar = (props: Props = {}) =>
  (/<div class="([^"]*)"><\/div><\/div>$/.exec(html(props))?.[1] ?? '').split(/\s+/).filter(Boolean).sort()

/** Every class on the track, per size and sorted: an extra or a missing one both fail. */
const TRACK = {
  xs: ['bg-neutral-soft', 'forced-color-adjust-none', 'h-pad-y-xs', 'overflow-hidden', 'rounded-control', 'w-full'],
  sm: ['bg-neutral-soft', 'forced-color-adjust-none', 'h-pad-y-sm', 'overflow-hidden', 'rounded-control', 'w-full'],
  md: ['bg-neutral-soft', 'forced-color-adjust-none', 'h-pad-y-md', 'overflow-hidden', 'rounded-control', 'w-full'],
  lg: ['bg-neutral-soft', 'forced-color-adjust-none', 'h-pad-y-lg', 'overflow-hidden', 'rounded-control', 'w-full'],
  xl: ['bg-neutral-soft', 'forced-color-adjust-none', 'h-pad-y-xl', 'overflow-hidden', 'rounded-control', 'w-full'],
  custom: ['bg-neutral-soft', 'forced-color-adjust-none', 'overflow-hidden', 'rounded-control', 'w-full'],
} as const

const BAR = ['bg-primary-solid', 'h-full', 'rounded-control', 'w-(--tc-progress-value)']
const BAR_INDETERMINATE = [
  'animate-pulse', 'bg-primary-solid', 'h-full', 'motion-reduce:animate-none', 'rounded-control', 'w-1/3',
]

describe('the track', () => {
  for (const size of ['xs', 'sm', 'md', 'lg', 'xl', 'custom'] as const) {
    it(`${size} carries exactly its own classes`, () => {
      expect(track({ size }), size).toEqual(TRACK[size])
    })
  }

  it('keeps every fill when forced colours would repaint both to nothing', () => {
    expect(track()).toContain('forced-color-adjust-none')
  })

  it('is the same neutral track under every tone; only the bar changes', () => {
    for (const tone of ['primary', 'neutral', 'success', 'warning', 'danger', 'info'] as const) {
      expect(track({ tone }), tone).toEqual(TRACK.md)
    }
  })

  it('is the same track when indeterminate', () => {
    expect(track({ indeterminate: true })).toEqual(TRACK.md)
  })
})

describe('the bar', () => {
  it('fills the track height and reads its width from the variable the root sets', () => {
    expect(bar()).toEqual(BAR)
  })

  it('is the same at every size, because the height comes from the track', () => {
    for (const size of ['xs', 'sm', 'md', 'lg', 'xl', 'custom'] as const) expect(bar({ size }), size).toEqual(BAR)
  })

  it('is a third of the track and pulses when indeterminate, unless motion is reduced', () => {
    expect(bar({ indeterminate: true })).toEqual(BAR_INDETERMINATE)
  })
})

describe('the parts stay simple', () => {
  it('starts the bar at the inline-start edge with no positioning class, so RTL needs nothing', () => {
    const positioned = /^(-?translate|absolute|relative|inset-|start-|end-|left-|right-|ms-|me-|float-|justify-|flex)/
    expect([...track(), ...bar()].filter((c) => positioned.test(c))).toEqual([])
  })

  it('is not interactive, so it carries no ring, hover, transition or touch target', () => {
    const interactive = /^(hover:|active:|focus-visible:|outline-|transition|duration-|min-[hw]-|disabled:|data-disabled:)/
    expect([...track(), ...bar()].filter((c) => interactive.test(c))).toEqual([])
    expect(html()).not.toContain('tabindex')
  })

  it('reaches into no descendant, so the bar keeps the classes it was given', () => {
    expect(track().filter((c) => /^(\*|\[&)/.test(c))).toEqual([])
  })
})

describe('className lands on the track, last', () => {
  it('keeps a consumer utility beside every class of its own, so it merges and never replaces', () => {
    expect(track({ className: 'ms-2' })).toEqual([
      'bg-neutral-soft', 'forced-color-adjust-none', 'h-pad-y-md', 'ms-2', 'overflow-hidden',
      'rounded-control', 'w-full',
    ])
  })

  it('lets a fixed width replace w-full, which a bar inside a list row needs', () => {
    const list = track({ className: 'w-16' })
    expect(list).toContain('w-16')
    expect(list).not.toContain('w-full')
  })

  it('lets the consumer replace the height', () => {
    const list = track({ size: 'md', className: 'h-2' })
    expect(list).toContain('h-2')
    expect(list).not.toContain('h-pad-y-md')
  })

  it('lets the consumer replace the radius', () => {
    const list = track({ className: 'rounded-box' })
    expect(list).toContain('rounded-box')
    expect(list).not.toContain('rounded-control')
  })

  it('lets the consumer replace the track fill', () => {
    const list = track({ className: 'bg-surface' })
    expect(list).toContain('bg-surface')
    expect(list).not.toContain('bg-neutral-soft')
  })

  it('never reaches the bar, which keeps its own look', () => {
    expect(bar({ className: 'rounded-box bg-surface w-16' })).toEqual(BAR)
  })
})
