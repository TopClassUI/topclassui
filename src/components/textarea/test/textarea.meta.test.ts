import { describe, expect, it } from 'vitest'

import { meta } from '../meta.js'

// The shared contract checks the shape; this pins Textarea's own row value by value.
describe('the catalog row', () => {
  it('is the row unit-4.md lists for Textarea: split, and on no Base UI part', () => {
    expect(meta).toEqual({
      name: 'Textarea',
      slug: 'textarea',
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
