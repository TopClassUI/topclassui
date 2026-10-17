import { describe, expect, it } from 'vitest'

import { meta } from '../meta.js'

// The shared contract checks the shape; this pins Accordion's own row value by value.
describe('the catalog row', () => {
  it('is the row PLAN 18 lists for Accordion: split, tier 1, verified against Base UI 1.8.0', () => {
    expect(meta).toEqual({
      name: 'Accordion',
      slug: 'accordion',
      category: 'navigation-and-disclosure',
      tier: 1,
      status: 'beta',
      rendering: 'split',
      baseUi: 'accordion',
      baseUiRange: '1.8.0',
      optionalDeps: [],
    })
  })
})
