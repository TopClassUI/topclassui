import { describe, expect, it } from 'vitest'

import { meta } from '../meta.js'

// The shared contract checks the shape; this pins CodeBlock's own row value by value.
describe('the catalog row', () => {
  it('is the row unit-5.md lists for CodeBlock: split, tier 2, and on no Base UI part', () => {
    expect(meta).toEqual({
      name: 'CodeBlock',
      slug: 'code-block',
      category: 'typography-and-layout',
      tier: 2,
      status: 'beta',
      rendering: 'split',
      baseUi: null,
      baseUiRange: null,
      optionalDeps: [],
    })
  })
})
