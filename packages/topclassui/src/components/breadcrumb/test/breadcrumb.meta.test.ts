import { describe, expect, it } from 'vitest'

import { meta } from '../meta.js'

// The shared contract checks the shape; this pins Breadcrumb's own row value by value.
describe('the catalog row', () => {
  it('is the row PLAN 18.6 lists for Breadcrumb', () => {
    expect(meta).toEqual({
      name: 'Breadcrumb',
      slug: 'breadcrumb',
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
