import { z } from 'zod'
import { describe, expect, it } from 'vitest'

import { skeletonSchema } from '../schema.js'

// R-8.3-3: the props table, the playground and registry.json all read this output.
const json = z.toJSONSchema(skeletonSchema, { io: 'input' }) as {
  properties?: Record<string, {
    description?: string; default?: unknown; type?: string; minimum?: number; maximum?: number; enum?: unknown[]
  }>
}

describe('the schema is the documentation', () => {
  const keys = Object.keys(skeletonSchema.shape)

  it('covers every design prop, and none of the unbuilt ones', () => {
    // Named, or a key dropped from the schema drops from the expectation too.
    expect(keys.sort()).toEqual(['animate', 'rounded', 'rows', 'variant'])
  })

  it('converts to JSON Schema at all', () => {
    expect(Object.keys(json.properties ?? {}).sort()).toEqual(['animate', 'rounded', 'rows', 'variant'])
  })

  for (const key of ['animate', 'rounded', 'rows', 'variant']) {
    it(`${key} carries a description into the JSON Schema output`, () => {
      const description = json.properties?.[key]?.description
      expect(typeof description, key).toBe('string')
      expect((description ?? '').length, key).toBeGreaterThan(10)
      expect(description ?? '', key).not.toContain('TODO')
    })
  }

  it('lists the four shapes as the variant values', () => {
    expect(json.properties?.['variant']?.enum).toEqual(['text', 'circle', 'rect', 'card'])
  })

  it('carries the defaults the spec names: text and three rows', () => {
    expect(json.properties?.['variant']?.default).toBe('text')
    expect(json.properties?.['rows']?.default).toBe(3)
  })
})

describe('rows has limits, and they are the clamp\'s', () => {
  it('is a whole number, because a row is drawn or it is not', () => {
    expect(json.properties?.['rows']?.type).toBe('integer')
  })

  it('carries the same two numbers boundaries.ts clamps to', () => {
    expect(json.properties?.['rows']?.minimum).toBe(1)
    expect(json.properties?.['rows']?.maximum).toBe(50)
  })

  it('accepts both bounds and refuses one past either', () => {
    expect(skeletonSchema.safeParse({ rows: 1 }).success).toBe(true)
    expect(skeletonSchema.safeParse({ rows: 50 }).success).toBe(true)
    expect(skeletonSchema.safeParse({ rows: 0 }).success).toBe(false)
    expect(skeletonSchema.safeParse({ rows: 51 }).success).toBe(false)
  })

  it('refuses a fraction, which the component would have to drop', () => {
    expect(skeletonSchema.safeParse({ rows: 2.5 }).success).toBe(false)
  })
})
