import { z } from 'zod'
import { describe, expect, it } from 'vitest'

import { FILE_UPLOAD_BOUNDARIES } from '../boundaries.js'
import { FILE_UPLOAD_DEFAULTS, FILE_UPLOAD_REASONS, FILE_UPLOAD_UNITS } from '../constants.js'
import { fileUploadSchema } from '../schema.js'

// R-8.3-3: the props table, the playground and registry.json all read this output.
const json = z.toJSONSchema(fileUploadSchema, { io: 'input' }) as {
  properties?: Record<string, { description?: string; default?: unknown; minimum?: number; maximum?: number; type?: string }>
}
const KEYS = ['compact', 'invalid', 'maxFiles', 'maxSize', 'visibleRows']

describe('the schema is the documentation', () => {
  it('covers the five props FileUpload adds and no other: the rest are the input\'s', () => {
    expect(Object.keys(fileUploadSchema.shape).sort()).toEqual(KEYS)
    expect(Object.keys(json.properties ?? {}).sort()).toEqual(KEYS)
  })

  for (const key of KEYS) {
    it(`${key} carries a description`, () => {
      expect((json.properties?.[key]?.description ?? '').length, key).toBeGreaterThan(30)
    })
  }

  it('records the defaults and the bounds the plan gives (R-5.7-7)', () => {
    const range = (key: string) => [json.properties?.[key]?.default, json.properties?.[key]?.minimum, json.properties?.[key]?.maximum]
    expect(range('maxFiles')).toEqual([1, 1, 100])
    expect(range('maxSize')).toEqual([10_737_418_240, 1, 10_737_418_240])
    expect(range('visibleRows')).toEqual([7, 1, 20])
    expect(json.properties?.['invalid']?.default).toBe(false)
    expect(json.properties?.['compact']?.default).toBe(false)
  })
})

describe('the schema, the constants and the bounds agree', () => {
  it('fills every default from constants.ts', () => {
    expect(fileUploadSchema.parse({})).toEqual({ maxFiles: 1, maxSize: 10_737_418_240, invalid: false, compact: false, visibleRows: 7 })
  })

  it('names the defaults, the bounds and the lists the spec gives, so a changed constant is a failure here', () => {
    expect(FILE_UPLOAD_DEFAULTS).toEqual({ maxFiles: 1, maxSize: 10_737_418_240, invalid: false, compact: false, visibleRows: 7 })
    expect(FILE_UPLOAD_BOUNDARIES).toEqual({ maxFilesMin: 1, maxFilesMax: 100, maxSizeMin: 1, maxSizeMax: 10_737_418_240 })
    expect(FILE_UPLOAD_REASONS).toEqual(['tooLarge', 'wrongType'])
    expect(FILE_UPLOAD_UNITS).toEqual(['kilobyte', 'megabyte', 'gigabyte'])
  })

  it('refuses a count outside 1 to 100, a part of a file, and a size outside 1 byte to 10 GiB', () => {
    for (const bad of [{ maxFiles: 0 }, { maxFiles: 101 }, { maxFiles: 1.5 }, { maxSize: 0 }, { maxSize: 10_737_418_241 }, { visibleRows: 21 }]) {
      expect(fileUploadSchema.safeParse(bad).success, JSON.stringify(bad)).toBe(false)
    }
  })

  it('keeps what is not built out of the schema: no size, no multiple, no value, no status', () => {
    for (const key of ['size', 'multiple', 'value', 'defaultValue', 'status', 'showList']) {
      expect(Object.keys(fileUploadSchema.shape), key).not.toContain(key)
    }
  })
})
