import { z } from 'zod'
import { describe, expect, it } from 'vitest'

import { ALERT_DEFAULTS } from '../constants.js'
import { alertSchema } from '../schema.js'

// R-8.3-3: the props table, the playground and registry.json all read this output.
const json = z.toJSONSchema(alertSchema, { io: 'input' }) as {
  properties?: Record<string, { description?: string; default?: unknown; enum?: unknown[] }>
}

describe('the schema is the documentation', () => {
  const keys = Object.keys(alertSchema.shape)

  it('covers every design prop, and no size: the alert has one', () => {
    // Named, or a key dropped from ALERT_DEFAULTS drops from the expectation too.
    expect(keys.sort()).toEqual(['tone', 'variant'])
  })

  it('converts to JSON Schema at all', () => {
    expect(Object.keys(json.properties ?? {}).sort()).toEqual(['tone', 'variant'])
  })

  for (const key of keys) {
    it(`${key} carries a description into the JSON Schema output`, () => {
      const description = json.properties?.[key]?.description
      expect(typeof description, key).toBe('string')
      expect((description ?? '').length, key).toBeGreaterThan(10)
      expect(description ?? '', key).not.toContain('TODO')
    })

    it(`${key} carries the default from constants.ts, not a second copy`, () => {
      expect(json.properties?.[key]?.default, key)
        .toBe(ALERT_DEFAULTS[key as keyof typeof ALERT_DEFAULTS])
    })
  }

  it('lists the three variants and the six tones as the limits of each prop', () => {
    expect(json.properties?.['variant']?.enum).toEqual(['soft', 'solid', 'outline'])
    expect(json.properties?.['tone']?.enum)
      .toEqual(['primary', 'neutral', 'success', 'warning', 'danger', 'info'])
  })
})
