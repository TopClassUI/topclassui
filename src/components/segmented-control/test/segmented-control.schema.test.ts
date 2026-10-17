import { z } from 'zod'
import { describe, expect, it } from 'vitest'

import { SEGMENTED_CONTROL_BOUNDARIES } from '../boundaries.js'
import { SEGMENTED_CONTROL_DEFAULTS, SEGMENTED_CONTROL_SIZES } from '../constants.js'
import { segmentedControlSchema } from '../schema.js'

// R-8.3-3: the props table, the playground and registry.json all read this output.
const json = z.toJSONSchema(segmentedControlSchema, { io: 'input' }) as {
  properties?: Record<string, { description?: string; default?: unknown; enum?: unknown[] }>
}

describe('the schema is the documentation', () => {
  it('covers the three props SegmentedControl adds and no other: the rest are Base UI\'s', () => {
    expect(Object.keys(segmentedControlSchema.shape).sort()).toEqual(['fullWidth', 'invalid', 'size'])
    expect(Object.keys(json.properties ?? {}).sort()).toEqual(['fullWidth', 'invalid', 'size'])
  })

  for (const key of ['fullWidth', 'invalid', 'size']) {
    it(`${key} carries a description that names its part`, () => {
      expect((json.properties?.[key]?.description ?? '').length, key).toBeGreaterThan(30)
      expect(json.properties?.[key]?.description, key).toMatch(/^SegmentedControlRoot: /)
    })
  }

  it('records md, false and false as the defaults, and the six sizes', () => {
    expect(json.properties?.['size']?.default).toBe('md')
    expect(json.properties?.['fullWidth']?.default).toBe(false)
    expect(json.properties?.['invalid']?.default).toBe(false)
    expect(json.properties?.['size']?.enum).toEqual(['xs', 'sm', 'md', 'lg', 'xl', 'custom'])
  })
})

describe('the schema, the constants and the bound agree', () => {
  it('fills every default from constants.ts', () => {
    expect(segmentedControlSchema.parse({})).toEqual({ size: 'md', fullWidth: false, invalid: false })
  })

  it('names the defaults the spec gives, so a changed constant is a failure here', () => {
    expect(SEGMENTED_CONTROL_DEFAULTS).toEqual({ size: 'md', fullWidth: false, invalid: false })
    expect(SEGMENTED_CONTROL_SIZES).toEqual(['xs', 'sm', 'md', 'lg', 'xl', 'custom'])
  })

  it('bounds a label at 100 characters, as Tabs does, and a skeleton at 1 to 50 segments (R-8.3-6)', () => {
    expect(SEGMENTED_CONTROL_BOUNDARIES).toEqual({ labelMaxLength: 100, skeletonItemsMin: 1, skeletonItemsMax: 50 })
  })

  it('refuses a size outside the six, and a fullWidth or an invalid that is not a boolean', () => {
    expect(segmentedControlSchema.safeParse({ size: 'xxl' }).success).toBe(false)
    expect(segmentedControlSchema.safeParse({ fullWidth: 'yes' }).success).toBe(false)
    expect(segmentedControlSchema.safeParse({ invalid: 'yes' }).success).toBe(false)
  })

  it('keeps what is not built out of the schema: no tone, no variant, no orientation, no items', () => {
    for (const key of ['tone', 'variant', 'orientation', 'items']) expect(Object.keys(segmentedControlSchema.shape), key).not.toContain(key)
  })
})
