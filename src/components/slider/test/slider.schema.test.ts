import { z } from 'zod'
import { describe, expect, it } from 'vitest'

import { SLIDER_BOUNDARIES } from '../boundaries.js'
import { SLIDER_DEFAULTS, SLIDER_SIZES } from '../constants.js'
import { sliderSchema } from '../schema.js'

// R-8.3-3: the props table, the playground and registry.json all read this output.
const json = z.toJSONSchema(sliderSchema, { io: 'input' }) as {
  properties?: Record<string, { description?: string; default?: unknown; enum?: unknown[]; minimum?: number; maximum?: number }>
}
const KEYS = ['fullWidth', 'invalid', 'max', 'min', 'showValue', 'size', 'step']

describe('the schema is the documentation', () => {
  it('covers the seven props Slider adds or bounds and no other: the rest are Base UI\'s', () => {
    expect(Object.keys(sliderSchema.shape).sort()).toEqual(KEYS)
    expect(Object.keys(json.properties ?? {}).sort()).toEqual(KEYS)
  })

  for (const key of KEYS) {
    it(`${key} carries a description`, () => {
      expect((json.properties?.[key]?.description ?? '').length, key).toBeGreaterThan(30)
    })
  }

  it('records the defaults: md, false three times, and Base UI\'s 0, 100 and 1', () => {
    expect(Object.fromEntries(KEYS.map((key) => [key, json.properties?.[key]?.default])))
      .toEqual({ fullWidth: false, invalid: false, max: 100, min: 0, showValue: false, size: 'md', step: 1 })
    expect(json.properties?.['size']?.enum).toEqual(['xs', 'sm', 'md', 'lg', 'xl', 'custom'])
  })

  it('records min and max for every numeric prop (R-5.7-7)', () => {
    expect(['min', 'max', 'step'].map((key) => [json.properties?.[key]?.minimum, json.properties?.[key]?.maximum]))
      .toEqual([[-1e15, 1e15], [-1e15, 1e15], [0.000001, 1e15]])
  })
})

describe('the schema, the bounds and the constants agree', () => {
  it('fills every default from constants.ts', () => {
    expect(sliderSchema.parse({})).toEqual({ size: 'md', invalid: false, fullWidth: false, showValue: false, min: 0, max: 100, step: 1 })
  })

  it('names the defaults and the bounds the spec gives, so a changed constant is a failure here', () => {
    expect(SLIDER_DEFAULTS).toEqual({ size: 'md', invalid: false, fullWidth: false, showValue: false, min: 0, max: 100, step: 1 })
    expect(SLIDER_BOUNDARIES).toEqual({ limitMin: -1e15, limitMax: 1e15, stepMin: 0.000001 })
    expect(SLIDER_SIZES).toEqual(['xs', 'sm', 'md', 'lg', 'xl', 'custom'])
  })

  it('refuses a size outside the six, a step of 0, and a limit past a quadrillion', () => {
    expect(sliderSchema.safeParse({ size: 'xxl' }).success).toBe(false)
    expect(sliderSchema.safeParse({ step: 0 }).success).toBe(false)
    expect(sliderSchema.safeParse({ max: 1e16 }).success).toBe(false)
    expect(sliderSchema.safeParse({ min: -1e16 }).success).toBe(false)
  })

  it('keeps what is not built out of the schema: no tone, no variant, no thumbAlignment, no readOnly', () => {
    for (const key of ['tone', 'variant', 'thumbAlignment', 'readOnly']) expect(Object.keys(sliderSchema.shape), key).not.toContain(key)
  })
})
