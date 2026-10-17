import { describe, expectTypeOf, it } from 'vitest'

import type { UnserializableKeys } from '#test/serializable.js'
import type { AvatarGroupProps } from '../types.js'

// The exemptions are the decision of 2026-10-17 in docs/DECISIONS.md; a new one fails here first.
describe('only serializable props cross the boundary (R-5.1-3)', () => {
  it('AvatarGroup: labels are called on the server and reach the element or the client part as strings (R-5.11-2)', () => {
    expectTypeOf<UnserializableKeys<AvatarGroupProps>>().toEqualTypeOf<'labels'>()
  })
})
