import { z } from 'zod'
import { describe, expect, it } from 'vitest'

import { BUTTON_DEFAULTS } from '../constants.js'
import { buttonSchema } from '../schema.js'

// R-8.3-3: the props table, the playground and registry.json all read this output.
const json = z.toJSONSchema(buttonSchema, { io: 'input' }) as {
  properties?: Record<string, { description?: string; default?: unknown }>
}

describe('the schema is the documentation', () => {
  const keys = Object.keys(buttonSchema.shape)

  it('covers every design prop', () => {
    // Named, or a key dropped from BUTTON_DEFAULTS drops from the expectation too.
    expect(keys.sort()).toEqual(['fullWidth', 'loading', 'size', 'tone', 'variant'])
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
        .toBe(BUTTON_DEFAULTS[key as keyof typeof BUTTON_DEFAULTS])
    })
  }
})
