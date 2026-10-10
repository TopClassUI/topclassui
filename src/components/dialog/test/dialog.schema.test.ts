import { z } from 'zod'
import { describe, expect, it } from 'vitest'

import { DIALOG_WIDTH } from '../classes.js'
import { DIALOG_DEFAULTS } from '../constants.js'
import { dialogSchema } from '../schema.js'

// R-8.3-3: the props table, the playground and registry.json all read this output.
const json = z.toJSONSchema(dialogSchema, { io: 'input' }) as {
  properties?: Record<string, { description?: string; default?: unknown; type?: string; enum?: unknown[] }>
}

describe('the schema is the documentation', () => {
  const keys = Object.keys(dialogSchema.shape)

  it('covers every design prop and no other', () => {
    expect(keys.sort()).toEqual(['closeButton', 'size'])
  })

  it('converts to JSON Schema at all', () => {
    expect(Object.keys(json.properties ?? {}).sort()).toEqual(['closeButton', 'size'])
  })

  for (const key of keys) {
    it(`${key} carries a description that names the part taking it`, () => {
      const description = json.properties?.[key]?.description ?? ''
      expect(description.length, key).toBeGreaterThan(30)
      expect(description, key).toMatch(/^Dialog(Popup|Header): /)
    })
  }

  it('records the defaults the spec names: md, and the x shown', () => {
    expect(json.properties?.['size']?.default).toBe('md')
    expect(json.properties?.['closeButton']?.default).toBe(true)
  })

  it('lists the six sizes in the JSON Schema enum, and closeButton as a boolean', () => {
    expect(json.properties?.['size']?.enum).toEqual(['xs', 'sm', 'md', 'lg', 'xl', 'custom'])
    expect(json.properties?.['closeButton']?.type).toBe('boolean')
  })
})

describe('the schema and the constants agree', () => {
  it('fills every default from constants.ts', () => {
    expect(dialogSchema.parse({})).toEqual({ size: 'md', closeButton: true })
  })

  it('names the defaults the spec gives, so a changed constant is a failure here', () => {
    expect(DIALOG_DEFAULTS).toEqual({ size: 'md', closeButton: true })
  })

  it('gives every size of the shared scale a width, in its order', () => {
    expect(Object.keys(DIALOG_WIDTH)).toEqual(['xs', 'sm', 'md', 'lg', 'xl', 'custom'])
  })

  it('accepts every size of the shared scale, and both values of closeButton', () => {
    for (const size of ['xs', 'sm', 'md', 'lg', 'xl', 'custom'] as const) expect(dialogSchema.parse({ size }).size).toBe(size)
    expect(dialogSchema.parse({ closeButton: false }).closeButton).toBe(false)
  })

  it('refuses a size outside the scale and a closeButton that is not a boolean', () => {
    expect(dialogSchema.safeParse({ size: '2xl' }).success).toBe(false)
    expect(dialogSchema.safeParse({ size: 400 }).success).toBe(false)
    expect(dialogSchema.safeParse({ closeButton: 'false' }).success).toBe(false)
  })
})

describe('the width table has one entry per size', () => {
  it('maps the five names to 320, 360, 400, 512 and 640 px, and custom to nothing', () => {
    // Tailwind's spacing step is 4 px, so max-w-80 is 320.
    expect(DIALOG_WIDTH).toEqual({
      xs: 'max-w-80', sm: 'max-w-90', md: 'max-w-100', lg: 'max-w-128', xl: 'max-w-160', custom: '',
    })
  })
})
