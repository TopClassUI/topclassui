import { z } from 'zod'
import { describe, expect, it } from 'vitest'

import { NAVBAR_BOUNDARIES } from '../boundaries.js'
import { NAVBAR_DEFAULTS } from '../constants.js'
import { navbarSchema } from '../schema.js'

// R-8.3-3: the props table, the playground and registry.json all read this output.
const json = z.toJSONSchema(navbarSchema, { io: 'input' }) as {
  properties?: Record<string, { description?: string; default?: unknown; type?: string }>
}

describe('the schema is the documentation', () => {
  const keys = Object.keys(navbarSchema.shape)

  it('covers the three design props and no other: size and bordered are not built', () => {
    expect(keys.sort()).toEqual(['current', 'sticky', 'variant'])
    expect(Object.keys(json.properties ?? {}).sort()).toEqual(['current', 'sticky', 'variant'])
  })

  for (const key of keys) {
    it(`${key} carries a description that names the part taking it`, () => {
      const description = json.properties?.[key]?.description ?? ''
      expect(description.length, key).toBeGreaterThan(30)
      expect(description, key).toMatch(/^Navbar(Root|Link): /)
    })
  }

  it('says which part takes which: sticky is the root\'s, current is a link\'s', () => {
    expect(json.properties?.['sticky']?.description).toMatch(/^NavbarRoot: /)
    expect(json.properties?.['current']?.description).toMatch(/^NavbarLink: /)
  })

  it('records both as booleans with the defaults the spec names: sticky on, current off', () => {
    expect(json.properties?.['sticky']).toMatchObject({ type: 'boolean', default: true })
    expect(json.properties?.['current']).toMatchObject({ type: 'boolean', default: false })
  })
})

describe('the schema and the constants agree', () => {
  it('fills every default from constants.ts', () => {
    expect(navbarSchema.parse({})).toEqual({ sticky: true, variant: 'solid', current: false })
  })

  it('names the defaults the spec gives, so a changed constant is a failure here', () => {
    expect(NAVBAR_DEFAULTS).toEqual({ sticky: true, variant: 'solid', current: false })
  })

  it('keeps what a caller passes', () => {
    expect(navbarSchema.parse({ sticky: false, variant: 'transparent', current: true })).toEqual({ sticky: false, variant: 'transparent', current: true })
  })

  it('refuses anything that is not a boolean', () => {
    expect(navbarSchema.safeParse({ sticky: 'top' }).success).toBe(false)
    expect(navbarSchema.safeParse({ current: 'page' }).success).toBe(false)
    expect(navbarSchema.safeParse({ sticky: 1 }).success).toBe(false)
  })
})

describe('the one bound', () => {
  it('is the length a label is cut at, far above any real label', () => {
    expect(NAVBAR_BOUNDARIES).toEqual({ labelMaxLength: 100 })
  })
})
