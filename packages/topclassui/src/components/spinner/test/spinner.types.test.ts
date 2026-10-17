import { describe, expect, expectTypeOf, it } from 'vitest'

import type { Size } from '#shared/contracts/size.js'
import type { Labels } from '#shared/labels/types.js'
import { SPINNER_DEFAULTS, SPINNER_SIZES, SPINNER_TONES } from '../constants.js'
import { spinnerSchema } from '../schema.js'
import type { SpinnerDesignProps, SpinnerProps, SpinnerTone } from '../types.js'

/** Assignability as a value, so a rejected prop is a passing assertion. */
type Accepts<Union, Candidate> = Candidate extends Union ? true : false

describe('the unions come from the constants', () => {
  it('tone is the shared six, so every toned component offers the same set', () => {
    expectTypeOf<SpinnerTone>()
      .toEqualTypeOf<'primary' | 'neutral' | 'success' | 'warning' | 'danger' | 'info'>()
  })

  it('size is the shared scale including custom, not any CSS length as Svg takes', () => {
    expectTypeOf<SpinnerProps['size']>().toEqualTypeOf<Size | undefined>()
    expectTypeOf<Accepts<SpinnerProps['size'], 'custom'>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<SpinnerProps['size'], '2rem'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<SpinnerProps['size'], 24>>().toEqualTypeOf<false>()
  })

  it('rejects a value that is not in the list', () => {
    expectTypeOf<Accepts<SpinnerTone, 'brand'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<SpinnerProps['size'], 'xxl'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<SpinnerTone, string>>().toEqualTypeOf<false>()
  })
})

describe('the props follow the vocabulary', () => {
  it('accepts className, style and ref, and ref is a normal prop', () => {
    expectTypeOf<SpinnerProps['className']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<Accepts<keyof SpinnerProps, 'style'>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<keyof SpinnerProps, 'ref'>>().toEqualTypeOf<true>()
  })

  it('takes the labels of the whole library, not a group of them', () => {
    expectTypeOf<SpinnerProps['labels']>().toEqualTypeOf<Labels | undefined>()
  })

  it('takes locale beside labels, so the pair getLabels returns spreads onto it', () => {
    expectTypeOf<SpinnerProps['locale']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<Accepts<Pick<SpinnerProps, 'labels' | 'locale'>, { locale: string; labels: Labels }>>()
      .toEqualTypeOf<true>()
  })

  it('keeps the two attributes it reads, and the rest of the svg props', () => {
    expectTypeOf<Accepts<keyof SpinnerProps, 'aria-label'>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<keyof SpinnerProps, 'aria-hidden'>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<keyof SpinnerProps, 'id'>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<keyof SpinnerProps, 'aria-describedby'>>().toEqualTypeOf<true>()
  })

  it('takes none of the Svg props it decides itself', () => {
    expectTypeOf<Accepts<keyof SpinnerProps, 'icon'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof SpinnerProps, 'label'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof SpinnerProps, 'flipRtl'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof SpinnerProps, 'role'>>().toEqualTypeOf<false>()
  })

  it('has no children, no render and no variant', () => {
    expectTypeOf<Accepts<keyof SpinnerProps, 'children'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof SpinnerProps, 'render'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof SpinnerProps, 'variant'>>().toEqualTypeOf<false>()
  })

  it('has none of the props the spec leaves unbuilt', () => {
    expectTypeOf<Accepts<keyof SpinnerProps, 'centered'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof SpinnerProps, 'overlay'>>().toEqualTypeOf<false>()
  })
})

describe('the design props and the schema cannot drift', () => {
  it('is derived from the schema input', () => {
    expectTypeOf<SpinnerDesignProps['tone']>().toEqualTypeOf<SpinnerTone | undefined>()
    expectTypeOf<SpinnerDesignProps['size']>().toEqualTypeOf<Size | undefined>()
  })

  it('is a subset of the component props, so every design prop is settable', () => {
    expectTypeOf<Accepts<keyof SpinnerProps, keyof SpinnerDesignProps>>().toEqualTypeOf<true>()
  })
})

describe('the schema', () => {
  it('fills every default from constants.ts', () => {
    expect(spinnerSchema.parse({})).toEqual({
      size: SPINNER_DEFAULTS.size,
      tone: SPINNER_DEFAULTS.tone,
    })
  })

  it('accepts every value the constants list', () => {
    for (const tone of SPINNER_TONES) expect(spinnerSchema.parse({ tone }).tone).toBe(tone)
    for (const size of SPINNER_SIZES) expect(spinnerSchema.parse({ size }).size).toBe(size)
  })

  it('refuses a value outside the list, which is what the docs table reads as the limit', () => {
    expect(spinnerSchema.safeParse({ tone: 'brand' }).success).toBe(false)
    expect(spinnerSchema.safeParse({ size: 'xxl' }).success).toBe(false)
    expect(spinnerSchema.safeParse({ size: 24 }).success).toBe(false)
  })

  it('agrees with the defaults the spec names', () => {
    expect(SPINNER_DEFAULTS).toEqual({ size: 'md', tone: 'primary' })
  })
})
