import { z } from 'zod'
import { describe, expect, it } from 'vitest'

import { COMBOBOX_DEFAULTS, COMBOBOX_PLACEMENTS, COMBOBOX_SIZES, COMBOBOX_STATUSES } from '../constants.js'
import { comboboxSchema } from '../schema.js'

// R-8.3-3: the props table, the playground and registry.json all read this output.
interface Property { description?: string, default?: unknown, enum?: unknown[], minimum?: number, maximum?: number }
const json = z.toJSONSchema(comboboxSchema, { io: 'input' }) as { properties?: Record<string, Property> }
const KEYS = ['fullWidth', 'hasMore', 'invalid', 'loadMoreThreshold', 'maxLength', 'placement', 'size', 'status', 'virtualize', 'visibleRows']

describe('the schema is the documentation', () => {
  it('covers the ten props Combobox adds and no other: the rest are Base UI\'s, data or functions', () => {
    expect(Object.keys(comboboxSchema.shape).sort()).toEqual(KEYS)
    expect(Object.keys(json.properties ?? {}).sort()).toEqual(KEYS)
  })

  for (const key of KEYS) {
    it(`${key} carries a description`, () => {
      expect((json.properties?.[key]?.description ?? '').length, key).toBeGreaterThan(30)
    })
  }

  it('records the defaults, the six sizes, the twelve placements and the three statuses', () => {
    const defaults = Object.fromEntries(KEYS.map((key) => [key, json.properties?.[key]?.default]))
    expect(defaults).toEqual({
      fullWidth: false, hasMore: false, invalid: false, loadMoreThreshold: 10, maxLength: 256, placement: 'bottom-start',
      size: 'md', status: 'idle', virtualize: 'auto', visibleRows: 7,
    })
    expect(json.properties?.['size']?.enum).toEqual(['xs', 'sm', 'md', 'lg', 'xl', 'custom'])
    expect(json.properties?.['placement']?.enum).toHaveLength(12)
    expect(json.properties?.['status']?.enum).toEqual(['idle', 'loading', 'loading-more'])
  })

  it('bounds visibleRows 1 to 20 and loadMoreThreshold 0 to 200, the shared collection bounds (R-5.7-7)', () => {
    expect([json.properties?.['visibleRows']?.minimum, json.properties?.['visibleRows']?.maximum]).toEqual([1, 20])
    expect([json.properties?.['loadMoreThreshold']?.minimum, json.properties?.['loadMoreThreshold']?.maximum]).toEqual([0, 200])
  })
})

describe('the schema and the constants agree', () => {
  it('fills every default from constants.ts and the shared text cap', () => {
    expect(comboboxSchema.parse({})).toEqual({
      size: 'md', invalid: false, fullWidth: false, placement: 'bottom-start', visibleRows: 7, virtualize: 'auto',
      hasMore: false, loadMoreThreshold: 10, status: 'idle', maxLength: 256,
    })
  })

  it('names the defaults the spec gives, so a changed constant is a failure here', () => {
    expect(COMBOBOX_DEFAULTS).toEqual({
      size: 'md', invalid: false, fullWidth: false, placement: 'bottom-start', visibleRows: 7, virtualize: 'auto',
      hasMore: false, loadMoreThreshold: 10, status: 'idle',
    })
    expect(COMBOBOX_SIZES).toEqual(['xs', 'sm', 'md', 'lg', 'xl', 'custom'])
    expect(COMBOBOX_PLACEMENTS).toContain('bottom-start')
    expect(COMBOBOX_STATUSES).toEqual(['idle', 'loading', 'loading-more'])
  })

  it('takes null for maxLength and true and false for virtualize; refuses what is out of bounds', () => {
    expect(comboboxSchema.safeParse({ maxLength: null }).success).toBe(true)
    expect(comboboxSchema.safeParse({ virtualize: true }).success).toBe(true)
    expect(comboboxSchema.safeParse({ virtualize: 'always' }).success).toBe(false)
    expect(comboboxSchema.safeParse({ visibleRows: 0 }).success).toBe(false)
    expect(comboboxSchema.safeParse({ visibleRows: 21 }).success).toBe(false)
    expect(comboboxSchema.safeParse({ loadMoreThreshold: 201 }).success).toBe(false)
    expect(comboboxSchema.safeParse({ status: 'error' }).success).toBe(false)
    expect(comboboxSchema.safeParse({ placement: 'left' }).success).toBe(false)
  })

  it('keeps what is not built out of the schema: no tone, no variant, no multiple', () => {
    for (const key of ['tone', 'variant', 'multiple']) expect(Object.keys(comboboxSchema.shape), key).not.toContain(key)
  })
})
