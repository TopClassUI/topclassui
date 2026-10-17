import { describe, expectTypeOf, it } from 'vitest'

import type { UnserializableKeys } from '#test/serializable.js'
import type { TagProps } from '../types.js'

// The exemptions are the decision of 2026-10-17 in docs/DECISIONS.md; a new one fails here first.
describe('only serializable props cross the boundary (R-5.1-3)', () => {
  it('Tag: onRemove is client-only: only a client file can pass it, and it goes to the client x', () => {
    expectTypeOf<UnserializableKeys<TagProps>>().toEqualTypeOf<'onRemove'>()
  })
})
