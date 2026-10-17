import { describe, expect, it } from 'vitest'

import { meterPercent, resolveMeterRange } from '../lib.js'

describe('meterPercent', () => {
  /** value, min, max, then the share of the track: written out. */
  const CASES = [
    [0, 0, 100, 0],
    [60, 0, 100, 60],
    [100, 0, 100, 100],
    [512, 0, 1024, 50],
    [150, 100, 200, 50],
    [100, 100, 200, 0],
    [-30, -40, -20, 50],
    [0.25, 0, 1, 25],
  ] as const

  for (const [value, min, max, percent] of CASES) {
    it(`${String(value)} of ${String(min)} to ${String(max)} is ${String(percent)}%`, () => {
      expect(meterPercent(value, min, max)).toBe(percent)
    })
  }

  it('is a full track when the range is one point, never a division by zero', () => {
    expect(meterPercent(10, 10, 10)).toBe(100)
    expect(meterPercent(0, 0, 0)).toBe(100)
  })
})

describe('resolveMeterRange', () => {
  it('passes a range that needs nothing through as it is', () => {
    expect(resolveMeterRange(40, 0, 100)).toEqual({ min: 0, max: 100, value: 40 })
  })

  it('raises max to min when it is below it, and the value with it', () => {
    expect(resolveMeterRange(0, 10, 5)).toEqual({ min: 10, max: 10, value: 10 })
  })

  it('holds both ends inside a quadrillion either way', () => {
    expect(resolveMeterRange(0, -1e308, 1e308)).toEqual({ min: -1e15, max: 1e15, value: 0 })
  })

  it('turns a NaN value into min', () => {
    expect(resolveMeterRange(Number.NaN, 20, 40)).toEqual({ min: 20, max: 40, value: 20 })
  })
})
