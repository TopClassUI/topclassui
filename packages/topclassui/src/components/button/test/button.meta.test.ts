import { describe, expect, it } from 'vitest'

import { meta } from '../meta.js'

// The shared contract checks the shape; this pins Button's own row value by value.
describe('the catalog row', () => {
  it('is the row PLAN 18.3 lists for Button', () => {
    expect(meta).toEqual({
      name: 'Button',
      slug: 'button',
      category: 'actions',
      tier: 1,
      status: 'beta',
      rendering: 'server',
      baseUi: null,
      baseUiRange: null,
      optionalDeps: [],
    })
  })
})
