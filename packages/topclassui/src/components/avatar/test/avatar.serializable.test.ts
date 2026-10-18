import { describe, expectTypeOf, it } from 'vitest'

import type { UnserializableKeys } from '#test/serializable.js'
import type { AvatarRootProps, AvatarFallbackProps, AvatarSkeletonProps } from '../types.js'

// The exemptions are the decision of 2026-10-17 in docs/DECISIONS.md; a new one fails here first.
describe('only serializable props cross the boundary (R-5.1-3)', () => {
  it('the server parts and the skeleton take no function and no class instance', () => {
    expectTypeOf<UnserializableKeys<AvatarRootProps>>().toEqualTypeOf<never>()
    expectTypeOf<UnserializableKeys<AvatarFallbackProps>>().toEqualTypeOf<never>()
    expectTypeOf<UnserializableKeys<AvatarSkeletonProps>>().toEqualTypeOf<never>()
  })
})
