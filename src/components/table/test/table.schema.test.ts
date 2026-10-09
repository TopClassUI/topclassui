import { z } from 'zod'
import { describe, expect, it } from 'vitest'

import { TABLE_DEFAULTS } from '../constants.js'
import { tableSchema } from '../schema.js'

// R-8.3-3: the props table, the playground and registry.json all read this output.
const json = z.toJSONSchema(tableSchema, { io: 'input' }) as {
  properties?: Record<string, { description?: string; default?: unknown; type?: string }>
}

describe('the schema is the documentation', () => {
  const keys = Object.keys(tableSchema.shape)

  it('covers the three toggles, and none of the data: items and columns are not design props', () => {
    // Named, or a key dropped from TABLE_DEFAULTS drops from the expectation too.
    expect(keys.sort()).toEqual(['captionVisible', 'stickyFirstColumn', 'striped'])
  })

  it('converts to JSON Schema at all', () => {
    expect(Object.keys(json.properties ?? {}).sort()).toEqual(['captionVisible', 'stickyFirstColumn', 'striped'])
  })

  for (const key of keys) {
    it(`${key} carries a description into the JSON Schema output`, () => {
      const description = json.properties?.[key]?.description
      expect(typeof description, key).toBe('string')
      expect((description ?? '').length, key).toBeGreaterThan(10)
      expect(description ?? '', key).not.toContain('TODO')
    })

    it(`${key} is a boolean that carries the default from constants.ts, not a second copy`, () => {
      expect(json.properties?.[key]?.type, key).toBe('boolean')
      expect(json.properties?.[key]?.default, key)
        .toBe(TABLE_DEFAULTS[key as keyof typeof TABLE_DEFAULTS])
    })
  }

  it('starts with every toggle off, which is the table the frame draws', () => {
    expect(tableSchema.parse({})).toEqual({ captionVisible: false, striped: false, stickyFirstColumn: false })
  })

  it('refuses anything that is not a boolean', () => {
    expect(tableSchema.safeParse({ striped: 'yes' }).success).toBe(false)
    expect(tableSchema.safeParse({ stickyFirstColumn: 1 }).success).toBe(false)
    expect(tableSchema.safeParse({ captionVisible: null }).success).toBe(false)
  })

  it('has none of the props the spec leaves unbuilt', () => {
    for (const key of ['pageSize', 'density', 'variant', 'hasMore', 'sortable', 'selectable', 'size', 'tone']) {
      expect(keys, key).not.toContain(key)
    }
  })
})
