import { describe, expect, it } from 'vitest'

import { attr, markup } from '#test/markup.js'
import { Meter } from '../index.js'
import type { MeterDesignProps, MeterProps } from '../types.js'

const html = (props: MeterDesignProps) => markup(<Meter aria-label="Disk" {...props} />)

/** What a tag announces and how wide its bar is: the four attributes, read back. */
const read = (props: MeterDesignProps) => {
  const tag = html(props)
  return [attr(tag, 'aria-valuemin'), attr(tag, 'aria-valuemax'), attr(tag, 'aria-valuenow'), attr(tag, 'style')]
}

/** The props given, then min, max and now as announced and the style that sizes the bar: written out. */
const CASES = [
  ['150 of 0 to 100', { value: 150 }, ['0', '100', '100', '--tc-meter-value:100%']],
  ['-5 of 0 to 100', { value: -5 }, ['0', '100', '0', '--tc-meter-value:0%']],
  ['min above max', { min: 10, max: 5 }, ['10', '10', '10', '--tc-meter-value:100%']],
  ['min above max, with a value', { min: 10, max: 5, value: 7 }, ['10', '10', '10', '--tc-meter-value:100%']],
  ['512 of 0 to 1024', { min: 0, max: 1024, value: 512 }, ['0', '1024', '512', '--tc-meter-value:50%']],
  ['150 of 100 to 200', { min: 100, max: 200, value: 150 }, ['100', '200', '150', '--tc-meter-value:50%']],
  ['NaN', { value: Number.NaN }, ['0', '100', '0', '--tc-meter-value:0%']],
  ['NaN in a range of its own', { min: 20, max: 40, value: Number.NaN }, ['20', '40', '20', '--tc-meter-value:0%']],
  ['a range below zero', { min: -40, max: -20, value: -30 }, ['-40', '-20', '-30', '--tc-meter-value:50%']],
  ['a range across zero', { min: -50, max: 50, value: 25 }, ['-50', '50', '25', '--tc-meter-value:75%']],
  ['a fraction', { min: 0, max: 1, value: 0.25 }, ['0', '1', '0.25', '--tc-meter-value:25%']],
  ['at its minimum', { min: 100, max: 200, value: 100 }, ['100', '200', '100', '--tc-meter-value:0%']],
  ['at its maximum', { min: 100, max: 200, value: 200 }, ['100', '200', '200', '--tc-meter-value:100%']],
  ['infinity', { value: Number.POSITIVE_INFINITY }, ['0', '100', '100', '--tc-meter-value:100%']],
  ['minus infinity', { value: Number.NEGATIVE_INFINITY }, ['0', '100', '0', '--tc-meter-value:0%']],
  ['a stray 1e308 max', { max: 1e308, value: 5e14 }, ['0', '1000000000000000', '500000000000000', '--tc-meter-value:50%']],
  ['a stray -1e308 min', { min: -1e308, max: 0, value: -5e14 }, ['-1000000000000000', '0', '-500000000000000', '--tc-meter-value:50%']],
  ['an infinite range', { min: Number.NEGATIVE_INFINITY, max: Number.POSITIVE_INFINITY, value: 0 }, ['-1000000000000000', '1000000000000000', '0', '--tc-meter-value:50%']],
  ['a NaN max', { max: Number.NaN, value: 50 }, ['0', '0', '0', '--tc-meter-value:100%']],
] as const

describe('the range and the value are clamped before they reach ARIA or the bar (R-5.7-7)', () => {
  for (const [name, props, expected] of CASES) {
    it(`${name} announces ${expected[2]} of ${expected[0]} to ${expected[1]} and draws ${expected[3]}`, () => {
      expect(read(props), name).toEqual(expected)
    })
  }

  it('starts at 0 of 0 to 100 when nothing is given, or an explicit undefined', () => {
    expect(read({})).toEqual(['0', '100', '0', '--tc-meter-value:0%'])
    expect(read({ value: undefined, min: undefined, max: undefined })).toEqual(['0', '100', '0', '--tc-meter-value:0%'])
  })
})

describe('no caller value gets past the clamp', () => {
  it('reads aria-valuenow={150} back as the clamped value, because Meter writes it last', () => {
    expect(attr(markup(<Meter aria-label="Disk" value={150} aria-valuenow={150} />), 'aria-valuenow')).toBe('100')
    expect(attr(markup(<Meter aria-label="Disk" value={40} aria-valuenow={150} />), 'aria-valuenow')).toBe('40')
  })

  it('keeps its own range when a caller passes another as an attribute', () => {
    const html_ = markup(<Meter aria-label="Disk" value={40} aria-valuemin={50} aria-valuemax={200} />)
    expect(attr(html_, 'aria-valuemin')).toBe('0')
    expect(attr(html_, 'aria-valuemax')).toBe('100')
  })

  it('stays a meter when a JavaScript caller passes a role the type refuses', () => {
    const forced = { 'aria-label': 'Disk', role: 'presentation' } as unknown as MeterProps
    expect(attr(markup(<Meter {...forced} />), 'role')).toBe('meter')
  })

  it('sets the variable after the caller style, so a style cannot widen the bar past the track', () => {
    const html_ = markup(<Meter aria-label="Disk" value={40} style={{ '--tc-meter-value': '150%' }} />)
    expect(attr(html_, 'style')).toBe('--tc-meter-value:40%')
  })
})
