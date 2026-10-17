import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import * as command from '../index.js'

describe('index.tsx exports Command, as the sample writes it, and its skeleton', () => {
  it('exports exactly Command and CommandSkeleton, two function components', () => {
    expect(Object.keys(command)).toEqual(['Command', 'CommandSkeleton'])
    expect([typeof command.Command, typeof command.CommandSkeleton]).toEqual(['function', 'function'])
  })

  it('its type surface is the props and the design props, and no Base UI name and no part', () => {
    const source = readFileSync(join(import.meta.dirname, '..', 'index.tsx'), 'utf8')
    expect(source).toContain("export { Command } from './client.js'")
    expect(source).toContain("export { CommandSkeleton } from './skeleton.js'")
    expect(source).toContain("export type { CommandDesignProps, CommandProps, CommandSkeletonProps } from './types.js'")
    expect(source).not.toMatch(/CommandPanel|CommandRows|@base-ui/)
  })
})
