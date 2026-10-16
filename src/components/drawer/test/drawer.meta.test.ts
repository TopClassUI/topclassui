import { describe, expect, it } from 'vitest'

import { meta } from '../meta.js'

// The shared contract checks the shape; this pins Drawer's own row value by value.
describe('the catalog row', () => {
  it('is the row PLAN 18.5 lists for Drawer, verified against Base UI 1.8.0', () => {
    expect(meta).toEqual({
      name: 'Drawer',
      slug: 'drawer',
      category: 'overlays',
      tier: 1,
      status: 'beta',
      rendering: 'client',
      baseUi: 'drawer',
      baseUiRange: '1.8.0',
      optionalDeps: [],
    })
  })
})
