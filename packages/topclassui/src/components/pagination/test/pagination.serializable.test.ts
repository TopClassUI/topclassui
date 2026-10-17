import { describe, expectTypeOf, it } from 'vitest'

import type { UnserializableKeys } from '#test/serializable.js'
import type { PaginationProps } from '../types.js'

// The exemptions are the decision of 2026-10-17 in docs/DECISIONS.md; a new one fails here first.
describe('only serializable props cross the boundary (R-5.1-3)', () => {
  it('Pagination: getHref and labels are called on the server; only their strings reach the links', () => {
    expectTypeOf<UnserializableKeys<PaginationProps>>().toEqualTypeOf<'getHref' | 'labels'>()
  })
})
