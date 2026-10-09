import { describe, expect, it } from 'vitest'

import { meta } from '../meta.js'

// The shared contract checks the shape; this pins Pagination's own row value by value.
describe('the catalog row', () => {
  it('is the row PLAN 18 lists for Pagination: server, tier 1, navigation and disclosure', () => {
    expect(meta).toEqual({
      name: 'Pagination',
      slug: 'pagination',
      category: 'navigation-and-disclosure',
      tier: 1,
      status: 'beta',
      rendering: 'server',
      baseUi: null,
      baseUiRange: null,
      optionalDeps: [],
    })
  })
})
