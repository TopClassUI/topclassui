import { describe, expect, it } from 'vitest'

import { meta } from '../meta.js'

// The shared contract checks the shape; this pins SegmentedControl's own row value by value.
describe('the catalog row', () => {
  it('is the row unit-4.md lists for SegmentedControl, verified against Base UI 1.8.0', () => {
    expect(meta).toEqual({
      name: 'SegmentedControl',
      slug: 'segmented-control',
      category: 'forms',
      tier: 2,
      status: 'beta',
      rendering: 'client',
      baseUi: 'radio-group',
      baseUiRange: '1.8.0',
      optionalDeps: [],
    })
  })
})
