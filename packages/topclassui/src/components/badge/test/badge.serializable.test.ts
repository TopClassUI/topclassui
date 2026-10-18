import { describe, expectTypeOf, it } from 'vitest'

import type { UnserializableKeys } from '#test/serializable.js'
import type { BadgeProps } from '../types.js'

// The exemptions are the decision of 2026-10-17 in docs/DECISIONS.md; a new one fails here first.
describe('only serializable props cross the boundary (R-5.1-3)', () => {
  it('Badge takes no function and no class instance beyond ref and the native handlers', () => {
    expectTypeOf<UnserializableKeys<BadgeProps>>().toEqualTypeOf<never>()
  })
})
