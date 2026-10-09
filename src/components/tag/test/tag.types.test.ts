import { describe, expect, expectTypeOf, it } from 'vitest'

import type { Size } from '#shared/contracts/size.js'
import { TAG_DEFAULTS, TAG_SIZES, TAG_TONES } from '../constants.js'
import { tagSchema } from '../schema.js'
import type { TagDesignProps, TagProps, TagTone } from '../types.js'

/** Assignability as a value, so a rejected prop is a passing assertion. */
type Accepts<Union, Candidate> = Candidate extends Union ? true : false

describe('the unions come from the constants', () => {
  it('tone is the shared six, so every toned component offers the same set', () => {
    expectTypeOf<TagTone>()
      .toEqualTypeOf<'primary' | 'neutral' | 'success' | 'warning' | 'danger' | 'info'>()
  })

  it('size is the shared scale including custom', () => {
    expectTypeOf<TagProps['size']>().toEqualTypeOf<Size | undefined>()
    expectTypeOf<Accepts<TagProps['size'], 'custom'>>().toEqualTypeOf<true>()
  })

  it('rejects a value that is not in the list', () => {
    expectTypeOf<Accepts<TagTone, 'brand'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<TagProps['size'], 'xxl'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<TagTone, string>>().toEqualTypeOf<false>()
  })
})

describe('the props follow the vocabulary', () => {
  it('accepts className, style and ref, and ref is a normal prop', () => {
    expectTypeOf<TagProps['className']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<Accepts<keyof TagProps, 'style'>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<keyof TagProps, 'ref'>>().toEqualTypeOf<true>()
  })

  it('keeps the native span props, so id, title and aria-* still pass through', () => {
    expectTypeOf<Accepts<keyof TagProps, 'id'>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<keyof TagProps, 'title'>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<keyof TagProps, 'aria-label'>>().toEqualTypeOf<true>()
  })

  it('has no render prop, because a tag rendered as a link would have no drawn states', () => {
    expectTypeOf<Accepts<keyof TagProps, 'render'>>().toEqualTypeOf<false>()
  })

  it('has none of the props the spec leaves unbuilt', () => {
    expectTypeOf<Accepts<keyof TagProps, 'variant'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof TagProps, 'removable'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof TagProps, 'onRemove'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof TagProps, 'truncate'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof TagProps, 'disabled'>>().toEqualTypeOf<false>()
  })
})

describe('the design props and the schema cannot drift', () => {
  it('is derived from the schema input', () => {
    expectTypeOf<TagDesignProps['tone']>().toEqualTypeOf<TagTone | undefined>()
    expectTypeOf<TagDesignProps['size']>().toEqualTypeOf<Size | undefined>()
  })

  it('holds tone and size and nothing else', () => {
    expectTypeOf<keyof TagDesignProps>().toEqualTypeOf<'tone' | 'size'>()
  })

  it('is a subset of the component props, so every design prop is settable', () => {
    expectTypeOf<Accepts<keyof TagProps, keyof TagDesignProps>>().toEqualTypeOf<true>()
  })
})

describe('the schema', () => {
  it('fills every default the spec names', () => {
    expect(tagSchema.parse({})).toEqual({ tone: 'neutral', size: 'md' })
  })

  it('accepts every value the constants list', () => {
    for (const tone of TAG_TONES) expect(tagSchema.parse({ tone }).tone).toBe(tone)
    for (const size of TAG_SIZES) expect(tagSchema.parse({ size }).size).toBe(size)
  })

  it('refuses a value outside the list, which is what the docs table reads as the limit', () => {
    expect(tagSchema.safeParse({ tone: 'brand' }).success).toBe(false)
    expect(tagSchema.safeParse({ size: 'xxl' }).success).toBe(false)
  })

  it('agrees with the defaults the spec names', () => {
    expect(TAG_DEFAULTS).toEqual({ tone: 'neutral', size: 'md' })
  })
})
