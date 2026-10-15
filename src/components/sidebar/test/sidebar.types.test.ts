import type { ReactElement, ReactNode, Ref } from 'react'
import { describe, expectTypeOf, it } from 'vitest'

// From the index, so a type it stops re-exporting fails here.
import type {
  SidebarBodyProps, SidebarDesignProps, SidebarGroupProps, SidebarHeaderProps, SidebarLinkProps, SidebarRootProps,
  SidebarTriggerProps,
} from '../index.js'
import type { SidebarState, SidebarTriggerEvent } from '../types.js'

/** Assignability as a value, so a rejected prop is a passing assertion. */
type Accepts<Union, Candidate> = Candidate extends Union ? true : false

describe('the state is on the root', () => {
  it('open and defaultOpen are optional booleans, and onOpenChange is given a boolean', () => {
    expectTypeOf<SidebarRootProps['open']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<SidebarRootProps['defaultOpen']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<SidebarRootProps['onOpenChange']>().toEqualTypeOf<((open: boolean) => void) | undefined>()
  })

  it('the design props are the three of the schema, each optional', () => {
    expectTypeOf<keyof SidebarDesignProps>().toEqualTypeOf<'open' | 'defaultOpen' | 'current'>()
    expectTypeOf<Accepts<SidebarDesignProps, Record<string, never>>>().toEqualTypeOf<true>()
  })

  it('the root takes no current, no width, no size and no variant: none is built', () => {
    expectTypeOf<Accepts<keyof SidebarRootProps, 'current'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof SidebarRootProps, 'width'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof SidebarRootProps, 'size'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof SidebarRootProps, 'variant'>>().toEqualTypeOf<false>()
  })

  it('what it shares with its toggle is the state and the way to ask for another', () => {
    expectTypeOf<SidebarState>().toEqualTypeOf<{ open: boolean, setOpen: (open: boolean) => void }>()
  })
})

describe('every part takes the attributes of its own element, a string className and a ref (R-5.7-3)', () => {
  it('the rail is a nav, the header, the body and a group are divs, the toggle a button and a row an anchor', () => {
    expectTypeOf<SidebarRootProps['ref']>().toEqualTypeOf<Ref<HTMLElement> | undefined>()
    expectTypeOf<SidebarHeaderProps['ref']>().toEqualTypeOf<Ref<HTMLDivElement> | undefined>()
    expectTypeOf<SidebarBodyProps['ref']>().toEqualTypeOf<Ref<HTMLDivElement> | undefined>()
    expectTypeOf<SidebarGroupProps['ref']>().toEqualTypeOf<Ref<HTMLDivElement> | undefined>()
    expectTypeOf<SidebarTriggerProps['ref']>().toEqualTypeOf<Ref<HTMLButtonElement> | undefined>()
    expectTypeOf<SidebarLinkProps['ref']>().toEqualTypeOf<Ref<HTMLAnchorElement> | undefined>()
  })

  it('className is a string on each, never a function of the state', () => {
    expectTypeOf<SidebarRootProps['className']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<SidebarTriggerProps['className']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<SidebarLinkProps['className']>().toEqualTypeOf<string | undefined>()
  })

  it('children are a ReactNode wherever a part has any', () => {
    expectTypeOf<SidebarRootProps['children']>().toEqualTypeOf<ReactNode>()
    expectTypeOf<SidebarHeaderProps['children']>().toEqualTypeOf<ReactNode>()
    expectTypeOf<SidebarBodyProps['children']>().toEqualTypeOf<ReactNode>()
    expectTypeOf<SidebarGroupProps['children']>().toEqualTypeOf<ReactNode>()
    expectTypeOf<SidebarLinkProps['children']>().toEqualTypeOf<ReactNode>()
  })
})

describe('the toggle keeps what is its own', () => {
  it('takes no type, no aria-expanded and no children', () => {
    expectTypeOf<Accepts<keyof SidebarTriggerProps, 'type'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof SidebarTriggerProps, 'aria-expanded'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof SidebarTriggerProps, 'children'>>().toEqualTypeOf<false>()
  })

  it('takes a name, a disabled and a press handler, whose event is the one hook.ts names', () => {
    expectTypeOf<SidebarTriggerProps['aria-label']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<SidebarTriggerProps['disabled']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<Parameters<NonNullable<SidebarTriggerProps['onClick']>>[0]>().toEqualTypeOf<SidebarTriggerEvent>()
    expectTypeOf<SidebarTriggerEvent['preventDefault']>().toBeFunction()
  })
})

describe('a group has a label and its rows', () => {
  it('label is a ReactNode, so a string or an element names the list', () => {
    expectTypeOf<SidebarGroupProps['label']>().toEqualTypeOf<ReactNode>()
  })
})

describe('a row must go somewhere (R-5.6-1)', () => {
  it('takes an href, or an element to render, or both', () => {
    expectTypeOf<Accepts<SidebarLinkProps, { href: string }>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<SidebarLinkProps, { render: ReactElement }>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<SidebarLinkProps, { render: ReactElement, href: string }>>().toEqualTypeOf<true>()
  })

  it('refuses neither, an href that may be undefined, and the function form of render (R-5.7-4)', () => {
    expectTypeOf<Accepts<SidebarLinkProps, Record<string, never>>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<SidebarLinkProps, { href?: string }>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<SidebarLinkProps, { render: () => ReactElement }>>().toEqualTypeOf<false>()
  })

  it('icon is a ReactNode and current an optional boolean; aria-current is not a prop, since current sets it', () => {
    expectTypeOf<SidebarLinkProps['icon']>().toEqualTypeOf<ReactNode>()
    expectTypeOf<SidebarLinkProps['current']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<Accepts<keyof SidebarLinkProps, 'aria-current'>>().toEqualTypeOf<false>()
  })

  it('takes what an anchor takes: a target, a rel and a download', () => {
    expectTypeOf<Accepts<SidebarLinkProps, { href: string, target: string, rel: string, download: boolean }>>().toEqualTypeOf<true>()
  })
})
