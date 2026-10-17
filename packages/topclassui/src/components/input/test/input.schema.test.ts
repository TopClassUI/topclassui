import { z } from 'zod'
import { describe, expect, it } from 'vitest'

import { INPUT_DEFAULTS, INPUT_SIZES } from '../constants.js'
import { inputSchema } from '../schema.js'

// R-8.3-3: the props table, the playground and registry.json all read this output.
const json = z.toJSONSchema(inputSchema, { io: 'input' }) as {
  properties?: Record<string, { description?: string; default?: unknown }>
}

describe('the schema is the documentation', () => {
  const keys = Object.keys(inputSchema.shape)

  it('covers every design prop, and none the spec leaves unbuilt', () => {
    // Named, or a key dropped from INPUT_DEFAULTS drops from the expectation too.
    expect(keys.sort()).toEqual(['fullWidth', 'invalid', 'size'])
  })

  it('converts to JSON Schema at all', () => {
    expect(Object.keys(json.properties ?? {}).sort()).toEqual(['fullWidth', 'invalid', 'size'])
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
        .toBe(INPUT_DEFAULTS[key as keyof typeof INPUT_DEFAULTS])
    })
  }
})

describe('the schema and the constants cannot drift', () => {
  it('agrees with the defaults the spec names', () => {
    expect(INPUT_DEFAULTS).toEqual({ size: 'md', invalid: false, fullWidth: false })
  })

  it('fills every default', () => {
    expect(inputSchema.parse({})).toEqual({ size: 'md', invalid: false, fullWidth: false })
  })

  it('accepts every size the constants list', () => {
    for (const size of INPUT_SIZES) expect(inputSchema.parse({ size }).size).toBe(size)
  })

  it('refuses a value outside the list or of the wrong kind', () => {
    expect(inputSchema.safeParse({ size: 'xxl' }).success).toBe(false)
    expect(inputSchema.safeParse({ invalid: 'yes' }).success).toBe(false)
    expect(inputSchema.safeParse({ fullWidth: 1 }).success).toBe(false)
  })
})
