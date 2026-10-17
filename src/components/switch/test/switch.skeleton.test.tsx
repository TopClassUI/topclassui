import { describe, expect, it } from 'vitest'

import { attr, classList, markup } from '#test/markup.js'
import { Switch } from '../index.js'
import { SwitchSkeleton } from '../skeleton.js'
import type { SwitchSkeletonProps } from '../types.js'

const html = (props: SwitchSkeletonProps = {}) => markup(<SwitchSkeleton {...props} />)
/** The class list of the outer span, then of the track inside it. */
const outer = (props: SwitchSkeletonProps = {}) => classList(html(props))
const track = (props: SwitchSkeletonProps = {}) => (/<span class="([^"]*)"><\/span>/.exec(html(props))?.[1] ?? '').split(' ')
const trackOf = (real: string) => (/<span class="([^"]*)"><span/.exec(real)?.[1] ?? '').split(' ')

/** Written out: the toggle height and 1.75 times it, per size. */
const TRACK = {
  xs: ['h-toggle-xs', 'w-[calc(1.53125rem*var(--tc-density))]'],
  sm: ['h-toggle-sm', 'w-[calc(1.75rem*var(--tc-density))]'],
  md: ['h-toggle-md', 'w-[calc(2.1875rem*var(--tc-density))]'],
  lg: ['h-toggle-lg', 'w-[calc(2.625rem*var(--tc-density))]'],
  xl: ['h-toggle-xl', 'w-[calc(3.0625rem*var(--tc-density))]'],
} as const

const FLOOR = [
  'min-h-[var(--tc-target-min,24px)]', 'min-w-[var(--tc-target-min,24px)]',
  'pointer-coarse:min-h-[var(--tc-target-coarse,44px)]', 'pointer-coarse:min-w-[var(--tc-target-coarse,44px)]',
]

describe('SwitchSkeleton', () => {
  it('is hidden from the accessibility tree, and a caller cannot un-hide it', () => {
    expect(attr(html(), 'aria-hidden')).toBe('true')
    expect(attr(html({ 'aria-hidden': false } as SwitchSkeletonProps), 'aria-hidden')).toBe('true')
  })

  it('renders no button and no input, so nothing in it can take focus: a span around one empty span', () => {
    expect(html()).toMatch(/^<span class="[^"<>]+" aria-hidden="true"><span class="[^"<>]+"><\/span><\/span>$/)
  })

  it('keeps the target floor of the switch, 24 px and 44 under a finger, around the track', () => {
    const real = classList(markup(<Switch aria-label="Digest" />))
    for (const name of FLOOR) {
      expect(outer(), name).toContain(name)
      expect(real, name).toContain(name)
    }
  })

  for (const size of ['xs', 'sm', 'md', 'lg', 'xl'] as const) {
    it(`${size} draws the track of an ${size} switch`, () => {
      const real = trackOf(markup(<Switch size={size} aria-label="Digest" />))
      for (const name of TRACK[size]) {
        expect(track({ size }), name).toContain(name)
        expect(real, name).toContain(name)
      }
    })
  }

  it('starts at md, the default size of the switch', () => {
    expect(track()).toEqual(track({ size: 'md' }))
  })

  it('emits no size class at custom, so the caller sizes the track as they size the switch', () => {
    expect(track({ size: 'custom' }).filter((c) => /^(h-|w-)/.test(c))).toEqual([])
  })

  it('wears the neutral fill, keeps an edge in forced colours, and pulses unless the reader asked it not to', () => {
    // Without animate-pulse, the reduced-motion half passes vacuously: nothing would be animating.
    expect(track()).toEqual(expect.arrayContaining([
      'rounded-full', 'bg-neutral-soft', 'animate-pulse', 'motion-reduce:animate-none', 'forced-colors:outline-(length:--tc-line-width)',
    ]))
  })

  it('passes className, style and the rest to the outer span, as every component must', () => {
    const out = html({ className: 'ms-2', id: 's', style: { ['--tc-x' as string]: '1' } })
    expect(classList(out)).toContain('ms-2')
    expect(attr(out, 'id')).toBe('s')
    expect(attr(out, 'style')).toBe('--tc-x:1')
  })
})
