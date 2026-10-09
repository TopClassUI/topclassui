import { describe, expect, it } from 'vitest'

import { meta } from '../meta.js'

// The shared contract checks the shape; this pins Timeline's own row value by value.
describe('the catalog row', () => {
  it('is the row PLAN 18.2 lists for Timeline: media and display, tier 3, server-rendered and still beta', () => {
    expect(meta).toEqual({
      name: 'Timeline',
      slug: 'timeline',
      category: 'media-and-display',
      tier: 3,
      status: 'beta',
      rendering: 'server',
      baseUi: null,
      baseUiRange: null,
      optionalDeps: [],
    })
  })
})
