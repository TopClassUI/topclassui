import { z } from 'zod'
import { describe, expect, it } from 'vitest'

import { CHECKBOX_DEFAULTS, CHECKBOX_SIZES } from '../constants.js'
import { checkboxSchema } from '../schema.js'

// R-8.3-3: the props table, the playground and registry.json all read this output.
const json = z.toJSONSchema(checkboxSchema, { io: 'input' }) as {
  properties?: Record<string, { description?: string; default?: unknown; enum?: unknown[] }>
}

describe('the schema is the documentation', () => {
  it('covers the two props Checkbox adds and no other: the rest are Base UI\'s', () => {
    expect(Object.keys(checkboxSchema.shape).sort()).toEqual(['invalid', 'size'])
    expect(Object.keys(json.properties ?? {}).sort()).toEqual(['invalid', 'size'])
  })

  for (const key of ['invalid', 'size']) {
    it(`${key} carries a description`, () => {
      expect((json.properties?.[key]?.description ?? '').length, key).toBeGreaterThan(30)
    })
  }

  it('records md and false as the defaults, and the six sizes', () => {
    expect(json.properties?.['size']?.default).toBe('md')
    expect(json.properties?.['invalid']?.default).toBe(false)
    expect(json.properties?.['size']?.enum).toEqual(['xs', 'sm', 'md', 'lg', 'xl', 'custom'])
  })
})

describe('the schema and the constants agree', () => {
  it('fills every default from constants.ts', () => {
    expect(checkboxSchema.parse({})).toEqual({ size: 'md', invalid: false })
  })

  it('names the defaults the spec gives, so a changed constant is a failure here', () => {
    expect(CHECKBOX_DEFAULTS).toEqual({ size: 'md', invalid: false, defaultChecked: false })
    expect(CHECKBOX_SIZES).toEqual(['xs', 'sm', 'md', 'lg', 'xl', 'custom'])
  })

  it('refuses a size that is not one of the six, and an invalid that is not a boolean', () => {
    expect(checkboxSchema.safeParse({ size: 'xxl' }).success).toBe(false)
    expect(checkboxSchema.safeParse({ invalid: 'yes' }).success).toBe(false)
  })

  it('keeps what is not built out of the schema: no tone, no variant, no label, no loading', () => {
    for (const key of ['tone', 'variant', 'label', 'loading']) expect(Object.keys(checkboxSchema.shape), key).not.toContain(key)
  })
})
