import { describe, expect, it } from 'vitest'

import { attr, classList, markup } from '#test/markup.js'
import { INPUT_SIZES } from '../constants.js'
import { Input } from '../index.js'
import { InputSkeleton } from '../skeleton.js'

const classes = (...args: Parameters<typeof InputSkeleton>) =>
  classList(markup(<InputSkeleton {...args[0]} />))

const heightOf = (list: string[]) => list.filter((c) => c.startsWith('h-'))

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

  it('is always full width, as a field in a form is', () => {
    const list = classes({})
    expect(list).toContain('block')
    expect(list).toContain('w-full')
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

  it('renders no input, so nothing in it can take focus', () => {
    expect(markup(<InputSkeleton />)).toMatch(/^<span [^<>]*><\/span>$/)
  })

  it('passes className, style and the rest through, as every component must', () => {
    const html = markup(<InputSkeleton className="mt-4 w-40" id="s" data-testid="x" />)
    expect(classList(html)).toContain('mt-4')
    expect(classList(html)).toContain('w-40')
    expect(classList(html)).not.toContain('w-full')
    expect(attr(html, 'id')).toBe('s')
    expect(attr(html, 'data-testid')).toBe('x')
  })
})
