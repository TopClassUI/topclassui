import { describe, expectTypeOf, it } from 'vitest'

import type { Size } from '#shared/contracts/size.js'
import type {
  InputDesignProps, InputName, InputProps, InputSkeletonProps, InputVariantProps,
} from '../types.js'

/** Assignability as a value, so a rejected prop is a passing assertion. */
type Accepts<Union, Candidate> = Candidate extends Union ? true : false

describe('the design props', () => {
  it('size is the shared scale including custom', () => {
    expectTypeOf<InputDesignProps['size']>().toEqualTypeOf<Size | undefined>()
    expectTypeOf<Accepts<InputDesignProps['size'], 'custom'>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<InputDesignProps['size'], 'xxl'>>().toEqualTypeOf<false>()
  })

  it('size is never the native character width', () => {
    expectTypeOf<Accepts<InputProps['size'], number>>().toEqualTypeOf<false>()
  })

  it('invalid and fullWidth are positive booleans', () => {
    expectTypeOf<InputDesignProps['invalid']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<InputDesignProps['fullWidth']>().toEqualTypeOf<boolean | undefined>()
  })

  it('is a subset of the component props, so every design prop is settable', () => {
    expectTypeOf<Accepts<keyof InputProps, keyof InputDesignProps>>().toEqualTypeOf<true>()
  })

  it('gives inputVariants the two props that change the look', () => {
    expectTypeOf<keyof InputVariantProps>().toEqualTypeOf<'size' | 'fullWidth' | 'className' | 'class'>()
  })
})

describe('a name is required, one of three ways (R-5.6-1)', () => {
  it('accepts id alone, aria-label alone or aria-labelledby alone', () => {
    expectTypeOf<Accepts<InputProps, { id: string }>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<InputProps, { 'aria-label': string }>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<InputProps, { 'aria-labelledby': string }>>().toEqualTypeOf<true>()
  })

  it('accepts them together', () => {
    expectTypeOf<Accepts<InputProps, { id: string; 'aria-label': string; 'aria-labelledby': string }>>()
      .toEqualTypeOf<true>()
  })

  it('refuses none of the three', () => {
    expectTypeOf<Accepts<InputProps, { type: 'email' }>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<InputName, object>>().toEqualTypeOf<false>()
  })

  it('refuses a name that is explicitly undefined', () => {
    expectTypeOf<Accepts<InputName, { id: undefined }>>().toEqualTypeOf<false>()
  })
})

describe('the props follow the vocabulary', () => {
  it('maxLength is a number, or null to remove the cap', () => {
    expectTypeOf<InputProps['maxLength']>().toEqualTypeOf<number | null | undefined>()
  })

  it('accepts className, style and ref, and ref is a normal prop', () => {
    expectTypeOf<InputProps['className']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<Accepts<keyof InputProps, 'style'>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<keyof InputProps, 'ref'>>().toEqualTypeOf<true>()
  })

  it('keeps the native input props, type included', () => {
    type Native = 'type' | 'name' | 'value' | 'defaultValue' | 'placeholder' | 'required' | 'readOnly'
      | 'disabled' | 'autoComplete' | 'min' | 'max' | 'step' | 'onChange'
    expectTypeOf<Exclude<Native, keyof InputProps>>().toEqualTypeOf<never>()
  })

  it('takes no content: an input is a void element', () => {
    expectTypeOf<Accepts<keyof InputProps, 'children'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof InputProps, 'dangerouslySetInnerHTML'>>().toEqualTypeOf<false>()
  })

  it('has none of the props the spec leaves unbuilt', () => {
    expectTypeOf<Accepts<keyof InputProps, 'variant'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof InputProps, 'tone'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof InputProps, 'render'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof InputProps, 'label'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof InputProps, 'hint'>>().toEqualTypeOf<false>()
  })
})

describe('the skeleton', () => {
  it('takes the size of the control and no name, since it is hidden', () => {
    expectTypeOf<InputSkeletonProps['size']>().toEqualTypeOf<Size | undefined>()
    expectTypeOf<Accepts<InputSkeletonProps, object>>().toEqualTypeOf<true>()
  })

  it('takes no content, no aria-hidden and no fullWidth: it is always full width', () => {
    expectTypeOf<Accepts<keyof InputSkeletonProps, 'children'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof InputSkeletonProps, 'aria-hidden'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof InputSkeletonProps, 'fullWidth'>>().toEqualTypeOf<false>()
  })
})
