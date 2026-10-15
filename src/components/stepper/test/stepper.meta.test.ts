import { describe, expect, it } from 'vitest'

import { meta } from '../meta.js'

// The shared contract checks the shape; this pins Stepper's own row value by value.
describe('the catalog row', () => {
  it('is the row unit-5.md gives Stepper: navigation and disclosure (PLAN 18.6), tier 3, server-rendered and still beta', () => {
    expect(meta).toEqual({
      name: 'Stepper',
      slug: 'stepper',
      category: 'navigation-and-disclosure',
      tier: 3,
      status: 'beta',
      rendering: 'server',
      baseUi: null,
      baseUiRange: null,
      optionalDeps: [],
    })
  })
})
