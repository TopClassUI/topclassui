import { z } from 'zod'
import { describe, expect, it } from 'vitest'

import { SEPARATOR_DEFAULTS } from '../constants.js'
import { separatorSchema } from '../schema.js'

// R-8.3-3: the props table, the playground and registry.json all read this output.
const json = z.toJSONSchema(separatorSchema, { io: 'input' }) as {
  properties?: Record<string, { description?: string; default?: unknown; enum?: unknown; type?: unknown }>
}

describe('the schema is the documentation', () => {
  const keys = Object.keys(separatorSchema.shape)

  it('covers every design prop, and none the spec leaves unbuilt', () => {
    // Named, or a key dropped from SEPARATOR_DEFAULTS drops from the expectation too.
    expect(keys.sort()).toEqual(['decorative', 'orientation'])
  })

  it('converts to JSON Schema at all', () => {
    expect(Object.keys(json.properties ?? {}).sort()).toEqual(['decorative', 'orientation'])
  })

  for (const key of keys) {
    it(`${key} carries a description into the JSON Schema output`, () => {
      const description = json.properties?.[key]?.description
      expect(typeof description, key).toBe('string')
      expect((description ?? '').length, key).toBeGreaterThan(10)
      expect(description, key).not.toContain('TODO')
    })

    it(`${key} carries the default from constants.ts, not a second copy`, () => {
      expect(json.properties?.[key]?.default, key)
        .toBe(SEPARATOR_DEFAULTS[key as keyof typeof SEPARATOR_DEFAULTS])
    })
  }

  it('lists the two orientations the docs table reads as the limit', () => {
    expect(json.properties?.orientation?.enum).toEqual(['horizontal', 'vertical'])
  })

  it('types decorative as a boolean that defaults to true', () => {
    expect(json.properties?.decorative?.type).toBe('boolean')
    expect(json.properties?.decorative?.default).toBe(true)
  })
})
