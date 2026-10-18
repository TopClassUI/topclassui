import { describe, expectTypeOf, it } from 'vitest'

import type { UnserializableKeys } from '#test/serializable.js'
import type { RatingEditableProps, RatingProps, RatingReadOnlyProps } from '../types.js'

// labels stays: R-5.11-2 makes a count label a function, and the server render calls it; only its strings cross.
describe('only serializable props cross the boundary (R-5.1-3)', () => {
  it('a read-only Rating calls labels on the server and hands the stars plain numbers', () => {
    expectTypeOf<UnserializableKeys<RatingReadOnlyProps>>().toEqualTypeOf<'labels'>()
  })

  it('an editable Rating hands the client part strings, and takes no handler: onValueChange is RatingInput\'s', () => {
    expectTypeOf<UnserializableKeys<RatingEditableProps>>().toEqualTypeOf<'labels'>()
    expectTypeOf<UnserializableKeys<RatingProps>>().toEqualTypeOf<'labels'>()
  })
})
