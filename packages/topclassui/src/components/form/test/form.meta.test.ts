import { describe, expect, it } from 'vitest'

import { meta } from '../meta.js'

// The shared contract checks the shape; this pins Form's own row value by value.
describe('the catalog row', () => {
  it('is the row unit-5.md lists for Form: split, tier 1, and on no Base UI part', () => {
    expect(meta).toEqual({
      name: 'Form',
      slug: 'form',
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
