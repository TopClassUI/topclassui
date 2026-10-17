import type { Select as Base } from '@base-ui/react/select'
import type { Ref } from 'react'
import { describe, expectTypeOf, it } from 'vitest'

// From the index, so a type it stops re-exporting fails here.
import type { Select, SelectDesignProps, SelectName, SelectPlacement, SelectProps } from '../index.js'

/** Assignability as a value, so a rejected prop is a passing assertion. */
type Accepts<Union, Candidate> = Candidate extends Union ? true : false

type Sizes = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'custom'
type Item = { value: string, label: string, disabled?: boolean | undefined }

describe('the value is a string or null, never Base UI\'s any', () => {
  it('value and defaultValue are a string or null', () => {
    expectTypeOf<SelectProps['value']>().toEqualTypeOf<string | null | undefined>()
    expectTypeOf<SelectProps['defaultValue']>().toEqualTypeOf<string | null | undefined>()
  })

  it('onValueChange receives a string or null, and Base UI\'s details', () => {
    type Handler = NonNullable<SelectProps['onValueChange']>
    expectTypeOf<Parameters<Handler>[0]>().toEqualTypeOf<string | null>()
    expectTypeOf<Parameters<Handler>[1]>().toEqualTypeOf<Base.Root.ChangeEventDetails>()
  })

  it('items is required plain data: a value, a label and an optional disabled', () => {
    expectTypeOf<SelectProps['items']>().toEqualTypeOf<readonly Item[]>()
    expectTypeOf<Accepts<SelectProps, { 'aria-label': string }>>().toEqualTypeOf<false>()
  })
})

describe('the props Select adds come from the schema', () => {
  it('are size, invalid, fullWidth, placement and visibleRows, all optional', () => {
    expectTypeOf<keyof SelectDesignProps>().toEqualTypeOf<'size' | 'invalid' | 'fullWidth' | 'placement' | 'visibleRows'>()
    expectTypeOf<SelectProps['size']>().toEqualTypeOf<Sizes | undefined>()
    expectTypeOf<SelectProps['placement']>().toEqualTypeOf<SelectPlacement | undefined>()
    expectTypeOf<SelectProps['visibleRows']>().toEqualTypeOf<number | undefined>()
    expectTypeOf<SelectProps['invalid']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<SelectProps['fullWidth']>().toEqualTypeOf<boolean | undefined>()
  })

  it('the placeholder is text, and the container is the Portal\'s', () => {
    expectTypeOf<SelectProps['placeholder']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<SelectProps['container']>().toEqualTypeOf<Base.Portal.Props['container']>()
  })
})

describe('what is removed from the types', () => {
  it('multiple, the object helpers, children, and the trigger\'s type and render', () => {
    expectTypeOf<Extract<keyof SelectProps, 'multiple' | 'itemToStringLabel' | 'itemToStringValue' | 'isItemEqualToValue'>>().toEqualTypeOf<never>()
    expectTypeOf<Extract<keyof SelectProps, 'children' | 'type' | 'render' | 'nativeButton'>>().toEqualTypeOf<never>()
  })

  it('no tone, no variant and no getKey: one look is drawn and the options are data', () => {
    expectTypeOf<Extract<keyof SelectProps, 'tone' | 'variant' | 'getKey' | 'loading'>>().toEqualTypeOf<never>()
  })
})

describe('the trigger is ours', () => {
  it('className is a string, never the state function Base UI also takes', () => {
    expectTypeOf<SelectProps['className']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<Accepts<SelectProps['className'], () => string>>().toEqualTypeOf<false>()
  })

  it('ref is a normal prop, to the trigger button', () => {
    expectTypeOf<SelectProps['ref']>().toEqualTypeOf<Ref<HTMLButtonElement> | undefined>()
  })

  it('takes its props type as it is', () => {
    expectTypeOf<Parameters<typeof Select>[0]>().toEqualTypeOf<SelectProps>()
  })
})

describe('what Base UI gives passes through, untouched (R-5.7-5)', () => {
  it('the form props and the open state of the root are Base UI\'s', () => {
    type Root = Base.Root.Props<string>
    expectTypeOf<SelectProps['name']>().toEqualTypeOf<Root['name']>()
    expectTypeOf<SelectProps['form']>().toEqualTypeOf<Root['form']>()
    expectTypeOf<SelectProps['required']>().toEqualTypeOf<Root['required']>()
    expectTypeOf<SelectProps['inputRef']>().toEqualTypeOf<Root['inputRef']>()
    expectTypeOf<SelectProps['modal']>().toEqualTypeOf<Root['modal']>()
    expectTypeOf<SelectProps['onOpenChange']>().toEqualTypeOf<Root['onOpenChange']>()
    expectTypeOf<SelectProps['disabled']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<SelectProps['readOnly']>().toEqualTypeOf<boolean | undefined>()
  })
})

describe('the name is the shared control name (R-5.6-1)', () => {
  it('is ControlName: an id for a label, an aria-label or an aria-labelledby', () => {
    expectTypeOf<Accepts<SelectName, { id: string }>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<SelectName, { 'aria-label': string }>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<SelectName, { 'aria-labelledby': string }>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<SelectName, { title: string }>>().toEqualTypeOf<false>()
  })
})
