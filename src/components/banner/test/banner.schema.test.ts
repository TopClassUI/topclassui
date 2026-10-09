import { z } from 'zod'
import { describe, expect, it } from 'vitest'

import { bannerSchema } from '../schema.js'

// R-8.3-3: the props table, the playground and registry.json all read this output.
const json = z.toJSONSchema(bannerSchema, { io: 'input' }) as {
  properties?: Record<string, { description?: string; default?: unknown; enum?: unknown[] }>
}

describe('the schema is the documentation', () => {
  it('covers the one design prop: no variant, size, placement or sticky', () => {
    expect(Object.keys(bannerSchema.shape)).toEqual(['tone'])
  })

  it('converts to JSON Schema at all', () => {
    expect(Object.keys(json.properties ?? {})).toEqual(['tone'])
  })

  it('tone carries a description into the JSON Schema output', () => {
    const description = json.properties?.['tone']?.description ?? ''
    expect(description.length).toBeGreaterThan(10)
    expect(description).not.toContain('TODO')
  })

  it('tone carries the default the spec names', () => {
    expect(json.properties?.['tone']?.default).toBe('primary')
  })

  it('lists the six tones as the limit of the prop', () => {
    expect(json.properties?.['tone']?.enum)
      .toEqual(['primary', 'neutral', 'success', 'warning', 'danger', 'info'])
  })
})
