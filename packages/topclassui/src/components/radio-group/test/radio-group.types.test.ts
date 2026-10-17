import type { Radio } from '@base-ui/react/radio'
import type { RadioGroup as Base } from '@base-ui/react/radio-group'
import type { CSSProperties, ReactNode, Ref } from 'react'
import { describe, expectTypeOf, it } from 'vitest'

// From the index, so a type it stops re-exporting fails here.
import type {
  RadioGroupDesignProps, RadioGroupItem, RadioGroupItemProps, RadioGroupName, RadioGroupOrientation, RadioGroupRoot,
  RadioGroupRootProps,
} from '../index.js'

/** Assignability as a value, so a rejected prop is a passing assertion. */
type Accepts<Union, Candidate> = Candidate extends Union ? true : false

type Sizes = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'custom'

describe('the value is a string, never Base UI\'s any', () => {
  it('value and defaultValue are strings', () => {
    expectTypeOf<RadioGroupRootProps['value']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<RadioGroupRootProps['defaultValue']>().toEqualTypeOf<string | undefined>()
  })

  it('onValueChange receives a string and Base UI\'s details', () => {
    type Handler = NonNullable<RadioGroupRootProps['onValueChange']>
    expectTypeOf<Parameters<Handler>[0]>().toEqualTypeOf<string>()
    expectTypeOf<Parameters<Handler>[1]>().toEqualTypeOf<Base.ChangeEventDetails>()
  })

  it('an item\'s value is a required string', () => {
    expectTypeOf<RadioGroupItemProps['value']>().toEqualTypeOf<string>()
    expectTypeOf<Accepts<RadioGroupItemProps, { children: string }>>().toEqualTypeOf<false>()
  })
})

describe('the props RadioGroup adds come from the schema', () => {
  it('are size, orientation and invalid, all optional, on the root', () => {
    expectTypeOf<keyof RadioGroupDesignProps>().toEqualTypeOf<'size' | 'orientation' | 'invalid'>()
    expectTypeOf<RadioGroupRootProps['size']>().toEqualTypeOf<Sizes | undefined>()
    expectTypeOf<RadioGroupRootProps['orientation']>().toEqualTypeOf<RadioGroupOrientation | undefined>()
    expectTypeOf<RadioGroupOrientation>().toEqualTypeOf<'vertical' | 'horizontal'>()
    expectTypeOf<RadioGroupRootProps['invalid']>().toEqualTypeOf<boolean | undefined>()
  })

  it('an item takes no size of its own: it reads its group\'s', () => {
    expectTypeOf<Extract<keyof RadioGroupItemProps, 'size' | 'invalid' | 'orientation'>>().toEqualTypeOf<never>()
  })

  it('has no tone, no variant and no items: one look is drawn, and the radios are children', () => {
    expectTypeOf<Extract<keyof RadioGroupRootProps, 'tone' | 'variant' | 'items' | 'loading'>>().toEqualTypeOf<never>()
  })
})

describe('the root and the item are ours', () => {
  it('className is a string on both, never the state function Base UI also takes', () => {
    expectTypeOf<RadioGroupRootProps['className']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<RadioGroupItemProps['className']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<Accepts<RadioGroupItemProps['className'], () => string>>().toEqualTypeOf<false>()
  })

  it('the item\'s style is a plain style object for its label', () => {
    expectTypeOf<RadioGroupItemProps['style']>().toEqualTypeOf<CSSProperties | undefined>()
  })

  it('the item is always a native button: nativeButton and render are not props', () => {
    expectTypeOf<Extract<keyof RadioGroupItemProps, 'nativeButton' | 'render'>>().toEqualTypeOf<never>()
  })

  it('ref is a normal prop: the group div, and the radio button', () => {
    expectTypeOf<RadioGroupRootProps['ref']>().toEqualTypeOf<Ref<HTMLDivElement> | undefined>()
    expectTypeOf<RadioGroupItemProps['ref']>().toEqualTypeOf<Ref<HTMLButtonElement> | undefined>()
  })

  it('children are the radios of a group and the text of an item', () => {
    expectTypeOf<Accepts<RadioGroupItemProps['children'], ReactNode>>().toEqualTypeOf<true>()
  })

  it('each part takes its props type as it is', () => {
    expectTypeOf<Parameters<typeof RadioGroupRoot>[0]>().toEqualTypeOf<RadioGroupRootProps>()
    expectTypeOf<Parameters<typeof RadioGroupItem>[0]>().toEqualTypeOf<RadioGroupItemProps>()
  })
})

describe('what Base UI gives passes through, untouched (R-5.7-5)', () => {
  it('the form props of the group are Base UI\'s', () => {
    expectTypeOf<RadioGroupRootProps['name']>().toEqualTypeOf<Base.Props['name']>()
    expectTypeOf<RadioGroupRootProps['form']>().toEqualTypeOf<Base.Props['form']>()
    expectTypeOf<RadioGroupRootProps['required']>().toEqualTypeOf<Base.Props['required']>()
    expectTypeOf<RadioGroupRootProps['inputRef']>().toEqualTypeOf<Base.Props['inputRef']>()
    expectTypeOf<RadioGroupRootProps['disabled']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<RadioGroupRootProps['readOnly']>().toEqualTypeOf<boolean | undefined>()
  })

  it('an item\'s disabled, readOnly and inputRef are Base UI\'s', () => {
    expectTypeOf<RadioGroupItemProps['disabled']>().toEqualTypeOf<Radio.Root.Props['disabled']>()
    expectTypeOf<RadioGroupItemProps['readOnly']>().toEqualTypeOf<Radio.Root.Props['readOnly']>()
    expectTypeOf<RadioGroupItemProps['inputRef']>().toEqualTypeOf<Radio.Root.Props['inputRef']>()
  })
})

describe('the name is the shared group name (R-5.6-1)', () => {
  it('is GroupName: an aria-label or an aria-labelledby, never an id alone', () => {
    expectTypeOf<Accepts<RadioGroupName, { 'aria-label': string }>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<RadioGroupName, { 'aria-labelledby': string }>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<RadioGroupName, { id: string }>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<RadioGroupName, { title: string }>>().toEqualTypeOf<false>()
  })
})
