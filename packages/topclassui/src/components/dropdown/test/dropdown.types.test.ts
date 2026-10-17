import type { Menu } from '@base-ui/react/menu'
import type { CSSProperties, ReactElement, ReactNode, Ref } from 'react'
import { describe, expectTypeOf, it } from 'vitest'

// From the index, so a type it stops re-exporting fails here.
import type {
  DropdownDesignProps, DropdownGroupLabelProps, DropdownGroupProps, DropdownItemProps, DropdownItemTone, DropdownLinkItemProps,
  DropdownMenuProps, DropdownPlacement, DropdownPopupProps, DropdownRootProps, DropdownSeparatorProps, DropdownTriggerProps,
} from '../index.js'

/** Assignability as a value, so a rejected prop is a passing assertion. */
type Accepts<Union, Candidate> = Candidate extends Union ? true : false

/** Every part that renders an element. */
interface Parts {
  trigger: DropdownTriggerProps
  popup: DropdownPopupProps
  item: DropdownItemProps
  link: DropdownLinkItemProps
  group: DropdownGroupProps
  label: DropdownGroupLabelProps
  separator: DropdownSeparatorProps
}

type Twelve =
  | 'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end'
  | 'start' | 'start-top' | 'start-bottom' | 'end' | 'end-top' | 'end-bottom'

describe('placement is on the popup and on the data-driven menu', () => {
  it('is exactly the twelve logical placements, optional', () => {
    expectTypeOf<DropdownPlacement>().toEqualTypeOf<Twelve>()
    expectTypeOf<DropdownPopupProps['placement']>().toEqualTypeOf<Twelve | undefined>()
    expectTypeOf<DropdownMenuProps['placement']>().toEqualTypeOf<Twelve | undefined>()
  })

  it('refuses a physical side, and the side Base UI would take (R-5.3-4)', () => {
    expectTypeOf<Accepts<DropdownPlacement, 'left'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<DropdownPlacement, 'right'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<DropdownPlacement, 'inline-start'>>().toEqualTypeOf<false>()
  })

  it('is on no other part', () => {
    expectTypeOf<Extract<keyof DropdownRootProps, 'placement'>>().toEqualTypeOf<never>()
    expectTypeOf<Extract<keyof DropdownTriggerProps, 'placement'>>().toEqualTypeOf<never>()
    expectTypeOf<Extract<keyof DropdownItemProps, 'placement'>>().toEqualTypeOf<never>()
  })
})

describe('what a row takes', () => {
  it('tone is neutral or danger, the two of the shared menu contract, on an item and on a link item', () => {
    expectTypeOf<DropdownItemTone>().toEqualTypeOf<'neutral' | 'danger'>()
    expectTypeOf<DropdownItemProps['tone']>().toEqualTypeOf<'neutral' | 'danger' | undefined>()
    expectTypeOf<DropdownLinkItemProps['tone']>().toEqualTypeOf<'neutral' | 'danger' | undefined>()
    expectTypeOf<Accepts<DropdownItemTone, 'primary'>>().toEqualTypeOf<false>()
  })

  it('icon is a node and shortcut a string, on both: an icon by name is not built', () => {
    expectTypeOf<DropdownItemProps['icon']>().toEqualTypeOf<ReactNode>()
    expectTypeOf<DropdownLinkItemProps['icon']>().toEqualTypeOf<ReactNode>()
    expectTypeOf<DropdownItemProps['shortcut']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<DropdownLinkItemProps['shortcut']>().toEqualTypeOf<string | undefined>()
  })

  it('a row is named: it takes children, or with none an aria-label (R-5.6-1)', () => {
    expectTypeOf<Accepts<DropdownItemProps, { children: string }>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<DropdownItemProps, { 'icon': ReactElement, 'aria-label': string }>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<DropdownItemProps, { icon: ReactElement }>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<DropdownLinkItemProps, { href: string }>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<DropdownLinkItemProps, { href: string, children: string }>>().toEqualTypeOf<true>()
  })

  it('an item keeps disabled, closeOnClick, label and onClick from Base UI; a link item has no disabled', () => {
    expectTypeOf<DropdownItemProps['disabled']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<DropdownItemProps['closeOnClick']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<DropdownItemProps['label']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<DropdownItemProps['onClick']>().toEqualTypeOf<Menu.Item.Props['onClick']>()
    expectTypeOf<Extract<keyof DropdownLinkItemProps, 'disabled'>>().toEqualTypeOf<never>()
    expectTypeOf<DropdownLinkItemProps['closeOnClick']>().toEqualTypeOf<boolean | undefined>()
  })

  it('a link item takes the attributes of an anchor, and render for one row', () => {
    expectTypeOf<Accepts<keyof DropdownLinkItemProps, 'href' | 'target' | 'rel' | 'download'>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<DropdownLinkItemProps['render'], ReactElement>>().toEqualTypeOf<true>()
  })
})

describe('the two delays are on the trigger', () => {
  it('are optional numbers, beside openOnHover, which Base UI types and which makes them act', () => {
    expectTypeOf<DropdownTriggerProps['delay']>().toEqualTypeOf<number | undefined>()
    expectTypeOf<DropdownTriggerProps['closeDelay']>().toEqualTypeOf<number | undefined>()
    expectTypeOf<DropdownTriggerProps['openOnHover']>().toEqualTypeOf<boolean | undefined>()
  })

  it('are on no other part', () => {
    expectTypeOf<Extract<keyof DropdownRootProps, 'delay' | 'closeDelay'>>().toEqualTypeOf<never>()
    expectTypeOf<Extract<keyof DropdownPopupProps, 'delay' | 'closeDelay'>>().toEqualTypeOf<never>()
  })
})

describe('the design props come from the schema', () => {
  it('are placement, tone, delay and closeDelay, all optional', () => {
    expectTypeOf<keyof DropdownDesignProps>().toEqualTypeOf<'placement' | 'tone' | 'delay' | 'closeDelay'>()
    expectTypeOf<Accepts<DropdownDesignProps, { placement: 'end', tone: 'danger' }>>().toEqualTypeOf<true>()
  })
})

describe('the root renders no element', () => {
  it('takes no className, style or ref', () => {
    expectTypeOf<Extract<keyof DropdownRootProps, 'className' | 'style' | 'ref'>>().toEqualTypeOf<never>()
  })

  it('takes every prop of Base UI root but the handle, untouched (R-5.7-5)', () => {
    expectTypeOf<Omit<DropdownRootProps, 'children'>>().toEqualTypeOf<Omit<Menu.Root.Props, 'handle' | 'children'>>()
    expectTypeOf<DropdownRootProps['open']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<DropdownRootProps['defaultOpen']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<DropdownRootProps['loopFocus']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<DropdownRootProps['highlightItemOnHover']>().toEqualTypeOf<boolean | undefined>()
  })

  it('takes modal as Base UI types it for a menu: a boolean, with no trap-focus', () => {
    expectTypeOf<DropdownRootProps['modal']>().toEqualTypeOf<boolean | undefined>()
  })

  it('takes children as nodes only: the function form exists to receive the payload of a handle', () => {
    expectTypeOf<DropdownRootProps['children']>().toEqualTypeOf<ReactNode>()
    expectTypeOf<Accepts<DropdownRootProps['children'], () => ReactNode>>().toEqualTypeOf<false>()
  })

  it('reports an open change with the event that follows the R-5.7-1 name', () => {
    type Handler = NonNullable<DropdownRootProps['onOpenChange']>
    expectTypeOf<Parameters<Handler>[0]>().toEqualTypeOf<boolean>()
    expectTypeOf<Parameters<Handler>[1]>().toEqualTypeOf<Menu.Root.ChangeEventDetails>()
  })
})

describe('every part that renders an element takes className, style, ref and the rest', () => {
  it('className is a string on all seven, never the state function Base UI also takes', () => {
    expectTypeOf<{ [K in keyof Parts]: Parts[K]['className'] }>().toEqualTypeOf<{ [K in keyof Parts]: string | undefined }>()
    expectTypeOf<Accepts<DropdownPopupProps['className'], () => string>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<DropdownItemProps['className'], () => string>>().toEqualTypeOf<false>()
  })

  it('style takes a plain style object on all seven', () => {
    expectTypeOf<{ [K in keyof Parts]: Accepts<Parts[K]['style'], CSSProperties> }>()
      .toEqualTypeOf<{ [K in keyof Parts]: true }>()
  })

  it('ref is a normal prop, of the element each part renders', () => {
    expectTypeOf<Accepts<DropdownTriggerProps['ref'], Ref<HTMLButtonElement>>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<DropdownPopupProps['ref'], Ref<HTMLDivElement>>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<DropdownItemProps['ref'], Ref<HTMLDivElement>>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<DropdownLinkItemProps['ref'], Ref<HTMLAnchorElement>>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<DropdownGroupProps['ref'], Ref<HTMLDivElement>>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<DropdownSeparatorProps['ref'], Ref<HTMLDivElement>>>().toEqualTypeOf<true>()
  })

  it('keeps the native attributes, so id, aria-* and data pass through', () => {
    expectTypeOf<Accepts<keyof DropdownPopupProps, 'id' | 'aria-label' | 'lang' | 'dir'>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<keyof DropdownItemProps, 'id' | 'aria-label' | 'onKeyDown'>>().toEqualTypeOf<true>()
  })
})

describe('what Base UI gives each part passes through', () => {
  it('the trigger takes render, which is how a Button becomes one, and keeps disabled and nativeButton', () => {
    expectTypeOf<Accepts<DropdownTriggerProps['render'], ReactElement>>().toEqualTypeOf<true>()
    expectTypeOf<DropdownTriggerProps['disabled']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<DropdownTriggerProps['nativeButton']>().toEqualTypeOf<boolean | undefined>()
  })

  it('the popup takes where the last focus goes, and the two props of the portal it renders', () => {
    expectTypeOf<DropdownPopupProps['finalFocus']>().toEqualTypeOf<Menu.Popup.Props['finalFocus']>()
    expectTypeOf<DropdownPopupProps['container']>().toEqualTypeOf<Menu.Portal.Props['container']>()
    expectTypeOf<DropdownPopupProps['keepMounted']>().toEqualTypeOf<boolean | undefined>()
  })

  it('and none of the positioner: the placement, the offset and the collision rule stay ours', () => {
    type Positioner = 'side' | 'align' | 'sideOffset' | 'alignOffset' | 'collisionPadding' | 'collisionAvoidance' | 'anchor' | 'sticky'
    expectTypeOf<Extract<keyof DropdownPopupProps, Positioner>>().toEqualTypeOf<never>()
  })

  it('the separator keeps its orientation', () => {
    expectTypeOf<DropdownSeparatorProps['orientation']>().toEqualTypeOf<Menu.Separator.Props['orientation']>()
  })
})

