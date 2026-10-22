import type { Tooltip } from '@base-ui/react/tooltip'
import type { CSSProperties, ReactElement, Ref } from 'react'
import { describe, expectTypeOf, it } from 'vitest'

// From the index, so a type it stops re-exporting fails here.
import type {
  TooltipDesignProps, TooltipPlacement, TooltipPopupProps, TooltipProvider, TooltipProviderProps, TooltipRoot,
  TooltipRootProps, TooltipText, TooltipTrigger, TooltipTriggerProps,
} from '../index.js'

/** Assignability as a value, so a rejected prop is a passing assertion. */
type Accepts<Union, Candidate> = Candidate extends Union ? true : false

type Children = TooltipPopupProps['children']

describe('the popup takes text and nothing else (R-10.5-2)', () => {
  it('takes a string, the usual case', () => {
    expectTypeOf<Accepts<Children, 'Copy link'>>().toEqualTypeOf<true>()
  })

  it('takes a number, which React renders as text', () => {
    expectTypeOf<Accepts<Children, 3>>().toEqualTypeOf<true>()
  })

  it('takes the array JSX passes for an interpolated run, such as Delete {count} rows', () => {
    expectTypeOf<Accepts<Children, (string | number)[]>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<Children, readonly ['Delete ', 3, ' rows']>>().toEqualTypeOf<true>()
  })

  it('refuses an element, so a link or a control cannot get in without a lint rule', () => {
    expectTypeOf<Accepts<Children, ReactElement>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<Children, ReactElement[]>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<Children, (string | ReactElement)[]>>().toEqualTypeOf<false>()
  })

  it('refuses a boolean, which would render nothing and leave an empty chip', () => {
    expectTypeOf<Accepts<Children, false>>().toEqualTypeOf<false>()
  })

  it('names the run of text as one type, string or number', () => {
    expectTypeOf<TooltipText>().toEqualTypeOf<string | number>()
  })

  it('takes no render prop, which would be a way round the text-only rule', () => {
    expectTypeOf<Accepts<keyof TooltipPopupProps, 'render'>>().toEqualTypeOf<false>()
  })

  it('takes no dangerouslySetInnerHTML, which would put markup in the chip', () => {
    expectTypeOf<Accepts<keyof TooltipPopupProps, 'dangerouslySetInnerHTML'>>().toEqualTypeOf<false>()
  })
})

describe('placement', () => {
  it('is exactly the twelve shared placements', () => {
    expectTypeOf<TooltipPlacement>().toEqualTypeOf<
      'top' | 'top-start' | 'top-end'
      | 'bottom' | 'bottom-start' | 'bottom-end'
      | 'start' | 'start-top' | 'start-bottom'
      | 'end' | 'end-top' | 'end-bottom'
    >()
  })

  it('is on the popup, optional', () => {
    expectTypeOf<TooltipPopupProps['placement']>().toEqualTypeOf<TooltipPlacement | undefined>()
  })

  it('refuses a physical side, which would not mirror (R-5.3-4)', () => {
    expectTypeOf<Accepts<TooltipPlacement, 'left'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<TooltipPlacement, 'right'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<TooltipPlacement, 'inline-start'>>().toEqualTypeOf<false>()
  })

  it('leaves Base UI side and align off the popup, so placement is the one way in', () => {
    expectTypeOf<Accepts<keyof TooltipPopupProps, 'side'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof TooltipPopupProps, 'align'>>().toEqualTypeOf<false>()
  })
})

describe('the delays are on the trigger', () => {
  it('takes delay and closeDelay as numbers', () => {
    expectTypeOf<TooltipTriggerProps['delay']>().toEqualTypeOf<number | undefined>()
    expectTypeOf<TooltipTriggerProps['closeDelay']>().toEqualTypeOf<number | undefined>()
  })

  it('does not put them on the root, where Base UI 1.8.0 has none', () => {
    expectTypeOf<Accepts<keyof TooltipRootProps, 'delay'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof TooltipRootProps, 'closeDelay'>>().toEqualTypeOf<false>()
  })
})

describe('the root renders no element', () => {
  it('takes no className, style or ref', () => {
    expectTypeOf<Accepts<keyof TooltipRootProps, 'className'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof TooltipRootProps, 'style'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof TooltipRootProps, 'ref'>>().toEqualTypeOf<false>()
  })

  it('passes every Base UI root prop through: open, defaultOpen, onOpenChange, disabled', () => {
    expectTypeOf<TooltipRootProps['open']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<TooltipRootProps['defaultOpen']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<TooltipRootProps['disabled']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<Accepts<keyof TooltipRootProps, 'onOpenChange'>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<keyof TooltipRootProps, 'actionsRef'>>().toEqualTypeOf<true>()
  })
})

describe('the trigger and the popup take className, style, ref and the rest', () => {
  it('className is a string on both, never the state function Base UI also takes', () => {
    expectTypeOf<TooltipTriggerProps['className']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<TooltipPopupProps['className']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<Accepts<TooltipPopupProps['className'], () => string>>().toEqualTypeOf<false>()
  })

  it('style takes a plain style object on both', () => {
    expectTypeOf<Accepts<TooltipTriggerProps['style'], CSSProperties>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<TooltipPopupProps['style'], CSSProperties>>().toEqualTypeOf<true>()
  })

  it('ref is a normal prop on both', () => {
    expectTypeOf<Accepts<TooltipTriggerProps['ref'], Ref<HTMLButtonElement>>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<TooltipPopupProps['ref'], Ref<HTMLDivElement>>>().toEqualTypeOf<true>()
  })

  it('the trigger takes render, which is how a Button becomes the trigger', () => {
    expectTypeOf<Accepts<TooltipTriggerProps['render'], ReactElement>>().toEqualTypeOf<true>()
  })

  it('keeps the Base UI trigger props: closeOnClick, disabled, handle and payload', () => {
    expectTypeOf<TooltipTriggerProps['closeOnClick']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<TooltipTriggerProps['disabled']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<Accepts<keyof TooltipTriggerProps, 'handle'>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<keyof TooltipTriggerProps, 'payload'>>().toEqualTypeOf<true>()
  })

  it('keeps the native attributes, so aria-label, id and data-* pass through', () => {
    expectTypeOf<Accepts<keyof TooltipTriggerProps, 'aria-label'>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<keyof TooltipPopupProps, 'id'>>().toEqualTypeOf<true>()
  })
})

describe('none of the props the spec leaves unbuilt', () => {
  it('has no showArrow and no instant', () => {
    expectTypeOf<Accepts<keyof TooltipPopupProps, 'showArrow'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof TooltipRootProps, 'instant'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof TooltipTriggerProps, 'instant'>>().toEqualTypeOf<false>()
  })

  it('has no size, variant or tone: one chip is drawn', () => {
    expectTypeOf<Accepts<keyof TooltipPopupProps, 'size'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof TooltipPopupProps, 'variant'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof TooltipPopupProps, 'tone'>>().toEqualTypeOf<false>()
  })
})

describe('the design props come from the schema', () => {
  it('are placement, delay and closeDelay, all optional', () => {
    expectTypeOf<keyof TooltipDesignProps>().toEqualTypeOf<'placement' | 'delay' | 'closeDelay'>()
    expectTypeOf<TooltipDesignProps['placement']>().toEqualTypeOf<TooltipPlacement | undefined>()
    expectTypeOf<TooltipDesignProps['delay']>().toEqualTypeOf<number | undefined>()
  })
})

describe('a typed handle types the payload, as Base UI does', () => {
  type Label = { label: string }

  it('the trigger takes the handle and a payload of its type', () => {
    expectTypeOf<TooltipTriggerProps<Label>['payload']>().toEqualTypeOf<Label | undefined>()
    expectTypeOf<TooltipTriggerProps<Label>['handle']>().toEqualTypeOf<Tooltip.Handle<Label> | undefined>()
  })

  it('the root children function receives the payload as that type', () => {
    type Render = Extract<TooltipRootProps<Label>['children'], (arg: never) => unknown>
    expectTypeOf<Parameters<Render>[0]['payload']>().toEqualTypeOf<Label | undefined>()
  })

  it('both parts are generic, so JSX infers the payload from the handle', () => {
    expectTypeOf<Parameters<typeof TooltipRoot<Label>>[0]>().toEqualTypeOf<TooltipRootProps<Label>>()
    expectTypeOf<Parameters<typeof TooltipTrigger<Label>>[0]>().toEqualTypeOf<TooltipTriggerProps<Label>>()
  })
})

describe('the provider is a delay group and renders no element (R-5.7-3)', () => {
  it('takes children, the two delays as numbers and the group timeout', () => {
    expectTypeOf<keyof TooltipProviderProps>().toEqualTypeOf<'children' | 'delay' | 'closeDelay' | 'timeout'>()
    expectTypeOf<TooltipProviderProps['delay']>().toEqualTypeOf<number | undefined>()
    expectTypeOf<TooltipProviderProps['closeDelay']>().toEqualTypeOf<number | undefined>()
  })

  it('takes no className, style or ref, since there is no element to put them on', () => {
    expectTypeOf<Accepts<keyof TooltipProviderProps, 'className'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof TooltipProviderProps, 'style'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof TooltipProviderProps, 'ref'>>().toEqualTypeOf<false>()
  })

  it('is called with exactly its props', () => {
    expectTypeOf<Parameters<typeof TooltipProvider>[0]>().toEqualTypeOf<TooltipProviderProps>()
  })
})
