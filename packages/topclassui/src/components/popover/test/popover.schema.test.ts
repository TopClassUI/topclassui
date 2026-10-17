import { z } from 'zod'
import { describe, expect, it } from 'vitest'

import { POPOVER_BOUNDARIES } from '../boundaries.js'
import { POPOVER_DEFAULTS, POPOVER_PLACEMENTS } from '../constants.js'
import { toPopupSelector } from '../lib.js'
import { popoverSchema } from '../schema.js'

// R-8.3-3: the props table, the playground and registry.json all read this output.
const json = z.toJSONSchema(popoverSchema, { io: 'input' }) as {
  properties?: Record<string, { description?: string; default?: unknown; minimum?: number; maximum?: number; enum?: unknown[] }>
}

describe('the schema is the documentation', () => {
  const keys = Object.keys(popoverSchema.shape)

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
      expect(description, key).toMatch(/^Popover(Popup|Trigger)[:,] /)
    })
  }

  it('records the defaults the spec names: bottom, and the 300 and 0 of Base UI', () => {
    expect(json.properties?.['placement']?.default).toBe('bottom')
    expect(json.properties?.['delay']?.default).toBe(300)
    expect(json.properties?.['closeDelay']?.default).toBe(0)
  })

  it('records the bounds the component clamps to: 0 and 10000 on both delays', () => {
    for (const key of ['delay', 'closeDelay']) {
      expect(json.properties?.[key]?.minimum, key).toBe(0)
      expect(json.properties?.[key]?.maximum, key).toBe(10000)
    }
  })

  it('lists the twelve placements in the JSON Schema enum, and no physical side', () => {
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
    expect(popoverSchema.parse({})).toEqual({ placement: 'bottom', delay: 300, closeDelay: 0 })
  })

  it('names the defaults the spec gives, so a changed constant is a failure here', () => {
    expect(POPOVER_DEFAULTS).toEqual({ placement: 'bottom', delay: 300, closeDelay: 0 })
  })

  it('names the bounds the spec gives, and nothing else lives in boundaries.ts', () => {
    expect(POPOVER_BOUNDARIES).toEqual({ delayMin: 0, delayMax: 10000 })
  })

  it('accepts every placement the constants list', () => {
    for (const placement of POPOVER_PLACEMENTS) expect(popoverSchema.parse({ placement }).placement).toBe(placement)
    expect(POPOVER_PLACEMENTS).toHaveLength(12)
  })

  it('accepts both ends of the delay range', () => {
    expect(popoverSchema.parse({ delay: 0, closeDelay: 10000 })).toMatchObject({ delay: 0, closeDelay: 10000 })
  })

  it('refuses a value outside the limits, a physical side and a delay that is not a number', () => {
    expect(popoverSchema.safeParse({ delay: 10001 }).success).toBe(false)
    expect(popoverSchema.safeParse({ delay: -1 }).success).toBe(false)
    expect(popoverSchema.safeParse({ closeDelay: 10001 }).success).toBe(false)
    expect(popoverSchema.safeParse({ closeDelay: -1 }).success).toBe(false)
    expect(popoverSchema.safeParse({ placement: 'left' }).success).toBe(false)
    expect(popoverSchema.safeParse({ delay: '300' }).success).toBe(false)
  })

  it('keeps what is not built out of the schema: no size, sideOffset, arrow, modal or dismissible', () => {
    for (const key of ['size', 'sideOffset', 'showArrow', 'modal', 'dismissible']) {
      expect(Object.keys(popoverSchema.shape), key).not.toContain(key)
    }
  })
})

describe('the selector of one popup', () => {
  it('matches the attribute the popup writes, with the scope quoted whole', () => {
    expect(toPopupSelector('_r_3_')).toBe('[data-popover="_r_3_"]')
  })

  it('quotes an id with a colon in it too, as React wrote them before 19.1', () => {
    expect(toPopupSelector(':r3:')).toBe('[data-popover=":r3:"]')
  })
})
