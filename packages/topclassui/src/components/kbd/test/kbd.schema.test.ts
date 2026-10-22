import { z } from 'zod'
import { describe, expect, it } from 'vitest'

import { KBD_DEFAULTS } from '../constants.js'
import { kbdSchema } from '../schema.js'

// R-8.3-3: the props table and the site's Try it read this output.
const json = z.toJSONSchema(kbdSchema, { io: 'input' }) as {
  required?: string[]
  properties?: Record<string, { type?: string; description?: string; default?: unknown }>
}

describe('the schema is the documentation', () => {
  it('covers pressed and disabled, the two states the frame draws, and none it leaves unbuilt', () => {
    expect(Object.keys(kbdSchema.shape)).toEqual(['pressed', 'disabled'])
    expect(Object.keys(json.properties ?? {})).toEqual(['pressed', 'disabled'])
  })

  it('makes both optional booleans that start off', () => {
    expect(json.required ?? []).toEqual([])
    expect(KBD_DEFAULTS).toEqual({ pressed: false, disabled: false })
    expect(json.properties?.pressed).toMatchObject({ type: 'boolean', default: false })
    expect(json.properties?.disabled).toMatchObject({ type: 'boolean', default: false })
    expect(kbdSchema.parse({})).toEqual({ pressed: false, disabled: false })
  })

  it('gives each a description for the props table', () => {
    expect(json.properties?.pressed?.description).toContain('held down')
    expect(json.properties?.disabled?.description).toContain('4.5:1')
  })

  it('refuses a value that is not a boolean', () => {
    expect(kbdSchema.safeParse({ pressed: 'true' }).success).toBe(false)
    expect(kbdSchema.safeParse({ disabled: 1 }).success).toBe(false)
  })
})
