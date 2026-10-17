import type { Switch as Base } from '@base-ui/react/switch'
import type { CSSProperties, Ref } from 'react'
import { describe, expectTypeOf, it } from 'vitest'

// From the index, so a type it stops re-exporting fails here.
import type { Switch, SwitchDesignProps, SwitchName, SwitchProps } from '../index.js'

/** Assignability as a value, so a rejected prop is a passing assertion. */
type Accepts<Union, Candidate> = Candidate extends Union ? true : false

type Sizes = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'custom'

describe('the state keeps Base UI\'s three names (choice 2)', () => {
  it('checked and defaultChecked are booleans', () => {
    expectTypeOf<SwitchProps['checked']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<SwitchProps['defaultChecked']>().toEqualTypeOf<boolean | undefined>()
  })

  it('onCheckedChange receives a boolean and Base UI\'s details', () => {
    type Handler = NonNullable<SwitchProps['onCheckedChange']>
    expectTypeOf<Parameters<Handler>[0]>().toEqualTypeOf<boolean>()
    expectTypeOf<Parameters<Handler>[1]>().toEqualTypeOf<Base.Root.ChangeEventDetails>()
  })

  it('value keeps its native meaning: the string the form receives when the switch is on', () => {
    expectTypeOf<SwitchProps['value']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<SwitchProps['uncheckedValue']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<Extract<keyof SwitchProps, 'onValueChange' | 'defaultValue'>>().toEqualTypeOf<never>()
  })
})

describe('the props Switch adds come from the schema', () => {
  it('are size and invalid, both optional', () => {
    expectTypeOf<keyof SwitchDesignProps>().toEqualTypeOf<'size' | 'invalid'>()
    expectTypeOf<SwitchProps['size']>().toEqualTypeOf<Sizes | undefined>()
    expectTypeOf<SwitchProps['invalid']>().toEqualTypeOf<boolean | undefined>()
  })

  it('has no tone and no variant: one look is drawn', () => {
    expectTypeOf<Extract<keyof SwitchProps, 'tone' | 'variant' | 'label' | 'loading'>>().toEqualTypeOf<never>()
  })
})

describe('the root is ours: a native button', () => {
  it('nativeButton and render are not props', () => {
    expectTypeOf<Extract<keyof SwitchProps, 'nativeButton' | 'render'>>().toEqualTypeOf<never>()
  })

  it('className is a string, never the state function Base UI also takes', () => {
    expectTypeOf<SwitchProps['className']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<Accepts<SwitchProps['className'], () => string>>().toEqualTypeOf<false>()
  })

  it('ref is a normal prop, of the button the root is', () => {
    expectTypeOf<SwitchProps['ref']>().toEqualTypeOf<Ref<HTMLButtonElement> | undefined>()
  })

  it('style takes a plain style object', () => {
    expectTypeOf<Accepts<SwitchProps['style'], CSSProperties>>().toEqualTypeOf<true>()
  })

  it('Switch takes its props type as it is', () => {
    expectTypeOf<Parameters<typeof Switch>[0]>().toEqualTypeOf<SwitchProps>()
  })
})

describe('what Base UI gives passes through, untouched (R-5.7-5)', () => {
  it('the form props and the hidden input are Base UI\'s', () => {
    expectTypeOf<SwitchProps['name']>().toEqualTypeOf<Base.Root.Props['name']>()
    expectTypeOf<SwitchProps['form']>().toEqualTypeOf<Base.Root.Props['form']>()
    expectTypeOf<SwitchProps['required']>().toEqualTypeOf<Base.Root.Props['required']>()
    expectTypeOf<SwitchProps['inputRef']>().toEqualTypeOf<Base.Root.Props['inputRef']>()
    expectTypeOf<SwitchProps['disabled']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<SwitchProps['readOnly']>().toEqualTypeOf<boolean | undefined>()
  })
})

describe('the name is the shared control name (R-5.6-1)', () => {
  it('is ControlName: an id, an aria-label or an aria-labelledby', () => {
    expectTypeOf<Accepts<SwitchName, { id: string }>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<SwitchName, { 'aria-label': string }>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<SwitchName, { 'aria-labelledby': string }>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<SwitchName, { title: string }>>().toEqualTypeOf<false>()
  })
})
