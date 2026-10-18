import { describe, expectTypeOf, it } from 'vitest'

import type { UnserializableKeys } from '#test/serializable.js'
import type { CardRootProps, CardHeaderProps, CardBodyProps, CardFooterProps, CardSkeletonProps } from '../types.js'

// The exemptions are the decision of 2026-10-17 in docs/DECISIONS.md; a new one fails here first.
describe('only serializable props cross the boundary (R-5.1-3)', () => {
  it('every part and the skeleton take no function and no class instance', () => {
    expectTypeOf<UnserializableKeys<CardRootProps>>().toEqualTypeOf<never>()
    expectTypeOf<UnserializableKeys<CardHeaderProps>>().toEqualTypeOf<never>()
    expectTypeOf<UnserializableKeys<CardBodyProps>>().toEqualTypeOf<never>()
    expectTypeOf<UnserializableKeys<CardFooterProps>>().toEqualTypeOf<never>()
    expectTypeOf<UnserializableKeys<CardSkeletonProps>>().toEqualTypeOf<never>()
  })
})
