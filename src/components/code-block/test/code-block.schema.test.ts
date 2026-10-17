import { z } from 'zod'
import { describe, expect, it } from 'vitest'

import { CODE_BLOCK_DEFAULTS, COPY_RESET_MS } from '../constants.js'
import { codeBlockSchema } from '../schema.js'

// R-8.3-3: the props table, the playground and registry.json all read this output.
const json = z.toJSONSchema(codeBlockSchema, { io: 'input' }) as {
  properties?: Record<string, { description?: string; default?: unknown; type?: string }>
}

const KEYS = ['showCopy', 'wrap']

describe('the schema is the documentation', () => {
  it('covers the two switches the plan names and no other', () => {
    expect(Object.keys(codeBlockSchema.shape).sort()).toEqual(KEYS)
    expect(Object.keys(json.properties ?? {}).sort()).toEqual(KEYS)
  })

  for (const key of KEYS) {
    it(`${key} carries a description and is a boolean`, () => {
      expect((json.properties?.[key]?.description ?? '').length, key).toBeGreaterThan(30)
      expect(json.properties?.[key]?.type, key).toBe('boolean')
    })
  }

  it('records the defaults: a copy button, no wrapping', () => {
    expect(codeBlockSchema.parse({})).toEqual({ showCopy: true, wrap: false })
  })
})

describe('the schema and the constants agree', () => {
  it('names the defaults and the reset time the spec gives, so a changed constant is a failure here', () => {
    expect(CODE_BLOCK_DEFAULTS).toEqual({ showCopy: true, wrap: false })
    expect(COPY_RESET_MS).toBe(2000)
  })

  it('keeps what is not built out of the schema: no size, no theme, no line numbers, no maxLines', () => {
    for (const key of ['size', 'theme', 'lineNumbers', 'maxLines', 'variant', 'tone']) {
      expect(Object.keys(codeBlockSchema.shape), key).not.toContain(key)
    }
  })
})
