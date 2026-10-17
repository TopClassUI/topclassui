import { z } from 'zod'
import { describe, expect, it } from 'vitest'

import { OTP_FIELD_BOUNDARIES } from '../boundaries.js'
import { OTP_FIELD_DEFAULTS, OTP_FIELD_SIZES, OTP_FIELD_WRAP_ABOVE } from '../constants.js'
import { otpFieldSchema } from '../schema.js'

// R-8.3-3: the props table, the playground and registry.json all read this output.
const json = z.toJSONSchema(otpFieldSchema, { io: 'input' }) as {
  properties?: Record<string, { description?: string, default?: unknown, enum?: unknown[], minimum?: number, maximum?: number }>
}
const KEYS = ['groupSize', 'invalid', 'length', 'size']

describe('the schema is the documentation', () => {
  it('covers the four props OTPField adds and no other: the rest are Base UI\'s', () => {
    expect(Object.keys(otpFieldSchema.shape).sort()).toEqual(KEYS)
    expect(Object.keys(json.properties ?? {}).sort()).toEqual(KEYS)
  })

  for (const key of KEYS) {
    it(`${key} carries a description`, () => {
      expect((json.properties?.[key]?.description ?? '').length, key).toBeGreaterThan(30)
    })
  }

  it('records 6, md, false and 0 as the defaults, and the six sizes', () => {
    expect(json.properties?.['length']?.default).toBe(6)
    expect(json.properties?.['size']?.default).toBe('md')
    expect(json.properties?.['invalid']?.default).toBe(false)
    expect(json.properties?.['groupSize']?.default).toBe(0)
    expect(json.properties?.['size']?.enum).toEqual(['xs', 'sm', 'md', 'lg', 'xl', 'custom'])
  })

  it('records the bounds the component clamps to (R-5.7-7)', () => {
    expect([json.properties?.['length']?.minimum, json.properties?.['length']?.maximum]).toEqual([1, 12])
    expect([json.properties?.['groupSize']?.minimum, json.properties?.['groupSize']?.maximum]).toEqual([0, 12])
  })
})

describe('the schema and the constants agree', () => {
  it('fills every default from constants.ts', () => {
    expect(otpFieldSchema.parse({})).toEqual({ length: 6, size: 'md', invalid: false, groupSize: 0 })
  })

  it('names the values the spec gives, so a changed constant is a failure here', () => {
    expect(OTP_FIELD_DEFAULTS).toEqual({ length: 6, size: 'md', invalid: false, groupSize: 0, defaultValue: '' })
    expect(OTP_FIELD_BOUNDARIES).toEqual({ lengthMin: 1, lengthMax: 12, groupSizeMin: 0 })
    expect(OTP_FIELD_WRAP_ABOVE).toBe(8)
    expect(OTP_FIELD_SIZES).toEqual(['xs', 'sm', 'md', 'lg', 'xl', 'custom'])
  })

  it('refuses a length outside 1 to 12 or not whole, a size outside the six, and a negative group', () => {
    for (const length of [0, 13, 2.5]) expect(otpFieldSchema.safeParse({ length }).success, String(length)).toBe(false)
    expect(otpFieldSchema.safeParse({ size: 'xxl' }).success).toBe(false)
    expect(otpFieldSchema.safeParse({ groupSize: -1 }).success).toBe(false)
    expect(otpFieldSchema.safeParse({ invalid: 'yes' }).success).toBe(false)
  })

  it('keeps what is not built out of the schema: no tone, no variant, no loading', () => {
    for (const key of ['tone', 'variant', 'loading']) expect(Object.keys(otpFieldSchema.shape), key).not.toContain(key)
  })
})
