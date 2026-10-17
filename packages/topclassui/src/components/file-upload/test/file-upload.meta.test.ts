import { describe, expect, it } from 'vitest'

import { meta } from '../meta.js'

// The shared contract checks the shape; this pins FileUpload's own row value by value.
describe('the catalog row', () => {
  it('is the row unit-5.md lists for FileUpload: a client form control on no Base UI part', () => {
    expect(meta).toEqual({
      name: 'FileUpload',
      slug: 'file-upload',
      category: 'forms',
      tier: 3,
      status: 'beta',
      rendering: 'client',
      baseUi: null,
      baseUiRange: null,
      optionalDeps: [],
    })
  })
})
