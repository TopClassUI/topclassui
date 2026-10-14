import type { Slider as Base } from '@base-ui/react/slider'
import type { Ref } from 'react'
import { describe, expectTypeOf, it } from 'vitest'

// From the index, so a type it stops re-exporting fails here.
import type { Slider, SliderDesignProps, SliderName, SliderProps, SliderValue } from '../index.js'

/** Assignability as a value, so a rejected prop is a passing assertion. */
type Accepts<Union, Candidate> = Candidate extends Union ? true : false

type Sizes = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'custom'
type Pair = readonly [number, number]

describe('one thumb or two, pinned by the type argument', () => {
  it('a slider is a number unless told otherwise', () => {
    expectTypeOf<SliderProps['value']>().toEqualTypeOf<number | undefined>()
    expectTypeOf<SliderProps['defaultValue']>().toEqualTypeOf<number | undefined>()
  })

  it('onValueChange hands a number to one thumb and a pair to a range, with Base UI\'s details', () => {
    type One = NonNullable<SliderProps['onValueChange']>
    type Two = NonNullable<SliderProps<Pair>['onValueChange']>
    expectTypeOf<Parameters<One>[0]>().toEqualTypeOf<number>()
    expectTypeOf<Parameters<Two>[0]>().toEqualTypeOf<Pair>()
    expectTypeOf<Parameters<One>[1]>().toEqualTypeOf<Base.Root.ChangeEventDetails>()
  })

  it('a value is a number or a pair, never a longer array', () => {
    expectTypeOf<SliderValue>().toEqualTypeOf<number | Pair>()
    expectTypeOf<Accepts<SliderValue, readonly [number, number, number]>>().toEqualTypeOf<false>()
  })

  it('the function is generic over the same value', () => {
    expectTypeOf<Parameters<typeof Slider<Pair>>[0]>().toEqualTypeOf<SliderProps<Pair>>()
    expectTypeOf<Parameters<typeof Slider>[0]>().toEqualTypeOf<SliderProps<SliderValue>>()
  })
})

describe('the props Slider adds come from the schema', () => {
  it('are size, invalid, fullWidth, showValue, min, max and step, all optional', () => {
    expectTypeOf<keyof SliderDesignProps>().toEqualTypeOf<'size' | 'invalid' | 'fullWidth' | 'showValue' | 'min' | 'max' | 'step'>()
    expectTypeOf<SliderProps['size']>().toEqualTypeOf<Sizes | undefined>()
    expectTypeOf<SliderProps['showValue']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<SliderProps['step']>().toEqualTypeOf<number | undefined>()
  })

  it('has no tone, no variant and no thumbAlignment, and Base UI has no readOnly', () => {
    expectTypeOf<Extract<keyof SliderProps, 'tone' | 'variant' | 'thumbAlignment' | 'readOnly'>>().toEqualTypeOf<never>()
  })

  it('takes required, so a Field can spread its object, as a boolean', () => {
    expectTypeOf<SliderProps['required']>().toEqualTypeOf<boolean | undefined>()
  })
})

describe('the root is ours', () => {
  it('className is a string, never the state function Base UI also takes', () => {
    expectTypeOf<SliderProps['className']>().toEqualTypeOf<string | undefined>()
  })

  it('ref is a normal prop: the group div', () => {
    expectTypeOf<SliderProps['ref']>().toEqualTypeOf<Ref<HTMLDivElement> | undefined>()
  })
})

describe('what Base UI gives passes through, untouched (R-5.7-5)', () => {
  it('the form props, the large step, the orientation, the format and the commit handler', () => {
    expectTypeOf<SliderProps['name']>().toEqualTypeOf<Base.Root.Props['name']>()
    expectTypeOf<SliderProps['form']>().toEqualTypeOf<Base.Root.Props['form']>()
    expectTypeOf<SliderProps['disabled']>().toEqualTypeOf<Base.Root.Props['disabled']>()
    expectTypeOf<SliderProps['largeStep']>().toEqualTypeOf<Base.Root.Props['largeStep']>()
    expectTypeOf<SliderProps['orientation']>().toEqualTypeOf<Base.Root.Props['orientation']>()
    expectTypeOf<SliderProps['format']>().toEqualTypeOf<Base.Root.Props['format']>()
    expectTypeOf<SliderProps['locale']>().toEqualTypeOf<Base.Root.Props['locale']>()
    expectTypeOf<SliderProps['minStepsBetweenValues']>().toEqualTypeOf<Base.Root.Props['minStepsBetweenValues']>()
    expectTypeOf<SliderProps['thumbCollisionBehavior']>().toEqualTypeOf<Base.Root.Props['thumbCollisionBehavior']>()
    expectTypeOf<Parameters<NonNullable<SliderProps<Pair>['onValueCommitted']>>[0]>().toEqualTypeOf<Pair>()
  })
})

describe('the name is the shared group name (R-5.6-1)', () => {
  it('is GroupName: an aria-label or an aria-labelledby, never an id alone', () => {
    expectTypeOf<Accepts<SliderName, { 'aria-label': string }>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<SliderName, { 'aria-labelledby': string }>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<SliderName, { id: string }>>().toEqualTypeOf<false>()
  })
})
