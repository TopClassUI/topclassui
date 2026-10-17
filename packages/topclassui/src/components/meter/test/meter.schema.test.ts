import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { z } from 'zod'
import { describe, expect, it } from 'vitest'

import { METER_BOUNDARIES } from '../boundaries.js'
import { METER_DEFAULTS } from '../constants.js'
import { meterSchema } from '../schema.js'

// R-8.3-3: the props table, the playground and registry.json all read this output.
const json = z.toJSONSchema(meterSchema, { io: 'input' }) as {
  properties?: Record<string, { description?: string; default?: unknown; minimum?: number; maximum?: number }>
}

describe('the schema is the documentation', () => {
  const keys = Object.keys(meterSchema.shape)

  it('covers every design prop', () => {
    // Named, or a key dropped from METER_DEFAULTS drops from the expectation too.
    expect(keys.sort()).toEqual(['max', 'min', 'size', 'tone', 'value'])
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
      expect(json.properties?.[key]?.default, key).toBe(METER_DEFAULTS[key as keyof typeof METER_DEFAULTS])
    })
  }

  // PLAN 20: a value test passes a hand-written copy with the same value, so read the source.
  it('reads every default from METER_DEFAULTS, so constants.ts holds the only copy', () => {
    const source = readFileSync(join(import.meta.dirname, '..', 'schema.ts'), 'utf8')
    expect(source.match(/\.default\([^)]*\)/g)).toEqual([
      '.default(METER_DEFAULTS.value)',
      '.default(METER_DEFAULTS.min)',
      '.default(METER_DEFAULTS.max)',
      '.default(METER_DEFAULTS.tone)',
      '.default(METER_DEFAULTS.size)',
    ])
  })
})

describe('the limits (R-5.7-7, PLAN 18.2)', () => {
  it('holds the guard rail NumberField and Slider use for their min and max', () => {
    expect(METER_BOUNDARIES).toEqual({ limitMin: -1e15, limitMax: 1e15 })
  })

  for (const key of ['value', 'min', 'max']) {
    it(`writes -1e15 and 1e15 into the JSON Schema for ${key}, the numbers the component clamps to`, () => {
      expect(json.properties?.[key]?.minimum, key).toBe(-1e15)
      expect(json.properties?.[key]?.maximum, key).toBe(1e15)
    })

    it(`accepts both ends of ${key} and refuses a value past either`, () => {
      expect(meterSchema.safeParse({ [key]: -1e15 }).success, key).toBe(true)
      expect(meterSchema.safeParse({ [key]: 1e15 }).success, key).toBe(true)
      expect(meterSchema.safeParse({ [key]: -1e16 }).success, key).toBe(false)
      expect(meterSchema.safeParse({ [key]: 1e16 }).success, key).toBe(false)
    })
  }

  it('bounds nothing else: tone and size are closed lists', () => {
    for (const key of ['tone', 'size']) {
      expect(json.properties?.[key]?.minimum, key).toBeUndefined()
      expect(json.properties?.[key]?.maximum, key).toBeUndefined()
    }
  })
})
