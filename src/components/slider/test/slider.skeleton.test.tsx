import { describe, expect, it } from 'vitest'

import { attr, classList, markup } from '#test/markup.js'
import { Slider } from '../index.js'
import { SliderSkeleton } from '../skeleton.js'
import type { SliderProps, SliderSkeletonProps } from '../types.js'

const html = (props: SliderSkeletonProps = {}) => markup(<SliderSkeleton {...props} />)
/** The class lists of the box, of the control inside it and of the track inside that. */
const parts = (props: SliderSkeletonProps = {}) =>
  (/^<span class="([^"]*)"[^>]*><span class="([^"]*)"><span class="([^"]*)"><\/span><\/span><\/span>$/.exec(html(props)) ?? []).slice(1).map((list) => list.split(' '))
const box = (props: SliderSkeletonProps = {}) => parts(props)[0] ?? []
const control = (props: SliderSkeletonProps = {}) => parts(props)[1] ?? []
const track = (props: SliderSkeletonProps = {}) => parts(props)[2] ?? []

/** The real slider's class lists: the root group, the control, and the track, the first div inside the control. */
function real(props: Partial<SliderProps> = {}): [string[], string[], string[]] {
  const out = markup(<Slider aria-label="Volume" defaultValue={40} {...props} />)
  const divs = [...out.matchAll(/<div [^>]*>/g)].map(([tag]) => tag)
  const at = divs.findIndex((tag) => tag.includes('data-base-ui-swipe-ignore'))
  const classOf = (tag: string | undefined) => (attr(tag ?? '', 'class') ?? '').split(' ')
  return [classOf(divs.find((tag) => tag.includes('role="group"'))), classOf(divs[at]), classOf(divs[at + 1])]
}

/** Written out per size: the type step that sets the em of the width, the inline padding of the control, the track. */
const SIZE = {
  xs: ['text-xs', 'px-[max(calc(var(--tc-target-min,24px)/2),calc(var(--spacing-toggle-xs)/2+var(--tc-ring-offset)+var(--tc-ring-width)))]', 'h-1'],
  sm: ['text-sm', 'px-[max(calc(var(--tc-target-min,24px)/2),calc(var(--spacing-toggle-sm)/2+var(--tc-ring-offset)+var(--tc-ring-width)))]', 'h-1'],
  md: ['text-sm', 'px-[max(calc(var(--tc-target-min,24px)/2),calc(var(--spacing-toggle-md)/2+var(--tc-ring-offset)+var(--tc-ring-width)))]', 'h-1.5'],
  lg: ['text-base', 'px-[max(calc(var(--tc-target-min,24px)/2),calc(var(--spacing-toggle-lg)/2+var(--tc-ring-offset)+var(--tc-ring-width)))]', 'h-2'],
  xl: ['text-base', 'px-[max(calc(var(--tc-target-min,24px)/2),calc(var(--spacing-toggle-xl)/2+var(--tc-ring-offset)+var(--tc-ring-width)))]', 'h-2'],
} as const

const FLOOR = ['min-h-[var(--tc-target-min,24px)]', 'pointer-coarse:min-h-[var(--tc-target-coarse,44px)]']
const WIDTH = ['grid', 'w-fit', 'max-w-full', 'grid-cols-[minmax(0,var(--tc-input-width))]', 'pointer-coarse:text-[max(1rem,16px)]']

describe('SliderSkeleton', () => {
  it('is hidden from the accessibility tree, and a caller cannot un-hide it', () => {
    expect(attr(html(), 'aria-hidden')).toBe('true')
    expect(attr(html({ 'aria-hidden': false } as SliderSkeletonProps), 'aria-hidden')).toBe('true')
  })

  it('renders no input and no thumb, so nothing in it can take focus: a box around a control around an empty track', () => {
    expect(html()).toMatch(/^<span class="[^"<>]+" aria-hidden="true"><span class="[^"<>]+"><span class="[^"<>]+"><\/span><\/span><\/span>$/)
  })

  it('takes the width of an Input of its size, as the slider does, and the coarse type step that widens it', () => {
    const [realBox] = real()
    for (const name of WIDTH) {
      expect(box(), name).toContain(name)
      expect(realBox, name).toContain(name)
    }
  })

  it('keeps the target height of the control, 24 px and 44 under a finger, around the track', () => {
    const [, realControl] = real()
    for (const name of FLOOR) {
      expect(control(), name).toContain(name)
      expect(realControl, name).toContain(name)
    }
  })

  for (const size of ['xs', 'sm', 'md', 'lg', 'xl'] as const) {
    it(`${size} draws the width, the padded control and the track of an ${size} slider`, () => {
      const [realBox, realControl, realTrack] = real({ size })
      const [text, padding, height] = SIZE[size]
      expect(box({ size }), text).toContain(text)
      expect(realBox, text).toContain(text)
      expect(control({ size }), padding).toContain(padding)
      expect(realControl, padding).toContain(padding)
      expect(track({ size }), height).toContain(height)
      expect(realTrack, height).toContain(height)
    })
  }

  it('starts at md, the default size of the slider, and at its own width', () => {
    expect(html()).toBe(html({ size: 'md', fullWidth: false }))
  })

  it('emits no size class at custom, so the caller sizes it as they size the slider', () => {
    expect(box({ size: 'custom' }).filter((c) => /^text-/.test(c))).toEqual([])
    expect(control({ size: 'custom' }).filter((c) => c.includes('toggle'))).toEqual([])
    expect(track({ size: 'custom' }).filter((c) => /^h-/.test(c))).toEqual([])
  })

  it('with fullWidth fills its parent, as the slider does', () => {
    const [realBox] = real({ fullWidth: true })
    for (const name of ['w-full', 'grid-cols-1']) {
      expect(box({ fullWidth: true }), name).toContain(name)
      expect(realBox, name).toContain(name)
    }
    expect(box({ fullWidth: true })).not.toContain('w-fit')
  })

  it('wears the neutral fill on the track, keeps an edge in forced colours, and pulses unless the reader asked it not to', () => {
    // Without animate-pulse, the reduced-motion half passes vacuously: nothing would be animating.
    expect(track()).toEqual(expect.arrayContaining([
      'w-full', 'rounded-full', 'bg-neutral-soft', 'animate-pulse', 'motion-reduce:animate-none', 'forced-colors:outline-(length:--tc-line-width)',
    ]))
  })

  it('passes className, style and the rest to the outer span, as every component must', () => {
    const out = html({ className: 'ms-2', id: 's', style: { ['--tc-x' as string]: '1' } })
    expect(classList(out)).toContain('ms-2')
    expect(attr(out, 'id')).toBe('s')
    expect(attr(out, 'style')).toBe('--tc-x:1')
  })
})
