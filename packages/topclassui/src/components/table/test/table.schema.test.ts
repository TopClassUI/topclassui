import { z } from 'zod'
import { describe, expect, it } from 'vitest'

import { TABLE_BOUNDARIES } from '../boundaries.js'
import { TABLE_DEFAULTS } from '../constants.js'
import * as schemas from '../schema.js'
import { tableSchema, tableSkeletonSchema } from '../schema.js'

// R-8.3-3: the props table, the playground and registry.json all read this output.
const json = z.toJSONSchema(tableSchema, { io: 'input' }) as {
  properties?: Record<string, { description?: string; default?: unknown; type?: string; minimum?: number; maximum?: number }>
}

describe('the schema is the documentation', () => {
  const keys = Object.keys(tableSchema.shape)

  const ALL = ['captionVisible', 'loadMoreThreshold', 'stickyFirstColumn', 'striped', 'virtualize', 'visibleRows']
  const TOGGLES = ['captionVisible', 'stickyFirstColumn', 'striped']

  it('covers the three toggles and the three collection knobs, and none of the data: items and columns are not design props', () => {
    // Named, or a key dropped from TABLE_DEFAULTS drops from the expectation too.
    expect([...keys].sort()).toEqual(ALL)
  })

  it('converts to JSON Schema at all', () => {
    expect(Object.keys(json.properties ?? {}).sort()).toEqual(ALL)
  })

  it('bounds the two counts with the shared collection bounds, written out here (R-5.7-7)', () => {
    const counts = json.properties
    expect(counts?.['visibleRows']).toMatchObject({ minimum: 1, maximum: 20, default: 7 })
    expect(counts?.['loadMoreThreshold']).toMatchObject({ minimum: 0, maximum: 200, default: 10 })
    expect(tableSchema.safeParse({ visibleRows: 21 }).success).toBe(false)
    expect(tableSchema.safeParse({ virtualize: 'always' }).success).toBe(false)
  })

  for (const key of ALL) {
    it(`${key} carries a description into the JSON Schema output`, () => {
      const description = json.properties?.[key]?.description
      expect(typeof description, key).toBe('string')
      expect((description ?? '').length, key).toBeGreaterThan(10)
      expect(description ?? '', key).not.toContain('TODO')
    })
  }

  for (const key of TOGGLES) {
    it(`${key} is a boolean that carries the default from constants.ts, not a second copy`, () => {
      expect(json.properties?.[key]?.type, key).toBe('boolean')
      expect(json.properties?.[key]?.default, key)
        .toBe(TABLE_DEFAULTS[key as keyof typeof TABLE_DEFAULTS])
    })
  }

  it('starts with every toggle off, which is the table the frame draws', () => {
    expect(tableSchema.parse({})).toEqual({
      captionVisible: false, striped: false, stickyFirstColumn: false, visibleRows: 7, virtualize: 'auto', loadMoreThreshold: 10,
    })
  })

  it('refuses anything that is not a boolean', () => {
    expect(tableSchema.safeParse({ striped: 'yes' }).success).toBe(false)
    expect(tableSchema.safeParse({ stickyFirstColumn: 1 }).success).toBe(false)
    expect(tableSchema.safeParse({ captionVisible: null }).success).toBe(false)
  })

  it('has none of the props the spec leaves unbuilt', () => {
    for (const key of ['pageSize', 'density', 'variant', 'sortable', 'selectable', 'size', 'tone']) {
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
    expect(skeleton.properties?.['rows']).toMatchObject({ type: 'integer', minimum: 1, maximum: 500, default: 5 })
    expect(skeleton.properties?.['columns']).toMatchObject({ type: 'integer', minimum: 1, maximum: 50, default: 4 })
    expect(TABLE_BOUNDARIES.skeletonRowsMax).toBe(500)
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
    expect(tableSkeletonSchema.safeParse({ rows: 501 }).success).toBe(false)
    expect(tableSkeletonSchema.safeParse({ rows: 2.5 }).success).toBe(false)
    expect(tableSkeletonSchema.safeParse({ columns: 51 }).success).toBe(false)
    expect(tableSkeletonSchema.safeParse({ rows: 500, columns: 50 }).success).toBe(true)
    // The largest page a table is given is a whole page here too, not five of them.
    expect(tableSkeletonSchema.safeParse({ rows: 101 }).success).toBe(true)
  })
})
