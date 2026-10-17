import { describe, expect, it } from 'vitest'

import { attr, classList, markup } from '#test/markup.js'
import { NumberField } from '../index.js'
import { NumberFieldSkeleton } from '../skeleton.js'
import type { NumberFieldSkeletonProps } from '../types.js'

const html = (props: NumberFieldSkeletonProps = {}) => markup(<NumberFieldSkeleton {...props} />)
/** The class list of the outer span, which holds the width, then of the box inside it. */
const outer = (props: NumberFieldSkeletonProps = {}) => classList(html(props))
const box = (props: NumberFieldSkeletonProps = {}) => (/<span class="([^"]*)"><\/span>/.exec(html(props))?.[1] ?? '').split(' ')
/** The real field: its root, then the group that draws its box. */
const realRoot = (size: NumberFieldSkeletonProps['size'] = 'md', fullWidth = false) =>
  classList(markup(<NumberField size={size} fullWidth={fullWidth} aria-label="Guests" />))
const realGroup = (size: NumberFieldSkeletonProps['size'] = 'md') =>
  (/<div role="group" class="([^"]*)"/.exec(markup(<NumberField size={size} aria-label="Guests" />))?.[1] ?? '').split(' ')

/** Written out: the control height of each size, and the type step its width in em is measured against. */
const HEIGHT = { xs: 'h-control-xs', sm: 'h-control-sm', md: 'h-control-md', lg: 'h-control-lg', xl: 'h-control-xl' } as const
const TYPE_STEP = { xs: 'text-xs', sm: 'text-sm', md: 'text-sm', lg: 'text-base', xl: 'text-base' } as const
const COARSE_TEXT = 'pointer-coarse:text-[max(1rem,16px)]'

/** Written out: one column that may shrink to nothing and grows to an Input, in a box as wide as that column. */
const HOLDER = ['inline-grid', 'align-middle', 'w-fit', 'max-w-full', 'grid-cols-[minmax(0,var(--tc-input-width))]']

const FLOOR = ['min-h-[var(--tc-target-min,24px)]', 'pointer-coarse:min-h-[var(--tc-target-coarse,44px)]']

describe('NumberFieldSkeleton', () => {
  it('is hidden from the accessibility tree, and a caller cannot unhide it', () => {
    expect(attr(html(), 'aria-hidden')).toBe('true')
    expect(attr(html({ 'aria-hidden': false } as NumberFieldSkeletonProps), 'aria-hidden')).toBe('true')
  })

  it('renders no input and no button, so nothing in it can take focus: a span around one empty span', () => {
    expect(html()).toMatch(/^<span class="[^"<>]+" aria-hidden="true"><span class="[^"<>]+"><\/span><\/span>$/)
  })

  for (const size of ['xs', 'sm', 'md', 'lg', 'xl'] as const) {
    it(`${size} is the height of an ${size} field, and the type step its width is measured in`, () => {
      expect(box({ size }).filter((c) => c.startsWith('h-'))).toEqual([HEIGHT[size]])
      expect(realGroup(size)).toContain(HEIGHT[size])
      for (const name of [TYPE_STEP[size], COARSE_TEXT]) {
        expect(outer({ size }), name).toContain(name)
        expect(realRoot(size), name).toContain(name)
      }
    })
  }

  it('starts at md, the default size of the field', () => {
    expect(box().filter((c) => c.startsWith('h-'))).toEqual(['h-control-md'])
    expect(outer()).toContain('text-sm')
  })

  it('emits no size class at custom, so the caller sizes it as they size the field', () => {
    expect(box({ size: 'custom' }).filter((c) => c.startsWith('h-'))).toEqual([])
    expect(outer({ size: 'custom' }).filter((c) => /^(text-|pointer-coarse:text-)/.test(c))).toEqual([])
  })

  it('keeps the floor of the field, 24 px and 44 under a finger, on the box', () => {
    for (const name of FLOOR) {
      expect(box(), name).toContain(name)
      expect(realGroup(), name).toContain(name)
    }
  })

  it('wears the radius of the field and the neutral fill, keeps an edge in forced colours, and pulses unless asked not to', () => {
    // Without animate-pulse, the reduced-motion half passes vacuously: nothing would be animating.
    expect(box()).toEqual(expect.arrayContaining([
      'rounded-control', 'bg-neutral-soft', 'animate-pulse', 'motion-reduce:animate-none', 'forced-colors:outline-(length:--tc-line-width)',
    ]))
    expect(realGroup()).toContain('rounded-control')
  })

  it('passes className, id, style and the rest to the outer span, as every component must', () => {
    const out = html({ className: 'ms-2', id: 's', style: { ['--tc-x' as string]: '1' }, 'data-testid': 'x' } as NumberFieldSkeletonProps)
    expect(classList(out)).toContain('ms-2')
    expect(attr(out, 'id')).toBe('s')
    expect(attr(out, 'style')).toBe('--tc-x:1')
    expect(attr(out, 'data-testid')).toBe('x')
  })
})

describe('the skeleton is as wide as the field it stands in for', () => {
  it('holds the width as the root of the field does: an Input wide, never past its parent', () => {
    for (const name of HOLDER) {
      expect(outer(), name).toContain(name)
      expect(realRoot(), name).toContain(name)
    }
    expect(box()).toEqual(expect.arrayContaining(['w-full', 'max-w-full']))
  })

  it('fills its container with fullWidth, as the field does', () => {
    for (const list of [outer({ fullWidth: true }), realRoot('md', true)]) {
      expect(list).toEqual(expect.arrayContaining(['w-full', 'grid-cols-1']))
      expect(list.filter((c) => c === 'w-fit' || c.startsWith('grid-cols-['))).toEqual([])
    }
  })
})
