import { describe, expect, it } from 'vitest'

import { attr, classList, markup } from '#test/markup.js'
import { INPUT_SIZES } from '../constants.js'
import { Input } from '../index.js'
import { InputSkeleton } from '../skeleton.js'

const classes = (...args: Parameters<typeof InputSkeleton>) =>
  classList(markup(<InputSkeleton {...args[0]} />))

const heightOf = (list: string[]) => list.filter((c) => c.startsWith('h-'))
const widthOf = (list: string[]) => list.filter((c) => c.startsWith('w-'))

/** Written out: a percentage with a cap, the width a text field has until it is told to fill. */
const OWN_WIDTH = 'w-[min(100%,var(--tc-input-width))]'

describe('InputSkeleton', () => {
  it('is hidden from the accessibility tree, and a caller cannot unhide it', () => {
    expect(markup(<InputSkeleton />)).toContain('aria-hidden="true"')
    expect(markup(<InputSkeleton {...{ 'aria-hidden': false }} />)).toContain('aria-hidden="true"')
  })

  /** Written out, so one height repeated across the scale is a failure. */
  const HEIGHT = {
    xs: 'h-control-xs', sm: 'h-control-sm', md: 'h-control-md', lg: 'h-control-lg', xl: 'h-control-xl',
  } as const

  for (const size of INPUT_SIZES) {
    it(`${size} is the control height of the same size`, () => {
      expect(heightOf(classes({ size })), size).toEqual(size === 'custom' ? [] : [HEIGHT[size]])
    })

    it(`${size} reserves the height the real Input has, so nothing shifts when it loads`, () => {
      const real = heightOf(classList(markup(<Input size={size} aria-label="Email" />)))
      expect(heightOf(classes({ size })), size).toEqual(real)
    })
  }

  it('starts at md, the default size of the control it stands in for', () => {
    expect(heightOf(classes({}))).toEqual(['h-control-md'])
  })

  it('wears the control radius and the neutral soft fill', () => {
    const list = classes({})
    expect(list).toContain('rounded-control')
    expect(list).toContain('bg-neutral-soft')
  })

  it('pulses, and stops pulsing for a reader who asked it to', () => {
    // Without the first, the second passes vacuously: nothing is animating.
    expect(classes({})).toContain('animate-pulse')
    expect(classes({})).toContain('motion-reduce:animate-none')
  })

  it('renders no input, so nothing in it can take focus: one span around a non-breaking space', () => {
    expect(markup(<InputSkeleton />)).toMatch(/^<span class="[^"<>]+" aria-hidden="true">\xa0<\/span>$/)
  })

  it('passes className, style and the rest through, as every component must', () => {
    const html = markup(<InputSkeleton className="mt-4 w-40" id="s" data-testid="x" />)
    expect(classList(html)).toContain('mt-4')
    expect(widthOf(classList(html))).toEqual(['w-40'])
    expect(attr(html, 'id')).toBe('s')
    expect(attr(html, 'data-testid')).toBe('x')
  })
})

describe('the skeleton is as wide as the field it stands in for', () => {
  it('takes the own width of a text field by default, not the whole container', () => {
    expect(widthOf(classes({}))).toEqual([OWN_WIDTH])
    expect(widthOf(classList(markup(<Input aria-label="Email" />)))).toEqual([OWN_WIDTH])
  })

  it('fills the container with fullWidth, as the field does', () => {
    expect(widthOf(classes({ fullWidth: true }))).toEqual(['w-full'])
    expect(widthOf(classList(markup(<Input fullWidth aria-label="Email" />)))).toEqual(['w-full'])
  })

  /** Written out: the own width is 13.8em, so it is measured against the type step of the size. */
  const TYPE_STEP = {
    xs: ['text-xs', 'px-pad-x-xs'],
    sm: ['text-sm', 'px-pad-x-sm'],
    md: ['text-sm', 'px-pad-x-md'],
    lg: ['text-base', 'px-pad-x-lg'],
    xl: ['text-base', 'px-pad-x-xl'],
  } as const

  for (const size of ['xs', 'sm', 'md', 'lg', 'xl'] as const) {
    it(`${size} carries the type step, the padding and the 16px touch text of an ${size} field`, () => {
      const real = classList(markup(<Input size={size} aria-label="Email" />))
      for (const name of [...TYPE_STEP[size], 'pointer-coarse:text-[max(1rem,16px)]']) {
        expect(classes({ size }), name).toContain(name)
        expect(real, name).toContain(name)
      }
    })
  }

  it('emits no size class at custom, so className sizes it as it sizes the field', () => {
    const list = classes({ size: 'custom' })
    expect(list.filter((c) => /^(h-|px-|text-|pointer-coarse:text-)/.test(c))).toEqual([])
  })

  it('never outgrows its container, whatever width a caller gives it', () => {
    expect(classes({ className: 'w-96' })).toContain('max-w-full')
  })
})

describe('the skeleton has the box model of the field', () => {
  /** Written out from R-5.6-2: on a touch screen an xs, sm or md field is 44px tall, not 28, 32 or 40. */
  const FLOOR = [
    'min-h-[var(--tc-target-min,24px)]', 'min-w-[var(--tc-target-min,24px)]',
    'pointer-coarse:min-h-[var(--tc-target-coarse,44px)]', 'pointer-coarse:min-w-[var(--tc-target-coarse,44px)]',
  ]

  it('keeps the target floor, so it is as tall as the field under a finger', () => {
    const real = classList(markup(<Input aria-label="Email" />))
    for (const name of FLOOR) {
      expect(classes({}), name).toContain(name)
      expect(real, name).toContain(name)
    }
  })

  it('has the border width of the field in no colour, so a flex row shrinks the two alike', () => {
    expect(classes({})).toContain('border-(length:--tc-line-width)')
    expect(classes({})).toContain('border-transparent')
    expect(classList(markup(<Input aria-label="Email" />))).toContain('border-(length:--tc-line-width)')
  })

  it('sits in the line and centres its one line, so it rests on the baseline the text of a field does', () => {
    expect(classes({})).toContain('inline-flex')
    expect(classes({})).toContain('items-center')
    expect(classes({}).filter((c) => /^(block|inline-block|align-)/.test(c))).toEqual([])
  })
})
