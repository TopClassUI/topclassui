import { z } from 'zod'
import { describe, expect, it } from 'vitest'

import { TOOLTIP_BOUNDARIES } from '../boundaries.js'
import { TOOLTIP_DEFAULTS, TOOLTIP_PLACEMENTS } from '../constants.js'
import { tooltipSchema } from '../schema.js'

// R-8.3-3: the props table, the playground and registry.json all read this output.
const json = z.toJSONSchema(tooltipSchema, { io: 'input' }) as {
  properties?: Record<string, { description?: string; default?: unknown; minimum?: number; maximum?: number; enum?: unknown[] }>
}

describe('the schema is the documentation', () => {
  const keys = Object.keys(tooltipSchema.shape)

  it('covers every design prop and no other', () => {
    expect(keys.sort()).toEqual(['closeDelay', 'delay', 'placement'])
  })

  it('converts to JSON Schema at all', () => {
    expect(Object.keys(json.properties ?? {}).sort()).toEqual(['closeDelay', 'delay', 'placement'])
  })

  for (const key of keys) {
    it(`${key} carries a description that names the part taking it`, () => {
      const description = json.properties?.[key]?.description ?? ''
      expect(description.length, key).toBeGreaterThan(30)
      expect(description, key).toMatch(/^Tooltip(Popup|Trigger): /)
    })
  }

  it('records the defaults the spec names: top, 600 and 0', () => {
    expect(json.properties?.['placement']?.default).toBe('top')
    expect(json.properties?.['delay']?.default).toBe(600)
    expect(json.properties?.['closeDelay']?.default).toBe(0)
  })

  it('records the bounds the component clamps to: 0 and 10000 on both delays', () => {
    for (const key of ['delay', 'closeDelay']) {
      expect(json.properties?.[key]?.minimum, key).toBe(0)
      expect(json.properties?.[key]?.maximum, key).toBe(10000)
    }
  })

  it('lists the twelve placements in the JSON Schema enum', () => {
    expect(json.properties?.['placement']?.enum).toEqual([
      'top', 'top-start', 'top-end',
      'bottom', 'bottom-start', 'bottom-end',
      'start', 'start-top', 'start-bottom',
      'end', 'end-top', 'end-bottom',
    ])
  })
})

describe('the schema and the constants agree', () => {
  it('fills every default from constants.ts', () => {
    expect(tooltipSchema.parse({})).toEqual({ placement: 'top', delay: 600, closeDelay: 0 })
  })

  it('names the defaults the spec gives, so a changed constant is a failure here', () => {
    expect(TOOLTIP_DEFAULTS).toEqual({ placement: 'top', delay: 600, closeDelay: 0 })
  })

  it('names the bounds the spec gives', () => {
    expect(TOOLTIP_BOUNDARIES).toEqual({ delayMin: 0, delayMax: 10000 })
  })

  it('accepts every placement the constants list', () => {
    for (const placement of TOOLTIP_PLACEMENTS) {
      expect(tooltipSchema.parse({ placement }).placement).toBe(placement)
    }
  })

  it('accepts both ends of the delay range', () => {
    expect(tooltipSchema.parse({ delay: 0, closeDelay: 10000 })).toMatchObject({ delay: 0, closeDelay: 10000 })
  })

  it('refuses a value outside the limits, which is what the docs table reads as the limit', () => {
    expect(tooltipSchema.safeParse({ delay: 10001 }).success).toBe(false)
    expect(tooltipSchema.safeParse({ delay: -1 }).success).toBe(false)
    expect(tooltipSchema.safeParse({ closeDelay: 10001 }).success).toBe(false)
    expect(tooltipSchema.safeParse({ closeDelay: -1 }).success).toBe(false)
    expect(tooltipSchema.safeParse({ placement: 'left' }).success).toBe(false)
    expect(tooltipSchema.safeParse({ delay: '600' }).success).toBe(false)
  })
})
