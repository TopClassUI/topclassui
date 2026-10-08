import { describe, expect, it } from 'vitest'

import { attr, markup } from '#test/markup.js'
import { Progress } from '../index.js'
import type { ProgressProps } from '../types.js'

const html = (value: number) => markup(<Progress aria-label="Upload" value={value} />)

/** value given, aria-valuenow announced, and the style that sizes the bar: written out. */
const CASES = [
  [0, '0', '--tc-progress-value:0%'],
  [15, '15', '--tc-progress-value:15%'],
  [50, '50', '--tc-progress-value:50%'],
  [72, '72', '--tc-progress-value:72%'],
  [100, '100', '--tc-progress-value:100%'],
  [33.3, '33.3', '--tc-progress-value:33.3%'],
  [-20, '0', '--tc-progress-value:0%'],
  [150, '100', '--tc-progress-value:100%'],
  [100.5, '100', '--tc-progress-value:100%'],
  [Number.POSITIVE_INFINITY, '100', '--tc-progress-value:100%'],
  [Number.NEGATIVE_INFINITY, '0', '--tc-progress-value:0%'],
  [Number.NaN, '0', '--tc-progress-value:0%'],
] as const

describe('value is clamped to 0-100 before it reaches ARIA or the bar (R-5.7-7)', () => {
  for (const [value, now, style] of CASES) {
    it(`${String(value)} announces ${now}`, () => {
      expect(attr(html(value), 'aria-valuenow'), String(value)).toBe(now)
    })

    it(`${String(value)} sizes the bar at ${now}%`, () => {
      expect(attr(html(value), 'style'), String(value)).toBe(style)
    })
  }

  it('starts at 0 when no value is given, or an explicit undefined', () => {
    expect(attr(markup(<Progress aria-label="Upload" />), 'aria-valuenow')).toBe('0')
    expect(attr(markup(<Progress aria-label="Upload" value={undefined} />), 'aria-valuenow')).toBe('0')
  })
})

describe('no caller value gets past the clamp', () => {
  it('reads aria-valuenow={150} back as the clamped value, because Progress writes it last', () => {
    expect(attr(markup(<Progress aria-label="Upload" value={150} aria-valuenow={150} />), 'aria-valuenow')).toBe('100')
    expect(attr(markup(<Progress aria-label="Upload" value={40} aria-valuenow={150} />), 'aria-valuenow')).toBe('40')
  })

  it('keeps its own range when a caller passes another', () => {
    const html_ = markup(<Progress aria-label="Upload" value={40} aria-valuemin={50} aria-valuemax={200} />)
    expect(attr(html_, 'aria-valuemin')).toBe('0')
    expect(attr(html_, 'aria-valuemax')).toBe('100')
  })

  it('stays a progressbar when a JavaScript caller passes a role the type refuses', () => {
    const forced = { 'aria-label': 'Upload', role: 'presentation' } as unknown as ProgressProps
    expect(attr(markup(<Progress {...forced} />), 'role')).toBe('progressbar')
  })

  it('sets the variable after the caller style, so a style cannot widen the bar past the track', () => {
    const html_ = markup(<Progress aria-label="Upload" value={40} style={{ '--tc-progress-value': '150%' }} />)
    expect(attr(html_, 'style')).toBe('--tc-progress-value:40%')
  })
})

describe('indeterminate', () => {
  it('announces no value, because the wait has none', () => {
    expect(markup(<Progress aria-label="Loading" indeterminate />)).not.toContain('aria-valuenow')
  })

  it('announces no value even when also given one, or passed one directly', () => {
    expect(markup(<Progress aria-label="Loading" indeterminate value={60} />)).not.toContain('aria-valuenow')
    expect(markup(<Progress aria-label="Loading" indeterminate aria-valuenow={60} />)).not.toContain('aria-valuenow')
  })

  it('keeps its range, which a screen reader still reads', () => {
    const html_ = markup(<Progress aria-label="Loading" indeterminate />)
    expect(attr(html_, 'aria-valuemin')).toBe('0')
    expect(attr(html_, 'aria-valuemax')).toBe('100')
  })
})
