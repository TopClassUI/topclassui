import type { ReactElement, ReactNode, Ref } from 'react'
import { describe, expectTypeOf, it } from 'vitest'

import type { Labels } from '#shared/labels/types.js'
import type { EmptyStateProps } from '../types.js'

/** Assignability as a value, so a rejected prop is a passing assertion. */
type Accepts<Union, Candidate> = Candidate extends Union ? true : false

describe('the content props are nodes, not strings', () => {
  it('takes any node for the icon, the title and the description', () => {
    expectTypeOf<EmptyStateProps['icon']>().toEqualTypeOf<ReactNode | undefined>()
    expectTypeOf<EmptyStateProps['title']>().toEqualTypeOf<ReactNode | undefined>()
    expectTypeOf<EmptyStateProps['description']>().toEqualTypeOf<ReactNode | undefined>()
    expectTypeOf<EmptyStateProps['children']>().toEqualTypeOf<ReactNode | undefined>()
  })

  it('accepts null for each of the three, which is how a part is hidden', () => {
    expectTypeOf<Accepts<EmptyStateProps['icon'], null>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<EmptyStateProps['title'], null>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<EmptyStateProps['description'], null>>().toEqualTypeOf<true>()
  })

  it('replaces the native title, so an element is a valid title', () => {
    expectTypeOf<Accepts<EmptyStateProps['title'], ReactElement>>().toEqualTypeOf<true>()
  })

  it('takes the whole Labels object, the labels field of what getLabels returns', () => {
    expectTypeOf<EmptyStateProps['labels']>().toEqualTypeOf<Labels | undefined>()
    expectTypeOf<Accepts<EmptyStateProps['labels'], { locale: string; labels: Labels }>>()
      .toEqualTypeOf<false>()
  })
})

describe('the props follow the vocabulary', () => {
  it('accepts className, style and ref, and ref is a normal prop on the div', () => {
    expectTypeOf<EmptyStateProps['className']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<Accepts<keyof EmptyStateProps, 'style'>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<EmptyStateProps['ref'], Ref<HTMLDivElement>>>().toEqualTypeOf<true>()
  })

  it('keeps the native div props, so id, role and aria-* still pass through', () => {
    expectTypeOf<Accepts<keyof EmptyStateProps, 'id'>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<keyof EmptyStateProps, 'role'>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<keyof EmptyStateProps, 'aria-labelledby'>>().toEqualTypeOf<true>()
  })

  it('has no render prop, because it is page content and not a control', () => {
    expectTypeOf<Accepts<keyof EmptyStateProps, 'render'>>().toEqualTypeOf<false>()
  })

  it('has none of the props the spec leaves unbuilt', () => {
    expectTypeOf<Accepts<keyof EmptyStateProps, 'size'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof EmptyStateProps, 'variant'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof EmptyStateProps, 'tone'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof EmptyStateProps, 'compact'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof EmptyStateProps, 'bordered'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof EmptyStateProps, 'withAction'>>().toEqualTypeOf<false>()
  })
})
