import { describe, expectTypeOf, it } from 'vitest'

import type { UnserializableKeys } from '#test/serializable.js'
import type { TagProps } from '../types.js'

describe('only serializable props cross the boundary (R-5.1-3)', () => {
  it('Tag takes no function: the handler of the x is a prop of TagRemovable, the client export', () => {
    expectTypeOf<UnserializableKeys<TagProps>>().toEqualTypeOf<never>()
  })
})
