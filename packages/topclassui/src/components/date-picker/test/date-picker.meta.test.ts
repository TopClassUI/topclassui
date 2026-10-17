import { describe, expect, it } from 'vitest'

import { meta } from '../meta.js'

// The shared contract checks the shape; this pins DatePicker's own row value by value.
describe('the catalog row', () => {
  it('is the row unit-5.md lists for DatePicker, verified against Base UI 1.8.0', () => {
    expect(meta).toEqual({
      name: 'DatePicker',
      slug: 'date-picker',
      category: 'forms',
      tier: 3,
      status: 'beta',
      rendering: 'client',
      baseUi: 'popover',
      baseUiRange: '1.8.0',
      optionalDeps: [],
    })
  })
})
