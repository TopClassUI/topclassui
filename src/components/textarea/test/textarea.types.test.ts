import { describe, expectTypeOf, it } from 'vitest'

import type { Size } from '#shared/contracts/size.js'
import type {
  TextareaDesignProps, TextareaFieldProps, TextareaName, TextareaProps, TextareaSkeletonProps,
} from '../types.js'

/** Assignability as a value, so a rejected prop is a passing assertion. */
type Accepts<Union, Candidate> = Candidate extends Union ? true : false

describe('the design props', () => {
  it('are the eight the schema holds besides the cap', () => {
    expectTypeOf<keyof TextareaDesignProps>().toEqualTypeOf<'size' | 'invalid' | 'fullWidth' | 'rows' | 'maxRows' | 'autosize' | 'showCount' | 'validate'>()
  })

  it('size is the shared scale including custom', () => {
    expectTypeOf<TextareaDesignProps['size']>().toEqualTypeOf<Size | undefined>()
  })

  it('rows and maxRows are numbers; the four switches are booleans', () => {
    expectTypeOf<TextareaProps['rows']>().toEqualTypeOf<number | undefined>()
    expectTypeOf<TextareaProps['maxRows']>().toEqualTypeOf<number | undefined>()
    expectTypeOf<TextareaProps['autosize']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<TextareaProps['showCount']>().toEqualTypeOf<boolean | undefined>()
  })

  it('the cap takes a number, null for none, or nothing for the default', () => {
    expectTypeOf<TextareaProps['maxLength']>().toEqualTypeOf<number | null | undefined>()
  })
})

describe('a name is required, one of three ways (R-5.6-1)', () => {
  it('accepts id alone, aria-label alone or aria-labelledby alone', () => {
    expectTypeOf<Accepts<TextareaProps, { id: string }>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<TextareaProps, { 'aria-label': string }>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<TextareaProps, { 'aria-labelledby': string }>>().toEqualTypeOf<true>()
  })

  it('refuses none of the three', () => {
    expectTypeOf<Accepts<TextareaProps, { name: 'bio' }>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<TextareaName, object>>().toEqualTypeOf<false>()
  })
})

describe('the skeleton and the holder', () => {
  it('the skeleton takes the size, the width and the rows of its field, and no children', () => {
    expectTypeOf<Accepts<keyof TextareaSkeletonProps, 'size' | 'fullWidth' | 'rows'>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<keyof TextareaSkeletonProps, 'children'>>().toEqualTypeOf<false>()
  })

  it('the holder takes only values a Server Component can send, and one element', () => {
    expectTypeOf<TextareaFieldProps['cap']>().toEqualTypeOf<number | null>()
    expectTypeOf<keyof TextareaFieldProps>().toEqualTypeOf<
      'size' | 'fullWidth' | 'rows' | 'maxRows' | 'autosize' | 'showCount' | 'cap' | 'counterId' | 'length' | 'children'
    >()
  })
})
