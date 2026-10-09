import type { CSSProperties, ReactNode, Ref } from 'react'
import { describe, expectTypeOf, it } from 'vitest'

// From the index, so a type it stops re-exporting fails here.
import type {
  CardBodyProps, CardFooterProps, CardHeaderProps, CardRootProps, CardSkeletonProps,
} from '../index.js'

/** Assignability as a value, so a rejected prop is a passing assertion. */
type Accepts<Union, Candidate> = Candidate extends Union ? true : false

describe('every part takes what a div takes', () => {
  it('className is a string on all four', () => {
    expectTypeOf<CardRootProps['className']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<CardHeaderProps['className']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<CardBodyProps['className']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<CardFooterProps['className']>().toEqualTypeOf<string | undefined>()
  })

  it('style is the React style object on all four', () => {
    expectTypeOf<CardRootProps['style']>().toEqualTypeOf<CSSProperties | undefined>()
    expectTypeOf<CardHeaderProps['style']>().toEqualTypeOf<CSSProperties | undefined>()
    expectTypeOf<CardBodyProps['style']>().toEqualTypeOf<CSSProperties | undefined>()
    expectTypeOf<CardFooterProps['style']>().toEqualTypeOf<CSSProperties | undefined>()
  })

  it('ref is a normal prop that receives the div, on all four', () => {
    expectTypeOf<CardRootProps['ref']>().toEqualTypeOf<Ref<HTMLDivElement> | undefined>()
    expectTypeOf<CardHeaderProps['ref']>().toEqualTypeOf<Ref<HTMLDivElement> | undefined>()
    expectTypeOf<CardBodyProps['ref']>().toEqualTypeOf<Ref<HTMLDivElement> | undefined>()
    expectTypeOf<CardFooterProps['ref']>().toEqualTypeOf<Ref<HTMLDivElement> | undefined>()
  })

  it('children is any node, so a part holds other components', () => {
    expectTypeOf<CardRootProps['children']>().toEqualTypeOf<ReactNode | undefined>()
    expectTypeOf<CardFooterProps['children']>().toEqualTypeOf<ReactNode | undefined>()
  })

  it('keeps the native div props, so id, title and aria-* still pass through', () => {
    expectTypeOf<Accepts<keyof CardRootProps, 'id'>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<keyof CardHeaderProps, 'title'>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<keyof CardBodyProps, 'aria-describedby'>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<keyof CardFooterProps, 'aria-label'>>().toEqualTypeOf<true>()
  })
})

describe('none of the props the spec leaves unbuilt', () => {
  it('has no render prop, because a card rendered as a link would have no drawn states', () => {
    expectTypeOf<Accepts<keyof CardRootProps, 'render'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof CardHeaderProps, 'render'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof CardBodyProps, 'render'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof CardFooterProps, 'render'>>().toEqualTypeOf<false>()
  })

  it('has no interactive, variant, padding or media on the root', () => {
    expectTypeOf<Accepts<keyof CardRootProps, 'interactive'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof CardRootProps, 'variant'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof CardRootProps, 'padding'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof CardRootProps, 'media'>>().toEqualTypeOf<false>()
  })

  it('has no size or tone, because nothing on a card is drawn at more than one', () => {
    expectTypeOf<Accepts<keyof CardRootProps, 'size'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof CardRootProps, 'tone'>>().toEqualTypeOf<false>()
  })
})

describe('the skeleton takes nothing it would ignore', () => {
  it('takes no content and no way to un-hide itself', () => {
    expectTypeOf<Accepts<keyof CardSkeletonProps, 'children'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof CardSkeletonProps, 'aria-hidden'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof CardSkeletonProps, 'dangerouslySetInnerHTML'>>().toEqualTypeOf<false>()
  })

  it('still takes className, style and a div ref', () => {
    expectTypeOf<CardSkeletonProps['className']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<CardSkeletonProps['style']>().toEqualTypeOf<CSSProperties | undefined>()
    expectTypeOf<CardSkeletonProps['ref']>().toEqualTypeOf<Ref<HTMLDivElement> | undefined>()
  })
})
