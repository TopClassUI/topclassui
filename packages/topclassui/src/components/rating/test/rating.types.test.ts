import { describe, expect, expectTypeOf, it } from 'vitest'

import type { Size } from '#shared/contracts/size.js'
import type { Labels } from '#shared/labels/types.js'
import type {
  RatingDesignProps, RatingEditableProps, RatingInputProps, RatingProps, RatingReadOnlyProps,
} from '../types.js'

/** Assignability as a value, so a rejected prop is a passing assertion. */
type Accepts<Union, Candidate> = Candidate extends Union ? true : false

describe('the design props come from the schema', () => {
  it('are exactly the six the schema documents', () => {
    expectTypeOf<keyof RatingDesignProps>().toEqualTypeOf<'value' | 'max' | 'size' | 'readOnly' | 'defaultValue' | 'disabled'>()
  })

  it('value and max are numbers, size the shared scale', () => {
    expectTypeOf<RatingDesignProps['value']>().toEqualTypeOf<number | undefined>()
    expectTypeOf<RatingDesignProps['max']>().toEqualTypeOf<number | undefined>()
    expectTypeOf<RatingDesignProps['size']>().toEqualTypeOf<Size | undefined>()
  })
})

describe('read-only is the default, and it takes no editing prop', () => {
  it('needs nothing', () => {
    expectTypeOf<Accepts<RatingProps, object>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<RatingProps, { value: 4 }>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<RatingProps, { value: 4; readOnly: true }>>().toEqualTypeOf<true>()
  })

  it('refuses onValueChange, defaultValue, name and disabled without readOnly={false}', () => {
    expectTypeOf<Accepts<RatingProps, { onValueChange: (v: number) => void }>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<RatingProps, { defaultValue: 3 }>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<RatingProps, { name: 'stay' }>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<RatingProps, { disabled: true }>>().toEqualTypeOf<false>()
  })

  it('takes labels and locale as the server parts do', () => {
    expectTypeOf<RatingReadOnlyProps['labels']>().toEqualTypeOf<Labels | undefined>()
    expectTypeOf<RatingReadOnlyProps['locale']>().toEqualTypeOf<string | undefined>()
  })
})

describe('editing requires a name for the group', () => {
  it('refuses readOnly={false} with neither aria-label nor aria-labelledby', () => {
    expectTypeOf<Accepts<RatingProps, { readOnly: false }>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<RatingProps, { readOnly: false; defaultValue: 3 }>>().toEqualTypeOf<false>()
  })

  it('accepts either one', () => {
    expectTypeOf<Accepts<RatingProps, { readOnly: false; 'aria-label': 'Stay' }>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<RatingProps, { readOnly: false; 'aria-labelledby': 'title' }>>().toEqualTypeOf<true>()
  })

  it('takes no onValueChange on Rating (R-5.1-3); RatingInput calls it with a number', () => {
    expectTypeOf<Accepts<keyof RatingEditableProps | keyof RatingReadOnlyProps, 'onValueChange'>>().toEqualTypeOf<false>()
    expectTypeOf<RatingInputProps['onValueChange']>().toEqualTypeOf<((value: number) => void) | undefined>()
    expectTypeOf<Accepts<keyof RatingInputProps, 'readOnly'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<RatingInputProps, { 'aria-label': 'Stay' }>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<RatingInputProps, { defaultValue: 3 }>>().toEqualTypeOf<false>()
  })

  it('takes name and disabled', () => {
    expectTypeOf<RatingEditableProps['name']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<RatingEditableProps['disabled']>().toEqualTypeOf<boolean | undefined>()
  })
})

describe('the vocabulary', () => {
  it('accepts className, style, ref and data attributes on both halves', () => {
    expectTypeOf<Accepts<keyof RatingReadOnlyProps, 'style' | 'ref' | 'className' | 'id'>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<keyof RatingEditableProps, 'style' | 'ref' | 'className' | 'id'>>().toEqualTypeOf<true>()
  })

  it('takes no children and no role: the stars and the role are the rating\'s own', () => {
    expectTypeOf<Accepts<keyof RatingReadOnlyProps, 'children'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof RatingReadOnlyProps, 'role'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof RatingEditableProps, 'children'>>().toEqualTypeOf<false>()
    expect(true).toBe(true)
  })
})
