import { z } from 'zod'
import { describe, expect, it } from 'vitest'

import { BREADCRUMB_DEFAULTS } from '../constants.js'
import { breadcrumbSchema } from '../schema.js'

// R-8.3-3: the props table reads this output.
const json = z.toJSONSchema(breadcrumbSchema, { io: 'input' }) as {
  required?: string[]
  properties?: Record<string, { type?: string; pattern?: string; description?: string; default?: unknown; minimum?: number; maximum?: number }>
}

describe('the schema is the documentation', () => {
  it('covers siteUrl and the two props the frame draws in Try it', () => {
    expect(Object.keys(breadcrumbSchema.shape)).toEqual(['siteUrl', 'showHome', 'maxItems'])
    expect(Object.keys(json.properties ?? {})).toEqual(['siteUrl', 'showHome', 'maxItems'])
  })

  it('makes every prop optional, since leaving siteUrl out is how a demo writes no JSON-LD', () => {
    expect(json.required ?? []).toEqual([])
    expect(breadcrumbSchema.parse({})).toEqual({ showHome: false, maxItems: 100 })
  })

  it('starts showHome off and maxItems at its rail, so a real trail is never folded unasked', () => {
    expect(BREADCRUMB_DEFAULTS).toEqual({ showHome: false, maxItems: 100 })
    expect(json.properties?.showHome).toMatchObject({ type: 'boolean', default: false })
    expect(json.properties?.maxItems).toMatchObject({ type: 'integer', minimum: 2, maximum: 100, default: 100 })
  })

  it('refuses a maxItems outside 2..100 or with a fraction', () => {
    for (const bad of [1, 101, 2.5]) expect(breadcrumbSchema.safeParse({ maxItems: bad }).success).toBe(false)
    for (const good of [2, 4, 100]) expect(breadcrumbSchema.safeParse({ maxItems: good }).success).toBe(true)
  })

  it('describes siteUrl as a string with a description for the props table', () => {
    expect(json.properties?.siteUrl?.type).toBe('string')
    expect(json.properties?.siteUrl?.description).toContain('BreadcrumbList')
  })
})

describe('siteUrl is an absolute origin with no trailing slash', () => {
  for (const good of ['https://example.com', 'http://localhost:3000', 'https://topclassui.com', 'https://a.b.example.co.uk']) {
    it(`accepts ${good}`, () => {
      expect(breadcrumbSchema.safeParse({ siteUrl: good }).success).toBe(true)
    })
  }

  for (const bad of ['', 'example.com', '/docs', 'https://', 'https://example.com/', 'https://example.com/shop', 'https://example.com?a=1', 'ftp://example.com', 'https://exa mple.com']) {
    it(`refuses "${bad}"`, () => {
      expect(breadcrumbSchema.safeParse({ siteUrl: bad }).success).toBe(false)
    })
  }
})
