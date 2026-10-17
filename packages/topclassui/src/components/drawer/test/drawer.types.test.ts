import type { Drawer } from '@base-ui/react/drawer'
import type { CSSProperties, ReactElement, ReactNode, Ref } from 'react'
import { describe, expectTypeOf, it } from 'vitest'

// From the index, so a type it stops re-exporting fails here.
import type {
  DrawerBodyProps, DrawerCloseProps, DrawerDescriptionProps, DrawerDesignProps, DrawerFooterProps,
  DrawerHeaderProps, DrawerPlacement, DrawerPopupProps, DrawerRootProps, DrawerTitleProps, DrawerTriggerProps,
} from '../index.js'

/** Assignability as a value, so a rejected prop is a passing assertion. */
type Accepts<Union, Candidate> = Candidate extends Union ? true : false

/** Every part that renders an element. */
interface Parts {
  trigger: DrawerTriggerProps
  popup: DrawerPopupProps
  header: DrawerHeaderProps
  title: DrawerTitleProps
  description: DrawerDescriptionProps
  body: DrawerBodyProps
  footer: DrawerFooterProps
  close: DrawerCloseProps
}

describe('placement is on the root, and logical', () => {
  it('is exactly the four edges, optional', () => {
    expectTypeOf<DrawerRootProps['placement']>().toEqualTypeOf<'start' | 'end' | 'top' | 'bottom' | undefined>()
    expectTypeOf<DrawerPlacement>().toEqualTypeOf<'start' | 'end' | 'top' | 'bottom'>()
  })

  it('refuses a physical side and the swipe names of Base UI (R-5.3-4)', () => {
    expectTypeOf<Accepts<DrawerRootProps['placement'], 'left'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<DrawerRootProps['placement'], 'right'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<DrawerRootProps['placement'], 'down'>>().toEqualTypeOf<false>()
  })

  it('is not on the popup, as the docs sample wrote it: the root owns the gesture', () => {
    expectTypeOf<Accepts<keyof DrawerPopupProps, 'placement'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof DrawerHeaderProps, 'placement'>>().toEqualTypeOf<false>()
  })
})

describe('size is on the root too', () => {
  it('is exactly the six shared sizes, optional', () => {
    expectTypeOf<DrawerRootProps['size']>().toEqualTypeOf<'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'custom' | undefined>()
  })

  it('refuses a width in pixels and a size outside the scale', () => {
    expectTypeOf<Accepts<DrawerRootProps['size'], 320>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<DrawerRootProps['size'], '2xl'>>().toEqualTypeOf<false>()
  })

  it('is on no other part: the bars follow the popup, and the popup follows its root', () => {
    expectTypeOf<Accepts<keyof DrawerPopupProps, 'size'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof DrawerHeaderProps, 'size'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof DrawerBodyProps, 'size'>>().toEqualTypeOf<false>()
  })
})

describe('the design props come from the schema', () => {
  it('are placement and size, both optional', () => {
    expectTypeOf<keyof DrawerDesignProps>().toEqualTypeOf<'placement' | 'size'>()
    expectTypeOf<DrawerDesignProps['placement']>().toEqualTypeOf<'start' | 'end' | 'top' | 'bottom' | undefined>()
    expectTypeOf<Accepts<DrawerDesignProps, { placement: 'bottom', size: 'lg' }>>().toEqualTypeOf<true>()
  })
})

describe('the root renders no element', () => {
  it('takes no className, style or ref', () => {
    expectTypeOf<Accepts<keyof DrawerRootProps, 'className'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof DrawerRootProps, 'style'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof DrawerRootProps, 'ref'>>().toEqualTypeOf<false>()
  })

  it('takes exactly these twelve props: the two of ours, and ten of Base UI (R-5.7-5)', () => {
    expectTypeOf<keyof DrawerRootProps>().toEqualTypeOf<
      'open' | 'defaultOpen' | 'modal' | 'onOpenChange' | 'onOpenChangeComplete' | 'disablePointerDismissal'
      | 'actionsRef' | 'children' | 'triggerId' | 'defaultTriggerId' | 'placement' | 'size'
    >()
    expectTypeOf<DrawerRootProps['open']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<DrawerRootProps['defaultOpen']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<DrawerRootProps['disablePointerDismissal']>().toEqualTypeOf<boolean | undefined>()
  })

  it('takes each of those ten as Base UI types it, untouched', () => {
    type Passed = 'open' | 'defaultOpen' | 'modal' | 'onOpenChange' | 'onOpenChangeComplete' | 'disablePointerDismissal'
      | 'actionsRef' | 'triggerId' | 'defaultTriggerId'
    expectTypeOf<Pick<DrawerRootProps, Passed>>().toEqualTypeOf<Pick<Drawer.Root.Props, Passed>>()
  })

  it('takes modal as Base UI types it: true, false or trap-focus', () => {
    expectTypeOf<DrawerRootProps['modal']>().toEqualTypeOf<boolean | 'trap-focus' | undefined>()
  })

  it('takes children as nodes only: the function form exists to receive the payload of a handle', () => {
    expectTypeOf<DrawerRootProps['children']>().toEqualTypeOf<ReactNode>()
    expectTypeOf<Accepts<DrawerRootProps['children'], () => ReactNode>>().toEqualTypeOf<false>()
  })

  it('reports an open change with the event that follows the R-5.7-1 name, and swipe is one of its reasons', () => {
    type Handler = NonNullable<DrawerRootProps['onOpenChange']>
    expectTypeOf<Parameters<Handler>[0]>().toEqualTypeOf<boolean>()
    expectTypeOf<Parameters<Handler>[1]>().toEqualTypeOf<Drawer.Root.ChangeEventDetails>()
    expectTypeOf<Accepts<Parameters<Handler>[1]['reason'], 'swipe'>>().toEqualTypeOf<true>()
  })
})

describe('every part that renders an element takes className, style, ref and the rest', () => {
  it('className is a string on all eight, never the state function Base UI also takes', () => {
    expectTypeOf<{ [K in keyof Parts]: Parts[K]['className'] }>().toEqualTypeOf<{ [K in keyof Parts]: string | undefined }>()
    expectTypeOf<Accepts<DrawerPopupProps['className'], () => string>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<DrawerBodyProps['className'], () => string>>().toEqualTypeOf<false>()
  })

  it('style takes a plain style object on all eight', () => {
    expectTypeOf<{ [K in keyof Parts]: Accepts<Parts[K]['style'], CSSProperties> }>()
      .toEqualTypeOf<{ [K in keyof Parts]: true }>()
  })

  it('ref is a normal prop, of the element each part renders', () => {
    expectTypeOf<Accepts<DrawerTriggerProps['ref'], Ref<HTMLButtonElement>>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<DrawerPopupProps['ref'], Ref<HTMLDivElement>>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<DrawerHeaderProps['ref'], Ref<HTMLDivElement>>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<DrawerTitleProps['ref'], Ref<HTMLHeadingElement>>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<DrawerDescriptionProps['ref'], Ref<HTMLParagraphElement>>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<DrawerBodyProps['ref'], Ref<HTMLDivElement>>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<DrawerFooterProps['ref'], Ref<HTMLDivElement>>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<DrawerCloseProps['ref'], Ref<HTMLButtonElement>>>().toEqualTypeOf<true>()
  })

  it('keeps the native attributes, so id, aria-* and data-* pass through', () => {
    expectTypeOf<Accepts<keyof DrawerPopupProps, 'id' | 'aria-label' | 'lang' | 'dir'>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<keyof DrawerBodyProps, 'id' | 'tabIndex' | 'role'>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<keyof DrawerCloseProps, 'aria-label' | 'disabled'>>().toEqualTypeOf<true>()
  })

  it('takes children as any node on the bars, the title, the description and the popup', () => {
    expectTypeOf<Accepts<DrawerHeaderProps['children'], ReactNode>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<DrawerBodyProps['children'], ReactNode>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<DrawerFooterProps['children'], ReactNode>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<DrawerTitleProps['children'], ReactNode>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<DrawerPopupProps['children'], ReactNode>>().toEqualTypeOf<true>()
  })
})

describe('what Base UI gives each part passes through', () => {
  it('the trigger and the close take render, which is how a Button becomes either', () => {
    expectTypeOf<Accepts<DrawerTriggerProps['render'], ReactElement>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<DrawerCloseProps['render'], ReactElement>>().toEqualTypeOf<true>()
  })

  it('the popup takes render too, and where the first and the last focus go', () => {
    expectTypeOf<Accepts<DrawerPopupProps['render'], ReactElement>>().toEqualTypeOf<true>()
    expectTypeOf<DrawerPopupProps['initialFocus']>().toEqualTypeOf<Drawer.Popup.Props['initialFocus']>()
    expectTypeOf<DrawerPopupProps['finalFocus']>().toEqualTypeOf<Drawer.Popup.Props['finalFocus']>()
    expectTypeOf<Accepts<DrawerPopupProps['initialFocus'], false>>().toEqualTypeOf<true>()
  })

  it('the trigger keeps disabled and nativeButton, which an element that is not a button needs', () => {
    expectTypeOf<DrawerTriggerProps['disabled']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<DrawerTriggerProps['nativeButton']>().toEqualTypeOf<boolean | undefined>()
  })

  it('the popup takes the two props of the portal it renders, as Base UI types them', () => {
    expectTypeOf<DrawerPopupProps['container']>().toEqualTypeOf<Drawer.Portal.Props['container']>()
    expectTypeOf<DrawerPopupProps['keepMounted']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<Accepts<DrawerPopupProps['container'], HTMLElement | null>>().toEqualTypeOf<true>()
  })

  it('the body is Base UI content, so it takes render; the header and the footer are plain divs and take none', () => {
    expectTypeOf<Accepts<DrawerBodyProps['render'], ReactElement>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<keyof DrawerHeaderProps, 'render'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof DrawerFooterProps, 'render'>>().toEqualTypeOf<false>()
  })
})
