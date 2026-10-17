import { z } from 'zod'
import { describe, expect, it } from 'vitest'

import { DATE_PICKER_BOUNDARIES } from '../boundaries.js'
import { DATE_PICKER_DEFAULTS, DATE_PICKER_PLACEMENTS, DATE_PICKER_SIZES } from '../constants.js'
import { datePickerSchema } from '../schema.js'

// R-8.3-3: the props table, the playground and registry.json all read this output.
const json = z.toJSONSchema(datePickerSchema, { io: 'input' }) as {
  properties?: Record<string, { description?: string; default?: unknown; enum?: unknown[]; minimum?: number; maximum?: number; pattern?: string }>
}
const KEYS = ['firstDayOfWeek', 'fullWidth', 'invalid', 'maxDate', 'minDate', 'placement', 'size']

describe('the schema is the documentation', () => {
  it('covers the seven props DatePicker adds and no other: the rest are Base UI\'s, or the form\'s', () => {
    expect(Object.keys(datePickerSchema.shape).sort()).toEqual(KEYS)
    expect(Object.keys(json.properties ?? {}).sort()).toEqual(KEYS)
  })

  for (const key of KEYS) {
    it(`${key} carries a description that names its part`, () => {
      expect((json.properties?.[key]?.description ?? '').length, key).toBeGreaterThan(30)
      expect(json.properties?.[key]?.description, key).toMatch(/^DatePicker: /)
    })
  }

  it('records the defaults, the six sizes, the twelve placements, the ISO pattern and the week\'s bounds', () => {
    expect(json.properties?.['size']?.default).toBe('md')
    expect(json.properties?.['placement']?.default).toBe('bottom-start')
    expect(json.properties?.['minDate']?.default).toBe('0001-01-01')
    expect(json.properties?.['maxDate']?.default).toBe('9999-12-31')
    expect(json.properties?.['firstDayOfWeek']?.default).toBeUndefined()
    expect(json.properties?.['size']?.enum).toEqual(['xs', 'sm', 'md', 'lg', 'xl', 'custom'])
    expect(json.properties?.['placement']?.enum).toHaveLength(12)
    expect(json.properties?.['minDate']?.pattern).toBe('^(\\d{4})-(\\d{2})-(\\d{2})$')
    expect([json.properties?.['firstDayOfWeek']?.minimum, json.properties?.['firstDayOfWeek']?.maximum]).toEqual([1, 7])
  })
})

describe('the schema and the constants agree', () => {
  it('fills every default from constants.ts, and leaves firstDayOfWeek to the locale', () => {
    expect(datePickerSchema.parse({})).toEqual({
      size: 'md', invalid: false, fullWidth: false, placement: 'bottom-start', minDate: '0001-01-01', maxDate: '9999-12-31',
    })
  })

  it('names the defaults and the bounds the spec gives, so a changed constant is a failure here', () => {
    expect(DATE_PICKER_DEFAULTS).toEqual({
      size: 'md', placement: 'bottom-start', invalid: false, fullWidth: false, minDate: '0001-01-01', maxDate: '9999-12-31', weekStartFallback: 1,
    })
    expect(DATE_PICKER_BOUNDARIES).toEqual({ minDate: '0001-01-01', maxDate: '9999-12-31', firstDayOfWeekMin: 1, firstDayOfWeekMax: 7 })
    expect(DATE_PICKER_SIZES).toEqual(['xs', 'sm', 'md', 'lg', 'xl', 'custom'])
    expect(DATE_PICKER_PLACEMENTS).toContain('bottom-start')
  })

  it('refuses a date that is not a real day or not ISO, a year 0, a week day outside 1 to 7, and a physical placement', () => {
    for (const date of ['2026-02-30', '2026-9-1', '22/09/2026', '0000-06-01', '10000-01-01']) {
      expect(datePickerSchema.safeParse({ minDate: date }).success, date).toBe(false)
    }
    expect(datePickerSchema.safeParse({ minDate: '2026-09-25', maxDate: '2027-03-31' }).success).toBe(true)
    expect(datePickerSchema.safeParse({ firstDayOfWeek: 0 }).success).toBe(false)
    expect(datePickerSchema.safeParse({ firstDayOfWeek: 8 }).success).toBe(false)
    expect(datePickerSchema.safeParse({ firstDayOfWeek: 6 }).success).toBe(true)
    expect(datePickerSchema.safeParse({ placement: 'left' }).success).toBe(false)
  })
})
