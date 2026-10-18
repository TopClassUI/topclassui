import { describe, expectTypeOf, it } from 'vitest'

import type { HoldsUnserializable, UnserializableKeys } from '#test/serializable.js'
import type { PartialLabels, ProviderLabels } from '../labels/types.js'
import type { TopClassProviderProps } from './provider.js'

// R-13-1 mounts the provider from the server root layout, so every prop it takes crosses into this client file.
describe('only serializable props cross into the provider (R-5.1-3)', () => {
  it('TopClassProvider takes no function and no class instance', () => {
    expectTypeOf<UnserializableKeys<TopClassProviderProps>>().toEqualTypeOf<never>()
  })

  it('takes the string labels only: a count label is a function, which a component takes instead', () => {
    expectTypeOf<HoldsUnserializable<PartialLabels>>().toEqualTypeOf<true>()
    expectTypeOf<HoldsUnserializable<ProviderLabels>>().toEqualTypeOf<false>()
    expectTypeOf<keyof NonNullable<ProviderLabels['pagination']>>().toEqualTypeOf<'label' | 'previous' | 'next' | 'first' | 'last'>()
  })
})
