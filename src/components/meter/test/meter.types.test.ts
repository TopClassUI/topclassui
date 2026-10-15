import { describe, expect, expectTypeOf, it } from 'vitest'

import type { Size } from '#shared/contracts/size.js'
import { METER_DEFAULTS, METER_SIZES, METER_TONES } from '../constants.js'
import { meterSchema } from '../schema.js'
import type { MeterDesignProps, MeterName, MeterProps, MeterTone } from '../types.js'

/** Assignability as a value, so a rejected prop is a passing assertion. */
type Accepts<Union, Candidate> = Candidate extends Union ? true : false

describe('the unions come from the constants', () => {
  it('tone is the shared six, so every toned component offers the same set', () => {
    expectTypeOf<MeterTone>()
      .toEqualTypeOf<'primary' | 'neutral' | 'success' | 'warning' | 'danger' | 'info'>()
  })

  it('size is the shared scale including custom', () => {
    expectTypeOf<MeterDesignProps['size']>().toEqualTypeOf<Size | undefined>()
    expectTypeOf<Accepts<MeterDesignProps['size'], 'custom'>>().toEqualTypeOf<true>()
  })

  it('value, min and max are numbers', () => {
    expectTypeOf<MeterDesignProps['value']>().toEqualTypeOf<number | undefined>()
    expectTypeOf<MeterDesignProps['min']>().toEqualTypeOf<number | undefined>()
    expectTypeOf<MeterDesignProps['max']>().toEqualTypeOf<number | undefined>()
  })

  it('rejects a value that is not in the list', () => {
    expectTypeOf<Accepts<MeterTone, 'brand'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<MeterDesignProps['size'], 'xxl'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<MeterDesignProps['value'], '50'>>().toEqualTypeOf<false>()
  })
})

describe('a name is required, one of two ways (R-5.6-1)', () => {
  it('accepts aria-label alone, aria-labelledby alone, or both', () => {
    expectTypeOf<Accepts<MeterProps, { 'aria-label': string }>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<MeterProps, { 'aria-labelledby': string }>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<MeterProps, { 'aria-label': string; 'aria-labelledby': string }>>().toEqualTypeOf<true>()
  })

  it('refuses neither', () => {
    expectTypeOf<Accepts<MeterProps, { value: number }>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<MeterName, object>>().toEqualTypeOf<false>()
  })
})

describe('the props follow the vocabulary', () => {
  it('accepts className, style and ref, and ref is a normal prop', () => {
    expectTypeOf<MeterProps['className']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<Accepts<keyof MeterProps, 'style'>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<keyof MeterProps, 'ref'>>().toEqualTypeOf<true>()
  })

  it('keeps the native div props and aria-valuetext, which passes through', () => {
    expectTypeOf<Accepts<keyof MeterProps, 'id'>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<keyof MeterProps, 'title'>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<keyof MeterProps, 'aria-valuetext'>>().toEqualTypeOf<true>()
  })

  it('takes none of what it writes itself', () => {
    expectTypeOf<Accepts<keyof MeterProps, 'children'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof MeterProps, 'dangerouslySetInnerHTML'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof MeterProps, 'role'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof MeterProps, 'aria-valuemin'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof MeterProps, 'aria-valuemax'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof MeterProps, 'aria-valuenow'>>().toEqualTypeOf<false>()
  })

  it('has none of the props the spec leaves unbuilt', () => {
    expectTypeOf<Accepts<keyof MeterProps, 'low'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof MeterProps, 'high'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof MeterProps, 'optimum'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof MeterProps, 'indeterminate'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof MeterProps, 'format'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof MeterProps, 'locale'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof MeterProps, 'labels'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof MeterProps, 'variant'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof MeterProps, 'render'>>().toEqualTypeOf<false>()
  })
})

describe('the design props and the schema cannot drift', () => {
  it('is a subset of the component props, so every design prop is settable', () => {
    expectTypeOf<Accepts<keyof MeterProps, keyof MeterDesignProps>>().toEqualTypeOf<true>()
  })

  it('fills every default with the value constants.ts holds', () => {
    expect(meterSchema.parse({})).toEqual({
      value: METER_DEFAULTS.value,
      min: METER_DEFAULTS.min,
      max: METER_DEFAULTS.max,
      tone: METER_DEFAULTS.tone,
      size: METER_DEFAULTS.size,
    })
  })

  it('accepts every value the constants list, and refuses one outside it', () => {
    for (const tone of METER_TONES) expect(meterSchema.parse({ tone }).tone).toBe(tone)
    for (const size of METER_SIZES) expect(meterSchema.parse({ size }).size).toBe(size)
    expect(meterSchema.safeParse({ tone: 'brand' }).success).toBe(false)
    expect(meterSchema.safeParse({ size: 'xxl' }).success).toBe(false)
  })

  it('agrees with the defaults the spec names', () => {
    expect(METER_DEFAULTS).toEqual({ value: 0, min: 0, max: 100, tone: 'primary', size: 'md' })
  })
})
