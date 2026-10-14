import type { Checkbox as Base } from '@base-ui/react/checkbox'
import type { CSSProperties, Ref } from 'react'
import { describe, expectTypeOf, it } from 'vitest'

// From the index, so a type it stops re-exporting fails here.
import type { Checkbox, CheckboxDesignProps, CheckboxName, CheckboxProps } from '../index.js'

/** Assignability as a value, so a rejected prop is a passing assertion. */
type Accepts<Union, Candidate> = Candidate extends Union ? true : false

type Sizes = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'custom'

describe('the state keeps Base UI\'s three names (choice 2)', () => {
  it('checked, defaultChecked and indeterminate are booleans', () => {
    expectTypeOf<CheckboxProps['checked']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<CheckboxProps['defaultChecked']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<CheckboxProps['indeterminate']>().toEqualTypeOf<boolean | undefined>()
  })

  it('onCheckedChange receives a boolean and Base UI\'s details', () => {
    type Handler = NonNullable<CheckboxProps['onCheckedChange']>
    expectTypeOf<Parameters<Handler>[0]>().toEqualTypeOf<boolean>()
    expectTypeOf<Parameters<Handler>[1]>().toEqualTypeOf<Base.Root.ChangeEventDetails>()
  })

  it('value keeps its native meaning: the string the form receives when the box is ticked', () => {
    expectTypeOf<CheckboxProps['value']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<CheckboxProps['uncheckedValue']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<Extract<keyof CheckboxProps, 'onValueChange' | 'defaultValue'>>().toEqualTypeOf<never>()
  })
})

describe('the props Checkbox adds come from the schema', () => {
  it('are size and invalid, both optional', () => {
    expectTypeOf<keyof CheckboxDesignProps>().toEqualTypeOf<'size' | 'invalid'>()
    expectTypeOf<CheckboxProps['size']>().toEqualTypeOf<Sizes | undefined>()
    expectTypeOf<CheckboxProps['invalid']>().toEqualTypeOf<boolean | undefined>()
  })

  it('has no tone and no variant: one look is drawn', () => {
    expectTypeOf<Extract<keyof CheckboxProps, 'tone' | 'variant' | 'label' | 'loading'>>().toEqualTypeOf<never>()
  })
})

describe('the root is ours: a native button', () => {
  it('nativeButton and render are not props', () => {
    expectTypeOf<Extract<keyof CheckboxProps, 'nativeButton' | 'render'>>().toEqualTypeOf<never>()
  })

  it('className is a string, never the state function Base UI also takes', () => {
    expectTypeOf<CheckboxProps['className']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<Accepts<CheckboxProps['className'], () => string>>().toEqualTypeOf<false>()
  })

  it('ref is a normal prop, of the button the root is', () => {
    expectTypeOf<CheckboxProps['ref']>().toEqualTypeOf<Ref<HTMLButtonElement> | undefined>()
  })

  it('style takes a plain style object', () => {
    expectTypeOf<Accepts<CheckboxProps['style'], CSSProperties>>().toEqualTypeOf<true>()
  })

  it('Checkbox takes its props type as it is', () => {
    expectTypeOf<Parameters<typeof Checkbox>[0]>().toEqualTypeOf<CheckboxProps>()
  })
})

describe('what Base UI gives passes through, untouched (R-5.7-5)', () => {
  it('the form props, parent and the hidden input are Base UI\'s', () => {
    expectTypeOf<CheckboxProps['name']>().toEqualTypeOf<Base.Root.Props['name']>()
    expectTypeOf<CheckboxProps['form']>().toEqualTypeOf<Base.Root.Props['form']>()
    expectTypeOf<CheckboxProps['required']>().toEqualTypeOf<Base.Root.Props['required']>()
    expectTypeOf<CheckboxProps['inputRef']>().toEqualTypeOf<Base.Root.Props['inputRef']>()
    expectTypeOf<CheckboxProps['parent']>().toEqualTypeOf<Base.Root.Props['parent']>()
    expectTypeOf<CheckboxProps['disabled']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<CheckboxProps['readOnly']>().toEqualTypeOf<boolean | undefined>()
  })
})

describe('the name is the shared control name (R-5.6-1)', () => {
  it('is ControlName: an id, an aria-label or an aria-labelledby', () => {
    expectTypeOf<Accepts<CheckboxName, { id: string }>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<CheckboxName, { 'aria-label': string }>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<CheckboxName, { 'aria-labelledby': string }>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<CheckboxName, { title: string }>>().toEqualTypeOf<false>()
  })
})
