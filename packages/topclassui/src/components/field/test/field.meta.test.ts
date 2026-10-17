import { describe, expect, it } from 'vitest'

import { meta } from '../meta.js'

// The shared contract checks the shape; this pins Field's own row value by value.
describe('the catalog row', () => {
  it('is the row unit-5.md lists for Field: split, forms, tier 1, on no Base UI part', () => {
    expect(meta).toEqual({
      name: 'Field',
      slug: 'field',
      category: 'forms',
      tier: 1,
      status: 'beta',
      rendering: 'split',
      baseUi: null,
      baseUiRange: null,
      optionalDeps: [],
    })
  })
})
