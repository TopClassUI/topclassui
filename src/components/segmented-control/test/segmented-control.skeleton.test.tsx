import { describe, expect, it } from 'vitest'

import { attr, classList, markup } from '#test/markup.js'
import { SegmentedControlItem, SegmentedControlRoot } from '../index.js'
import { SegmentedControlSkeleton } from '../skeleton.js'
import type { SegmentedControlRootProps, SegmentedControlSkeletonProps } from '../types.js'

const html = (props: SegmentedControlSkeletonProps = {}) => markup(<SegmentedControlSkeleton {...props} />)
/** The class list of the holder, then of the track inside it. */
const holder = (props: SegmentedControlSkeletonProps = {}) => classList(html(props))
const track = (props: SegmentedControlSkeletonProps = {}) => (/^<span [^>]*><span class="([^"]*)"/.exec(html(props))?.[1] ?? '').split(' ')
/** The class lists of the segments, then of the label reserve inside the first. */
const segments = (props: SegmentedControlSkeletonProps = {}) =>
  [...html(props).matchAll(/<span class="([^"]*)"><span class="[^"]*"><\/span><\/span>/g)].map(([, list = '']) => list.split(' '))
const reserve = (props: SegmentedControlSkeletonProps = {}) => (/<span class="([^"]*)"><\/span>/.exec(html(props))?.[1] ?? '').split(' ')

/** The real track's class list, then its first segment's. */
function real(props: Partial<SegmentedControlRootProps> = {}): [string[], string[]] {
  const out = markup(
    <SegmentedControlRoot aria-label="View" defaultValue="a" {...props}>
      <SegmentedControlItem value="a">Board</SegmentedControlItem>
      <SegmentedControlItem value="b">Table</SegmentedControlItem>
    </SegmentedControlRoot>,
  )
  const of = (re: RegExp) => (re.exec(out)?.[1] ?? '').split(' ')
  return [of(/role="radiogroup"[^>]*class="([^"]*)"/), of(/<button [^>]*class="([^"]*)"/)]
}

/** Written out: the track's height, then a segment's padding and type step, per size. */
const SIZE = {
  xs: [['min-h-control-xs'], ['px-2', 'text-xs']],
  sm: [['min-h-control-sm'], ['px-2.5', 'text-sm']],
  md: [['min-h-control-md'], ['px-3', 'text-sm']],
  lg: [['min-h-control-lg'], ['px-4', 'text-base']],
  xl: [['min-h-control-xl'], ['px-5', 'text-base']],
} as const

const FLOOR = [
  'min-h-[var(--tc-target-min,24px)]', 'min-w-[var(--tc-target-min,24px)]',
  'pointer-coarse:min-h-[var(--tc-target-coarse,44px)]', 'pointer-coarse:min-w-[var(--tc-target-coarse,44px)]',
]

/** The box of the track: its line width, padding, gap and radius. */
const BOX = ['flex', 'w-fit', 'max-w-full', 'items-stretch', 'gap-0.5', 'rounded-control', 'p-0.75', 'border-(length:--tc-line-width)']

describe('SegmentedControlSkeleton', () => {
  it('is hidden from the accessibility tree, and a caller cannot un-hide it', () => {
    expect(attr(html(), 'aria-hidden')).toBe('true')
    expect(attr(html({ 'aria-hidden': false } as SegmentedControlSkeletonProps), 'aria-hidden')).toBe('true')
  })

  it('renders no button and no input, so nothing in it can take focus: a holder and a track around three empty segments', () => {
    expect(html()).toMatch(/^<span class="[^"<>]+" aria-hidden="true"><span class="[^"<>]+" aria-hidden="true">(<span class="[^"<>]+"><span class="[^"<>]+"><\/span><\/span>){3}<\/span><\/span>$/)
  })

  it('sits in the holder of the track, a grid column that may shrink to nothing, so it never widens the page', () => {
    expect(holder()).toEqual(['grid', 'grid-cols-1'])
    expect(holder({ fullWidth: true })).toEqual(['grid', 'grid-cols-1', 'w-full'])
    expect(markup(<SegmentedControlRoot aria-label="View" defaultValue="a" fullWidth />)).toMatch(/^<div class="grid grid-cols-1 w-full">/)
  })

  it('draws the box of the track: its line, padding, gap and radius', () => {
    const [realTrack] = real()
    for (const name of BOX) {
      expect(track(), name).toContain(name)
      expect(realTrack, name).toContain(name)
    }
  })

  it('keeps the target floor of a segment, 24 px and 44 under a finger', () => {
    const [, realSegment] = real()
    for (const name of FLOOR) {
      expect(segments()[0], name).toContain(name)
      expect(realSegment, name).toContain(name)
    }
  })

  for (const size of ['xs', 'sm', 'md', 'lg', 'xl'] as const) {
    it(`${size} draws the height of an ${size} track and the padding and type step of its segments`, () => {
      const [realTrack, realSegment] = real({ size })
      const [height, segment] = SIZE[size]
      for (const name of height) {
        expect(track({ size }), name).toContain(name)
        expect(realTrack, name).toContain(name)
      }
      for (const name of segment) {
        for (const one of segments({ size })) expect(one, name).toContain(name)
        expect(realSegment, name).toContain(name)
      }
    })
  }

  it('starts at md, the default size of the track, three segments and its own width', () => {
    expect(html()).toBe(html({ size: 'md', items: 3, fullWidth: false }))
    expect(segments()).toHaveLength(3)
  })

  it('emits no size class at custom, so the caller sizes it as they size the track', () => {
    expect(track({ size: 'custom' }).filter((c) => c.startsWith('min-h-control'))).toEqual([])
    expect(segments({ size: 'custom' })[0]?.filter((c) => /^(px-|text-)/.test(c))).toEqual([])
  })

  it('reserves four em of the type step per label, since the width of caller text is unknown', () => {
    expect(reserve()).toEqual(['block', 'w-[4em]', 'shrink-0'])
  })

  it('with fullWidth fills its parent and shares it between the segments, as the track does', () => {
    const [realTrack] = real({ fullWidth: true })
    for (const name of ['w-full', '*:flex-1']) {
      expect(track({ fullWidth: true }), name).toContain(name)
      expect(realTrack, name).toContain(name)
    }
    expect(track({ fullWidth: true })).not.toContain('w-fit')
    expect(track()).not.toContain('w-full')
  })

  it('draws one segment per item, clamped to 1 and 50 and truncated to a whole number', () => {
    expect(segments({ items: 5 })).toHaveLength(5)
    expect(segments({ items: 2.7 })).toHaveLength(2)
    expect(segments({ items: 0 })).toHaveLength(1)
    expect(segments({ items: Number.NaN })).toHaveLength(1)
    expect(segments({ items: 500 })).toHaveLength(50)
  })

  it('wears the neutral fill, keeps an edge in forced colours, and pulses unless the reader asked it not to', () => {
    // Without animate-pulse, the reduced-motion half passes vacuously: nothing would be animating.
    expect(track()).toEqual(expect.arrayContaining([
      'rounded-control', 'bg-neutral-soft', 'animate-pulse', 'motion-reduce:animate-none', 'forced-colors:outline-(length:--tc-line-width)',
    ]))
  })

  it('passes className, style and the rest to the track, as the segmented control does, and nothing to the holder', () => {
    const out = html({ className: 'ms-2', id: 's', style: { ['--tc-x' as string]: '1' } })
    expect(track({ className: 'ms-2' })).toContain('ms-2')
    expect(out).toMatch(/^<span class="grid grid-cols-1" aria-hidden="true"><span class="[^"]*" id="s" style="--tc-x:1" aria-hidden="true">/)
  })
})
