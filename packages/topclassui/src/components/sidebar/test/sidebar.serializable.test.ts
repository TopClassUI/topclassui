import { describe, expectTypeOf, it } from 'vitest'

import type { UnserializableKeys } from '#test/serializable.js'
import type { SidebarHeaderProps, SidebarBodyProps, SidebarGroupProps, SidebarLinkProps } from '../types.js'

// The exemptions are the decision of 2026-10-17 in docs/DECISIONS.md; a new one fails here first.
describe('only serializable props cross the boundary (R-5.1-3)', () => {
  it('the server parts take no function and no class instance', () => {
    expectTypeOf<UnserializableKeys<SidebarHeaderProps>>().toEqualTypeOf<never>()
    expectTypeOf<UnserializableKeys<SidebarBodyProps>>().toEqualTypeOf<never>()
    expectTypeOf<UnserializableKeys<SidebarGroupProps>>().toEqualTypeOf<never>()
    expectTypeOf<UnserializableKeys<SidebarLinkProps>>().toEqualTypeOf<never>()
  })
})
