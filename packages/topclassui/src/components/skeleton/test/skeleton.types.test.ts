import { describe, expect, expectTypeOf, it } from 'vitest'

import { SKELETON_DEFAULTS, SKELETON_VARIANTS } from '../constants.js'
import { skeletonSchema } from '../schema.js'
import type { SkeletonDesignProps, SkeletonProps, SkeletonVariant } from '../types.js'

/** Assignability as a value, so a rejected prop is a passing assertion. */
type Accepts<Union, Candidate> = Candidate extends Union ? true : false

describe('the unions come from the constants', () => {
  it('variant is exactly the four shapes the docs previewer captions', () => {
    expectTypeOf<SkeletonVariant>().toEqualTypeOf<'text' | 'circle' | 'rect' | 'card'>()
  })

  it('rows is a number', () => {
    expectTypeOf<SkeletonProps['rows']>().toEqualTypeOf<number | undefined>()
  })

  it('rejects a shape that is not in the list', () => {
    expectTypeOf<Accepts<SkeletonVariant, 'avatar'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<SkeletonVariant, 'line'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<SkeletonVariant, string>>().toEqualTypeOf<false>()
  })
})

describe('the props follow the vocabulary', () => {
  it('accepts className, style and ref, and ref is a normal prop', () => {
    expectTypeOf<SkeletonProps['className']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<Accepts<keyof SkeletonProps, 'style'>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<keyof SkeletonProps, 'ref'>>().toEqualTypeOf<true>()
  })

  it('keeps the native span props, so id and title still pass through', () => {
    expectTypeOf<Accepts<keyof SkeletonProps, 'id'>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<keyof SkeletonProps, 'title'>>().toEqualTypeOf<true>()
  })

  it('takes no content and no way to un-hide itself', () => {
    expectTypeOf<Accepts<keyof SkeletonProps, 'children'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof SkeletonProps, 'aria-hidden'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof SkeletonProps, 'dangerouslySetInnerHTML'>>().toEqualTypeOf<false>()
  })

  it('has none of the props the spec leaves unbuilt', () => {
    expectTypeOf<Accepts<keyof SkeletonProps, 'animate'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof SkeletonProps, 'rounded'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof SkeletonProps, 'size'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof SkeletonProps, 'tone'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof SkeletonProps, 'lines'>>().toEqualTypeOf<false>()
  })

  it('has no render prop, which none of the nine server components takes', () => {
    expectTypeOf<Accepts<keyof SkeletonProps, 'render'>>().toEqualTypeOf<false>()
  })
})

describe('the design props and the schema cannot drift', () => {
  it('is derived from the schema input', () => {
    expectTypeOf<SkeletonDesignProps['variant']>().toEqualTypeOf<SkeletonVariant | undefined>()
    expectTypeOf<SkeletonDesignProps['rows']>().toEqualTypeOf<number | undefined>()
  })

  it('is a subset of the component props, so every design prop is settable', () => {
    expectTypeOf<Accepts<keyof SkeletonProps, keyof SkeletonDesignProps>>().toEqualTypeOf<true>()
  })
})

describe('the schema', () => {
  it('fills every default', () => {
    expect(skeletonSchema.parse({})).toEqual({ variant: 'text', rows: 3 })
  })

  it('accepts every value the constants list', () => {
    for (const variant of SKELETON_VARIANTS) {
      expect(skeletonSchema.parse({ variant }).variant).toBe(variant)
    }
  })

  it('refuses a value outside the list, which is what the docs table reads as the limit', () => {
    expect(skeletonSchema.safeParse({ variant: 'avatar' }).success).toBe(false)
    expect(skeletonSchema.safeParse({ variant: 'line' }).success).toBe(false)
  })

  it('agrees with the defaults the spec names', () => {
    expect(SKELETON_DEFAULTS).toEqual({ variant: 'text', rows: 3 })
  })

  it('lists the four shapes in the order the docs previewer draws them', () => {
    expect(SKELETON_VARIANTS).toEqual(['text', 'circle', 'rect', 'card'])
  })
})
