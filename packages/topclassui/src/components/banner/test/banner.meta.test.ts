import { describe, expect, it } from 'vitest'

import { meta } from '../meta.js'

// The shared contract checks the shape; this pins Banner's own row value by value.
describe('the catalog row', () => {
  it('is the tier 2 row of PLAN 18, split now that the dismiss button is built, and still beta', () => {
    expect(meta).toEqual({
      name: 'Banner',
      slug: 'banner',
      category: 'media-and-display',
      tier: 2,
      status: 'beta',
      rendering: 'split',
      baseUi: null,
      baseUiRange: null,
      optionalDeps: [],
    })
  })
})
