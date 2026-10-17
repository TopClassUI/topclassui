import { describe, expect, it } from 'vitest'

import { attr, classList, markup } from '#test/markup.js'
import { Combobox } from '../index.js'
import { ComboboxSkeleton } from '../skeleton.js'
import type { ComboboxProps, ComboboxSkeletonProps } from '../types.js'

const FRUITS = [{ value: 'apple', label: 'Apple' }, { value: 'banana', label: 'Banana' }]

const html = (props: ComboboxSkeletonProps = {}) => markup(<ComboboxSkeleton {...props} />)
/** The class list of the box that owns the width, then of the input's stand-in inside it. */
const box = (props: ComboboxSkeletonProps = {}) => classList(html(props))
const input = (props: ComboboxSkeletonProps = {}) => (/^<span class="[^"]*" aria-hidden="true"><span class="([^"]*)"/.exec(html(props))?.[1] ?? '').split(' ')
const real = (props: Pick<ComboboxProps, 'size' | 'fullWidth'> = {}) => markup(<Combobox aria-label="Fruit" items={FRUITS} {...props} />)
const realBox = (props: Pick<ComboboxProps, 'size' | 'fullWidth'> = {}) => classList(real(props))
const realInput = (props: Pick<ComboboxProps, 'size' | 'fullWidth'> = {}) => (/<input [^>]*role="combobox"[^>]*class="([^"]*)"/.exec(real(props))?.[1] ?? '').split(' ')

const COARSE_TEXT = 'pointer-coarse:text-[max(1rem,16px)]'

/** Written out: the type step of the box, which its width in em is measured against. */
const BOX_TEXT = { xs: 'text-xs', sm: 'text-sm', md: 'text-sm', lg: 'text-base', xl: 'text-base' } as const

/** Written out: the control height and the type step of the input, per size. */
const INPUT = {
  xs: ['h-control-xs', 'text-xs'],
  sm: ['h-control-sm', 'text-sm'],
  md: ['h-control-md', 'text-sm'],
  lg: ['h-control-lg', 'text-base'],
  xl: ['h-control-xl', 'text-base'],
} as const

const FLOOR = [
  'min-h-[var(--tc-target-min,24px)]', 'min-w-[var(--tc-target-min,24px)]',
  'pointer-coarse:min-h-[var(--tc-target-coarse,44px)]', 'pointer-coarse:min-w-[var(--tc-target-coarse,44px)]',
]

/** Written out: a percentage with a cap, the width a text field has until it is told to fill. */
const OWN_WIDTH = 'w-[min(100%,var(--tc-input-width))]'

const widthOf = (list: string[]) => list.filter((c) => c.startsWith('w-'))

describe('ComboboxSkeleton', () => {
  it('is hidden from the accessibility tree, and a caller cannot un-hide it', () => {
    expect(attr(html(), 'aria-hidden')).toBe('true')
    expect(attr(html({ 'aria-hidden': false } as ComboboxSkeletonProps), 'aria-hidden')).toBe('true')
  })

  it('renders no input, so nothing in it can take focus: a span around one span of a non-breaking space', () => {
    expect(html()).toMatch(/^<span class="[^"<>]+" aria-hidden="true"><span class="[^"<>]+">\xa0<\/span><\/span>$/)
  })

  for (const size of ['xs', 'sm', 'md', 'lg', 'xl'] as const) {
    it(`${size}: the box carries the type step of an ${size} Combobox, and its input the height and text`, () => {
      for (const name of [BOX_TEXT[size], COARSE_TEXT]) {
        expect(box({ size }), name).toContain(name)
        expect(realBox({ size }), name).toContain(name)
      }
      for (const name of [...INPUT[size], COARSE_TEXT]) {
        expect(input({ size }), name).toContain(name)
        expect(realInput({ size }), name).toContain(name)
      }
    })
  }

  it('starts at md, the default size of the Combobox', () => {
    expect(box()).toEqual(box({ size: 'md' }))
    expect(input()).toEqual(input({ size: 'md' }))
  })

  it('emits no size class at custom, in the box or the input, so the caller sizes it as they size the Combobox', () => {
    const sized = (list: string[]) => list.filter((c) => /^(h-|px-|text-|pointer-coarse:text-)/.test(c))
    expect([sized(box({ size: 'custom' })), sized(input({ size: 'custom' }))]).toEqual([[], []])
  })

  it('keeps the target floor of the input, 24 px and 44 under a finger', () => {
    for (const name of FLOOR) {
      expect(input(), name).toContain(name)
      expect(realInput(), name).toContain(name)
    }
  })

  it('has the border width of the input in no colour, fills the box as the input does, and centres one line', () => {
    expect(input()).toEqual(expect.arrayContaining([
      'border-(length:--tc-line-width)', 'border-transparent', 'w-full', 'max-w-full', 'inline-flex', 'items-center',
    ]))
    expect(realInput()).toEqual(expect.arrayContaining(['border-(length:--tc-line-width)', 'w-full']))
  })

  it('wears the control radius and the neutral fill, and pulses unless the reader asked it not to', () => {
    // Without animate-pulse, the reduced-motion half passes vacuously: nothing would be animating.
    expect(input()).toEqual(expect.arrayContaining(['rounded-control', 'bg-neutral-soft', 'animate-pulse', 'motion-reduce:animate-none']))
  })

  it('passes className, style and the rest to the input, where the Combobox puts them, and nothing to the box', () => {
    const out = html({ className: 'ms-2', id: 's', style: { ['--tc-x' as string]: '1' }, 'data-testid': 'x' } as ComboboxSkeletonProps)
    expect(out).toMatch(/^<span class="[^"]*" aria-hidden="true"><span class="[^"]* ms-2" id="s" style="--tc-x:1" data-testid="x">/)
    expect(box({ className: 'ms-2' })).not.toContain('ms-2')
  })
})

describe('the box is as wide as the Combobox it stands in for', () => {
  it('takes the own width of a text field by default, in a box that sits in the line', () => {
    expect(widthOf(box())).toEqual([OWN_WIDTH])
    expect(widthOf(realBox())).toEqual([OWN_WIDTH])
    expect(box()).toEqual(expect.arrayContaining(['relative', 'inline-block', 'max-w-full', 'align-middle']))
  })

  it('fills its container with fullWidth, as the Combobox does', () => {
    expect(widthOf(box({ fullWidth: true }))).toEqual(['w-full'])
    expect(widthOf(realBox({ fullWidth: true }))).toEqual(['w-full'])
  })
})
