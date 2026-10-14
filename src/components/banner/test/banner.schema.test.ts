import { z } from 'zod'
import { describe, expect, it } from 'vitest'

import { bannerSchema } from '../schema.js'

// R-8.3-3: the props table, the playground and registry.json all read this output.
const json = z.toJSONSchema(bannerSchema, { io: 'input' }) as {
  properties?: Record<string, { description?: string; default?: unknown; enum?: unknown[]; type?: string }>
}

describe('the schema is the documentation', () => {
  it('covers the two design props: no variant, size, placement or sticky', () => {
    expect(Object.keys(bannerSchema.shape)).toEqual(['tone', 'dismissible'])
  })

  it('converts to JSON Schema at all', () => {
    expect(Object.keys(json.properties ?? {})).toEqual(['tone', 'dismissible'])
  })

  for (const prop of ['tone', 'dismissible']) {
    it(`${prop} carries a description into the JSON Schema output`, () => {
      const description = json.properties?.[prop]?.description ?? ''
      expect(description.length).toBeGreaterThan(10)
      expect(description).not.toContain('TODO')
    })
  }

  it('tone carries the default the spec names', () => {
    expect(json.properties?.['tone']?.default).toBe('primary')
  })

  it('lists the six tones as the limit of the prop', () => {
    expect(json.properties?.['tone']?.enum)
      .toEqual(['primary', 'neutral', 'success', 'warning', 'danger', 'info'])
  })

  it('dismissible is a boolean that is off unless asked, so a plain banner ships no client code', () => {
    expect(json.properties?.['dismissible']?.type).toBe('boolean')
    expect(json.properties?.['dismissible']?.default).toBe(false)
  })
})
