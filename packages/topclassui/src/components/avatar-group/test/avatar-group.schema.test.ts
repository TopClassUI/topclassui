import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { z } from 'zod'
import { describe, expect, it } from 'vitest'

import { AVATAR_GROUP_BOUNDARIES } from '../boundaries.js'
import { AVATAR_GROUP_DEFAULTS } from '../constants.js'
import { avatarGroupSchema } from '../schema.js'

// R-8.3-3: the props table, the playground and registry.json all read this output.
const json = z.toJSONSchema(avatarGroupSchema, { io: 'input' }) as {
  properties?: Record<string, {
    type?: string
    description?: string
    default?: unknown
    minimum?: number
    maximum?: number
  }>
}

const SOURCE = readFileSync(join(import.meta.dirname, '..', 'schema.ts'), 'utf8')

describe('the schema is the documentation', () => {
  const keys = Object.keys(avatarGroupSchema.shape)

  it('covers every design prop', () => {
    // Named, or a key dropped from AVATAR_GROUP_DEFAULTS drops from the expectation too.
    expect(keys.sort()).toEqual(['max', 'size'])
  })

  it('converts to JSON Schema at all', () => {
    expect(Object.keys(json.properties ?? {}).sort()).toEqual(['max', 'size'])
  })

  for (const key of keys) {
    it(`${key} carries a description into the JSON Schema output`, () => {
      const description = json.properties?.[key]?.description
      expect(typeof description, key).toBe('string')
      expect((description ?? '').length, key).toBeGreaterThan(10)
    })
  }

  it('carries the values constants.ts holds as its JSON Schema defaults', () => {
    expect(json.properties?.['max']?.default).toBe(4)
    expect(json.properties?.['size']?.default).toBe('md')
  })

  // PLAN 20: a value test passes a hand-written copy with the same value, so read the source.
  it('reads every default from AVATAR_GROUP_DEFAULTS, so constants.ts holds the only copy', () => {
    expect(SOURCE.match(/\.default\([^)]*\)/g)).toEqual([
      '.default(AVATAR_GROUP_DEFAULTS.max)',
      '.default(AVATAR_GROUP_DEFAULTS.size)',
    ])
  })

  it('agrees with the defaults the spec names', () => {
    expect(AVATAR_GROUP_DEFAULTS).toEqual({ max: 4, size: 'md', locale: 'en' })
    expect(avatarGroupSchema.parse({})).toEqual({ max: 4, size: 'md' })
  })
})

describe('the limits (R-5.7-7, PLAN 18.11)', () => {
  it('writes 1 and 20 into the JSON Schema, which the docs table reads as the limit', () => {
    expect(json.properties?.['max']?.minimum).toBe(1)
    expect(json.properties?.['max']?.maximum).toBe(20)
  })

  it('holds the same two numbers the component clamps to', () => {
    expect(AVATAR_GROUP_BOUNDARIES).toEqual({ maxMin: 1, maxMax: 20 })
  })

  it('reads both bounds from boundaries.ts, so the schema and the clamp cannot drift', () => {
    expect(SOURCE).toContain('.min(AVATAR_GROUP_BOUNDARIES.maxMin).max(AVATAR_GROUP_BOUNDARIES.maxMax)')
  })

  it('accepts both ends and refuses a value past either', () => {
    expect(avatarGroupSchema.safeParse({ max: 1 }).success).toBe(true)
    expect(avatarGroupSchema.safeParse({ max: 20 }).success).toBe(true)
    expect(avatarGroupSchema.safeParse({ max: 0 }).success).toBe(false)
    expect(avatarGroupSchema.safeParse({ max: 21 }).success).toBe(false)
  })

  it('is a whole number, because a child cannot be half shown', () => {
    expect(json.properties?.['max']?.type).toBe('integer')
    expect(avatarGroupSchema.safeParse({ max: 2.5 }).success).toBe(false)
  })

  it('bounds nothing else: size is a closed list', () => {
    expect(json.properties?.['size']?.minimum).toBeUndefined()
    expect(json.properties?.['size']?.maximum).toBeUndefined()
  })

  it('accepts every size on the shared scale and refuses one that is not', () => {
    for (const size of ['xs', 'sm', 'md', 'lg', 'xl', 'custom']) {
      expect(avatarGroupSchema.safeParse({ size }).success, size).toBe(true)
    }
    expect(avatarGroupSchema.safeParse({ size: 'xxl' }).success).toBe(false)
  })
})
