import { describe, expect, it } from 'vitest'

import { meta } from '../meta.js'

// The shared contract checks the shape; this pins Navbar's own row value by value.
describe('the catalog row', () => {
  it('is the row the Unit 3 plan lists for Navbar: split, tier 2, no Base UI part', () => {
    expect(meta).toEqual({
      name: 'Navbar',
      slug: 'navbar',
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
