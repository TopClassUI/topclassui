import { z } from 'zod'
import { describe, expect, it } from 'vitest'

import { RADIO_GROUP_DEFAULTS, RADIO_GROUP_ORIENTATIONS, RADIO_GROUP_SIZES } from '../constants.js'
import { radioGroupSchema } from '../schema.js'

// R-8.3-3: the props table, the playground and registry.json all read this output.
const json = z.toJSONSchema(radioGroupSchema, { io: 'input' }) as {
  properties?: Record<string, { description?: string; default?: unknown; enum?: unknown[] }>
}

describe('the schema is the documentation', () => {
  it('covers the three props RadioGroup adds and no other: the rest are Base UI\'s', () => {
    expect(Object.keys(radioGroupSchema.shape).sort()).toEqual(['invalid', 'orientation', 'size'])
    expect(Object.keys(json.properties ?? {}).sort()).toEqual(['invalid', 'orientation', 'size'])
  })

  for (const key of ['invalid', 'orientation', 'size']) {
    it(`${key} carries a description that names its part`, () => {
      expect((json.properties?.[key]?.description ?? '').length, key).toBeGreaterThan(30)
      expect(json.properties?.[key]?.description, key).toMatch(/^RadioGroupRoot: /)
    })
  }

  it('records md, vertical and false as the defaults, the six sizes and the two orientations', () => {
    expect(json.properties?.['size']?.default).toBe('md')
    expect(json.properties?.['orientation']?.default).toBe('vertical')
    expect(json.properties?.['invalid']?.default).toBe(false)
    expect(json.properties?.['size']?.enum).toEqual(['xs', 'sm', 'md', 'lg', 'xl', 'custom'])
    expect(json.properties?.['orientation']?.enum).toEqual(['vertical', 'horizontal'])
  })
})

describe('the schema and the constants agree', () => {
  it('fills every default from constants.ts', () => {
    expect(radioGroupSchema.parse({})).toEqual({ size: 'md', orientation: 'vertical', invalid: false })
  })

  it('names the defaults the spec gives, so a changed constant is a failure here', () => {
    expect(RADIO_GROUP_DEFAULTS).toEqual({ size: 'md', orientation: 'vertical', invalid: false })
    expect(RADIO_GROUP_SIZES).toEqual(['xs', 'sm', 'md', 'lg', 'xl', 'custom'])
    expect(RADIO_GROUP_ORIENTATIONS).toEqual(['vertical', 'horizontal'])
  })

  it('refuses a size outside the six, an orientation outside the two, and an invalid that is not a boolean', () => {
    expect(radioGroupSchema.safeParse({ size: 'xxl' }).success).toBe(false)
    expect(radioGroupSchema.safeParse({ orientation: 'diagonal' }).success).toBe(false)
    expect(radioGroupSchema.safeParse({ invalid: 'yes' }).success).toBe(false)
  })

  it('keeps what is not built out of the schema: no tone, no variant, no items, no loading', () => {
    for (const key of ['tone', 'variant', 'items', 'loading']) expect(Object.keys(radioGroupSchema.shape), key).not.toContain(key)
  })
})
