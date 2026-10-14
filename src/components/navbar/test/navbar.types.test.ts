import type { CSSProperties, ReactElement, ReactNode, Ref } from 'react'
import { describe, expectTypeOf, it } from 'vitest'

import type { Labels } from '#shared/labels/types.js'
// From the index, so a type it stops re-exporting fails here.
import type {
  NavbarActionsProps, NavbarBrandProps, NavbarDesignProps, NavbarLinkProps, NavbarLinksProps, NavbarRootProps,
} from '../index.js'

/** Assignability as a value, so a rejected prop is a passing assertion. */
type Accepts<Union, Candidate> = Candidate extends Union ? true : false

describe('the two design props', () => {
  it('are optional booleans, each on the part that takes it', () => {
    expectTypeOf<NavbarDesignProps>().toEqualTypeOf<{ sticky?: boolean | undefined, current?: boolean | undefined }>()
    expectTypeOf<NavbarRootProps['sticky']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<NavbarLinkProps['current']>().toEqualTypeOf<boolean | undefined>()
  })

  it('sticky is not a prop of a link, and current is not a prop of the root', () => {
    expectTypeOf<Accepts<keyof NavbarLinkProps, 'sticky'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof NavbarRootProps, 'current'>>().toEqualTypeOf<false>()
  })

  it('what is not built is not in the types: size, bordered, variant and a collapsible bar', () => {
    type Unbuilt = 'size' | 'bordered' | 'variant' | 'collapsible' | 'transparent'
    expectTypeOf<Extract<keyof NavbarRootProps, Unbuilt>>().toEqualTypeOf<never>()
  })
})

describe('every part takes what its element takes (R-5.7-3)', () => {
  it('the root takes the attributes and the ref of a header', () => {
    expectTypeOf<NavbarRootProps['ref']>().toEqualTypeOf<Ref<HTMLElement> | undefined>()
    expectTypeOf<NavbarRootProps['className']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<NavbarRootProps['style']>().toEqualTypeOf<CSSProperties | undefined>()
    expectTypeOf<NavbarRootProps['children']>().toEqualTypeOf<ReactNode | undefined>()
    expectTypeOf<Accepts<keyof NavbarRootProps, 'id' | 'aria-label' | 'onClick'>>().toEqualTypeOf<true>()
  })

  it('the brand and a link take the attributes and the ref of an anchor', () => {
    expectTypeOf<NavbarBrandProps['ref']>().toEqualTypeOf<Ref<HTMLAnchorElement> | undefined>()
    expectTypeOf<NavbarLinkProps['ref']>().toEqualTypeOf<Ref<HTMLAnchorElement> | undefined>()
    expectTypeOf<NavbarBrandProps['href']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<NavbarLinkProps['href']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<Accepts<keyof NavbarLinkProps, 'target' | 'rel' | 'className' | 'style'>>().toEqualTypeOf<true>()
  })

  it('the links take the attributes and the ref of a nav, and the actions those of a div', () => {
    expectTypeOf<NavbarLinksProps['ref']>().toEqualTypeOf<Ref<HTMLElement> | undefined>()
    expectTypeOf<NavbarActionsProps['ref']>().toEqualTypeOf<Ref<HTMLDivElement> | undefined>()
    expectTypeOf<NavbarLinksProps['aria-label']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<NavbarActionsProps['className']>().toEqualTypeOf<string | undefined>()
  })
})

// R-5.7-4: a server part takes the element form of render and nothing else.
describe('render is an element', () => {
  it('on the brand and on a link, optional', () => {
    expectTypeOf<NavbarBrandProps['render']>().toEqualTypeOf<ReactElement | undefined>()
    expectTypeOf<NavbarLinkProps['render']>().toEqualTypeOf<ReactElement | undefined>()
  })

  it('a function is not one', () => {
    expectTypeOf<Accepts<NavbarLinkProps['render'], () => ReactElement>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<NavbarBrandProps['render'], (props: object) => ReactElement>>().toEqualTypeOf<false>()
  })

  it('the root, the links and the actions have no render: each is the element it says', () => {
    expectTypeOf<Accepts<keyof NavbarRootProps, 'render'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof NavbarLinksProps, 'render'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof NavbarActionsProps, 'render'>>().toEqualTypeOf<false>()
  })
})

describe('labels reach the one part that names something', () => {
  it('NavbarLinks takes the whole Labels object and a locale, both optional', () => {
    expectTypeOf<NavbarLinksProps['labels']>().toEqualTypeOf<Labels | undefined>()
    expectTypeOf<NavbarLinksProps['locale']>().toEqualTypeOf<string | undefined>()
  })

  it('no other part takes labels', () => {
    expectTypeOf<Accepts<keyof NavbarRootProps, 'labels'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof NavbarLinkProps, 'labels'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof NavbarBrandProps, 'labels'>>().toEqualTypeOf<false>()
  })
})
