import { describe, expect, it } from 'vitest'

import { meta } from '../meta.js'

// The shared contract checks the shape; this pins Rating's own row value by value.
describe('the catalog row', () => {
  it('is the row the plan gives Rating: split, tier 3, media and display, no Base UI part', () => {
    expect(meta).toEqual({
      name: 'Rating',
      slug: 'rating',
      category: 'media-and-display',
      tier: 3,
      status: 'beta',
      rendering: 'split',
      baseUi: null,
      baseUiRange: null,
      optionalDeps: [],
    })
  })
})
