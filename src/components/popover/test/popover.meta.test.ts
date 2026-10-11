import { describe, expect, it } from 'vitest'

import { meta } from '../meta.js'

// The shared contract checks the shape; this pins Popover's own row value by value.
describe('the catalog row', () => {
  it('is the row the plan lists for Popover, verified against Base UI 1.8.0', () => {
    expect(meta).toEqual({
      name: 'Popover',
      slug: 'popover',
      category: 'overlays',
      tier: 1,
      status: 'beta',
      rendering: 'client',
      baseUi: 'popover',
      baseUiRange: '1.8.0',
      optionalDeps: [],
    })
  })
})
