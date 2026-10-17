import { describe, expect, it } from 'vitest'

import { clampValue, formatValue, latinPaste, numberingSystemOf, resolveLimits } from '../lib.js'

describe('resolveLimits clamps the bounds (R-5.7-7)', () => {
  it('leaves an absent bound absent, and keeps a real one', () => {
    expect(resolveLimits(undefined, undefined, 1)).toEqual({ min: undefined, max: undefined, step: 1 })
    expect(resolveLimits(2, 8, 0.5)).toEqual({ min: 2, max: 8, step: 0.5 })
  })

  it('pulls min and max inside ±1e15 and raises a step under 0.000001 to it; any stays any', () => {
    expect(resolveLimits(-1e20, 1e20, 0)).toEqual({ min: -1e15, max: 1e15, step: 0.000001 })
    expect(resolveLimits(undefined, undefined, -3)).toEqual({ min: undefined, max: undefined, step: 0.000001 })
    expect(resolveLimits(undefined, undefined, 'any').step).toBe('any')
  })

  it('reads a NaN min or max as absent and a NaN step as 1, never as -1e15 and 0.000001', () => {
    expect(resolveLimits(Number.NaN, Number.NaN, Number.NaN)).toEqual({ min: undefined, max: undefined, step: 1 })
    expect(resolveLimits(2, Number.NaN, 'any')).toEqual({ min: 2, max: undefined, step: 'any' })
  })

  it('raises a max under min to min, so the hidden input can still be valid', () => {
    expect(resolveLimits(10, 2, 1)).toEqual({ min: 10, max: 10, step: 1 })
    expect(resolveLimits(1e20, -1e20, 1)).toEqual({ min: 1e15, max: 1e15, step: 1 })
    expect(resolveLimits(-3, -3, 1)).toEqual({ min: -3, max: -3, step: 1 })
  })
})

describe('clampValue is the clamp at our seam', () => {
  const limits = { min: 0, max: 10, step: 1 }

  it('pulls a value between min and max', () => {
    expect([clampValue(50, limits), clampValue(-3, limits), clampValue(4, limits)]).toEqual([10, 0, 4])
  })

  it('leaves undefined (not controlled) and null (empty) as they are', () => {
    expect([clampValue(undefined, limits), clampValue(null, limits)]).toEqual([undefined, null])
  })

  it('with allowOutOfRange leaves the value where it is', () => {
    expect(clampValue(50, limits, true)).toBe(50)
  })

  it('without min or max uses the limits, and reads NaN as empty', () => {
    const open = { min: undefined, max: undefined, step: 1 }
    expect([clampValue(1e300, open), clampValue(-Infinity, open), clampValue(Number.NaN, open)]).toEqual([1e15, -1e15, null])
  })
})

describe('numberingSystemOf picks the digits', () => {
  it('format first, then a -u-nu- in the caller\'s locale, then the provider\'s', () => {
    expect(numberingSystemOf('ar-u-nu-arab', { numberingSystem: 'latn' }, 'latn')).toBe('latn')
    expect(numberingSystemOf('ar-u-nu-arab', undefined, 'latn')).toBe('arab')
    expect(numberingSystemOf(['ar-u-nu-arab', 'en'], undefined, 'latn')).toBe('arab')
    expect(numberingSystemOf(new Intl.Locale('fa-u-nu-arabext'), undefined, 'latn')).toBe('arabext')
    expect(numberingSystemOf('ar', undefined, 'latn')).toBe('latn')
    expect(numberingSystemOf(undefined, undefined, 'arab')).toBe('arab')
  })

  it('an invalid tag falls back instead of throwing', () => {
    expect(numberingSystemOf('not a locale', undefined, 'latn')).toBe('latn')
  })
})

describe('formatValue writes what Base UI shows', () => {
  it('empty for null, and the locale\'s digits and separators otherwise', () => {
    expect(formatValue(null, 'en', undefined)).toBe('')
    expect(formatValue(1234.5, 'en', { numberingSystem: 'latn' })).toBe('1,234.5')
    expect(formatValue(1234.5, 'ar', { numberingSystem: 'arab' })).toBe('١٬٢٣٤٫٥')
  })
})

describe('latinPaste reads a Latin "1,234.5" where both separators are not Latin', () => {
  it('returns the plain number under Arabic-Indic digits, a sign kept', () => {
    expect(latinPaste('1,234.5', 'ar-u-nu-arab', { numberingSystem: 'arab' })).toBe('1234.5')
    expect(latinPaste(' -12,000 ', 'ar', { numberingSystem: 'arab' })).toBe('-12000')
  })

  it('leaves a paste Base UI already reads: Latin separators, no comma, or not a grouped number', () => {
    expect(latinPaste('1,234.5', 'en', { numberingSystem: 'latn' })).toBeNull()
    expect(latinPaste('1,234.5', 'ar', { numberingSystem: 'latn' })).toBeNull()
    expect(latinPaste('1234.5', 'ar', { numberingSystem: 'arab' })).toBeNull()
    expect(latinPaste('12,34', 'ar', { numberingSystem: 'arab' })).toBeNull()
    expect(latinPaste('١٬٢٣٤', 'ar', { numberingSystem: 'arab' })).toBeNull()
  })

  it('an invalid format returns null instead of throwing', () => {
    expect(latinPaste('1,234', 'en', { style: 'currency' })).toBeNull()
  })
})
