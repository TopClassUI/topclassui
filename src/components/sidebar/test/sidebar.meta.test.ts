import { describe, expect, it } from 'vitest'

import { meta } from '../meta.js'

// The shared contract checks the shape; this pins Sidebar's own row value by value.
describe('the catalog row', () => {
  it('is the row PLAN 18 lists for Sidebar: split, navigation, tier 2, and built on no Base UI part', () => {
    expect(meta).toEqual({
      name: 'Sidebar',
      slug: 'sidebar',
      category: 'navigation-and-disclosure',
      tier: 2,
      status: 'beta',
      rendering: 'split',
      baseUi: null,
      baseUiRange: null,
      optionalDeps: [],
    })
  })
})
