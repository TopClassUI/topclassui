import { describe, expect, it } from 'vitest'

import { meta } from '../meta.js'

// The shared contract checks the shape; this pins Tooltip's own row value by value.
describe('the catalog row', () => {
  it('is the row PLAN 18.5 lists for Tooltip, verified against Base UI 1.8.0', () => {
    expect(meta).toEqual({
      name: 'Tooltip',
      slug: 'tooltip',
      category: 'overlays',
      tier: 1,
      status: 'beta',
      rendering: 'client',
      baseUi: 'tooltip',
      baseUiRange: '1.8.0',
      optionalDeps: [],
    })
  })
})
