import { z } from 'zod'
import { describe, expect, it } from 'vitest'

import { AVATAR_DEFAULTS, AVATAR_SIZES } from '../constants.js'
import { avatarSchema } from '../schema.js'

// R-8.3-3: the props table, the playground and registry.json all read this output.
const json = z.toJSONSchema(avatarSchema, { io: 'input' }) as {
  properties?: Record<string, { description?: string; default?: unknown; enum?: unknown[] }>
}

describe('the schema is the documentation', () => {
  it('covers the one design prop, and none of the four the spec leaves unbuilt', () => {
    expect(Object.keys(avatarSchema.shape)).toEqual(['size'])
    expect(Object.keys(json.properties ?? {})).toEqual(['size'])
  })

  it('describes size for the props table', () => {
    expect(json.properties?.size?.description).toContain('custom emits no size classes')
  })

  it('offers the shared scale, written out, with md as the default', () => {
    expect(json.properties?.size?.enum).toEqual(['xs', 'sm', 'md', 'lg', 'xl', 'custom'])
    expect([...AVATAR_SIZES]).toEqual(['xs', 'sm', 'md', 'lg', 'xl', 'custom'])
    expect(json.properties?.size?.default).toBe('md')
    expect(AVATAR_DEFAULTS).toEqual({ size: 'md' })
  })

  it('fills the default in and rejects a size outside the scale', () => {
    expect(avatarSchema.parse({})).toEqual({ size: 'md' })
    expect(avatarSchema.safeParse({ size: '2xl' }).success).toBe(false)
  })
})
