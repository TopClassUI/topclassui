import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { z } from 'zod'
import { describe, expect, it } from 'vitest'

import { PROGRESS_BOUNDARIES } from '../boundaries.js'
import { PROGRESS_DEFAULTS } from '../constants.js'
import { progressSchema } from '../schema.js'

// R-8.3-3: the props table, the playground and registry.json all read this output.
const json = z.toJSONSchema(progressSchema, { io: 'input' }) as {
  properties?: Record<string, { description?: string; default?: unknown; minimum?: number; maximum?: number }>
}

describe('the schema is the documentation', () => {
  const keys = Object.keys(progressSchema.shape)

  it('covers every design prop', () => {
    // Named, or a key dropped from PROGRESS_DEFAULTS drops from the expectation too.
    expect(keys.sort()).toEqual(['indeterminate', 'size', 'tone', 'value'])
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

    it(`${key} carries the value constants.ts holds as its JSON Schema default`, () => {
      expect(json.properties?.[key]?.default, key)
        .toBe(PROGRESS_DEFAULTS[key as keyof typeof PROGRESS_DEFAULTS])
    })
  }

  // PLAN 20: a value test passes a hand-written copy with the same value, so read the source.
  it('reads every default from PROGRESS_DEFAULTS, so constants.ts holds the only copy', () => {
    const source = readFileSync(join(import.meta.dirname, '..', 'schema.ts'), 'utf8')
    expect(source.match(/\.default\([^)]*\)/g)).toEqual([
      '.default(PROGRESS_DEFAULTS.value)',
      '.default(PROGRESS_DEFAULTS.tone)',
      '.default(PROGRESS_DEFAULTS.size)',
      '.default(PROGRESS_DEFAULTS.indeterminate)',
    ])
  })
})

describe('the limits (R-5.7-7, PLAN 18.11)', () => {
  it('writes 0 and 100 into the JSON Schema, which the docs table reads as the limit', () => {
    expect(json.properties?.['value']?.minimum).toBe(0)
    expect(json.properties?.['value']?.maximum).toBe(100)
  })

  it('holds the same two numbers the component clamps to', () => {
    expect(PROGRESS_BOUNDARIES).toEqual({ valueMin: 0, valueMax: 100 })
  })

  it('accepts both ends and refuses a value past either', () => {
    expect(progressSchema.safeParse({ value: 0 }).success).toBe(true)
    expect(progressSchema.safeParse({ value: 100 }).success).toBe(true)
    expect(progressSchema.safeParse({ value: -1 }).success).toBe(false)
    expect(progressSchema.safeParse({ value: 150 }).success).toBe(false)
  })

  it('bounds nothing else: tone, size and indeterminate are closed lists', () => {
    for (const key of ['tone', 'size', 'indeterminate']) {
      expect(json.properties?.[key]?.minimum, key).toBeUndefined()
      expect(json.properties?.[key]?.maximum, key).toBeUndefined()
    }
  })
})
