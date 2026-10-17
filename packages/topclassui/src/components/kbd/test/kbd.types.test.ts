import type { ComponentPropsWithRef, ReactNode, Ref } from 'react'
import { describe, expectTypeOf, it } from 'vitest'

import type { KbdProps } from '../types.js'

/** Assignability as a value, so a rejected prop is a passing assertion. */
type Accepts<Union, Candidate> = Candidate extends Union ? true : false

describe('the props are the native kbd props and nothing else', () => {
  it('is exactly the props of a kbd element, because Kbd has none of its own', () => {
    expectTypeOf<KbdProps>().toEqualTypeOf<ComponentPropsWithRef<'kbd'>>()
  })

  it('accepts children, className, style and ref, and ref is a normal prop', () => {
    expectTypeOf<KbdProps['children']>().toEqualTypeOf<ReactNode | undefined>()
    expectTypeOf<KbdProps['className']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<Accepts<keyof KbdProps, 'style'>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<KbdProps['ref'], Ref<HTMLElement>>>().toEqualTypeOf<true>()
  })

  it('keeps the native attributes, so id, title and aria-* still pass through', () => {
    expectTypeOf<Accepts<keyof KbdProps, 'id'>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<keyof KbdProps, 'title'>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<keyof KbdProps, 'aria-label'>>().toEqualTypeOf<true>()
  })
})

describe('the props the spec leaves unbuilt', () => {
  it('has no design prop, though the docs playground names variant and size', () => {
    expectTypeOf<Accepts<keyof KbdProps, 'variant'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof KbdProps, 'size'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof KbdProps, 'tone'>>().toEqualTypeOf<false>()
  })

  it('has no state prop, because a key is not interactive', () => {
    expectTypeOf<Accepts<keyof KbdProps, 'pressed'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof KbdProps, 'muted'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof KbdProps, 'disabled'>>().toEqualTypeOf<false>()
  })

  it('has no render prop, which none of the Unit 1 server components takes', () => {
    expectTypeOf<Accepts<keyof KbdProps, 'render'>>().toEqualTypeOf<false>()
  })
})
