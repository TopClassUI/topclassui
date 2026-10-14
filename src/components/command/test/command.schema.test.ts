import { describe, expect, it } from 'vitest'

import { COMMAND_BOUNDARIES } from '../boundaries.js'
import { COMMAND_DEFAULTS } from '../constants.js'
import { meta } from '../meta.js'
import { commandSchema } from '../schema.js'

describe('the schema', () => {
  it('fills every default the plan gives: the k shortcut, closed, windowing on above the threshold, seven rows', () => {
    expect(commandSchema.parse({})).toEqual({ visibleRows: 7, virtualize: 'auto', shortcut: 'k', defaultOpen: false })
    expect(COMMAND_DEFAULTS).toEqual({ shortcut: 'k', defaultOpen: false, virtualize: 'auto', visibleRows: 7 })
  })

  it('bounds visibleRows to 1 to 100 rows, a whole number, the same bound the hook clamps to', () => {
    expect(COMMAND_BOUNDARIES).toEqual({ visibleRowsMin: 1, visibleRowsMax: 100 })
    expect(commandSchema.safeParse({ visibleRows: 1 }).success).toBe(true)
    expect(commandSchema.safeParse({ visibleRows: 100 }).success).toBe(true)
    expect(commandSchema.safeParse({ visibleRows: 0 }).success).toBe(false)
    expect(commandSchema.safeParse({ visibleRows: 101 }).success).toBe(false)
    expect(commandSchema.safeParse({ visibleRows: 2.5 }).success).toBe(false)
  })

  it('takes null as no shortcut, and refuses an empty one, which would match no key', () => {
    expect(commandSchema.parse({ shortcut: null }).shortcut).toBeNull()
    expect(commandSchema.safeParse({ shortcut: '' }).success).toBe(false)
  })

  it('virtualize is auto, true or false, and nothing else', () => {
    for (const value of ['auto', true, false]) expect(commandSchema.safeParse({ virtualize: value }).success).toBe(true)
    expect(commandSchema.safeParse({ virtualize: 'always' }).success).toBe(false)
  })
})

describe('the catalog row', () => {
  it('is the row the plan gives Command: an overlay of tier 3 on Base UI autocomplete 1.8.0, beta', () => {
    expect(meta).toEqual({
      name: 'Command',
      slug: 'command',
      category: 'overlays',
      tier: 3,
      status: 'beta',
      rendering: 'client',
      baseUi: 'autocomplete',
      baseUiRange: '1.8.0',
      optionalDeps: [],
    })
  })
})
