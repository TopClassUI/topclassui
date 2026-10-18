import { describe, expectTypeOf, it } from 'vitest'

import type { UnserializableKeys } from '#test/serializable.js'
import type { BannerProps } from '../types.js'

describe('only serializable props cross the boundary (R-5.1-3)', () => {
  it('Banner takes no function: onDismiss is a prop of BannerDismissible, the client export', () => {
    expectTypeOf<UnserializableKeys<BannerProps>>().toEqualTypeOf<never>()
  })
})
