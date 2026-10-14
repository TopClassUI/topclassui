import type { NumberField as Base } from '@base-ui/react/number-field'
import type { CSSProperties, Ref } from 'react'
import { describe, expectTypeOf, it } from 'vitest'

// From the index, so a type it stops re-exporting fails here.
import type { NumberField, NumberFieldDesignProps, NumberFieldName, NumberFieldProps } from '../index.js'

/** Assignability as a value, so a rejected prop is a passing assertion. */
type Accepts<Union, Candidate> = Candidate extends Union ? true : false

type Sizes = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'custom'

describe('the value is Base UI\'s value, defaultValue and onValueChange', () => {
  it('value is a number or null, defaultValue a number', () => {
    expectTypeOf<NumberFieldProps['value']>().toEqualTypeOf<number | null | undefined>()
    expectTypeOf<NumberFieldProps['defaultValue']>().toEqualTypeOf<number | undefined>()
  })

  it('onValueChange receives a number or null and Base UI\'s details', () => {
    type Handler = NonNullable<NumberFieldProps['onValueChange']>
    expectTypeOf<Parameters<Handler>[0]>().toEqualTypeOf<number | null>()
    expectTypeOf<Parameters<Handler>[1]>().toEqualTypeOf<Base.Root.ChangeEventDetails>()
  })
})

describe('the props NumberField adds come from the schema', () => {
  it('are size, invalid, fullWidth, min, max and step, all optional', () => {
    expectTypeOf<keyof NumberFieldDesignProps>().toEqualTypeOf<'size' | 'invalid' | 'fullWidth' | 'min' | 'max' | 'step'>()
    expectTypeOf<NumberFieldProps['size']>().toEqualTypeOf<Sizes | undefined>()
    expectTypeOf<NumberFieldProps['fullWidth']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<NumberFieldProps['min']>().toEqualTypeOf<number | undefined>()
    expectTypeOf<NumberFieldProps['step']>().toEqualTypeOf<number | 'any' | undefined>()
  })

  it('a placeholder, and no tone, variant or suffix', () => {
    expectTypeOf<NumberFieldProps['placeholder']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<Extract<keyof NumberFieldProps, 'tone' | 'variant' | 'suffix'>>().toEqualTypeOf<never>()
  })
})

describe('the root is ours: a div that owns the width', () => {
  it('render is not a prop', () => {
    expectTypeOf<Extract<keyof NumberFieldProps, 'render'>>().toEqualTypeOf<never>()
  })

  it('className is a string, never the state function Base UI also takes', () => {
    expectTypeOf<NumberFieldProps['className']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<Accepts<NumberFieldProps['className'], () => string>>().toEqualTypeOf<false>()
  })

  it('ref is a normal prop, of the root div', () => {
    expectTypeOf<NumberFieldProps['ref']>().toEqualTypeOf<Ref<HTMLDivElement> | undefined>()
  })

  it('style takes a plain style object', () => {
    expectTypeOf<Accepts<NumberFieldProps['style'], CSSProperties>>().toEqualTypeOf<true>()
  })

  it('NumberField takes its props type as it is', () => {
    expectTypeOf<Parameters<typeof NumberField>[0]>().toEqualTypeOf<NumberFieldProps>()
  })
})

describe('what Base UI gives passes through, untouched (R-5.7-5)', () => {
  it('the form props, the hidden input, the locale and the format are Base UI\'s', () => {
    expectTypeOf<NumberFieldProps['name']>().toEqualTypeOf<Base.Root.Props['name']>()
    expectTypeOf<NumberFieldProps['form']>().toEqualTypeOf<Base.Root.Props['form']>()
    expectTypeOf<NumberFieldProps['required']>().toEqualTypeOf<Base.Root.Props['required']>()
    expectTypeOf<NumberFieldProps['inputRef']>().toEqualTypeOf<Base.Root.Props['inputRef']>()
    expectTypeOf<NumberFieldProps['locale']>().toEqualTypeOf<Base.Root.Props['locale']>()
    expectTypeOf<NumberFieldProps['format']>().toEqualTypeOf<Base.Root.Props['format']>()
    expectTypeOf<NumberFieldProps['allowOutOfRange']>().toEqualTypeOf<Base.Root.Props['allowOutOfRange']>()
    expectTypeOf<NumberFieldProps['largeStep']>().toEqualTypeOf<Base.Root.Props['largeStep']>()
  })
})

describe('the name is the shared control name (R-5.6-1)', () => {
  it('is ControlName: an id, an aria-label or an aria-labelledby', () => {
    expectTypeOf<Accepts<NumberFieldName, { id: string }>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<NumberFieldName, { 'aria-label': string }>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<NumberFieldName, { 'aria-labelledby': string }>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<NumberFieldName, { title: string }>>().toEqualTypeOf<false>()
  })
})
