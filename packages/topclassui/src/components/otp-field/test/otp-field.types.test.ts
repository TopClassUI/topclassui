import type { OTPField as Base } from '@base-ui/react/otp-field'
import type { Ref } from 'react'
import { describe, expectTypeOf, it } from 'vitest'

// From the index, so a type it stops re-exporting fails here.
import type {
  OTPField, OTPFieldProps, OtpFieldDesignProps, OtpFieldName, OtpFieldProps, OtpFieldValidationType,
} from '../index.js'

/** Assignability as a value, so a rejected prop is a passing assertion. */
type Accepts<Union, Candidate> = Candidate extends Union ? true : false

type Sizes = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'custom'

describe('the value is a string', () => {
  it('value and defaultValue are strings, and the handler reads a string and Base UI\'s details', () => {
    expectTypeOf<OtpFieldProps['value']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<OtpFieldProps['defaultValue']>().toEqualTypeOf<string | undefined>()
    type Handler = NonNullable<OtpFieldProps['onValueChange']>
    expectTypeOf<Parameters<Handler>[0]>().toEqualTypeOf<string>()
    expectTypeOf<Parameters<Handler>[1]>().toEqualTypeOf<Base.Root.ChangeEventDetails>()
  })
})

describe('the props OTPField adds come from the schema', () => {
  it('are length, size, invalid and groupSize, all optional', () => {
    expectTypeOf<keyof OtpFieldDesignProps>().toEqualTypeOf<'length' | 'size' | 'invalid' | 'groupSize'>()
    expectTypeOf<OtpFieldProps['length']>().toEqualTypeOf<number | undefined>()
    expectTypeOf<OtpFieldProps['groupSize']>().toEqualTypeOf<number | undefined>()
    expectTypeOf<OtpFieldProps['size']>().toEqualTypeOf<Sizes | undefined>()
    expectTypeOf<OtpFieldProps['invalid']>().toEqualTypeOf<boolean | undefined>()
  })

  it('has no tone, no variant and no children: the cells are ours', () => {
    expectTypeOf<Extract<keyof OtpFieldProps, 'tone' | 'variant' | 'loading'>>().toEqualTypeOf<never>()
  })

  it('the export name and the README name are one type (choice 24)', () => {
    expectTypeOf<OTPFieldProps>().toEqualTypeOf<OtpFieldProps>()
    expectTypeOf<Parameters<typeof OTPField>[0]>().toEqualTypeOf<OtpFieldProps>()
  })
})

describe('the group and its cells', () => {
  it('className is a string, never the state function Base UI also takes', () => {
    expectTypeOf<OtpFieldProps['className']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<Accepts<OtpFieldProps['className'], () => string>>().toEqualTypeOf<false>()
  })

  it('ref is a normal prop: the group div', () => {
    expectTypeOf<OtpFieldProps['ref']>().toEqualTypeOf<Ref<HTMLDivElement> | undefined>()
  })
})

describe('what Base UI gives passes through, untouched (R-5.7-5)', () => {
  it('the form props, the completion and the masking are Base UI\'s', () => {
    expectTypeOf<OtpFieldProps['name']>().toEqualTypeOf<Base.Root.Props['name']>()
    expectTypeOf<OtpFieldProps['form']>().toEqualTypeOf<Base.Root.Props['form']>()
    expectTypeOf<OtpFieldProps['required']>().toEqualTypeOf<Base.Root.Props['required']>()
    expectTypeOf<OtpFieldProps['disabled']>().toEqualTypeOf<Base.Root.Props['disabled']>()
    expectTypeOf<OtpFieldProps['readOnly']>().toEqualTypeOf<Base.Root.Props['readOnly']>()
    expectTypeOf<OtpFieldProps['autoSubmit']>().toEqualTypeOf<Base.Root.Props['autoSubmit']>()
    expectTypeOf<OtpFieldProps['mask']>().toEqualTypeOf<Base.Root.Props['mask']>()
    expectTypeOf<OtpFieldProps['onValueComplete']>().toEqualTypeOf<Base.Root.Props['onValueComplete']>()
    expectTypeOf<OtpFieldProps['onValueInvalid']>().toEqualTypeOf<Base.Root.Props['onValueInvalid']>()
    expectTypeOf<OtpFieldProps['normalizeValue']>().toEqualTypeOf<Base.Root.Props['normalizeValue']>()
  })

  it('the validation types are Base UI\'s four', () => {
    expectTypeOf<OtpFieldValidationType>().toEqualTypeOf<'numeric' | 'alpha' | 'alphanumeric' | 'none'>()
  })
})

describe('the name (R-5.6-1)', () => {
  it('is an id or an aria-labelledby, never an aria-label', () => {
    expectTypeOf<Accepts<OtpFieldName, { id: string }>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<OtpFieldName, { 'aria-labelledby': string }>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<OtpFieldName, { 'aria-label': string }>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<OtpFieldName, { id: string, 'aria-label': string }>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<OtpFieldName, { title: string }>>().toEqualTypeOf<false>()
  })
})
