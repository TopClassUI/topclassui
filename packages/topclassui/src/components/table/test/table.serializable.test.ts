import { describe, expectTypeOf, it } from 'vitest'

import type { UnserializableKeys } from '#test/serializable.js'
import type { TableProps } from '../types.js'

// The exemptions are the decision of 2026-10-17 in docs/DECISIONS.md; a new one fails here first.
describe('only serializable props cross the boundary (R-5.1-3)', () => {
  it('Table: the cell of every column, getKey and labels are called on the server; no table part is a client one', () => {
    expectTypeOf<UnserializableKeys<TableProps<{ name: string }>>>().toEqualTypeOf<'columns' | 'getKey' | 'labels'>()
  })
})
