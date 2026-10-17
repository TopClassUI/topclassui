import { describe, expect, it } from 'vitest'

import { meta } from '../meta.js'

// The shared contract checks the shape; this pins Toast's own row value by value.
describe('the catalog row', () => {
  it('is the row the plan gives Toast, verified against Base UI 1.8.0', () => {
    expect(meta).toEqual({
      name: 'Toast',
      slug: 'toast',
      category: 'overlays',
      tier: 1,
      status: 'beta',
      rendering: 'client',
      baseUi: 'toast',
      baseUiRange: '1.8.0',
      optionalDeps: [],
    })
  })
})
