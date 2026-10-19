import { z } from 'zod'
import { describe, expect, it } from 'vitest'

import { TABS_BOUNDARIES } from '../boundaries.js'
import { TABS_LIST, TABS_SIZE, TABS_TAB } from '../classes.js'
import { TABS_DEFAULTS, TABS_SIZES, TABS_VARIANTS } from '../constants.js'
import { tabsSchema } from '../schema.js'

// R-8.3-3: the props table, the playground and registry.json all read this output.
const json = z.toJSONSchema(tabsSchema, { io: 'input' }) as {
  properties?: Record<string, { description?: string; default?: unknown; type?: string; enum?: unknown[] }>
}

describe('the schema is the documentation', () => {
  const keys = Object.keys(tabsSchema.shape)

  it('covers every design prop and no other', () => {
    expect(keys.sort()).toEqual(['keepMounted', 'size', 'variant'])
  })

  it('converts to JSON Schema at all', () => {
    expect(Object.keys(json.properties ?? {}).sort()).toEqual(['keepMounted', 'size', 'variant'])
  })

  for (const key of keys) {
    it(`${key} carries a description that names the part taking it`, () => {
      const description = json.properties?.[key]?.description ?? ''
      expect(description.length, key).toBeGreaterThan(30)
      expect(description, key).toMatch(/^Tabs(Root|Panel): /)
    })
  }

  it('records the defaults the spec names: the line look, md, and a panel that stays mounted', () => {
    expect(json.properties?.['variant']?.default).toBe('line')
    expect(json.properties?.['size']?.default).toBe('md')
    expect(json.properties?.['keepMounted']?.default).toBe(true)
  })

  it('lists the two looks and the six sizes in the JSON Schema enums, and keepMounted as a boolean', () => {
    expect(json.properties?.['variant']?.enum).toEqual(['line', 'enclosed'])
    expect(json.properties?.['size']?.enum).toEqual(['xs', 'sm', 'md', 'lg', 'xl', 'custom'])
    expect(json.properties?.['keepMounted']?.type).toBe('boolean')
  })
})

describe('the schema and the constants agree', () => {
  it('fills every default from constants.ts', () => {
    expect(tabsSchema.parse({})).toEqual({ variant: 'line', size: 'md', keepMounted: true })
  })

  it('names the defaults the spec gives, so a changed constant is a failure here', () => {
    expect(TABS_DEFAULTS).toEqual({ variant: 'line', size: 'md', keepMounted: true })
  })

  it('offers the two looks and the shared size scale', () => {
    expect(TABS_VARIANTS).toEqual(['line', 'enclosed'])
    expect(TABS_SIZES).toEqual(['xs', 'sm', 'md', 'lg', 'xl', 'custom'])
  })

  it('accepts every look and every size, and both values of keepMounted', () => {
    for (const variant of ['line', 'enclosed'] as const) expect(tabsSchema.parse({ variant }).variant).toBe(variant)
    for (const size of ['xs', 'sm', 'md', 'lg', 'xl', 'custom'] as const) expect(tabsSchema.parse({ size }).size).toBe(size)
    expect(tabsSchema.parse({ keepMounted: false }).keepMounted).toBe(false)
  })

  it('refuses a look and a size outside the lists, and a keepMounted that is not a boolean', () => {
    expect(tabsSchema.safeParse({ variant: 'pills' }).success).toBe(false)
    expect(tabsSchema.safeParse({ size: '2xl' }).success).toBe(false)
    expect(tabsSchema.safeParse({ keepMounted: 'false' }).success).toBe(false)
  })
})

describe('every look and every size has its classes', () => {
  it('a list and a tab for each look, in the order of the list', () => {
    expect(Object.keys(TABS_LIST)).toEqual(['line', 'enclosed'])
    expect(Object.keys(TABS_TAB)).toEqual(['line', 'enclosed'])
  })

  it('a height, a padding and a type step for each size of the shared scale, and none for custom', () => {
    expect(Object.keys(TABS_SIZE)).toEqual(['xs', 'sm', 'md', 'lg', 'xl', 'custom'])
    expect(TABS_SIZE.md).toBe('h-control-md px-pad-x-sm text-sm')
    expect(TABS_SIZE.custom).toBe('')
  })
})

describe('the one bound', () => {
  it('cuts a label at 100 characters: far above any real tab, far below a pasted file', () => {
    expect(TABS_BOUNDARIES).toEqual({ labelMaxLength: 100 })
  })
})
