import { describe, expect, it } from 'vitest'

import { fillOf, iconSizeOf, stepsOf, toMax, toShown, toStep } from '../lib.js'

describe('the fill rule, one rule for both halves', () => {
  it('fills every star at or below the value, and none above it', () => {
    expect([1, 2, 3, 4, 5].map((step) => fillOf(step, 3))).toEqual(['full', 'full', 'full', 'none', 'none'])
  })

  it('draws half of the star the value stops halfway into', () => {
    expect([1, 2, 3, 4, 5].map((step) => fillOf(step, 3.5))).toEqual(['full', 'full', 'full', 'half', 'none'])
  })

  it('fills nothing at 0 and everything at max', () => {
    expect([1, 2, 3].map((step) => fillOf(step, 0))).toEqual(['none', 'none', 'none'])
    expect([1, 2, 3].map((step) => fillOf(step, 3))).toEqual(['full', 'full', 'full'])
  })
})

describe('the clamps (R-5.7-7)', () => {
  it('max is a whole number from 1 to 10', () => {
    expect([0, 1, 3.4, 3.5, 10, 11, -4, Number.NaN].map(toMax)).toEqual([1, 1, 3, 4, 10, 10, 1, 1])
  })

  it('a read-only value is clamped to 0 and max, then shown to the nearest half', () => {
    expect([-1, 0, 0.2, 0.3, 2.74, 2.75, 5, 7, Number.NaN].map((value) => toShown(value, 5))).toEqual([0, 0, 0, 0.5, 2.5, 3, 5, 5, 0])
  })

  it('an editing value is clamped to 0 and max, then to a whole step', () => {
    expect([-1, 0, 0.4, 0.5, 2.6, 5, 7, Number.NaN].map((value) => toStep(value, 5))).toEqual([0, 0, 0, 1, 3, 5, 5, 0])
  })

  it('the steps run from 1 to max', () => {
    expect(stepsOf(1)).toEqual([1])
    expect(stepsOf(5)).toEqual([1, 2, 3, 4, 5])
  })
})

describe('the icon size', () => {
  it('passes the five names to Svg, and draws custom at 1em', () => {
    expect(['xs', 'sm', 'md', 'lg', 'xl', 'custom'].map((size) => iconSizeOf(size as 'md'))).toEqual(['xs', 'sm', 'md', 'lg', 'xl', '1em'])
  })
})
