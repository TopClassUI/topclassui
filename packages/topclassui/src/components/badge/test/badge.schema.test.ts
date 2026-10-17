import { z } from 'zod'
import { describe, expect, it } from 'vitest'

import { BADGE_DEFAULTS } from '../constants.js'
import { badgeSchema } from '../schema.js'

// R-8.3-3: the props table, the playground and registry.json all read this output.
const json = z.toJSONSchema(badgeSchema, { io: 'input' }) as {
  properties?: Record<string, { description?: string; default?: unknown }>
}

describe('the schema is the documentation', () => {
  const keys = Object.keys(badgeSchema.shape)

  it('covers every design prop', () => {
    // Named, or a key dropped from BADGE_DEFAULTS drops from the expectation too.
    expect(keys.sort()).toEqual(['size', 'tone', 'variant'])
  })

  it('converts to JSON Schema at all', () => {
    expect(Object.keys(json.properties ?? {}).sort()).toEqual(keys.sort())
  })

  for (const key of keys) {
    it(`${key} carries a description into the JSON Schema output`, () => {
      const description = json.properties?.[key]?.description
      expect(typeof description, key).toBe('string')
      expect((description ?? '').length, key).toBeGreaterThan(10)
    })

    it(`${key} carries the default from constants.ts, not a second copy`, () => {
      expect(json.properties?.[key]?.default, key)
        .toBe(BADGE_DEFAULTS[key as keyof typeof BADGE_DEFAULTS])
    })
  }
})
