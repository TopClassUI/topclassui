import { describe, expectTypeOf, it } from 'vitest'

import type { UnserializableKeys } from '#test/serializable.js'
import type { NavbarRootProps, NavbarBrandProps, NavbarLinksProps, NavbarLinkProps, NavbarActionsProps } from '../types.js'

// The exemptions are the decision of 2026-10-17 in docs/DECISIONS.md; a new one fails here first.
describe('only serializable props cross the boundary (R-5.1-3)', () => {
  it('every part takes no function and no class instance, NavbarRoot included, which mounts the client NavbarOffset', () => {
    expectTypeOf<UnserializableKeys<NavbarRootProps>>().toEqualTypeOf<never>()
    expectTypeOf<UnserializableKeys<NavbarBrandProps>>().toEqualTypeOf<never>()
    expectTypeOf<UnserializableKeys<NavbarLinkProps>>().toEqualTypeOf<never>()
    expectTypeOf<UnserializableKeys<NavbarActionsProps>>().toEqualTypeOf<never>()
  })

  it('NavbarLinks: labels is read on the server, and only its string reaches the nav', () => {
    expectTypeOf<UnserializableKeys<NavbarLinksProps>>().toEqualTypeOf<'labels'>()
  })
})
