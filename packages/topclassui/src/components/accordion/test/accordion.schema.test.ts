import { z } from 'zod'
import { describe, expect, it } from 'vitest'

import { ACCORDION_BOUNDARIES } from '../boundaries.js'
import { ACCORDION_DEFAULTS } from '../constants.js'
import { accordionSchema } from '../schema.js'

// R-8.3-3: the props table, the playground and registry.json all read this output.
const json = z.toJSONSchema(accordionSchema, { io: 'input' }) as {
  properties?: Record<string, { description?: string; default?: unknown; type?: string; minimum?: number; maximum?: number }>
}

describe('the schema is the documentation', () => {
  const keys = Object.keys(accordionSchema.shape)

  it('covers the three props whose default or bounds are ours, and no other', () => {
    expect(keys.sort()).toEqual(['headingLevel', 'hiddenUntilFound', 'size'])
    expect(Object.keys(json.properties ?? {}).sort()).toEqual(['headingLevel', 'hiddenUntilFound', 'size'])
  })

  for (const key of keys) {
    it(`${key} carries a description that names the part taking it`, () => {
      const description = json.properties?.[key]?.description ?? ''
      expect(description.length, key).toBeGreaterThan(30)
      expect(description, key).toMatch(/^Accordion(Root|Item): /)
    })
  }

  it('records the defaults: closed panels kept in the HTML, an h3 and md', () => {
    expect(json.properties?.['hiddenUntilFound']?.default).toBe(true)
    expect(json.properties?.['headingLevel']?.default).toBe(3)
    expect(json.properties?.['size']?.default).toBe('md')
  })

  it('lists size as the shared scale, custom included (R-5.7-2)', () => {
    expect(json.properties?.['size']).toMatchObject({ enum: ['xs', 'sm', 'md', 'lg', 'xl', 'custom'] })
  })

  it('lists headingLevel as a whole number from 2 to 6, and hiddenUntilFound as a boolean', () => {
    expect(json.properties?.['headingLevel']).toMatchObject({ type: 'integer', minimum: 2, maximum: 6 })
    expect(json.properties?.['hiddenUntilFound']?.type).toBe('boolean')
  })
})

describe('the schema, the constants and the bounds agree', () => {
  it('fills every default from constants.ts', () => {
    expect(accordionSchema.parse({})).toEqual({ hiddenUntilFound: true, headingLevel: 3, size: 'md' })
  })

  it('names the defaults and the bounds the spec gives, so a changed number is a failure here', () => {
    expect(ACCORDION_DEFAULTS).toEqual({ hiddenUntilFound: true, headingLevel: 3, size: 'md' })
    expect(ACCORDION_BOUNDARIES).toEqual({ headingLevelMin: 2, headingLevelMax: 6 })
  })

  it('accepts each of the five levels and both values of hiddenUntilFound', () => {
    for (const headingLevel of [2, 3, 4, 5, 6]) expect(accordionSchema.parse({ headingLevel }).headingLevel).toBe(headingLevel)
    expect(accordionSchema.parse({ hiddenUntilFound: false }).hiddenUntilFound).toBe(false)
  })

  it('refuses a level outside the bounds, a level that is no whole number, and a text', () => {
    for (const headingLevel of [1, 7, 9, 2.5, '2']) expect(accordionSchema.safeParse({ headingLevel }).success, String(headingLevel)).toBe(false)
    expect(accordionSchema.safeParse({ hiddenUntilFound: 'false' }).success).toBe(false)
    expect(accordionSchema.safeParse({ size: 'xxl' }).success).toBe(false)
  })

  it('keeps multiple, disabled and keepMounted out of the schema: they are Base UI own, with its defaults', () => {
    expect(Object.keys(accordionSchema.shape)).not.toContain('multiple')
    expect(Object.keys(accordionSchema.shape)).not.toContain('disabled')
    expect(Object.keys(accordionSchema.shape)).not.toContain('keepMounted')
  })
})
