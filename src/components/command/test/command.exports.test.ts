import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import * as command from '../index.js'

describe('index.tsx exports one name, Command, as the sample writes it', () => {
  it('exports exactly Command, a function component', () => {
    expect(Object.keys(command)).toEqual(['Command'])
    expect(typeof command.Command).toBe('function')
  })

  it('its type surface is the props and the design props, and no Base UI name and no part', () => {
    const source = readFileSync(join(import.meta.dirname, '..', 'index.tsx'), 'utf8')
    expect(source).toContain("export { Command } from './client.js'")
    expect(source).toContain("export type { CommandDesignProps, CommandProps } from './types.js'")
    expect(source).not.toMatch(/CommandPanel|CommandRows|@base-ui/)
  })
})
