import { z } from 'zod'
import { describe, expect, it } from 'vitest'

import { EMPTY_STATE_DEFAULTS } from '../constants.js'
import { emptyStateSchema } from '../schema.js'

// R-8.3-3: the props table, the playground and registry.json all read this output.
const json = z.toJSONSchema(emptyStateSchema, { io: 'input' }) as {
  properties?: Record<string, { description?: string; default?: unknown; type?: string }>
}

const KEYS = ['bordered', 'compact']

describe('the schema is the documentation', () => {
  it('covers the two switches the frame\'s Try it draws with a prop behind them, and no other', () => {
    expect(Object.keys(emptyStateSchema.shape).sort()).toEqual(KEYS)
    expect(Object.keys(json.properties ?? {}).sort()).toEqual(KEYS)
  })

  for (const key of KEYS) {
    it(`${key} carries a description and is a boolean`, () => {
      expect((json.properties?.[key]?.description ?? '').length, key).toBeGreaterThan(30)
      expect(json.properties?.[key]?.type, key).toBe('boolean')
    })
  }

  it('records the defaults: the dashed box, at full size', () => {
    expect(emptyStateSchema.parse({})).toEqual({ compact: false, bordered: true })
    expect(EMPTY_STATE_DEFAULTS).toEqual({ compact: false, bordered: true })
  })

  it('keeps what is not built out of the schema: no size, no variant, no withAction', () => {
    for (const key of ['size', 'variant', 'withAction', 'icon']) expect(Object.keys(emptyStateSchema.shape), key).not.toContain(key)
  })
})
