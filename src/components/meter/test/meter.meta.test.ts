import { describe, expect, it } from 'vitest'

import { meta } from '../meta.js'

// The shared contract checks the shape; this pins Meter's own row value by value.
describe('the catalog row', () => {
  it('is the row unit-5.md gives Meter: server, tier 2, media and display, no Base UI', () => {
    expect(meta).toEqual({
      name: 'Meter',
      slug: 'meter',
      category: 'media-and-display',
      tier: 2,
      status: 'beta',
      rendering: 'server',
      baseUi: null,
      baseUiRange: null,
      optionalDeps: [],
    })
  })
})
