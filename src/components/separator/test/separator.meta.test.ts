import { describe, expect, it } from 'vitest'

import { meta } from '../meta.js'

// The shared contract checks the shape; this pins Separator's own row value by value.
describe('the catalog row', () => {
  it('is the row PLAN 18.1 lists for Separator', () => {
    expect(meta).toEqual({
      name: 'Separator',
      slug: 'separator',
      category: 'typography-and-layout',
      tier: 1,
      status: 'beta',
      rendering: 'server',
      baseUi: null,
      baseUiRange: null,
      optionalDeps: [],
    })
  })
})
