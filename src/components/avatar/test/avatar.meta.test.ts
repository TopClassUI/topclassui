import { describe, expect, it } from 'vitest'

import { meta } from '../meta.js'

// The shared contract checks the shape; this pins Avatar's own row value by value.
describe('the catalog row', () => {
  it('is the row PLAN 18 lists for Avatar', () => {
    expect(meta).toEqual({
      name: 'Avatar',
      slug: 'avatar',
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
