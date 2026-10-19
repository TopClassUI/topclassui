import { z } from 'zod'
import { describe, expect, it } from 'vitest'

import { breadcrumbSchema } from '../schema.js'

// R-8.3-3: the props table reads this output.
const json = z.toJSONSchema(breadcrumbSchema, { io: 'input' }) as {
  required?: string[]
  properties?: Record<string, { type?: string; pattern?: string; description?: string }>
}

describe('the schema is the documentation', () => {
  it('covers siteUrl, the one design prop', () => {
    expect(Object.keys(breadcrumbSchema.shape)).toEqual(['siteUrl'])
    expect(Object.keys(json.properties ?? {})).toEqual(['siteUrl'])
  })

  it('makes siteUrl optional, since leaving it out is how a demo writes no JSON-LD', () => {
    expect(json.required ?? []).toEqual([])
    expect(breadcrumbSchema.parse({})).toEqual({})
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
