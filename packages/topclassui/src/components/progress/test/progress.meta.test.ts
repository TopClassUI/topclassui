import { describe, expect, it } from 'vitest'

import { meta } from '../meta.js'

// The shared contract checks the shape; this pins Progress's own row value by value.
describe('the catalog row', () => {
  it('is the row PLAN 18.2 lists for Progress: server, tier 2, media and display', () => {
    expect(meta).toEqual({
      name: 'Progress',
      slug: 'progress',
      category: 'media-and-display',
      tier: 2,
      status: 'beta',
      rendering: 'server',
      baseUi: null,
      baseUiRange: null,
      optionalDeps: [],
    })
  })
})
