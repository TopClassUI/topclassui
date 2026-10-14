import { describe, expect, it } from 'vitest'

import { meta } from '../meta.js'

// The shared contract checks the shape; this pins Select's own row value by value.
describe('the catalog row', () => {
  it('is the row unit-4.md lists for Select, verified against Base UI 1.8.0', () => {
    expect(meta).toEqual({
      name: 'Select',
      slug: 'select',
      category: 'forms',
      tier: 1,
      status: 'beta',
      rendering: 'client',
      baseUi: 'select',
      baseUiRange: '1.8.0',
      optionalDeps: [],
    })
  })
})
