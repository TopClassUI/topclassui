import type { ReactElement, ReactNode } from 'react'
import { describe, expect, expectTypeOf, it } from 'vitest'

import { MENU_ITEM_TONES, type MenuContract, type MenuItem, type MenuItemTone } from './menu.js'
import type { Tone } from './tone.js'

/** Assignability as a value, so a rejected item is a passing assertion. */
type Accepts<Union, Candidate> = Candidate extends Union ? true : false

interface Named { id: string; label: string }
type Action = (formData: FormData) => void | Promise<void>
type Select = () => void

describe('the tone of a menu item', () => {
  it('is neutral or danger, in that order, and nothing else', () => {
    expect(MENU_ITEM_TONES).toEqual(['neutral', 'danger'])
    expectTypeOf<MenuItemTone>().toEqualTypeOf<'neutral' | 'danger'>()
  })

  it('comes from the shared vocabulary, and is not all of it', () => {
    expectTypeOf<Accepts<Tone, MenuItemTone>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<MenuItemTone, 'primary'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<MenuItemTone, string>>().toEqualTypeOf<false>()
  })
})

describe('a menu item is exactly one of three kinds', () => {
  it('is a link, a Server Action or a client handler', () => {
    expectTypeOf<Accepts<MenuItem, Named & { href: string }>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<MenuItem, Named & { action: Action }>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<MenuItem, Named & { onSelect: Select }>>().toEqualTypeOf<true>()
  })

  it('does not compile with none of the three', () => {
    expectTypeOf<Accepts<MenuItem, Named>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<MenuItem, Named & { tone: 'danger'; disabled: true }>>().toEqualTypeOf<false>()
  })

  it('does not compile with two of them, whichever two, or with all three', () => {
    expectTypeOf<Accepts<MenuItem, Named & { href: string; action: Action }>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<MenuItem, Named & { href: string; onSelect: Select }>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<MenuItem, Named & { action: Action; onSelect: Select }>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<MenuItem, Named & { href: string; action: Action; onSelect: Select }>>()
      .toEqualTypeOf<false>()
  })

  it('does not compile when its one kind may be missing', () => {
    expectTypeOf<Accepts<MenuItem, Named & { href: string | undefined }>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<MenuItem, Named & { href?: string }>>().toEqualTypeOf<false>()
  })

  it('reads an explicit undefined as a key left out, so an item built by a spread still compiles', () => {
    expectTypeOf<Accepts<MenuItem, Named & { href: string; action: undefined; onSelect: undefined }>>()
      .toEqualTypeOf<true>()
  })

  it('requires the id and the label, and both are strings', () => {
    expectTypeOf<MenuItem['id']>().toEqualTypeOf<string>()
    expectTypeOf<MenuItem['label']>().toEqualTypeOf<string>()
    expectTypeOf<Accepts<MenuItem, { id: string; href: string }>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<MenuItem, { label: string; href: string }>>().toEqualTypeOf<false>()
  })

  it('takes the icon as a node, since an icon by name is resolved on the server first (R-7-2)', () => {
    expectTypeOf<MenuItem['icon']>().toEqualTypeOf<ReactNode>()
  })

  it('types the four optional fields and the three kinds', () => {
    expectTypeOf<MenuItem['shortcut']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<MenuItem['tone']>().toEqualTypeOf<'neutral' | 'danger' | undefined>()
    expectTypeOf<MenuItem['disabled']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<MenuItem['separatorBefore']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<MenuItem['href']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<MenuItem['action']>().toEqualTypeOf<Action | undefined>()
    expectTypeOf<MenuItem['onSelect']>().toEqualTypeOf<Select | undefined>()
  })

  it('has these ten keys and no others', () => {
    expectTypeOf<keyof MenuItem>().toEqualTypeOf<
      'id' | 'label' | 'icon' | 'shortcut' | 'tone' | 'disabled' | 'separatorBefore' | 'href' | 'action' | 'onSelect'
    >()
  })
})

describe('the contract of a data-driven menu', () => {
  it('requires the trigger as an element, a title and the items', () => {
    expectTypeOf<MenuContract['trigger']>().toEqualTypeOf<ReactElement>()
    expectTypeOf<MenuContract['title']>().toEqualTypeOf<string>()
    expectTypeOf<Accepts<MenuContract, { trigger: ReactElement; title: string; items: MenuItem[] }>>()
      .toEqualTypeOf<true>()
    expectTypeOf<Accepts<MenuContract, { title: string; items: MenuItem[] }>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<MenuContract, { trigger: ReactElement; items: MenuItem[] }>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<MenuContract, { trigger: ReactElement; title: string }>>().toEqualTypeOf<false>()
  })

  it('takes the items as a list a caller may also declare as const', () => {
    expectTypeOf<MenuContract['items']>().toEqualTypeOf<readonly MenuItem[]>()
    expectTypeOf<Accepts<MenuContract['items'], MenuItem[]>>().toEqualTypeOf<true>()
  })

  it('takes one link element for every href item, in the element form a Server Component can pass', () => {
    expectTypeOf<MenuContract['link']>().toEqualTypeOf<ReactElement | undefined>()
    expectTypeOf<Accepts<MenuContract['link'], () => ReactElement>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<MenuContract['link'], string>>().toEqualTypeOf<false>()
  })

  it('carries the controlled pair of R-5.7-1 and its event', () => {
    expectTypeOf<MenuContract['open']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<MenuContract['defaultOpen']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<MenuContract['onOpenChange']>().toEqualTypeOf<((open: boolean) => void) | undefined>()
  })

  it('has these seven keys: no size until a menu has more than one row height', () => {
    expectTypeOf<keyof MenuContract>().toEqualTypeOf<
      'trigger' | 'title' | 'items' | 'link' | 'open' | 'defaultOpen' | 'onOpenChange'
    >()
  })
})
