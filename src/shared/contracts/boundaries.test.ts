import { describe, expect, it } from 'vitest'

import {
  COUNTER_THRESHOLD, TEXT_MAX_LENGTH, type TextFieldType, maxLengthFor, resolveMaxLength,
} from './boundaries.js'

describe('a default cap protects the developer who never thought about it', () => {
  it('covers every text input type a form really uses', () => {
    expect(Object.keys(TEXT_MAX_LENGTH).sort()).toEqual(
      ['email', 'password', 'search', 'tel', 'text', 'textarea', 'url'],
    )
  })

  it('falls back to the text cap for an unknown or missing type', () => {
    expect(maxLengthFor(undefined)).toBe(TEXT_MAX_LENGTH.text)
    expect(maxLengthFor('color')).toBe(TEXT_MAX_LENGTH.text)
    expect(maxLengthFor('number')).toBe(TEXT_MAX_LENGTH.text)
  })

  it('uses the cap that belongs to the type when there is one', () => {
    expect(maxLengthFor('email')).toBe(254)
    expect(maxLengthFor('url')).toBe(2048)
    expect(maxLengthFor('tel')).toBe(32)
  })
})

describe('the cap is a guard rail, never a truncator', () => {
  /** The longest real value of each type, which must still fit: a long address, the
   * RFC maximum, the URL ceiling, a number with an extension, a long review. */
  const REAL: Record<TextFieldType, number> = {
    text: 100, email: 254, url: 2048, tel: 20, search: 80, password: 72, textarea: 2000,
  }

  for (const [type, realistic] of Object.entries(REAL) as [TextFieldType, number][]) {
    it(`${type} fits its own longest real value`, () => {
      expect(TEXT_MAX_LENGTH[type], type).toBeGreaterThanOrEqual(realistic)
    })
  }

  it('never caps so low that a name or an address is cut', () => {
    for (const [type, cap] of Object.entries(TEXT_MAX_LENGTH)) {
      if (type === 'tel') continue
      expect(cap, type).toBeGreaterThanOrEqual(100)
    }
  })

  it('stops a pasted file, so the guard rail is real', () => {
    for (const cap of Object.values(TEXT_MAX_LENGTH)) {
      expect(cap).toBeLessThanOrEqual(5000)
    }
  })
})

describe('the counter warns before the cap bites', () => {
  it('appears near the end, not at the start', () => {
    expect(COUNTER_THRESHOLD).toBeGreaterThan(0.5)
    expect(COUNTER_THRESHOLD).toBeLessThan(1)
  })
})

describe('the caller stays in charge of the cap', () => {
  it('uses the default when nothing is passed', () => {
    expect(resolveMaxLength(undefined, 'email')).toBe(254)
    expect(resolveMaxLength(undefined, undefined)).toBe(TEXT_MAX_LENGTH.text)
  })

  it('takes the number the caller passed, higher or lower than the default', () => {
    expect(resolveMaxLength(10, 'email')).toBe(10)
    expect(resolveMaxLength(100000, 'text')).toBe(100000)
  })

  it('removes the cap entirely on an explicit null, which is the documented opt-out', () => {
    expect(resolveMaxLength(null, 'text')).toBeUndefined()
    expect(resolveMaxLength(null, undefined)).toBeUndefined()
  })

  it('treats zero as a real cap, not as absent', () => {
    expect(resolveMaxLength(0, 'text')).toBe(0)
  })
})

describe('the resolver does not quietly change what the caller asked for', () => {
  it('passes a negative or fractional cap through untouched', () => {
    expect(resolveMaxLength(-5, 'text')).toBe(-5)
    expect(resolveMaxLength(1.5, 'text')).toBe(1.5)
  })

  it('gives an unknown input type the text cap rather than none at all', () => {
    for (const type of ['datetime-local', 'month', 'week', 'color', '']) {
      expect(typeof resolveMaxLength(undefined, type), type).toBe('number')
    }
  })
})
