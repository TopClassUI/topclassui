import { z } from 'zod'
import { describe, expect, it } from 'vitest'

import { NUMBER_FIELD_BOUNDARIES } from '../boundaries.js'
import { NUMBER_FIELD_DEFAULTS, NUMBER_FIELD_SIZES } from '../constants.js'
import { numberFieldSchema } from '../schema.js'

// R-8.3-3: the props table, the playground and registry.json all read this output.
interface Property { description?: string, default?: unknown, enum?: unknown[], minimum?: number, maximum?: number, anyOf?: Property[], const?: unknown }
const json = z.toJSONSchema(numberFieldSchema, { io: 'input' }) as { properties?: Record<string, Property> }
const KEYS = ['fullWidth', 'invalid', 'max', 'min', 'size', 'step']

describe('the schema is the documentation', () => {
  it('covers the six props the block names and no other: the rest are Base UI\'s', () => {
    expect(Object.keys(numberFieldSchema.shape).sort()).toEqual(KEYS)
    expect(Object.keys(json.properties ?? {}).sort()).toEqual(KEYS)
  })

  for (const key of KEYS) {
    it(`${key} carries a description`, () => {
      expect((json.properties?.[key]?.description ?? '').length, key).toBeGreaterThan(30)
    })
  }

  it('records md, false, false and 1 as the defaults, and the six sizes', () => {
    expect(json.properties?.['size']?.default).toBe('md')
    expect(json.properties?.['invalid']?.default).toBe(false)
    expect(json.properties?.['fullWidth']?.default).toBe(false)
    expect(json.properties?.['step']?.default).toBe(1)
    expect(json.properties?.['size']?.enum).toEqual(['xs', 'sm', 'md', 'lg', 'xl', 'custom'])
  })

  it('writes the bounds of min, max and step into the JSON Schema (R-5.7-7)', () => {
    for (const key of ['min', 'max']) expect([json.properties?.[key]?.minimum, json.properties?.[key]?.maximum], key).toEqual([-1e15, 1e15])
    expect(json.properties?.['step']?.anyOf?.map(({ minimum, maximum, const: only }) => [minimum, maximum, only]))
      .toEqual([[0.000001, 1e15, undefined], [undefined, undefined, 'any']])
  })
})

describe('the schema, the bounds and the constants agree', () => {
  it('fills every default from constants.ts, and leaves min and max out', () => {
    expect(numberFieldSchema.parse({})).toEqual({ size: 'md', invalid: false, fullWidth: false, step: 1 })
  })

  it('names the defaults and the bounds the spec gives, so a changed constant is a failure here', () => {
    expect(NUMBER_FIELD_DEFAULTS).toEqual({ size: 'md', invalid: false, fullWidth: false, step: 1 })
    expect(NUMBER_FIELD_SIZES).toEqual(['xs', 'sm', 'md', 'lg', 'xl', 'custom'])
    expect(NUMBER_FIELD_BOUNDARIES).toEqual({ limitMin: -1e15, limitMax: 1e15, stepMin: 0.000001 })
  })

  it('refuses a bound past the limits, a step of 0, a step that is a word other than any, and a size outside the six', () => {
    expect(numberFieldSchema.safeParse({ max: 1e16 }).success).toBe(false)
    expect(numberFieldSchema.safeParse({ min: -1e16 }).success).toBe(false)
    expect(numberFieldSchema.safeParse({ step: 0 }).success).toBe(false)
    expect(numberFieldSchema.safeParse({ step: 'all' }).success).toBe(false)
    expect(numberFieldSchema.safeParse({ size: 'xxl' }).success).toBe(false)
    expect(numberFieldSchema.safeParse({ step: 'any', min: -1e15, max: 1e15 }).success).toBe(true)
  })

  it('keeps what is not built out of the schema: no tone, no variant, no prefix, no suffix', () => {
    for (const key of ['tone', 'variant', 'prefix', 'suffix']) expect(Object.keys(numberFieldSchema.shape), key).not.toContain(key)
  })
})
