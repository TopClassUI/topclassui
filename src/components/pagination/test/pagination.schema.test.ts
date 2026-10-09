import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { z } from 'zod'
import { describe, expect, it } from 'vitest'

import { PAGINATION_BOUNDARIES } from '../boundaries.js'
import { paginationSchema } from '../schema.js'

// R-8.3-3: the props table, the playground and registry.json all read this output.
const json = z.toJSONSchema(paginationSchema, { io: 'input' }) as {
  required?: string[]
  properties?: Record<string, { description?: string; default?: unknown; minimum?: number; maximum?: number }>
}

const page = { value: 3, pageCount: 12 }

describe('the schema is the documentation', () => {
  const keys = Object.keys(paginationSchema.shape)

  it('covers every design prop', () => {
    expect(keys.sort()).toEqual(['boundaryCount', 'pageCount', 'siblingCount', 'size', 'value'])
  })

  it('converts to JSON Schema at all', () => {
    expect(Object.keys(json.properties ?? {}).sort())
      .toEqual(['boundaryCount', 'pageCount', 'siblingCount', 'size', 'value'])
  })

  for (const key of keys) {
    it(`${key} carries a description into the JSON Schema output`, () => {
      const description = json.properties?.[key]?.description
      expect(typeof description, key).toBe('string')
      expect((description ?? '').length, key).toBeGreaterThan(10)
      expect(description, key).not.toContain('TODO')
    })
  }

  it('requires the two numbers that have no sensible default, and nothing else', () => {
    expect([...(json.required ?? [])].sort()).toEqual(['pageCount', 'value'])
  })

  it('carries the three defaults', () => {
    expect(json.properties?.['siblingCount']?.default).toBe(1)
    expect(json.properties?.['boundaryCount']?.default).toBe(1)
    expect(json.properties?.['size']?.default).toBe('sm')
    expect(paginationSchema.parse(page)).toEqual({ value: 3, pageCount: 12, siblingCount: 1, boundaryCount: 1, size: 'sm' })
  })

  // PLAN 20: a value test passes a hand-written copy with the same value, so read the source.
  it('reads every default from PAGINATION_DEFAULTS, so constants.ts holds the only copy', () => {
    const source = readFileSync(join(import.meta.dirname, '..', 'schema.ts'), 'utf8')
    expect(source.match(/\.default\([^)]*\)/g)).toEqual([
      '.default(PAGINATION_DEFAULTS.siblingCount)',
      '.default(PAGINATION_DEFAULTS.boundaryCount)',
      '.default(PAGINATION_DEFAULTS.size)',
    ])
  })

  it('reads every limit from PAGINATION_BOUNDARIES, so boundaries.ts holds the only copy', () => {
    const source = readFileSync(join(import.meta.dirname, '..', 'schema.ts'), 'utf8')
    expect(source.match(/\.(?:min|max)\([^)]*\)/g)).toEqual([
      '.min(PAGINATION_BOUNDARIES.pageMin)', '.max(PAGINATION_BOUNDARIES.pageCountMax)',
      '.min(PAGINATION_BOUNDARIES.pageMin)', '.max(PAGINATION_BOUNDARIES.pageCountMax)',
      '.min(PAGINATION_BOUNDARIES.siblingCountMin)', '.max(PAGINATION_BOUNDARIES.siblingCountMax)',
      '.min(PAGINATION_BOUNDARIES.boundaryCountMin)', '.max(PAGINATION_BOUNDARIES.boundaryCountMax)',
    ])
  })
})

describe('the limits (R-5.7-7, PLAN 18.11)', () => {
  it('holds the numbers the component clamps to', () => {
    expect(PAGINATION_BOUNDARIES).toEqual({
      pageMin: 1,
      pageCountMax: 9007199254740991,
      siblingCountMin: 0,
      siblingCountMax: 3,
      boundaryCountMin: 0,
      boundaryCountMax: 3,
    })
  })

  it('writes 0 and 3 into the JSON Schema for both counts, which the docs table reads as the limit', () => {
    for (const key of ['siblingCount', 'boundaryCount']) {
      expect(json.properties?.[key]?.minimum, key).toBe(0)
      expect(json.properties?.[key]?.maximum, key).toBe(3)
    }
  })

  it('writes 1 and the largest exact integer for the page and the count', () => {
    for (const key of ['value', 'pageCount']) {
      expect(json.properties?.[key]?.minimum, key).toBe(1)
      expect(json.properties?.[key]?.maximum, key).toBe(9007199254740991)
    }
  })

  it('accepts both ends of each count and refuses a value past either', () => {
    for (const key of ['siblingCount', 'boundaryCount']) {
      expect(paginationSchema.safeParse({ ...page, [key]: 0 }).success, key).toBe(true)
      expect(paginationSchema.safeParse({ ...page, [key]: 3 }).success, key).toBe(true)
      expect(paginationSchema.safeParse({ ...page, [key]: -1 }).success, key).toBe(false)
      expect(paginationSchema.safeParse({ ...page, [key]: 4 }).success, key).toBe(false)
    }
  })

  it('refuses a page or a count below 1, a fraction, and a missing one', () => {
    expect(paginationSchema.safeParse({ value: 0, pageCount: 12 }).success).toBe(false)
    expect(paginationSchema.safeParse({ value: 1, pageCount: 0 }).success).toBe(false)
    expect(paginationSchema.safeParse({ value: 2.5, pageCount: 12 }).success).toBe(false)
    expect(paginationSchema.safeParse({ value: 1, pageCount: 7.5 }).success).toBe(false)
    expect(paginationSchema.safeParse({ ...page, siblingCount: 1.5 }).success).toBe(false)
    expect(paginationSchema.safeParse({ value: 1 }).success).toBe(false)
    expect(paginationSchema.safeParse({ pageCount: 12 }).success).toBe(false)
  })

  it('bounds size by its list, not by a number', () => {
    expect(json.properties?.['size']?.minimum).toBeUndefined()
    expect(json.properties?.['size']?.maximum).toBeUndefined()
    expect(paginationSchema.safeParse({ ...page, size: 'xxl' }).success).toBe(false)
  })
})
