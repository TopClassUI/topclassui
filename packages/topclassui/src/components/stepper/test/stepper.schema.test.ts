import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { z } from 'zod'
import { describe, expect, it } from 'vitest'

import { stepperSchema } from '../schema.js'

// R-8.3-3: the props table, the playground and registry.json all read this output.
const json = z.toJSONSchema(stepperSchema, { io: 'input' }) as {
  properties?: Record<string, { description?: string; default?: unknown; enum?: unknown[]; minimum?: number }>
}

describe('the schema is the documentation', () => {
  it('covers the one design prop, size', () => {
    expect(Object.keys(stepperSchema.shape)).toEqual(['size'])
    expect(Object.keys(json.properties ?? {})).toEqual(['size'])
  })

  it('carries a description, the md default and the shared six into the JSON Schema output', () => {
    expect(json.properties?.['size']?.description).toBe('The size of the circles (24 to 48 px) and of the titles; custom emits none.')
    expect(json.properties?.['size']?.default).toBe('md')
    expect(json.properties?.['size']?.enum).toEqual(['xs', 'sm', 'md', 'lg', 'xl', 'custom'])
  })

  it('reads the default from STEPPER_DEFAULTS, so constants.ts holds the only copy', () => {
    const source = readFileSync(join(import.meta.dirname, '..', 'schema.ts'), 'utf8')
    expect(source.match(/\.default\([^)]*\)/g)).toEqual(['.default(STEPPER_DEFAULTS.size)'])
  })

  it('accepts the six sizes and refuses another', () => {
    for (const size of ['xs', 'sm', 'md', 'lg', 'xl', 'custom']) expect(stepperSchema.safeParse({ size }).success, size).toBe(true)
    expect(stepperSchema.safeParse({ size: 'xxl' }).success).toBe(false)
  })

  it('bounds no number: a stepper has none to clamp, so it has no boundaries.ts', () => {
    expect(json.properties?.['size']?.minimum).toBeUndefined()
  })
})
