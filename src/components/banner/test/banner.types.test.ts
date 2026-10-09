import type { ReactNode } from 'react'
import { describe, expect, expectTypeOf, it } from 'vitest'

import { BANNER_DEFAULTS, BANNER_TONES } from '../constants.js'
import { bannerSchema } from '../schema.js'
import type { BannerDesignProps, BannerName, BannerProps, BannerTone } from '../types.js'

/** Assignability as a value, so a rejected prop is a passing assertion. */
type Accepts<Union, Candidate> = Candidate extends Union ? true : false

describe('the union comes from the constants', () => {
  it('tone is the shared six, so every toned component offers the same set', () => {
    expectTypeOf<BannerTone>()
      .toEqualTypeOf<'primary' | 'neutral' | 'success' | 'warning' | 'danger' | 'info'>()
  })

  it('rejects a value that is not in the list', () => {
    expectTypeOf<Accepts<BannerTone, 'brand'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<BannerTone, string>>().toEqualTypeOf<false>()
  })
})

describe('a name is required, one of two ways (R-5.6-1)', () => {
  it('accepts aria-label alone, aria-labelledby alone, or both', () => {
    expectTypeOf<Accepts<BannerProps, { 'aria-label': string }>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<BannerProps, { 'aria-labelledby': string }>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<BannerProps, { 'aria-label': string; 'aria-labelledby': string }>>().toEqualTypeOf<true>()
  })

  it('refuses neither', () => {
    expectTypeOf<Accepts<BannerProps, { tone: 'info' }>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<BannerName, object>>().toEqualTypeOf<false>()
  })
})

describe('a wrapper that drops a prop', () => {
  it('loses the name through the built-in Omit, which folds one of two into neither', () => {
    expectTypeOf<Accepts<BannerProps, Omit<BannerProps, 'tone'>>>().toEqualTypeOf<false>()
  })

  it('gets the name back from BannerName, the form the README gives', () => {
    expectTypeOf<Accepts<BannerProps, Omit<BannerProps, 'tone'> & BannerName>>().toEqualTypeOf<true>()
  })

  it('or drops both names and passes its own', () => {
    type Titled = Omit<BannerProps, 'aria-label' | 'aria-labelledby'> & { 'aria-label': string }
    expectTypeOf<Accepts<BannerProps, Titled>>().toEqualTypeOf<true>()
  })
})

describe('the props follow the vocabulary', () => {
  it('takes the three slots as nodes', () => {
    expectTypeOf<BannerProps['icon']>().toEqualTypeOf<ReactNode>()
    expectTypeOf<BannerProps['children']>().toEqualTypeOf<ReactNode>()
    expectTypeOf<BannerProps['action']>().toEqualTypeOf<ReactNode>()
  })

  it('accepts className, style and ref, and ref is a normal prop', () => {
    expectTypeOf<BannerProps['className']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<Accepts<keyof BannerProps, 'style'>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<keyof BannerProps, 'ref'>>().toEqualTypeOf<true>()
  })

  it('keeps the native div props, so id and aria-* still pass through', () => {
    expectTypeOf<Accepts<keyof BannerProps, 'id'>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<keyof BannerProps, 'aria-describedby'>>().toEqualTypeOf<true>()
  })

  it('has no role, which the component writes, and no dangerouslySetInnerHTML', () => {
    expectTypeOf<Accepts<keyof BannerProps, 'role'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof BannerProps, 'dangerouslySetInnerHTML'>>().toEqualTypeOf<false>()
  })

  it('has none of the props the spec leaves unbuilt', () => {
    expectTypeOf<Accepts<keyof BannerProps, 'dismissible'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof BannerProps, 'onDismiss'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof BannerProps, 'sticky'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof BannerProps, 'placement'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof BannerProps, 'variant'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof BannerProps, 'size'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof BannerProps, 'render'>>().toEqualTypeOf<false>()
  })
})

describe('the design props and the schema cannot drift', () => {
  it('is derived from the schema input', () => {
    expectTypeOf<BannerDesignProps['tone']>().toEqualTypeOf<BannerTone | undefined>()
    expectTypeOf<keyof BannerDesignProps>().toEqualTypeOf<'tone'>()
  })

  it('is a subset of the component props, so every design prop is settable', () => {
    expectTypeOf<Accepts<keyof BannerProps, keyof BannerDesignProps>>().toEqualTypeOf<true>()
  })
})

describe('the schema', () => {
  it('fills the default from constants.ts', () => {
    expect(bannerSchema.parse({})).toEqual({ tone: BANNER_DEFAULTS.tone })
  })

  it('accepts every value the constants list', () => {
    for (const tone of BANNER_TONES) expect(bannerSchema.parse({ tone }).tone).toBe(tone)
  })

  it('refuses a value outside the list, which is what the docs table reads as the limit', () => {
    expect(bannerSchema.safeParse({ tone: 'brand' }).success).toBe(false)
  })
})
