import { z } from 'zod'
import { describe, expect, it } from 'vitest'

import { FIELD_DEFAULTS, FIELD_ID_SUFFIX } from '../constants.js'
import { fieldSchema } from '../schema.js'

// R-8.3-3: the props table, the playground and registry.json all read this output.
const json = z.toJSONSchema(fieldSchema, { io: 'input' }) as {
  properties?: Record<string, { description?: string; default?: unknown; type?: string }>
}

const KEYS = ['inline', 'invalid', 'required']

describe('the schema is the documentation', () => {
  it('covers the three design props the plan names and no other', () => {
    expect(Object.keys(fieldSchema.shape).sort()).toEqual(KEYS)
    expect(Object.keys(json.properties ?? {}).sort()).toEqual(KEYS)
  })

  for (const key of KEYS) {
    it(`${key} carries a description`, () => {
      expect((json.properties?.[key]?.description ?? '').length, key).toBeGreaterThan(30)
    })
  }

  it('records the defaults: required and inline off, invalid with none of its own', () => {
    expect(fieldSchema.parse({})).toEqual({ required: false, inline: false })
    expect(json.properties?.['invalid']?.default).toBeUndefined()
  })

  it('takes booleans only', () => {
    expect(fieldSchema.safeParse({ invalid: true, required: true, inline: true }).success).toBe(true)
    expect(fieldSchema.safeParse({ required: 'yes' }).success).toBe(false)
  })

  it('keeps what is not built out of the schema: no size, no variant, no tone', () => {
    for (const key of ['size', 'variant', 'tone']) expect(Object.keys(fieldSchema.shape), key).not.toContain(key)
  })
})

describe('the constants', () => {
  it('name the defaults and the id suffixes the plan gives, so a changed constant is a failure here', () => {
    expect(FIELD_DEFAULTS).toEqual({ required: false, inline: false })
    expect(FIELD_ID_SUFFIX).toEqual({ label: '-label', hint: '-hint', error: '-err' })
  })
})
