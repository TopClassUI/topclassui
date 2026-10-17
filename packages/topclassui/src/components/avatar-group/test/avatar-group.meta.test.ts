import { describe, expect, it } from 'vitest'

import { meta } from '../meta.js'

// The shared contract checks the shape; this pins AvatarGroup's own row value by value.
describe('the catalog row', () => {
  it('is the row Unit 2 builds for AvatarGroup: server, tier 2, media and display', () => {
    expect(meta).toEqual({
      name: 'AvatarGroup',
      slug: 'avatar-group',
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
