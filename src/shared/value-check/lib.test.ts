import { describe, expect, it } from 'vitest'

import { faultOf, numberSchema, patternOf, textSchema } from './lib.js'

describe('a text value', () => {
  it('is held to its cap in UTF-16 units, as maxlength counts', () => {
    expect(faultOf('abcd', { maxLength: 4 })).toBeNull()
    expect(faultOf('abcde', { maxLength: 4 })).toBe('tooLong')
    // One emoji is two units: the browser stops a fifth unit, so must the check.
    expect(faultOf('abc😀', { maxLength: 4 })).toBe('tooLong')
    expect(faultOf('ab😀', { maxLength: 4 })).toBeNull()
  })

  it('has no cap when there is none, nor when it is not a finite number', () => {
    expect(faultOf('x'.repeat(100_000), {})).toBeNull()
    expect(faultOf('x'.repeat(100_000), { maxLength: null })).toBeNull()
    expect(faultOf('x'.repeat(10), { maxLength: Number.NaN })).toBeNull()
  })

  it('a cap of 0 takes no character at all', () => {
    expect(faultOf('a', { maxLength: 0 })).toBe('tooLong')
  })

  it('matches its pattern whole, as HTML anchors it', () => {
    expect(faultOf('123', { pattern: '[0-9]+' })).toBeNull()
    expect(faultOf('12a', { pattern: '[0-9]+' })).toBe('patternMismatch')
    expect(faultOf('a12', { pattern: '[0-9]+' })).toBe('patternMismatch')
    // An alternation is grouped, so `a|b` does not match "ab" by its first half.
    expect(faultOf('ab', { pattern: 'a|b' })).toBe('patternMismatch')
    expect(faultOf('b', { pattern: 'a|b' })).toBeNull()
  })

  it('reports the cap before the pattern when both break', () => {
    expect(faultOf('abcde', { maxLength: 2, pattern: '[0-9]*' })).toBe('tooLong')
  })

  it('an empty value breaks no rule: that is required, which the browser checks', () => {
    expect(faultOf('', { maxLength: 0, pattern: '[0-9]+' })).toBeNull()
    expect(faultOf('', { numeric: true, min: 5 })).toBeNull()
  })
})

describe('an HTML pattern', () => {
  it('compiles with the v flag, anchored and grouped', () => {
    expect(patternOf('[0-9]+')?.source).toBe('^(?:[0-9]+)$')
    expect(patternOf('[0-9]+')?.flags).toBe('v')
  })

  it('that does not compile checks nothing, as a browser ignores it', () => {
    expect(patternOf('(')).toBeNull()
    // Valid without v, refused with it: the v flag's set syntax, as the browser reads it.
    expect(patternOf('[a-z-]')).toBeNull()
    expect(faultOf('anything', { pattern: '(' })).toBeNull()
  })

  it('that is absent or empty is none', () => {
    expect(patternOf(undefined)).toBeNull()
    expect(patternOf('')).toBeNull()
  })
})

describe('a number value', () => {
  const rules = { numeric: true, min: 1, max: 10, step: 1 }

  it('is held to its bounds, each inclusive', () => {
    expect(faultOf('1', rules)).toBeNull()
    expect(faultOf('10', rules)).toBeNull()
    expect(faultOf('0', rules)).toBe('rangeUnderflow')
    expect(faultOf('11', rules)).toBe('rangeOverflow')
    expect(faultOf('-5', rules)).toBe('rangeUnderflow')
  })

  it('is held to its step from min', () => {
    expect(faultOf('2.5', rules)).toBe('stepMismatch')
    expect(faultOf('0.5', { numeric: true, min: 0.5, step: 2 })).toBeNull()
    expect(faultOf('2.5', { numeric: true, min: 0.5, step: 2 })).toBeNull()
    expect(faultOf('1.5', { numeric: true, min: 0.5, step: 2 })).toBe('stepMismatch')
  })

  it('takes float noise on a decimal step as on the step', () => {
    expect(faultOf('0.3', { numeric: true, min: 0, step: 0.1 })).toBeNull()
    expect(faultOf('1.1', { numeric: true, min: 0, step: 0.1 })).toBeNull()
    expect(faultOf('0.35', { numeric: true, min: 0, step: 0.1 })).toBe('stepMismatch')
  })

  it('with no min, steps from the base it is given, and with neither checks no step', () => {
    expect(faultOf('1.5', { numeric: true, step: 1, stepBase: 0.5 })).toBeNull()
    expect(faultOf('1.5', { numeric: true, step: 1, stepBase: 0 })).toBe('stepMismatch')
    expect(faultOf('1.5', { numeric: true, step: 1 })).toBeNull()
  })

  it('a step of any, or one that is not positive, checks no step', () => {
    expect(faultOf('1.234', { numeric: true, min: 0, step: 'any' })).toBeNull()
    expect(faultOf('1.234', { numeric: true, min: 0, step: 0 })).toBeNull()
    expect(faultOf('1.234', { numeric: true, min: 0, step: -1 })).toBeNull()
  })

  it('text no number can be read from is left to the browser, whose number input reports badInput', () => {
    expect(faultOf('abc', rules)).toBeNull()
  })

  it('is not held to a cap or a pattern, which a number has none of', () => {
    expect(faultOf('123456', { numeric: true, maxLength: 2, pattern: '[a-z]+' })).toBeNull()
  })
})

describe('the schemas', () => {
  it('are zod/mini schemas, read by safeParse', () => {
    expect(textSchema({ maxLength: 2 })['~standard'].vendor).toBe('zod')
    expect(numberSchema({ max: 2 })['~standard'].validate(3)).toEqual({
      issues: [expect.objectContaining({ code: 'too_big', message: 'rangeOverflow' })],
    })
  })
})
