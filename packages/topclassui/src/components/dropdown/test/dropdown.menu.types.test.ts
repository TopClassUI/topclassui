import { describe, expectTypeOf, it } from 'vitest'

import type { MenuContract } from '#shared/contracts/menu.js'
// From the index, so a type it stops re-exporting fails here.
import type {
  DropdownItemProps, DropdownMenu, DropdownMenuProps, DropdownPopupProps, DropdownRoot, DropdownRootProps, DropdownTrigger,
  DropdownTriggerProps,
} from '../index.js'

describe('the data-driven menu', () => {
  it('takes the shared menu contract whole, plus placement and className, and nothing else', () => {
    expectTypeOf<keyof DropdownMenuProps>().toEqualTypeOf<keyof MenuContract | 'placement' | 'className'>()
    expectTypeOf<Pick<DropdownMenuProps, keyof MenuContract>>().toEqualTypeOf<MenuContract>()
    expectTypeOf<DropdownMenuProps['className']>().toEqualTypeOf<string | undefined>()
  })

  it('has no size and no modal: one row height, and the default of Base UI', () => {
    expectTypeOf<Extract<keyof DropdownMenuProps, 'size' | 'modal' | 'render'>>().toEqualTypeOf<never>()
  })

  it('takes its props type as it is', () => {
    expectTypeOf<Parameters<typeof DropdownMenu>[0]>().toEqualTypeOf<DropdownMenuProps>()
  })
})

describe('none of the props the spec leaves unbuilt', () => {
  it('has no size, sideOffset, showArrow, checked or submenu prop on the root, the popup or a row', () => {
    type Unbuilt = 'size' | 'sideOffset' | 'showArrow' | 'arrow' | 'checked' | 'onCheckedChange' | 'value' | 'submenu' | 'variant'
    expectTypeOf<Extract<keyof DropdownRootProps, Unbuilt>>().toEqualTypeOf<never>()
    expectTypeOf<Extract<keyof DropdownPopupProps, Unbuilt>>().toEqualTypeOf<never>()
    expectTypeOf<Extract<keyof DropdownItemProps, Unbuilt>>().toEqualTypeOf<never>()
  })
})

// Nothing exported can create a handle, so a prop that takes one could never be given a value.
describe('a trigger outside its root is not built', () => {
  it('has no handle on the root or the trigger, and no payload to send through one', () => {
    expectTypeOf<Extract<keyof DropdownRootProps, 'handle'>>().toEqualTypeOf<never>()
    expectTypeOf<Extract<keyof DropdownTriggerProps, 'handle' | 'payload'>>().toEqualTypeOf<never>()
  })

  it('neither part is generic: each takes its props type as it is', () => {
    expectTypeOf<Parameters<typeof DropdownRoot>[0]>().toEqualTypeOf<DropdownRootProps>()
    expectTypeOf<Parameters<typeof DropdownTrigger>[0]>().toEqualTypeOf<DropdownTriggerProps>()
  })
})
