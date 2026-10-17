import { describe, expect, it } from 'vitest'

import { clampLength, digitRules, layoutCells, toAsciiDigits } from '../lib.js'

describe('toAsciiDigits, the one gate of a numeric field (choice 21)', () => {
  it('keeps ASCII digits as they are', () => {
    expect(toAsciiDigits('0123456789')).toBe('0123456789')
  })

  it('reads the Arabic-Indic digits U+0660 to U+0669 as 0 to 9', () => {
    expect(toAsciiDigits('٠١٢٣٤٥٦٧٨٩')).toBe('0123456789')
  })

  it('reads the Persian digits U+06F0 to U+06F9 as 0 to 9', () => {
    expect(toAsciiDigits('۰۱۲۳۴۵۶۷۸۹')).toBe('0123456789')
  })

  it('drops a letter, a sign, a space and a character beside each range', () => {
    expect(toAsciiDigits('a')).toBe('')
    expect(toAsciiDigits('-+. /:')).toBe('')
    expect(toAsciiDigits('ٟ٪ۯۺ')).toBe('')
  })

  it('a mixed string keeps its digits in order', () => {
    expect(toAsciiDigits('4a٨ ۲x1')).toBe('4821')
  })

  it('is idempotent, as Base UI asks of a normalizer', () => {
    expect(toAsciiDigits(toAsciiDigits('٤٨۲1z'))).toBe('4821')
  })
})

describe('clampLength (R-5.7-7)', () => {
  it('a whole number between 1 and 12', () => {
    expect([0, 1, 6, 12, 13, 99, -4, 6.9].map(clampLength)).toEqual([1, 1, 6, 12, 12, 12, 1, 6])
    expect(clampLength(Number.NaN)).toBe(1)
  })
})

describe('layoutCells', () => {
  it('no separator by default, and six cells do not wrap', () => {
    expect(layoutCells(6, 0)).toEqual({ separators: [false, false, false, false, false, false], wraps: false })
  })

  it('a separator after every group but the last', () => {
    expect(layoutCells(6, 3).separators).toEqual([false, false, true, false, false, false])
    expect(layoutCells(7, 3).separators).toEqual([false, false, true, false, false, true, false])
  })

  it('a group is clamped between 0 and the length', () => {
    expect(layoutCells(4, 4).separators).toEqual([false, false, false, false])
    expect(layoutCells(4, 40).separators).toEqual([false, false, false, false])
    expect(layoutCells(4, -2).separators).toEqual([false, false, false, false])
  })

  it('more than eight items wrap, separators counted', () => {
    expect([layoutCells(8, 0).wraps, layoutCells(9, 0).wraps, layoutCells(6, 2).wraps, layoutCells(8, 4).wraps]).toEqual([false, true, false, true])
  })
})

describe('digitRules', () => {
  it('numeric, the default, becomes none with our filter and a numeric keyboard', () => {
    expect(digitRules({})).toEqual({ validationType: 'none', normalizeValue: toAsciiDigits, inputMode: 'numeric' })
    expect(digitRules({ validationType: 'numeric' })).toEqual({ validationType: 'none', normalizeValue: toAsciiDigits, inputMode: 'numeric' })
  })

  it('a caller inputMode is kept', () => {
    expect(digitRules({ inputMode: 'tel' }).inputMode).toBe('tel')
  })

  it('another type, or a normalizer of the caller, passes through untouched', () => {
    const own = (value: string) => value.toUpperCase()
    expect(digitRules({ validationType: 'alpha' })).toEqual({ validationType: 'alpha', normalizeValue: undefined, inputMode: undefined })
    expect(digitRules({ normalizeValue: own })).toEqual({ validationType: 'numeric', normalizeValue: own, inputMode: undefined })
  })
})
