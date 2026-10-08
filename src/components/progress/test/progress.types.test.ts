import { describe, expect, expectTypeOf, it } from 'vitest'

import type { Size } from '#shared/contracts/size.js'
import { PROGRESS_DEFAULTS, PROGRESS_SIZES, PROGRESS_TONES } from '../constants.js'
import { progressSchema } from '../schema.js'
import type { ProgressDesignProps, ProgressName, ProgressProps, ProgressTone } from '../types.js'

/** Assignability as a value, so a rejected prop is a passing assertion. */
type Accepts<Union, Candidate> = Candidate extends Union ? true : false

describe('the unions come from the constants', () => {
  it('tone is the shared six, so every toned component offers the same set', () => {
    expectTypeOf<ProgressTone>()
      .toEqualTypeOf<'primary' | 'neutral' | 'success' | 'warning' | 'danger' | 'info'>()
  })

  it('size is the shared scale including custom', () => {
    expectTypeOf<ProgressDesignProps['size']>().toEqualTypeOf<Size | undefined>()
    expectTypeOf<Accepts<ProgressDesignProps['size'], 'custom'>>().toEqualTypeOf<true>()
  })

  it('value is a number and indeterminate a boolean', () => {
    expectTypeOf<ProgressDesignProps['value']>().toEqualTypeOf<number | undefined>()
    expectTypeOf<ProgressDesignProps['indeterminate']>().toEqualTypeOf<boolean | undefined>()
  })

  it('rejects a value that is not in the list', () => {
    expectTypeOf<Accepts<ProgressTone, 'brand'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<ProgressDesignProps['size'], 'xxl'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<ProgressDesignProps['value'], '50'>>().toEqualTypeOf<false>()
  })
})

describe('a name is required, one of two ways (R-5.6-1)', () => {
  it('accepts aria-label alone, aria-labelledby alone, or both', () => {
    expectTypeOf<Accepts<ProgressProps, { 'aria-label': string }>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<ProgressProps, { 'aria-labelledby': string }>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<ProgressProps, { 'aria-label': string; 'aria-labelledby': string }>>().toEqualTypeOf<true>()
  })

  it('refuses neither', () => {
    expectTypeOf<Accepts<ProgressProps, { value: number }>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<ProgressName, object>>().toEqualTypeOf<false>()
  })
})

describe('the props follow the vocabulary', () => {
  it('accepts className, style and ref, and ref is a normal prop', () => {
    expectTypeOf<ProgressProps['className']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<Accepts<keyof ProgressProps, 'style'>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<keyof ProgressProps, 'ref'>>().toEqualTypeOf<true>()
  })

  it('keeps the native div props, so id and title still pass through', () => {
    expectTypeOf<Accepts<keyof ProgressProps, 'id'>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<keyof ProgressProps, 'title'>>().toEqualTypeOf<true>()
  })

  it('takes none of what it writes itself', () => {
    expectTypeOf<Accepts<keyof ProgressProps, 'children'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof ProgressProps, 'dangerouslySetInnerHTML'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof ProgressProps, 'role'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof ProgressProps, 'aria-valuemin'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof ProgressProps, 'aria-valuemax'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof ProgressProps, 'aria-valuenow'>>().toEqualTypeOf<false>()
  })

  it('has none of the props the spec leaves unbuilt', () => {
    expectTypeOf<Accepts<keyof ProgressProps, 'min'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof ProgressProps, 'max'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof ProgressProps, 'showLabel'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof ProgressProps, 'variant'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof ProgressProps, 'render'>>().toEqualTypeOf<false>()
  })
})

describe('the design props and the schema cannot drift', () => {
  it('is a subset of the component props, so every design prop is settable', () => {
    expectTypeOf<Accepts<keyof ProgressProps, keyof ProgressDesignProps>>().toEqualTypeOf<true>()
  })

  it('fills every default with the value constants.ts holds', () => {
    expect(progressSchema.parse({})).toEqual({
      value: PROGRESS_DEFAULTS.value,
      tone: PROGRESS_DEFAULTS.tone,
      size: PROGRESS_DEFAULTS.size,
      indeterminate: PROGRESS_DEFAULTS.indeterminate,
    })
  })

  it('accepts every value the constants list', () => {
    for (const tone of PROGRESS_TONES) expect(progressSchema.parse({ tone }).tone).toBe(tone)
    for (const size of PROGRESS_SIZES) expect(progressSchema.parse({ size }).size).toBe(size)
  })

  it('refuses a value outside the list', () => {
    expect(progressSchema.safeParse({ tone: 'brand' }).success).toBe(false)
    expect(progressSchema.safeParse({ size: 'xxl' }).success).toBe(false)
  })

  it('agrees with the defaults the spec names', () => {
    expect(PROGRESS_DEFAULTS).toEqual({ value: 0, tone: 'primary', size: 'md', indeterminate: false })
  })
})
