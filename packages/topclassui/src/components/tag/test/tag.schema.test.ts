import { z } from 'zod'
import { describe, expect, it } from 'vitest'

import { TAG_DEFAULTS } from '../constants.js'
import { tagSchema } from '../schema.js'

// R-8.3-3: the props table, the playground and registry.json all read this output.
const json = z.toJSONSchema(tagSchema, { io: 'input' }) as {
  properties?: Record<string, { description?: string; default?: unknown }>
}

describe('the schema is the documentation', () => {
  const keys = Object.keys(tagSchema.shape)

  it('covers every design prop, and no variant', () => {
    // Named, or a key dropped from TAG_DEFAULTS drops from the expectation too.
    expect(keys.sort()).toEqual(['size', 'tone'])
  })

  it('converts to JSON Schema at all', () => {
    expect(Object.keys(json.properties ?? {}).sort()).toEqual(['size', 'tone'])
  })

  for (const key of keys) {
    it(`${key} carries a description into the JSON Schema output`, () => {
      const description = json.properties?.[key]?.description
      expect(typeof description, key).toBe('string')
      expect((description ?? '').length, key).toBeGreaterThan(10)
      expect(description ?? '', key).not.toContain('TODO')
    })

    it(`${key} carries the default from constants.ts, not a second copy`, () => {
      expect(json.properties?.[key]?.default, key)
        .toBe(TAG_DEFAULTS[key as keyof typeof TAG_DEFAULTS])
    })
  }
})
