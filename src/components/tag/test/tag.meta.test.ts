import { describe, expect, it } from 'vitest'

import { meta } from '../meta.js'

// The shared contract checks the shape; this pins Tag's own row value by value.
describe('the catalog row', () => {
  it('is the row the Unit 2 Build this block gives Tag, now split: the x is the client half', () => {
    expect(meta).toEqual({
      name: 'Tag',
      slug: 'tag',
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
