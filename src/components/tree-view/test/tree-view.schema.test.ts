import { z } from 'zod'
import { describe, expect, it } from 'vitest'

import { TREE_VIEW_DEFAULTS, TREE_VIEW_ROW_ESTIMATE, TREE_VIEW_STATUSES, TYPEAHEAD_MS } from '../constants.js'
import { treeViewSchema } from '../schema.js'

// R-8.3-3: the props table, the playground and registry.json all read this output.
interface Property { description?: string, default?: unknown, enum?: unknown[], minimum?: number, maximum?: number }
const json = z.toJSONSchema(treeViewSchema, { io: 'input' }) as { properties?: Record<string, Property> }
const KEYS = ['loadMoreThreshold', 'status', 'virtualize', 'visibleRows']

describe('the schema is the documentation', () => {
  it('covers the four props the plan names and no other: the rest are data or functions', () => {
    expect(Object.keys(treeViewSchema.shape).sort()).toEqual(KEYS)
    expect(Object.keys(json.properties ?? {}).sort()).toEqual(KEYS)
  })

  for (const key of KEYS) {
    it(`${key} carries a description`, () => {
      expect((json.properties?.[key]?.description ?? '').length, key).toBeGreaterThan(30)
    })
  }

  it('records the defaults and the four statuses', () => {
    const defaults = Object.fromEntries(KEYS.map((key) => [key, json.properties?.[key]?.default]))
    expect(defaults).toEqual({ loadMoreThreshold: 10, status: 'idle', virtualize: 'auto', visibleRows: 7 })
    expect(json.properties?.['status']?.enum).toEqual(['idle', 'loading', 'loading-more', 'empty'])
  })

  it('bounds visibleRows 1 to 20 and loadMoreThreshold 0 to 200, the shared collection bounds (R-5.7-7)', () => {
    expect([json.properties?.['visibleRows']?.minimum, json.properties?.['visibleRows']?.maximum]).toEqual([1, 20])
    expect([json.properties?.['loadMoreThreshold']?.minimum, json.properties?.['loadMoreThreshold']?.maximum]).toEqual([0, 200])
  })
})

describe('the schema and the constants agree', () => {
  it('fills every default from constants.ts', () => {
    expect(treeViewSchema.parse({})).toEqual({ visibleRows: 7, virtualize: 'auto', loadMoreThreshold: 10, status: 'idle' })
  })

  it('names the defaults the spec gives, so a changed constant is a failure here', () => {
    expect(TREE_VIEW_DEFAULTS).toEqual({
      defaultValue: null, defaultExpanded: [], visibleRows: 7, virtualize: 'auto', hasMore: false, loadMoreThreshold: 10, status: 'idle',
    })
    expect(TREE_VIEW_STATUSES).toEqual(['idle', 'loading', 'loading-more', 'empty'])
    expect(TYPEAHEAD_MS).toBe(500)
    expect(TREE_VIEW_ROW_ESTIMATE).toBe(40)
  })

  it('takes true and false for virtualize; refuses what is out of bounds and the error status (choice 3)', () => {
    expect(treeViewSchema.safeParse({ virtualize: true }).success).toBe(true)
    expect(treeViewSchema.safeParse({ virtualize: 'always' }).success).toBe(false)
    expect(treeViewSchema.safeParse({ visibleRows: 0 }).success).toBe(false)
    expect(treeViewSchema.safeParse({ visibleRows: 21 }).success).toBe(false)
    expect(treeViewSchema.safeParse({ loadMoreThreshold: 201 }).success).toBe(false)
    expect(treeViewSchema.safeParse({ status: 'error' }).success).toBe(false)
  })

  it('keeps what is not built out of the schema: no size, no selectionMode, no indent', () => {
    for (const key of ['size', 'selectionMode', 'indent', 'showLines']) expect(Object.keys(treeViewSchema.shape), key).not.toContain(key)
  })
})
