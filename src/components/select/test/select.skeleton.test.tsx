import { describe, expect, it } from 'vitest'

import { attr, classList, markup } from '#test/markup.js'
import { Select } from '../index.js'
import { SelectSkeleton } from '../skeleton.js'
import type { SelectProps, SelectSkeletonProps } from '../types.js'

const PLANS = [{ value: 'free', label: 'Free' }, { value: 'pro', label: 'Pro' }]

const html = (props: SelectSkeletonProps = {}) => markup(<SelectSkeleton {...props} />)
/** The class list of the box that owns the width, then of the trigger's stand-in inside it. */
const box = (props: SelectSkeletonProps = {}) => classList(html(props))
const trigger = (props: SelectSkeletonProps = {}) => (/^<span class="[^"]*" aria-hidden="true"><span class="([^"]*)"/.exec(html(props))?.[1] ?? '').split(' ')
const real = (props: Pick<SelectProps, 'size' | 'fullWidth'> = {}) => markup(<Select aria-label="Plan" items={PLANS} {...props} />)
const realBox = (props: Pick<SelectProps, 'size' | 'fullWidth'> = {}) => classList(real(props))
const realTrigger = (props: Pick<SelectProps, 'size' | 'fullWidth'> = {}) => (/<button [^>]*class="([^"]*)"/.exec(real(props))?.[1] ?? '').split(' ')

const COARSE_TEXT = 'pointer-coarse:text-[max(1rem,16px)]'

/** Written out: the type step of the box, which its width in em is measured against. */
const BOX_TEXT = { xs: 'text-xs', sm: 'text-sm', md: 'text-sm', lg: 'text-base', xl: 'text-base' } as const

/** Written out: the control height, the inline padding and the type step of the trigger, per size. */
const TRIGGER = {
  xs: ['h-control-xs', 'px-pad-x-xs', 'text-xs'],
  sm: ['h-control-sm', 'px-pad-x-sm', 'text-sm'],
  md: ['h-control-md', 'px-pad-x-md', 'text-sm'],
  lg: ['h-control-lg', 'px-pad-x-lg', 'text-base'],
  xl: ['h-control-xl', 'px-pad-x-xl', 'text-base'],
} as const

const FLOOR = [
  'min-h-[var(--tc-target-min,24px)]', 'min-w-[var(--tc-target-min,24px)]',
  'pointer-coarse:min-h-[var(--tc-target-coarse,44px)]', 'pointer-coarse:min-w-[var(--tc-target-coarse,44px)]',
]

/** Written out: one column that grows to an Input's width, in a box as wide as its content. */
const OWN_WIDTH = ['inline-grid', 'w-fit', 'max-w-full', 'grid-cols-[minmax(0,var(--tc-input-width))]']

const widthOf = (list: string[]) => list.filter((c) => c.startsWith('w-') || c.startsWith('grid-cols-'))

describe('SelectSkeleton', () => {
  it('is hidden from the accessibility tree, and a caller cannot un-hide it', () => {
    expect(attr(html(), 'aria-hidden')).toBe('true')
    expect(attr(html({ 'aria-hidden': false } as SelectSkeletonProps), 'aria-hidden')).toBe('true')
  })

  it('renders no button and no input, so nothing in it can take focus: a span around one span of a non-breaking space', () => {
    expect(html()).toMatch(/^<span class="[^"<>]+" aria-hidden="true"><span class="[^"<>]+">\xa0<\/span><\/span>$/)
  })

  for (const size of ['xs', 'sm', 'md', 'lg', 'xl'] as const) {
    it(`${size}: the box carries the type step of an ${size} Select, and its trigger the height, padding and text`, () => {
      for (const name of [BOX_TEXT[size], COARSE_TEXT]) {
        expect(box({ size }), name).toContain(name)
        expect(realBox({ size }), name).toContain(name)
      }
      for (const name of [...TRIGGER[size], COARSE_TEXT]) {
        expect(trigger({ size }), name).toContain(name)
        expect(realTrigger({ size }), name).toContain(name)
      }
    })
  }

  it('starts at md, the default size of the Select', () => {
    expect(box()).toEqual(box({ size: 'md' }))
    expect(trigger()).toEqual(trigger({ size: 'md' }))
  })

  it('emits no size class at custom, in the box or the trigger, so the caller sizes it as they size the Select', () => {
    const sized = (list: string[]) => list.filter((c) => /^(h-|px-|text-|pointer-coarse:text-)/.test(c))
    expect([sized(box({ size: 'custom' })), sized(trigger({ size: 'custom' }))]).toEqual([[], []])
  })

  it('keeps the target floor of the trigger, 24 px and 44 under a finger', () => {
    for (const name of FLOOR) {
      expect(trigger(), name).toContain(name)
      expect(realTrigger(), name).toContain(name)
    }
  })

  it('has the border width of the trigger in no colour, and fills the box as the trigger does', () => {
    expect(trigger()).toEqual(expect.arrayContaining(['border-(length:--tc-line-width)', 'border-transparent', 'w-full', 'max-w-full']))
    expect(realTrigger()).toEqual(expect.arrayContaining(['border-(length:--tc-line-width)', 'w-full']))
  })

  it('wears the control radius and the neutral fill, and pulses unless the reader asked it not to', () => {
    // Without animate-pulse, the reduced-motion half passes vacuously: nothing would be animating.
    expect(trigger()).toEqual(expect.arrayContaining(['rounded-control', 'bg-neutral-soft', 'animate-pulse', 'motion-reduce:animate-none']))
  })

  it('passes className, style and the rest to the trigger, where the Select puts them, and nothing to the box', () => {
    const out = html({ className: 'ms-2', id: 's', style: { ['--tc-x' as string]: '1' }, 'data-testid': 'x' } as SelectSkeletonProps)
    expect(out).toMatch(/^<span class="[^"]*" aria-hidden="true"><span class="[^"]* ms-2" id="s" style="--tc-x:1" data-testid="x">/)
    expect(box({ className: 'ms-2' })).not.toContain('ms-2')
  })
})

describe('the box is as wide as the Select it stands in for', () => {
  it('takes the width of an Input by default', () => {
    for (const name of OWN_WIDTH) {
      expect(box(), name).toContain(name)
      expect(realBox(), name).toContain(name)
    }
  })

  it('fills its container with fullWidth, as the Select does', () => {
    expect(widthOf(box({ fullWidth: true }))).toEqual(['w-full', 'grid-cols-1'])
    expect(widthOf(realBox({ fullWidth: true }))).toEqual(['w-full', 'grid-cols-1'])
  })
})
