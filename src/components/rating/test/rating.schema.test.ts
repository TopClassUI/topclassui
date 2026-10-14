import { describe, expect, it } from 'vitest'

import { RATING_BOUNDARIES } from '../boundaries.js'
import { RATING_DEFAULTS, RATING_FILLS, RATING_SIZES } from '../constants.js'
import { ratingSchema } from '../schema.js'

describe('the schema', () => {
  it('fills in every default', () => {
    expect(ratingSchema.parse({})).toEqual({ value: 0, max: 5, size: 'md', readOnly: true, defaultValue: 0, disabled: false })
  })

  it('bounds max with the numbers the component clamps to, 1 and 10 (R-8.3-6)', () => {
    expect(RATING_BOUNDARIES).toEqual({ maxMin: 1, maxMax: 10 })
    expect(ratingSchema.safeParse({ max: 1 }).success).toBe(true)
    expect(ratingSchema.safeParse({ max: 10 }).success).toBe(true)
    expect(ratingSchema.safeParse({ max: 0 }).success).toBe(false)
    expect(ratingSchema.safeParse({ max: 11 }).success).toBe(false)
    expect(ratingSchema.safeParse({ max: 4.5 }).success).toBe(false)
  })

  it('bounds value and defaultValue from 0 to 10, halves allowed', () => {
    for (const key of ['value', 'defaultValue']) {
      expect(ratingSchema.safeParse({ [key]: 3.5 }).success, key).toBe(true)
      expect(ratingSchema.safeParse({ [key]: -1 }).success, key).toBe(false)
      expect(ratingSchema.safeParse({ [key]: 10.5 }).success, key).toBe(false)
    }
  })

  it('offers the six shared sizes and refuses another', () => {
    expect(RATING_SIZES).toEqual(['xs', 'sm', 'md', 'lg', 'xl', 'custom'])
    expect(ratingSchema.safeParse({ size: 'xxl' }).success).toBe(false)
  })

  it('reads the defaults from one place', () => {
    expect(RATING_DEFAULTS).toEqual({ value: 0, max: 5, size: 'md', readOnly: true, disabled: false, locale: 'en' })
    expect(RATING_FILLS).toEqual(['none', 'half', 'full'])
  })

  it('documents every field, which the README props table needs', () => {
    const json = ratingSchema.toJSONSchema() as { properties: Record<string, { description?: string }> }
    for (const [key, field] of Object.entries(json.properties)) expect(field.description, key).toMatch(/\w/)
  })
})
