import type { Drawer } from '@base-ui/react/drawer'
import { describe, expectTypeOf, it } from 'vitest'

// From the index, so a type it stops re-exporting fails here.
import type { DrawerHeaderProps, DrawerPopupProps, DrawerRoot, DrawerRootProps, DrawerTrigger, DrawerTriggerProps } from '../index.js'

describe('none of what the spec leaves unbuilt', () => {
  it('has no snap points: no class moves a sheet to one, so the five props of Base UI are not offered', () => {
    type Snap = 'snapPoints' | 'snapPoint' | 'defaultSnapPoint' | 'snapToSequentialPoints' | 'onSnapPointChange'
    expectTypeOf<Extract<keyof DrawerRootProps, Snap>>().toEqualTypeOf<never>()
    expectTypeOf<Extract<keyof Drawer.Root.Props, Snap>>().toEqualTypeOf<Snap>()
  })

  it('has no swipeDirection: a physical side is worked out from placement, never passed', () => {
    expectTypeOf<Extract<keyof DrawerRootProps, 'swipeDirection'>>().toEqualTypeOf<never>()
  })

  it('has no dismissible and no closeButton: pass disablePointerDismissal, and the x is always there', () => {
    type Unbuilt = 'dismissible' | 'closeButton' | 'swipeToClose' | 'side'
    expectTypeOf<Extract<keyof DrawerRootProps, Unbuilt>>().toEqualTypeOf<never>()
    expectTypeOf<Extract<keyof DrawerPopupProps, Unbuilt>>().toEqualTypeOf<never>()
    expectTypeOf<Extract<keyof DrawerHeaderProps, Unbuilt>>().toEqualTypeOf<never>()
  })

  it('has no variant and no tone: one surface is drawn', () => {
    expectTypeOf<Extract<keyof DrawerPopupProps, 'variant' | 'tone'>>().toEqualTypeOf<never>()
    expectTypeOf<Extract<keyof DrawerRootProps, 'variant' | 'tone'>>().toEqualTypeOf<never>()
  })
})

// Nothing exported can create a handle, so a prop that takes one could never be given a value.
describe('a trigger outside its root is not built', () => {
  it('has no handle on the root or the trigger, and no payload to send through one', () => {
    expectTypeOf<Extract<keyof DrawerRootProps, 'handle'>>().toEqualTypeOf<never>()
    expectTypeOf<Extract<keyof DrawerTriggerProps, 'handle' | 'payload'>>().toEqualTypeOf<never>()
  })

  it('keeps the two ids a controlled sheet names its trigger by', () => {
    expectTypeOf<DrawerRootProps['triggerId']>().toEqualTypeOf<string | null | undefined>()
    expectTypeOf<DrawerTriggerProps['id']>().toEqualTypeOf<string | undefined>()
  })

  it('neither part is generic: each takes its props type as it is', () => {
    expectTypeOf<Parameters<typeof DrawerRoot>[0]>().toEqualTypeOf<DrawerRootProps>()
    expectTypeOf<Parameters<typeof DrawerTrigger>[0]>().toEqualTypeOf<DrawerTriggerProps>()
  })
})
