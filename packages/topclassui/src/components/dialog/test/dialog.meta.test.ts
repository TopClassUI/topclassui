import { describe, expect, it } from 'vitest'

import { meta } from '../meta.js'

// The shared contract checks the shape; this pins Dialog's own row value by value.
describe('the catalog row', () => {
  it('is the row PLAN 18.5 lists for Dialog, verified against Base UI 1.8.0', () => {
    expect(meta).toEqual({
      name: 'Dialog',
      slug: 'dialog',
      category: 'overlays',
      tier: 1,
      status: 'beta',
      rendering: 'client',
      baseUi: 'dialog',
      baseUiRange: '1.8.0',
      optionalDeps: [],
    })
  })
})
