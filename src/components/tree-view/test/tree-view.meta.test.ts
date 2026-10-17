import { describe, expect, it } from 'vitest'

import { meta } from '../meta.js'

// The shared contract checks the shape; this pins TreeView's own row value by value.
describe('the catalog row', () => {
  it('is the row unit-5.md lists for TreeView: data, tier 3, a client component on no Base UI part', () => {
    expect(meta).toEqual({
      name: 'TreeView',
      slug: 'tree-view',
      category: 'data',
      tier: 3,
      status: 'beta',
      rendering: 'client',
      baseUi: null,
      baseUiRange: null,
      optionalDeps: [],
    })
  })
})
