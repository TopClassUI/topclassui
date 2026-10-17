import { describe, expect, expectTypeOf, it } from 'vitest'

import type { Size } from '#shared/contracts/size.js'
import type { Labels } from '#shared/labels/types.js'
import { AVATAR_GROUP_DEFAULTS, AVATAR_GROUP_SIZES } from '../constants.js'
import { avatarGroupSchema } from '../schema.js'
import type { AvatarGroupDesignProps, AvatarGroupProps } from '../types.js'

/** Assignability as a value, so a rejected prop is a passing assertion. */
type Accepts<Union, Candidate> = Candidate extends Union ? true : false

describe('the design props come from the schema', () => {
  it('max is a number', () => {
    expectTypeOf<AvatarGroupDesignProps['max']>().toEqualTypeOf<number | undefined>()
    expectTypeOf<Accepts<AvatarGroupDesignProps['max'], '4'>>().toEqualTypeOf<false>()
  })

  it('size is the shared scale including custom', () => {
    expectTypeOf<AvatarGroupDesignProps['size']>().toEqualTypeOf<Size | undefined>()
    expectTypeOf<Accepts<AvatarGroupDesignProps['size'], 'custom'>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<AvatarGroupDesignProps['size'], 'xxl'>>().toEqualTypeOf<false>()
  })

  it('is exactly max and size, so the schema documents every design prop', () => {
    expectTypeOf<keyof AvatarGroupDesignProps>().toEqualTypeOf<'max' | 'size'>()
  })

  it('offers the six shared sizes', () => {
    expect(AVATAR_GROUP_SIZES).toEqual(['xs', 'sm', 'md', 'lg', 'xl', 'custom'])
  })
})

describe('labels and locale', () => {
  it('takes the labels object, not the { locale, labels } pair getLabels returns', () => {
    expectTypeOf<AvatarGroupProps['labels']>().toEqualTypeOf<Labels | undefined>()
  })

  it('takes locale as a plain string, which crosses the server boundary (R-5.1-3)', () => {
    expectTypeOf<AvatarGroupProps['locale']>().toEqualTypeOf<string | undefined>()
  })

  it('needs neither: both are optional', () => {
    expectTypeOf<Accepts<AvatarGroupProps, object>>().toEqualTypeOf<true>()
  })
})

describe('the props follow the vocabulary', () => {
  it('accepts className, style and ref, and ref is a normal prop', () => {
    expectTypeOf<AvatarGroupProps['className']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<Accepts<keyof AvatarGroupProps, 'style'>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<keyof AvatarGroupProps, 'ref'>>().toEqualTypeOf<true>()
  })

  it('keeps the native span props, so id, title and aria-label still pass through', () => {
    expectTypeOf<Accepts<keyof AvatarGroupProps, 'id'>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<keyof AvatarGroupProps, 'title'>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<keyof AvatarGroupProps, 'aria-label'>>().toEqualTypeOf<true>()
  })

  it('takes children, which are the members it counts', () => {
    expectTypeOf<Accepts<keyof AvatarGroupProps, 'children'>>().toEqualTypeOf<true>()
  })

  it('takes none of what it writes itself', () => {
    expectTypeOf<Accepts<keyof AvatarGroupProps, 'role'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof AvatarGroupProps, 'dangerouslySetInnerHTML'>>().toEqualTypeOf<false>()
  })

  it('has none of the props the spec leaves unbuilt', () => {
    expectTypeOf<Accepts<keyof AvatarGroupProps, 'spacing'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof AvatarGroupProps, 'showCount'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof AvatarGroupProps, 'bordered'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof AvatarGroupProps, 'variant'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof AvatarGroupProps, 'tone'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof AvatarGroupProps, 'render'>>().toEqualTypeOf<false>()
  })
})

describe('the design props and the schema cannot drift', () => {
  it('is a subset of the component props, so every design prop is settable', () => {
    expectTypeOf<Accepts<keyof AvatarGroupProps, keyof AvatarGroupDesignProps>>().toEqualTypeOf<true>()
  })

  it('fills every default with the value constants.ts holds', () => {
    expect(avatarGroupSchema.parse({})).toEqual({
      max: AVATAR_GROUP_DEFAULTS.max,
      size: AVATAR_GROUP_DEFAULTS.size,
    })
  })

  it('accepts every size the constants list', () => {
    for (const size of AVATAR_GROUP_SIZES) expect(avatarGroupSchema.parse({ size }).size).toBe(size)
  })
})
