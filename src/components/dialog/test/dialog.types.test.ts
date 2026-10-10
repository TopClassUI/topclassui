import type { Dialog } from '@base-ui/react/dialog'
import type { CSSProperties, ReactElement, ReactNode, Ref } from 'react'
import { describe, expectTypeOf, it } from 'vitest'

// From the index, so a type it stops re-exporting fails here.
import type {
  DialogBodyProps, DialogCloseProps, DialogDescriptionProps, DialogDesignProps, DialogFooterProps,
  DialogHeaderProps, DialogPopupProps, DialogRoot, DialogRootProps, DialogTitleProps, DialogTrigger,
  DialogTriggerProps,
} from '../index.js'

/** Assignability as a value, so a rejected prop is a passing assertion. */
type Accepts<Union, Candidate> = Candidate extends Union ? true : false

/** Every part that renders an element. */
interface Parts {
  trigger: DialogTriggerProps
  popup: DialogPopupProps
  header: DialogHeaderProps
  title: DialogTitleProps
  description: DialogDescriptionProps
  body: DialogBodyProps
  footer: DialogFooterProps
  close: DialogCloseProps
}

describe('size is on the popup', () => {
  it('is exactly the six shared sizes, optional', () => {
    expectTypeOf<DialogPopupProps['size']>().toEqualTypeOf<'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'custom' | undefined>()
  })

  it('refuses a width in pixels and a size outside the scale', () => {
    expectTypeOf<Accepts<DialogPopupProps['size'], 400>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<DialogPopupProps['size'], '2xl'>>().toEqualTypeOf<false>()
  })

  it('is on no other part: the root renders nothing and the bars follow the popup', () => {
    expectTypeOf<Accepts<keyof DialogRootProps, 'size'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof DialogHeaderProps, 'size'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof DialogBodyProps, 'size'>>().toEqualTypeOf<false>()
  })
})

describe('closeButton is on the header', () => {
  it('is an optional boolean', () => {
    expectTypeOf<DialogHeaderProps['closeButton']>().toEqualTypeOf<boolean | undefined>()
  })

  it('is on no other part', () => {
    expectTypeOf<Accepts<keyof DialogPopupProps, 'closeButton'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof DialogRootProps, 'closeButton'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof DialogFooterProps, 'closeButton'>>().toEqualTypeOf<false>()
  })
})

describe('the design props come from the schema', () => {
  it('are size and closeButton, both optional', () => {
    expectTypeOf<keyof DialogDesignProps>().toEqualTypeOf<'size' | 'closeButton'>()
    expectTypeOf<DialogDesignProps['closeButton']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<DialogDesignProps['size']>().toEqualTypeOf<'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'custom' | undefined>()
    expectTypeOf<Accepts<DialogDesignProps, { size: 'lg' }>>().toEqualTypeOf<true>()
  })
})

describe('the root renders no element', () => {
  it('takes no className, style or ref', () => {
    expectTypeOf<Accepts<keyof DialogRootProps, 'className'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof DialogRootProps, 'style'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof DialogRootProps, 'ref'>>().toEqualTypeOf<false>()
  })

  it('passes every Base UI root prop through untouched (R-5.7-5)', () => {
    expectTypeOf<DialogRootProps>().toEqualTypeOf<Dialog.Root.Props>()
    expectTypeOf<DialogRootProps['open']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<DialogRootProps['defaultOpen']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<DialogRootProps['modal']>().toEqualTypeOf<boolean | 'trap-focus' | undefined>()
    expectTypeOf<DialogRootProps['disablePointerDismissal']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<Accepts<keyof DialogRootProps, 'onOpenChange'>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<keyof DialogRootProps, 'actionsRef'>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<keyof DialogRootProps, 'handle'>>().toEqualTypeOf<true>()
  })

  it('reports an open change with the event that follows the R-5.7-1 name', () => {
    type Handler = NonNullable<DialogRootProps['onOpenChange']>
    expectTypeOf<Parameters<Handler>[0]>().toEqualTypeOf<boolean>()
    expectTypeOf<Parameters<Handler>[1]>().toEqualTypeOf<Dialog.Root.ChangeEventDetails>()
  })
})

describe('every part that renders an element takes className, style, ref and the rest', () => {
  it('className is a string on all eight, never the state function Base UI also takes', () => {
    expectTypeOf<{ [K in keyof Parts]: Parts[K]['className'] }>().toEqualTypeOf<{ [K in keyof Parts]: string | undefined }>()
    expectTypeOf<Accepts<DialogPopupProps['className'], () => string>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<DialogCloseProps['className'], () => string>>().toEqualTypeOf<false>()
  })

  it('style takes a plain style object on all eight', () => {
    expectTypeOf<{ [K in keyof Parts]: Accepts<Parts[K]['style'], CSSProperties> }>()
      .toEqualTypeOf<{ [K in keyof Parts]: true }>()
  })

  it('ref is a normal prop, of the element each part renders', () => {
    expectTypeOf<Accepts<DialogTriggerProps['ref'], Ref<HTMLButtonElement>>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<DialogPopupProps['ref'], Ref<HTMLDivElement>>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<DialogHeaderProps['ref'], Ref<HTMLDivElement>>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<DialogTitleProps['ref'], Ref<HTMLHeadingElement>>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<DialogDescriptionProps['ref'], Ref<HTMLParagraphElement>>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<DialogBodyProps['ref'], Ref<HTMLDivElement>>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<DialogFooterProps['ref'], Ref<HTMLDivElement>>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<DialogCloseProps['ref'], Ref<HTMLButtonElement>>>().toEqualTypeOf<true>()
  })

  it('keeps the native attributes, so id, aria-* and data-* pass through', () => {
    expectTypeOf<Accepts<keyof DialogPopupProps, 'id' | 'aria-label' | 'lang' | 'dir'>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<keyof DialogBodyProps, 'id' | 'tabIndex' | 'role'>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<keyof DialogCloseProps, 'aria-label' | 'disabled'>>().toEqualTypeOf<true>()
  })

  it('takes children as any node on the bars, the title, the description and the popup', () => {
    expectTypeOf<Accepts<DialogHeaderProps['children'], ReactNode>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<DialogBodyProps['children'], ReactNode>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<DialogFooterProps['children'], ReactNode>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<DialogTitleProps['children'], ReactNode>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<DialogPopupProps['children'], ReactNode>>().toEqualTypeOf<true>()
  })
})

describe('what Base UI gives each part passes through', () => {
  it('the trigger and the close take render, which is how a Button becomes either', () => {
    expectTypeOf<Accepts<DialogTriggerProps['render'], ReactElement>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<DialogCloseProps['render'], ReactElement>>().toEqualTypeOf<true>()
  })

  it('the popup takes render too, and where the first and the last focus go', () => {
    expectTypeOf<Accepts<DialogPopupProps['render'], ReactElement>>().toEqualTypeOf<true>()
    expectTypeOf<DialogPopupProps['initialFocus']>().toEqualTypeOf<Dialog.Popup.Props['initialFocus']>()
    expectTypeOf<DialogPopupProps['finalFocus']>().toEqualTypeOf<Dialog.Popup.Props['finalFocus']>()
    expectTypeOf<Accepts<DialogPopupProps['initialFocus'], false>>().toEqualTypeOf<true>()
  })

  it('the trigger keeps its Base UI props: disabled, nativeButton, handle and payload', () => {
    expectTypeOf<DialogTriggerProps['disabled']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<Accepts<keyof DialogTriggerProps, 'nativeButton' | 'handle' | 'payload'>>().toEqualTypeOf<true>()
  })

  it('the header, the body and the footer are plain divs: they take no render', () => {
    expectTypeOf<Accepts<keyof DialogHeaderProps, 'render'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof DialogBodyProps, 'render'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof DialogFooterProps, 'render'>>().toEqualTypeOf<false>()
  })
})

describe('none of the props the spec leaves unbuilt', () => {
  it('has no dismissible, placement or scrollBody on the root or the popup', () => {
    type Unbuilt = 'dismissible' | 'placement' | 'scrollBody'
    expectTypeOf<Extract<keyof DialogRootProps, Unbuilt>>().toEqualTypeOf<never>()
    expectTypeOf<Extract<keyof DialogPopupProps, Unbuilt>>().toEqualTypeOf<never>()
  })

  it('has no variant and no tone: one surface is drawn', () => {
    expectTypeOf<Extract<keyof DialogPopupProps, 'variant' | 'tone'>>().toEqualTypeOf<never>()
  })
})

describe('a typed handle types the payload, as Base UI does', () => {
  interface Project { id: string }

  it('the trigger takes the handle and a payload of its type', () => {
    expectTypeOf<DialogTriggerProps<Project>['payload']>().toEqualTypeOf<Project | undefined>()
    expectTypeOf<DialogTriggerProps<Project>['handle']>().toEqualTypeOf<Dialog.Handle<Project> | undefined>()
  })

  it('the root children function receives the payload as that type', () => {
    type Render = Extract<DialogRootProps<Project>['children'], (arg: never) => unknown>
    expectTypeOf<Parameters<Render>[0]['payload']>().toEqualTypeOf<Project | undefined>()
  })

  it('both parts are generic, so JSX infers the payload from the handle', () => {
    expectTypeOf<Parameters<typeof DialogRoot<Project>>[0]>().toEqualTypeOf<DialogRootProps<Project>>()
    expectTypeOf<Parameters<typeof DialogTrigger<Project>>[0]>().toEqualTypeOf<DialogTriggerProps<Project>>()
  })
})
