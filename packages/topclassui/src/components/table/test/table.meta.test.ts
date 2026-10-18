import { describe, expect, it } from 'vitest'

import { meta } from '../meta.js'

// The shared contract checks the shape; this pins Table's own row value by value.
describe('the catalog row', () => {
  it('is the row PLAN 18.2 lists for Table, split: a server table with a client body, and still beta', () => {
    expect(meta).toEqual({
      name: 'Table',
      slug: 'table',
      category: 'media-and-display',
      tier: 1,
      status: 'beta',
      rendering: 'split',
      baseUi: null,
      baseUiRange: null,
      optionalDeps: [],
    })
  })
})
