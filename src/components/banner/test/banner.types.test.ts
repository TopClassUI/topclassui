import type { ReactNode } from 'react'
import { describe, expect, expectTypeOf, it } from 'vitest'

import { BANNER_DEFAULTS, BANNER_TONES } from '../constants.js'
import { bannerSchema } from '../schema.js'
import type { BannerDesignProps, BannerDismissal, BannerName, BannerProps, BannerTone } from '../types.js'

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

  it('gets the name and the id rule back from BannerName and BannerDismissal, the form the README gives', () => {
    expectTypeOf<Accepts<BannerProps, Omit<BannerProps, 'tone'> & BannerName>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<BannerProps, Omit<BannerProps, 'tone'> & BannerName & BannerDismissal>>().toEqualTypeOf<true>()
  })

  it('or drops both names and passes its own', () => {
    type Titled = Omit<BannerProps, 'aria-label' | 'aria-labelledby'> & { 'aria-label': string } & BannerDismissal
    expectTypeOf<Accepts<BannerProps, Titled>>().toEqualTypeOf<true>()
  })
})

describe('dismissal (the client half)', () => {
  type Named = { 'aria-label': string }

  it('requires an id with dismissible, since the dismissal is remembered by it', () => {
    expectTypeOf<Accepts<BannerProps, Named & { dismissible: true }>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<BannerProps, Named & { dismissible: true; id: string }>>().toEqualTypeOf<true>()
  })

  it('takes a boolean decided at runtime with an id, and refuses it without one', () => {
    expectTypeOf<Accepts<BannerProps, Named & { dismissible: boolean; id: string }>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<BannerProps, Named & { dismissible: boolean }>>().toEqualTypeOf<false>()
  })

  it('takes onDismiss only with dismissible, where it has an x to answer', () => {
    expectTypeOf<Accepts<BannerProps, Named & { onDismiss: () => void }>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<BannerProps, Named & { id: string; onDismiss: () => void }>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<BannerProps, Named & { dismissible: true; id: string; onDismiss: () => void }>>().toEqualTypeOf<true>()
  })

  it('leaves dismissible off and the id optional on a plain banner', () => {
    expectTypeOf<Accepts<BannerProps, Named & { dismissible: false }>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<BannerProps, Named & { id: string }>>().toEqualTypeOf<true>()
  })

  it('takes a callback of no argument that returns nothing', () => {
    expectTypeOf<Extract<BannerProps, { dismissible: boolean }>['onDismiss']>().toEqualTypeOf<(() => void) | undefined>()
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
    expectTypeOf<BannerDesignProps['dismissible']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<keyof BannerDesignProps>().toEqualTypeOf<'tone' | 'dismissible'>()
  })

  it('is a subset of the component props, so every design prop is settable', () => {
    expectTypeOf<Accepts<keyof BannerProps, keyof BannerDesignProps>>().toEqualTypeOf<true>()
  })
})

describe('the schema', () => {
  it('fills the default from constants.ts', () => {
    expect(bannerSchema.parse({})).toEqual({ tone: BANNER_DEFAULTS.tone, dismissible: BANNER_DEFAULTS.dismissible })
  })

  it('accepts every value the constants list', () => {
    for (const tone of BANNER_TONES) expect(bannerSchema.parse({ tone }).tone).toBe(tone)
  })

  it('refuses a value outside the list, which is what the docs table reads as the limit', () => {
    expect(bannerSchema.safeParse({ tone: 'brand' }).success).toBe(false)
  })
})
