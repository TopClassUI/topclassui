import { z } from 'zod'
import { describe, expect, it } from 'vitest'

import { TABLE_BOUNDARIES } from '../boundaries.js'
import { TABLE_DEFAULTS } from '../constants.js'
import * as schemas from '../schema.js'
import { tableSchema, tableSkeletonSchema } from '../schema.js'

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

  it('is the first schema the file exports, which is the one the README table is built from', () => {
    expect(Object.keys(schemas)).toEqual(['tableSchema', 'tableSkeletonSchema'])
  })
})

describe('the schema of the placeholder (R-5.7-7)', () => {
  const skeleton = z.toJSONSchema(tableSkeletonSchema, { io: 'input' }) as {
    properties?: Record<string, { description?: string; default?: unknown; type?: string; minimum?: number; maximum?: number }>
  }

  it('bounds its two counts with the numbers boundaries.ts holds, written out here', () => {
    expect(skeleton.properties?.['rows']).toMatchObject({ type: 'integer', minimum: 1, maximum: 100, default: 5 })
    expect(skeleton.properties?.['columns']).toMatchObject({ type: 'integer', minimum: 1, maximum: 50, default: 4 })
    expect(TABLE_BOUNDARIES.skeletonRowsMax).toBe(100)
    expect(TABLE_BOUNDARIES.skeletonColumnsMax).toBe(50)
  })

  it('describes both, with no placeholder text left in', () => {
    for (const key of ['rows', 'columns']) {
      expect((skeleton.properties?.[key]?.description ?? '').length, key).toBeGreaterThan(10)
      expect(skeleton.properties?.[key]?.description ?? '', key).not.toContain('TODO')
    }
  })

  it('fills the defaults and refuses what the clamp would have to repair', () => {
    expect(tableSkeletonSchema.parse({})).toEqual({ rows: 5, columns: 4 })
    expect(tableSkeletonSchema.safeParse({ rows: 0 }).success).toBe(false)
    expect(tableSkeletonSchema.safeParse({ rows: 101 }).success).toBe(false)
    expect(tableSkeletonSchema.safeParse({ rows: 2.5 }).success).toBe(false)
    expect(tableSkeletonSchema.safeParse({ columns: 51 }).success).toBe(false)
    expect(tableSkeletonSchema.safeParse({ rows: 100, columns: 50 }).success).toBe(true)
  })
})
