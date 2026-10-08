import { describe, expect, expectTypeOf, it } from 'vitest'

import type { Size } from '#shared/contracts/size.js'
import { BADGE_DEFAULTS, BADGE_SIZES, BADGE_TONES, BADGE_VARIANTS } from '../constants.js'
import { badgeSchema } from '../schema.js'
import type {
  BadgeDesignProps, BadgeProps, BadgeSkeletonProps, BadgeTone, BadgeVariant,
} from '../types.js'

/** Assignability as a value, so a rejected prop is a passing assertion. */
type Accepts<Union, Candidate> = Candidate extends Union ? true : false

describe('the unions come from the constants', () => {
  it('variant is exactly the three drawn', () => {
    expectTypeOf<BadgeVariant>().toEqualTypeOf<'solid' | 'soft' | 'outline'>()
  })

  it('tone is the shared six, so every toned component offers the same set', () => {
    expectTypeOf<BadgeTone>()
      .toEqualTypeOf<'primary' | 'neutral' | 'success' | 'warning' | 'danger' | 'info'>()
  })

  it('size is the shared scale including custom', () => {
    expectTypeOf<BadgeProps['size']>().toEqualTypeOf<Size | undefined>()
    expectTypeOf<Accepts<BadgeProps['size'], 'custom'>>().toEqualTypeOf<true>()
  })

  it('rejects a value that is not in the list', () => {
    expectTypeOf<Accepts<BadgeVariant, 'ghost'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<BadgeVariant, 'link'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<BadgeTone, 'brand'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<BadgeProps['size'], 'xxl'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<BadgeVariant, string>>().toEqualTypeOf<false>()
  })
})

describe('the props follow the vocabulary', () => {
  it('accepts className, style and ref, and ref is a normal prop', () => {
    expectTypeOf<BadgeProps['className']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<Accepts<keyof BadgeProps, 'style'>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<keyof BadgeProps, 'ref'>>().toEqualTypeOf<true>()
  })

  it('keeps the native span props, so id, title and aria-* still pass through', () => {
    expectTypeOf<Accepts<keyof BadgeProps, 'id'>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<keyof BadgeProps, 'title'>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<keyof BadgeProps, 'aria-label'>>().toEqualTypeOf<true>()
  })

  it('has no render prop, because a badge rendered as a link would have no drawn states', () => {
    expectTypeOf<Accepts<keyof BadgeProps, 'render'>>().toEqualTypeOf<false>()
  })

  it('has none of the props the spec leaves unbuilt', () => {
    expectTypeOf<Accepts<keyof BadgeProps, 'dot'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof BadgeProps, 'uppercase'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof BadgeProps, 'truncate'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof BadgeProps, 'disabled'>>().toEqualTypeOf<false>()
  })
})

describe('the skeleton takes the badge size and nothing it would ignore', () => {
  it('takes the badge size prop', () => {
    expectTypeOf<BadgeSkeletonProps['size']>().toEqualTypeOf<BadgeProps['size']>()
  })

  it('takes no content and no way to un-hide itself', () => {
    expectTypeOf<Accepts<keyof BadgeSkeletonProps, 'children'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof BadgeSkeletonProps, 'aria-hidden'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof BadgeSkeletonProps, 'dangerouslySetInnerHTML'>>().toEqualTypeOf<false>()
  })

  it('takes no variant or tone, because a placeholder has neither', () => {
    expectTypeOf<Accepts<keyof BadgeSkeletonProps, 'variant'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof BadgeSkeletonProps, 'tone'>>().toEqualTypeOf<false>()
  })

  it('still takes className, style and ref', () => {
    expectTypeOf<Accepts<keyof BadgeSkeletonProps, 'className'>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<keyof BadgeSkeletonProps, 'style'>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<keyof BadgeSkeletonProps, 'ref'>>().toEqualTypeOf<true>()
  })
})

describe('the design props and the schema cannot drift', () => {
  it('is derived from the schema input', () => {
    expectTypeOf<BadgeDesignProps['variant']>().toEqualTypeOf<BadgeVariant | undefined>()
    expectTypeOf<BadgeDesignProps['tone']>().toEqualTypeOf<BadgeTone | undefined>()
    expectTypeOf<BadgeDesignProps['size']>().toEqualTypeOf<Size | undefined>()
  })

  it('is a subset of the component props, so every design prop is settable', () => {
    expectTypeOf<Accepts<keyof BadgeProps, keyof BadgeDesignProps>>().toEqualTypeOf<true>()
  })
})

describe('the schema', () => {
  it('fills every default from constants.ts', () => {
    expect(badgeSchema.parse({})).toEqual({
      variant: BADGE_DEFAULTS.variant,
      tone: BADGE_DEFAULTS.tone,
      size: BADGE_DEFAULTS.size,
    })
  })

  it('accepts every value the constants list', () => {
    for (const variant of BADGE_VARIANTS) expect(badgeSchema.parse({ variant }).variant).toBe(variant)
    for (const tone of BADGE_TONES) expect(badgeSchema.parse({ tone }).tone).toBe(tone)
    for (const size of BADGE_SIZES) expect(badgeSchema.parse({ size }).size).toBe(size)
  })

  it('refuses a value outside the list, which is what the docs table reads as the limit', () => {
    expect(badgeSchema.safeParse({ variant: 'ghost' }).success).toBe(false)
    expect(badgeSchema.safeParse({ tone: 'brand' }).success).toBe(false)
    expect(badgeSchema.safeParse({ size: 'xxl' }).success).toBe(false)
  })

  it('agrees with the defaults the spec names', () => {
    expect(BADGE_DEFAULTS).toEqual({ variant: 'soft', tone: 'primary', size: 'md' })
  })
})
