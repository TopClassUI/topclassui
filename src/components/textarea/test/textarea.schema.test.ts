import { z } from 'zod'
import { describe, expect, it } from 'vitest'

import { TEXTAREA_BOUNDARIES } from '../boundaries.js'
import { TEXTAREA_DEFAULTS, TEXTAREA_SIZES } from '../constants.js'
import { textareaSchema } from '../schema.js'

// R-8.3-3: the props table, the playground and registry.json all read this output.
const json = z.toJSONSchema(textareaSchema, { io: 'input' }) as {
  properties?: Record<string, { description?: string; default?: unknown; enum?: unknown[]; minimum?: number; maximum?: number }>
}

const KEYS = ['autosize', 'fullWidth', 'invalid', 'maxLength', 'maxRows', 'rows', 'showCount', 'size']

describe('the schema is the documentation', () => {
  it('covers the eight props the plan names and no other', () => {
    expect(Object.keys(textareaSchema.shape).sort()).toEqual(KEYS)
    expect(Object.keys(json.properties ?? {}).sort()).toEqual(KEYS)
  })

  for (const key of KEYS) {
    it(`${key} carries a description`, () => {
      expect((json.properties?.[key]?.description ?? '').length, key).toBeGreaterThan(30)
    })
  }

  it('records the defaults: md, three rows, six at most, a cap of 5000, every switch off', () => {
    expect(textareaSchema.parse({})).toEqual({
      size: 'md', invalid: false, fullWidth: false, rows: 3, maxRows: 6, maxLength: 5000, autosize: false, showCount: false,
    })
  })

  it('records the bounds the component clamps to (R-5.7-7), from boundaries.ts', () => {
    expect([json.properties?.['rows']?.minimum, json.properties?.['rows']?.maximum]).toEqual([1, 40])
    expect([json.properties?.['maxRows']?.minimum, json.properties?.['maxRows']?.maximum]).toEqual([1, 40])
    expect(TEXTAREA_BOUNDARIES).toEqual({ rowsMin: 1, rowsMax: 40, maxRowsMin: 1, maxRowsMax: 40 })
  })
})

describe('the schema and the constants agree', () => {
  it('names the defaults the spec gives, so a changed constant is a failure here', () => {
    expect(TEXTAREA_DEFAULTS).toEqual({ size: 'md', invalid: false, fullWidth: false, rows: 3, maxRows: 6, autosize: false, showCount: false })
    expect(TEXTAREA_SIZES).toEqual(['xs', 'sm', 'md', 'lg', 'xl', 'custom'])
  })

  it('takes null for the cap, and refuses a fraction of a row and a size not on the scale', () => {
    expect(textareaSchema.safeParse({ maxLength: null }).success).toBe(true)
    expect(textareaSchema.safeParse({ rows: 2.5 }).success).toBe(false)
    expect(textareaSchema.safeParse({ rows: 41 }).success).toBe(false)
    expect(textareaSchema.safeParse({ size: 'xxl' }).success).toBe(false)
  })

  it('keeps what is not built out of the schema: no variant, no tone, no label', () => {
    for (const key of ['variant', 'tone', 'label']) expect(Object.keys(textareaSchema.shape), key).not.toContain(key)
  })
})
