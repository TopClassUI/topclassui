import { describe, expect, it } from 'vitest'

import { clamp, clampToStep } from './clamp.js'

describe('clamp', () => {
  it('keeps a value inside the range', () => {
    expect(clamp(5, 0, 10)).toBe(5)
    expect(clamp(-1, 0, 10)).toBe(0)
    expect(clamp(11, 0, 10)).toBe(10)
  })

  it('returns min for NaN, because a slider must still have a position', () => {
    expect(clamp(Number.NaN, 2, 10)).toBe(2)
  })

  it('clamps the infinities to the ends', () => {
    expect(clamp(Number.POSITIVE_INFINITY, 0, 10)).toBe(10)
    expect(clamp(Number.NEGATIVE_INFINITY, 0, 10)).toBe(0)
  })

  it('returns min when the range is inverted, rather than an impossible value', () => {
    expect(clamp(5, 10, 0)).toBe(10)
  })

  it('handles a zero-width range', () => {
    expect(clamp(5, 3, 3)).toBe(3)
  })
})

describe('clampToStep', () => {
  it('snaps to the nearest step measured from min', () => {
    expect(clampToStep(7, 0, 10, 5)).toBe(5)
    expect(clampToStep(8, 0, 10, 5)).toBe(10)
    expect(clampToStep(4, 1, 10, 3)).toBe(4)
  })

  it('does not drift, so a stepped value is not 0.30000000000000004', () => {
    expect(clampToStep(0.3, 0.1, 1, 0.1)).toBe(0.3)
    expect(clampToStep(0.7, 0.1, 1, 0.1)).toBe(0.7)
    expect(clampToStep(2.9, 0, 10, 0.1)).toBe(2.9)
  })

  it('handles a fractional min as well as a fractional step', () => {
    expect(clampToStep(0.25, 0.05, 1, 0.1)).toBe(0.25)
  })

  it('ignores a step of zero or less, which would divide by zero', () => {
    expect(clampToStep(7, 0, 10, 0)).toBe(7)
    expect(clampToStep(7, 0, 10, -1)).toBe(7)
  })

  it('ignores a step that is not finite', () => {
    expect(clampToStep(7, 0, 10, Number.POSITIVE_INFINITY)).toBe(7)
    expect(clampToStep(7, 0, 10, Number.NaN)).toBe(7)
  })

  it('never leaves the range, even when the last step would overshoot max', () => {
    expect(clampToStep(10, 0, 10, 3)).toBe(9)
    expect(clampToStep(100, 0, 10, 3)).toBe(9)
    expect(clampToStep(-100, 0, 10, 3)).toBe(0)
  })

  it('returns min for NaN, matching clamp', () => {
    expect(clampToStep(Number.NaN, 2, 10, 2)).toBe(2)
  })
})
