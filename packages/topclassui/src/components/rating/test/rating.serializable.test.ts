import { describe, expectTypeOf, it } from 'vitest'

import type { UnserializableKeys } from '#test/serializable.js'
import type { RatingEditableProps, RatingProps, RatingReadOnlyProps } from '../types.js'

// The exemptions are the decision of 2026-10-17 in docs/DECISIONS.md; a new one fails here first.
describe('only serializable props cross the boundary (R-5.1-3)', () => {
  it('a read-only Rating calls labels on the server and hands the stars plain numbers', () => {
    expectTypeOf<UnserializableKeys<RatingReadOnlyProps>>().toEqualTypeOf<'labels'>()
  })

  it('an editable Rating hands the client part strings; onValueChange is client-only', () => {
    expectTypeOf<UnserializableKeys<RatingEditableProps>>().toEqualTypeOf<'labels' | 'onValueChange'>()
    expectTypeOf<UnserializableKeys<RatingProps>>().toEqualTypeOf<'labels' | 'onValueChange'>()
  })
})
