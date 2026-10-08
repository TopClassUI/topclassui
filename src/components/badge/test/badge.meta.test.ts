import { describe, expect, it } from 'vitest'

import { meta } from '../meta.js'

// The shared contract checks the shape; this pins Badge's own row value by value.
describe('the catalog row', () => {
  it('is the row PLAN 18 lists for Badge', () => {
    expect(meta).toEqual({
      name: 'Badge',
      slug: 'badge',
      category: 'media-and-display',
      tier: 1,
      status: 'beta',
      rendering: 'server',
      baseUi: null,
      baseUiRange: null,
      optionalDeps: [],
    })
  })
})
