import { z } from 'zod'
import { describe, expect, it } from 'vitest'

import { COLLECTION_BOUNDARIES } from '#shared/contracts/collection.js'
import { SELECT_DEFAULTS, SELECT_PLACEMENTS, SELECT_SIZES } from '../constants.js'
import { selectSchema } from '../schema.js'

// R-8.3-3: the props table, the playground and registry.json all read this output.
const json = z.toJSONSchema(selectSchema, { io: 'input' }) as {
  properties?: Record<string, { description?: string; default?: unknown; enum?: unknown[]; minimum?: number; maximum?: number }>
}
const KEYS = ['fullWidth', 'invalid', 'placement', 'size', 'visibleRows']

describe('the schema is the documentation', () => {
  it('covers the five props Select adds and no other: the rest are Base UI\'s, or data', () => {
    expect(Object.keys(selectSchema.shape).sort()).toEqual(KEYS)
    expect(Object.keys(json.properties ?? {}).sort()).toEqual(KEYS)
  })

  for (const key of KEYS) {
    it(`${key} carries a description that names its part`, () => {
      expect((json.properties?.[key]?.description ?? '').length, key).toBeGreaterThan(30)
      expect(json.properties?.[key]?.description, key).toMatch(/^Select: /)
    })
  }

  it('records md, false, false, bottom-start and seven rows as the defaults, the six sizes and the twelve placements', () => {
    expect(json.properties?.['size']?.default).toBe('md')
    expect(json.properties?.['invalid']?.default).toBe(false)
    expect(json.properties?.['fullWidth']?.default).toBe(false)
    expect(json.properties?.['placement']?.default).toBe('bottom-start')
    expect(json.properties?.['visibleRows']?.default).toBe(7)
    expect(json.properties?.['size']?.enum).toEqual(['xs', 'sm', 'md', 'lg', 'xl', 'custom'])
    expect(json.properties?.['placement']?.enum).toHaveLength(12)
  })

  it('bounds visibleRows with the shared collection bounds, 1 to 20 (R-5.7-7)', () => {
    expect([json.properties?.['visibleRows']?.minimum, json.properties?.['visibleRows']?.maximum]).toEqual([1, 20])
  })
})

describe('the schema and the constants agree', () => {
  it('fills every default from constants.ts', () => {
    expect(selectSchema.parse({})).toEqual({ size: 'md', invalid: false, fullWidth: false, placement: 'bottom-start', visibleRows: 7 })
  })

  it('names the defaults and the bounds the spec gives, so a changed constant is a failure here', () => {
    expect(SELECT_DEFAULTS).toEqual({ size: 'md', placement: 'bottom-start', invalid: false, fullWidth: false, visibleRows: 7 })
    expect(SELECT_SIZES).toEqual(['xs', 'sm', 'md', 'lg', 'xl', 'custom'])
    expect(SELECT_PLACEMENTS).toContain('bottom-start')
    expect(COLLECTION_BOUNDARIES).toMatchObject({ visibleRowsMin: 1, visibleRowsMax: 20 })
  })

  it('refuses a size outside the six, a placement that is a physical side, and rows out of bounds', () => {
    expect(selectSchema.safeParse({ size: 'xxl' }).success).toBe(false)
    expect(selectSchema.safeParse({ placement: 'left' }).success).toBe(false)
    expect(selectSchema.safeParse({ visibleRows: 0 }).success).toBe(false)
    expect(selectSchema.safeParse({ visibleRows: 21 }).success).toBe(false)
  })

  it('keeps what is not built out of the schema: no tone, no variant, no multiple, no loading', () => {
    for (const key of ['tone', 'variant', 'multiple', 'loading']) expect(Object.keys(selectSchema.shape), key).not.toContain(key)
  })
})
