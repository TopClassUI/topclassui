import { z } from 'zod'
import { describe, expect, it } from 'vitest'

import { SIDEBAR_BOUNDARIES } from '../boundaries.js'
import { SIDEBAR_ICON, SIDEBAR_LINK_STATE } from '../classes.js'
import { SIDEBAR_DEFAULTS, SIDEBAR_SKELETON_DEFAULTS } from '../constants.js'
import { boundLabel, resolveDir } from '../lib.js'
import { sidebarSchema } from '../schema.js'

// R-8.3-3: the props table, the playground and registry.json all read this output.
const json = z.toJSONSchema(sidebarSchema, { io: 'input' }) as {
  properties?: Record<string, { description?: string; default?: unknown; type?: string }>
}

describe('the schema is the documentation', () => {
  const keys = Object.keys(sidebarSchema.shape)

  it('covers every design prop and no other', () => {
    expect(keys.sort()).toEqual(['current', 'defaultOpen', 'expanded', 'links', 'open'])
  })

  it('converts to JSON Schema at all', () => {
    expect(Object.keys(json.properties ?? {}).sort()).toEqual(['current', 'defaultOpen', 'expanded', 'links', 'open'])
  })

  for (const key of keys) {
    it(`${key} carries a description that names the part taking it`, () => {
      const description = json.properties?.[key]?.description ?? ''
      expect(description.length, key).toBeGreaterThan(30)
      expect(description, key).toMatch(/^Sidebar(Root|Link|Skeleton): /)
    })
  }

  it('records the defaults the spec names: a rail that starts expanded and a link that is not the current page', () => {
    expect(json.properties?.['defaultOpen']?.default).toBe(true)
    expect(json.properties?.['current']?.default).toBe(false)
  })

  it('gives open no default: leaving it out is what makes the rail hold its own state', () => {
    expect(json.properties?.['open']).not.toHaveProperty('default')
    expect(sidebarSchema.parse({})).not.toHaveProperty('open')
  })

  it('types the four states as booleans', () => {
    for (const key of ['current', 'defaultOpen', 'expanded', 'open']) expect(json.properties?.[key]?.type, key).toBe('boolean')
  })
})

describe('the schema and the constants agree', () => {
  it('fills every default from constants.ts', () => {
    expect(sidebarSchema.parse({})).toEqual({ defaultOpen: true, current: false, expanded: true, links: 4 })
  })

  it('names the defaults the spec gives, so a changed constant is a failure here', () => {
    expect(SIDEBAR_DEFAULTS).toEqual({ defaultOpen: true, current: false })
    expect(SIDEBAR_SKELETON_DEFAULTS).toEqual({ expanded: true, links: 4 })
  })

  it('accepts both values of each prop', () => {
    for (const value of [true, false]) {
      expect(sidebarSchema.parse({ defaultOpen: value, open: value, current: value })).toEqual({ defaultOpen: value, open: value, current: value, expanded: true, links: 4 })
    }
  })

  it('refuses a state that is not a boolean', () => {
    expect(sidebarSchema.safeParse({ defaultOpen: 'false' }).success).toBe(false)
    expect(sidebarSchema.safeParse({ open: 1 }).success).toBe(false)
    expect(sidebarSchema.safeParse({ current: 'page' }).success).toBe(false)
  })
})

describe('a row has classes for each value of current', () => {
  it('a look and an icon colour for the current row and for any other, and no third', () => {
    expect(Object.keys(SIDEBAR_LINK_STATE)).toEqual(['current', 'rest'])
    expect(Object.keys(SIDEBAR_ICON)).toEqual(['current', 'rest'])
  })
})

describe('the bounds', () => {
  it('cuts a label at 100 characters: far above any real page name, far below a pasted file; and a placeholder holds 1 to 200 rows', () => {
    expect(SIDEBAR_BOUNDARIES).toEqual({ labelMaxLength: 100, skeletonLinksMin: 1, skeletonLinksMax: 200 })
  })

  it('declares the count of the skeleton with the same numbers it is clamped to (R-8.3-6)', () => {
    expect(json.properties?.['links']).toMatchObject({ type: 'integer', minimum: 1, maximum: 200, default: 4 })
  })

  it('boundLabel cuts a string at the bound and leaves a shorter one whole', () => {
    expect(boundLabel('W'.repeat(300), 100)).toBe('W'.repeat(100))
    expect(boundLabel('Settings', 100)).toBe('Settings')
    expect(boundLabel('Settings', 3)).toBe('Set')
    expect(boundLabel('', 100)).toBe('')
  })

  it('boundLabel hands back anything that is not a string as it came: a number, an element, a list, nothing', () => {
    const element = { type: 'strong', props: { children: 'W'.repeat(300) } }
    const list = ['Inbox ', 3]
    expect(boundLabel(element, 100)).toBe(element)
    expect(boundLabel(list, 100)).toBe(list)
    expect(boundLabel(12345, 2)).toBe(12345)
    expect(boundLabel(undefined, 100)).toBeUndefined()
    expect(boundLabel(null, 100)).toBeNull()
  })

  it('boundLabel cuts between graphemes, so an emoji across the bound is left out whole and no half of it is written', () => {
    expect(boundLabel(`${'a'.repeat(99)}😀tail`, 100)).toBe('a'.repeat(99))
    expect(boundLabel('ab🇯🇴', 3)).toBe('ab')
    expect(boundLabel('abé', 3)).toBe('ab')
  })
})

describe('the direction of a label', () => {
  it('is its own for text in one script, so an English label in an Arabic rail keeps its start', () => {
    expect(resolveDir('Workspace')).toBe('auto')
    expect(resolveDir('مساحة العمل')).toBe('auto')
    expect(resolveDir(['Inbox ', 3])).toBe('auto')
    expect(resolveDir(12)).toBe('auto')
  })

  it("is the page's for text that mixes the two, so an Arabic label that starts with a brand reads it first", () => {
    expect(resolveDir('Wi-Fi متصل')).toBeUndefined()
    expect(resolveDir(['iPhone ', 'الجديد'])).toBeUndefined()
  })

  it("is the page's for a label that holds an element, which is the caller's own markup", () => {
    expect(resolveDir({ type: 'strong', props: { children: 'Bold' } })).toBeUndefined()
    expect(resolveDir(['Inbox ', { type: 'b', props: {} }])).toBeUndefined()
  })
})
