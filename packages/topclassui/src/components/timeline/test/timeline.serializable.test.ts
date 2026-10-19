import { describe, expectTypeOf, it } from 'vitest'

import type { UnserializableKeys } from '#test/serializable.js'
import type { TimelineProps, TimelineSkeletonProps } from '../types.js'

// The exemptions are the decision of 2026-10-17 in docs/DECISIONS.md; a new one fails here first.
describe('only serializable props cross the boundary (R-5.1-3)', () => {
  it('Timeline: getKey and labels are called on the server; no timeline part is a client one', () => {
    expectTypeOf<UnserializableKeys<TimelineProps>>().toEqualTypeOf<'getKey' | 'labels'>()
  })

  it('TimelineSkeleton takes no function and no class instance', () => {
    expectTypeOf<UnserializableKeys<TimelineSkeletonProps>>().toEqualTypeOf<never>()
  })
})
