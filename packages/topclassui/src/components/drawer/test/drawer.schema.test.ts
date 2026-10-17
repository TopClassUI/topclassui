import { z } from 'zod'
import { describe, expect, it } from 'vitest'

import { DRAWER_WIDTH } from '../classes.js'
import { DRAWER_DEFAULTS, DRAWER_PLACEMENTS } from '../constants.js'
import { drawerSchema } from '../schema.js'

// R-8.3-3: the props table, the playground and registry.json all read this output.
const json = z.toJSONSchema(drawerSchema, { io: 'input' }) as {
  properties?: Record<string, { description?: string; default?: unknown; type?: string; enum?: unknown[] }>
}

describe('the schema is the documentation', () => {
  const keys = Object.keys(drawerSchema.shape)

  it('covers every design prop and no other', () => {
    expect(keys.sort()).toEqual(['placement', 'size'])
  })

  it('converts to JSON Schema at all', () => {
    expect(Object.keys(json.properties ?? {}).sort()).toEqual(['placement', 'size'])
  })

  for (const key of keys) {
    it(`${key} carries a description that names the part taking it`, () => {
      const description = json.properties?.[key]?.description ?? ''
      expect(description.length, key).toBeGreaterThan(30)
      expect(description, key).toMatch(/^DrawerRoot: /)
    })
  }

  it('records the defaults the spec names: the inline end, and md', () => {
    expect(json.properties?.['placement']?.default).toBe('end')
    expect(json.properties?.['size']?.default).toBe('md')
  })

  it('lists the four placements and the six sizes in the JSON Schema enums', () => {
    expect(json.properties?.['placement']?.enum).toEqual(['start', 'end', 'top', 'bottom'])
    expect(json.properties?.['size']?.enum).toEqual(['xs', 'sm', 'md', 'lg', 'xl', 'custom'])
  })
})

describe('the schema and the constants agree', () => {
  it('fills every default from constants.ts', () => {
    expect(drawerSchema.parse({})).toEqual({ placement: 'end', size: 'md' })
  })

  it('names the defaults the spec gives, so a changed constant is a failure here', () => {
    expect(DRAWER_DEFAULTS).toEqual({ placement: 'end', size: 'md', modal: true })
  })

  it('names the four placements, logical every one: no left and no right', () => {
    expect(DRAWER_PLACEMENTS).toEqual(['start', 'end', 'top', 'bottom'])
  })

  it('keeps modal out of the schema: the prop is Base UI own, and only its default is named here', () => {
    expect(Object.keys(drawerSchema.shape)).not.toContain('modal')
  })

  it('accepts every placement and every size of the shared scale', () => {
    for (const placement of ['start', 'end', 'top', 'bottom'] as const) expect(drawerSchema.parse({ placement }).placement).toBe(placement)
    for (const size of ['xs', 'sm', 'md', 'lg', 'xl', 'custom'] as const) expect(drawerSchema.parse({ size }).size).toBe(size)
  })

  it('refuses a physical side, the swipe names of Base UI, and a size outside the scale', () => {
    expect(drawerSchema.safeParse({ placement: 'left' }).success).toBe(false)
    expect(drawerSchema.safeParse({ placement: 'right' }).success).toBe(false)
    expect(drawerSchema.safeParse({ placement: 'down' }).success).toBe(false)
    expect(drawerSchema.safeParse({ placement: 'inline-end' }).success).toBe(false)
    expect(drawerSchema.safeParse({ size: '2xl' }).success).toBe(false)
    expect(drawerSchema.safeParse({ size: 320 }).success).toBe(false)
  })
})

describe('the width table has one entry per size', () => {
  it('gives every size of the shared scale a width, in its order', () => {
    expect(Object.keys(DRAWER_WIDTH)).toEqual(['xs', 'sm', 'md', 'lg', 'xl', 'custom'])
  })

  it('maps the five names to 256, 288, 320, 384 and 480 px, and custom to nothing', () => {
    // Tailwind's spacing step is 4 px, so max-w-64 is 256.
    expect(DRAWER_WIDTH).toEqual({
      xs: 'max-w-64', sm: 'max-w-72', md: 'max-w-80', lg: 'max-w-96', xl: 'max-w-120', custom: '',
    })
  })
})
