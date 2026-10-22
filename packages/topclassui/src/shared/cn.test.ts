import { describe, expect, it } from 'vitest'

import { clamp, clampToStep } from './clamp.js'
import { cn } from './cn.js'
import { ICON_SIZE, resolveIconSize, SIZES } from './contracts/size.js'

describe('cn', () => {
  it('keeps only the last of two conflicting control heights', () => {
    expect(cn('h-control-md', 'h-control-sm')).toBe('h-control-sm')
  })

  it('keeps only the last of two conflicting radii', () => {
    expect(cn('rounded-control', 'rounded-box')).toBe('rounded-box')
  })

  it('resolves the other custom spacing scales', () => {
    expect(cn('size-toggle-md', 'size-toggle-lg')).toBe('size-toggle-lg')
    expect(cn('size-knob-md', 'size-knob-lg')).toBe('size-knob-lg')
    expect(cn('px-pad-x-sm', 'px-pad-x-xl')).toBe('px-pad-x-xl')
  })

  it('still resolves the ordinary Tailwind conflicts', () => {
    expect(cn('bg-surface', 'bg-page')).toBe('bg-page')
    expect(cn('p-2', 'p-4')).toBe('p-4')
  })

  it('keeps classes that do not conflict', () => {
    expect(cn('inline-flex', 'items-center', 'gap-2')).toBe('inline-flex items-center gap-2')
  })

  it('the consumer className is passed last, so it wins', () => {
    const ours = 'h-control-md bg-primary-solid'
    expect(cn(ours, 'h-control-xl')).toBe('bg-primary-solid h-control-xl')
  })

  it('ignores false, null and undefined', () => {
    expect(cn('flex', false, null, undefined, 'gap-2')).toBe('flex gap-2')
  })

  it('does not merge across different variants', () => {
    expect(cn('hover:bg-surface', 'bg-page')).toBe('hover:bg-surface bg-page')
  })
})

describe('size contract', () => {
  it('has the six names of R-5.7-2 in order', () => {
    expect(SIZES).toEqual(['xs', 'sm', 'md', 'lg', 'xl', 'custom'])
  })

  it('maps the five icon names to their pixel values', () => {
    expect(ICON_SIZE).toEqual({ xs: 16, sm: 20, md: 24, lg: 32, xl: 40 })
  })

  it('resolves a name to pixels and passes any CSS length through', () => {
    expect(resolveIconSize('md')).toBe(24)
    expect(resolveIconSize('1em')).toBe('1em')
    expect(resolveIconSize('1.5rem')).toBe('1.5rem')
    expect(resolveIconSize(18)).toBe(18)
  })

  it('does not treat custom as an icon size', () => {
    expect(resolveIconSize('custom')).toBe('custom')
  })
})

describe('clamp', () => {
  it('holds a value inside its range', () => {
    expect(clamp(5, 0, 10)).toBe(5)
    expect(clamp(-1, 0, 10)).toBe(0)
    expect(clamp(99, 0, 10)).toBe(10)
  })

  it('returns min when the range is inverted or the value is not a number', () => {
    expect(clamp(5, 10, 0)).toBe(10)
    expect(clamp(Number.NaN, 2, 8)).toBe(2)
  })

  it('snaps to the nearest step from min', () => {
    expect(clampToStep(7, 0, 10, 5)).toBe(5)
    expect(clampToStep(8, 0, 10, 5)).toBe(10)
    expect(clampToStep(2.6, 0, 10, 0.5)).toBe(2.5)
  })

  it('ignores a step of zero or less', () => {
    expect(clampToStep(7, 0, 10, 0)).toBe(7)
    expect(clampToStep(7, 0, 10, -1)).toBe(7)
  })
})
