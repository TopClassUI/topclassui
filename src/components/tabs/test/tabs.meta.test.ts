import { describe, expect, it } from 'vitest'

import { meta } from '../meta.js'

// The shared contract checks the shape; this pins Tabs' own row value by value.
describe('the catalog row', () => {
  it('is the row PLAN 18 lists for Tabs: split, navigation, tier 1, verified against Base UI 1.8.0', () => {
    expect(meta).toEqual({
      name: 'Tabs',
      slug: 'tabs',
      category: 'navigation-and-disclosure',
      tier: 1,
      status: 'beta',
      rendering: 'split',
      baseUi: 'tabs',
      baseUiRange: '1.8.0',
      optionalDeps: [],
    })
  })
})
