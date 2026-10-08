import { describe, expect, it } from 'vitest'

import { meta } from '../meta.js'

// The shared contract checks the shape; this pins Kbd's own row value by value.
describe('the catalog row', () => {
  it('is the row PLAN 18.1 lists for Kbd', () => {
    expect(meta).toEqual({
      name: 'Kbd',
      slug: 'kbd',
      category: 'typography-and-layout',
      tier: 2,
      status: 'beta',
      rendering: 'server',
      baseUi: null,
      baseUiRange: null,
      optionalDeps: [],
    })
  })
})
