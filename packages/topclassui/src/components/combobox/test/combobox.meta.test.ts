import { describe, expect, it } from 'vitest'

import { meta } from '../meta.js'

// The shared contract checks the shape; this pins Combobox's own row value by value.
describe('the catalog row', () => {
  it('is the row unit-4.md lists for Combobox, verified against Base UI 1.8.0', () => {
    expect(meta).toEqual({
      name: 'Combobox',
      slug: 'combobox',
      category: 'forms',
      tier: 2,
      status: 'beta',
      rendering: 'client',
      baseUi: 'combobox',
      baseUiRange: '1.8.0',
      optionalDeps: [],
    })
  })
})
