import { describe, expect, it } from 'vitest'

import { meta } from '../meta.js'

// The shared contract checks the shape; this pins Input's own row value by value.
describe('the catalog row', () => {
  it('is the row PLAN 18 lists for Input, split since validate loads a client half', () => {
    expect(meta).toEqual({
      name: 'Input',
      slug: 'input',
      category: 'forms',
      tier: 1,
      status: 'beta',
      rendering: 'split',
      baseUi: null,
      baseUiRange: null,
      optionalDeps: [],
    })
  })
})
