import { describe, expect, it } from 'vitest'

import { meta } from '../meta.js'

// The shared contract checks the shape; this pins Dropdown's own row value by value.
describe('the catalog row', () => {
  it('is the row the plan lists for Dropdown, verified against the menu of Base UI 1.8.0', () => {
    expect(meta).toEqual({
      name: 'Dropdown',
      slug: 'dropdown',
      category: 'overlays',
      tier: 1,
      status: 'beta',
      rendering: 'client',
      baseUi: 'menu',
      baseUiRange: '1.8.0',
      optionalDeps: [],
    })
  })
})
