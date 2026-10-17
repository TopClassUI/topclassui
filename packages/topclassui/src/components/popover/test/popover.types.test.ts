import type { Popover } from '@base-ui/react/popover'
import type { CSSProperties, ReactElement, ReactNode, Ref } from 'react'
import { describe, expectTypeOf, it } from 'vitest'

// From the index, so a type it stops re-exporting fails here.
import type {
  PopoverCloseProps, PopoverDescriptionProps, PopoverDesignProps, PopoverPlacement, PopoverPopupProps, PopoverRoot,
  PopoverRootProps, PopoverTitleProps, PopoverTrigger, PopoverTriggerProps,
} from '../index.js'

/** Assignability as a value, so a rejected prop is a passing assertion. */
type Accepts<Union, Candidate> = Candidate extends Union ? true : false

/** Every part that renders an element. */
interface Parts {
  trigger: PopoverTriggerProps
  popup: PopoverPopupProps
  title: PopoverTitleProps
  description: PopoverDescriptionProps
  close: PopoverCloseProps
}

type Twelve =
  | 'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end'
  | 'start' | 'start-top' | 'start-bottom' | 'end' | 'end-top' | 'end-bottom'

describe('placement is on the popup', () => {
  it('is exactly the twelve logical placements, optional', () => {
    expectTypeOf<PopoverPlacement>().toEqualTypeOf<Twelve>()
    expectTypeOf<PopoverPopupProps['placement']>().toEqualTypeOf<Twelve | undefined>()
  })

  it('refuses a physical side, and the side Base UI would take (R-5.3-4)', () => {
    expectTypeOf<Accepts<PopoverPlacement, 'left'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<PopoverPlacement, 'right'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<PopoverPlacement, 'inline-start'>>().toEqualTypeOf<false>()
  })

  it('is on no other part', () => {
    expectTypeOf<Accepts<keyof PopoverRootProps, 'placement'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof PopoverTriggerProps, 'placement'>>().toEqualTypeOf<false>()
  })
})

describe('the two delays are on the trigger', () => {
  it('are optional numbers', () => {
    expectTypeOf<PopoverTriggerProps['delay']>().toEqualTypeOf<number | undefined>()
    expectTypeOf<PopoverTriggerProps['closeDelay']>().toEqualTypeOf<number | undefined>()
  })

  it('sit beside openOnHover, which Base UI types and which makes them act', () => {
    expectTypeOf<PopoverTriggerProps['openOnHover']>().toEqualTypeOf<boolean | undefined>()
  })

  it('are on no other part', () => {
    expectTypeOf<Extract<keyof PopoverRootProps, 'delay' | 'closeDelay'>>().toEqualTypeOf<never>()
    expectTypeOf<Extract<keyof PopoverPopupProps, 'delay' | 'closeDelay'>>().toEqualTypeOf<never>()
  })
})

describe('the design props come from the schema', () => {
  it('are placement, delay and closeDelay, all optional', () => {
    expectTypeOf<keyof PopoverDesignProps>().toEqualTypeOf<'placement' | 'delay' | 'closeDelay'>()
    expectTypeOf<PopoverDesignProps['placement']>().toEqualTypeOf<Twelve | undefined>()
    expectTypeOf<Accepts<PopoverDesignProps, { placement: 'end' }>>().toEqualTypeOf<true>()
  })
})

describe('the root renders no element', () => {
  it('takes no className, style or ref', () => {
    expectTypeOf<Accepts<keyof PopoverRootProps, 'className'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof PopoverRootProps, 'style'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof PopoverRootProps, 'ref'>>().toEqualTypeOf<false>()
  })

  it('takes exactly these nine props, every one of them Base UI root prop but the handle (R-5.7-5)', () => {
    expectTypeOf<keyof PopoverRootProps>().toEqualTypeOf<
      'open' | 'defaultOpen' | 'modal' | 'onOpenChange' | 'onOpenChangeComplete' | 'actionsRef' | 'children' | 'triggerId'
      | 'defaultTriggerId'
    >()
    expectTypeOf<Omit<PopoverRootProps, 'children'>>().toEqualTypeOf<Omit<Popover.Root.Props, 'handle' | 'children'>>()
    expectTypeOf<PopoverRootProps['open']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<PopoverRootProps['defaultOpen']>().toEqualTypeOf<boolean | undefined>()
  })

  it('takes modal as Base UI types it: true, false or trap-focus', () => {
    expectTypeOf<PopoverRootProps['modal']>().toEqualTypeOf<boolean | 'trap-focus' | undefined>()
  })

  it('takes children as nodes only: the function form exists to receive the payload of a handle', () => {
    expectTypeOf<PopoverRootProps['children']>().toEqualTypeOf<ReactNode>()
    expectTypeOf<Accepts<PopoverRootProps['children'], () => ReactNode>>().toEqualTypeOf<false>()
  })

  it('reports an open change with the event that follows the R-5.7-1 name', () => {
    type Handler = NonNullable<PopoverRootProps['onOpenChange']>
    expectTypeOf<Parameters<Handler>[0]>().toEqualTypeOf<boolean>()
    expectTypeOf<Parameters<Handler>[1]>().toEqualTypeOf<Popover.Root.ChangeEventDetails>()
  })
})

describe('every part that renders an element takes className, style, ref and the rest', () => {
  it('className is a string on all five, never the state function Base UI also takes', () => {
    expectTypeOf<{ [K in keyof Parts]: Parts[K]['className'] }>().toEqualTypeOf<{ [K in keyof Parts]: string | undefined }>()
    expectTypeOf<Accepts<PopoverPopupProps['className'], () => string>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<PopoverCloseProps['className'], () => string>>().toEqualTypeOf<false>()
  })

  it('style takes a plain style object on all five', () => {
    expectTypeOf<{ [K in keyof Parts]: Accepts<Parts[K]['style'], CSSProperties> }>()
      .toEqualTypeOf<{ [K in keyof Parts]: true }>()
  })

  it('ref is a normal prop, of the element each part renders', () => {
    expectTypeOf<Accepts<PopoverTriggerProps['ref'], Ref<HTMLButtonElement>>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<PopoverPopupProps['ref'], Ref<HTMLDivElement>>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<PopoverTitleProps['ref'], Ref<HTMLHeadingElement>>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<PopoverDescriptionProps['ref'], Ref<HTMLParagraphElement>>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<PopoverCloseProps['ref'], Ref<HTMLButtonElement>>>().toEqualTypeOf<true>()
  })

  it('keeps the native attributes, so id, aria-* and tabIndex pass through', () => {
    expectTypeOf<Accepts<keyof PopoverPopupProps, 'id' | 'aria-label' | 'lang' | 'dir' | 'tabIndex'>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<keyof PopoverCloseProps, 'aria-label' | 'disabled'>>().toEqualTypeOf<true>()
  })

  it('takes children as any node on the popup, the title and the description: a popover holds links and controls', () => {
    expectTypeOf<Accepts<PopoverPopupProps['children'], ReactNode>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<PopoverPopupProps['children'], ReactElement>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<PopoverTitleProps['children'], ReactNode>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<PopoverDescriptionProps['children'], ReactNode>>().toEqualTypeOf<true>()
  })
})

describe('what Base UI gives each part passes through', () => {
  it('the trigger and the close take render, which is how a Button becomes either', () => {
    expectTypeOf<Accepts<PopoverTriggerProps['render'], ReactElement>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<PopoverCloseProps['render'], ReactElement>>().toEqualTypeOf<true>()
  })

  it('the popup takes render too, and where the first and the last focus go', () => {
    expectTypeOf<Accepts<PopoverPopupProps['render'], ReactElement>>().toEqualTypeOf<true>()
    expectTypeOf<PopoverPopupProps['initialFocus']>().toEqualTypeOf<Popover.Popup.Props['initialFocus']>()
    expectTypeOf<PopoverPopupProps['finalFocus']>().toEqualTypeOf<Popover.Popup.Props['finalFocus']>()
    expectTypeOf<Accepts<PopoverPopupProps['initialFocus'], false>>().toEqualTypeOf<true>()
  })

  it('the trigger keeps disabled and nativeButton, which an element that is not a button needs', () => {
    expectTypeOf<PopoverTriggerProps['disabled']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<PopoverTriggerProps['nativeButton']>().toEqualTypeOf<boolean | undefined>()
  })

  it('the popup takes the two props of the portal it renders, as Base UI types them', () => {
    expectTypeOf<PopoverPopupProps['container']>().toEqualTypeOf<Popover.Portal.Props['container']>()
    expectTypeOf<PopoverPopupProps['keepMounted']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<Accepts<PopoverPopupProps['container'], HTMLElement | null>>().toEqualTypeOf<true>()
  })

  it('and none of the positioner: the placement, the offset and the collision rule stay ours', () => {
    type Positioner = 'side' | 'align' | 'sideOffset' | 'alignOffset' | 'collisionPadding' | 'collisionAvoidance' | 'anchor' | 'sticky'
    expectTypeOf<Extract<keyof PopoverPopupProps, Positioner>>().toEqualTypeOf<never>()
  })
})

describe('none of the props the spec leaves unbuilt', () => {
  it('has no size, sideOffset, showArrow or dismissible on the root or the popup', () => {
    type Unbuilt = 'size' | 'sideOffset' | 'showArrow' | 'arrow' | 'dismissible'
    expectTypeOf<Extract<keyof PopoverRootProps, Unbuilt>>().toEqualTypeOf<never>()
    expectTypeOf<Extract<keyof PopoverPopupProps, Unbuilt>>().toEqualTypeOf<never>()
  })

  it('has no variant and no tone: one surface is drawn', () => {
    expectTypeOf<Extract<keyof PopoverPopupProps, 'variant' | 'tone'>>().toEqualTypeOf<never>()
  })
})

// Nothing exported can create a handle, so a prop that takes one could never be given a value.
describe('a trigger outside its root is not built', () => {
  it('has no handle on the root or the trigger, and no payload to send through one', () => {
    expectTypeOf<Extract<keyof PopoverRootProps, 'handle'>>().toEqualTypeOf<never>()
    expectTypeOf<Extract<keyof PopoverTriggerProps, 'handle' | 'payload'>>().toEqualTypeOf<never>()
  })

  it('keeps the two ids a controlled popover names its trigger by', () => {
    expectTypeOf<PopoverRootProps['triggerId']>().toEqualTypeOf<string | null | undefined>()
    expectTypeOf<PopoverTriggerProps['id']>().toEqualTypeOf<string | undefined>()
  })

  it('neither part is generic: each takes its props type as it is', () => {
    expectTypeOf<Parameters<typeof PopoverRoot>[0]>().toEqualTypeOf<PopoverRootProps>()
    expectTypeOf<Parameters<typeof PopoverTrigger>[0]>().toEqualTypeOf<PopoverTriggerProps>()
  })
})
