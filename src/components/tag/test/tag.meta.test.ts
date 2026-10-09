import { describe, expect, it } from 'vitest'

import { meta } from '../meta.js'

// The shared contract checks the shape; this pins Tag's own row value by value.
describe('the catalog row', () => {
  it('is the row the Unit 2 Build this block gives Tag, server half only', () => {
    expect(meta).toEqual({
      name: 'Tag',
      slug: 'tag',
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
