import type { Radio } from '@base-ui/react/radio'
import type { RadioGroup as Base } from '@base-ui/react/radio-group'
import type { CSSProperties, ReactNode, Ref } from 'react'
import { describe, expectTypeOf, it } from 'vitest'

// From the index, so a type it stops re-exporting fails here.
import type {
  SegmentedControlDesignProps, SegmentedControlItem, SegmentedControlItemProps, SegmentedControlName, SegmentedControlRoot,
  SegmentedControlRootProps, SegmentedControlSelection,
} from '../index.js'

/** Assignability as a value, so a rejected prop is a passing assertion. */
type Accepts<Union, Candidate> = Candidate extends Union ? true : false

type Sizes = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'custom'

describe('the value is a string, never Base UI\'s any, and one is always given', () => {
  it('value and defaultValue are strings', () => {
    expectTypeOf<SegmentedControlRootProps['value']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<SegmentedControlRootProps['defaultValue']>().toEqualTypeOf<string | undefined>()
  })

  it('a selection is value, defaultValue or both, never neither', () => {
    expectTypeOf<Accepts<SegmentedControlSelection, { value: string }>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<SegmentedControlSelection, { defaultValue: string }>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<SegmentedControlSelection, { value: string, defaultValue: string }>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<SegmentedControlSelection, { name: string }>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<SegmentedControlRootProps, { 'aria-label': string }>>().toEqualTypeOf<false>()
  })

  it('onValueChange receives a string and Base UI\'s details', () => {
    type Handler = NonNullable<SegmentedControlRootProps['onValueChange']>
    expectTypeOf<Parameters<Handler>[0]>().toEqualTypeOf<string>()
    expectTypeOf<Parameters<Handler>[1]>().toEqualTypeOf<Base.ChangeEventDetails>()
  })

  it('a segment\'s value is a required string', () => {
    expectTypeOf<SegmentedControlItemProps['value']>().toEqualTypeOf<string>()
    expectTypeOf<Accepts<SegmentedControlItemProps, { children: string }>>().toEqualTypeOf<false>()
  })
})

describe('the props SegmentedControl adds come from the schema', () => {
  it('are size, fullWidth and invalid, all optional, on the root', () => {
    expectTypeOf<keyof SegmentedControlDesignProps>().toEqualTypeOf<'size' | 'fullWidth' | 'invalid'>()
    expectTypeOf<SegmentedControlRootProps['size']>().toEqualTypeOf<Sizes | undefined>()
    expectTypeOf<SegmentedControlRootProps['fullWidth']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<SegmentedControlRootProps['invalid']>().toEqualTypeOf<boolean | undefined>()
  })

  it('a segment takes no size of its own, and an icon as any node', () => {
    expectTypeOf<Extract<keyof SegmentedControlItemProps, 'size' | 'invalid' | 'fullWidth'>>().toEqualTypeOf<never>()
    expectTypeOf<SegmentedControlItemProps['icon']>().toEqualTypeOf<ReactNode | undefined>()
  })

  it('has no tone, no variant, no orientation and no items: one look is drawn, and the segments are children', () => {
    expectTypeOf<Extract<keyof SegmentedControlRootProps, 'tone' | 'variant' | 'orientation' | 'items'>>().toEqualTypeOf<never>()
  })
})

describe('the track and the segment are ours', () => {
  it('className is a string on both, never the state function Base UI also takes', () => {
    expectTypeOf<SegmentedControlRootProps['className']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<SegmentedControlItemProps['className']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<Accepts<SegmentedControlItemProps['className'], () => string>>().toEqualTypeOf<false>()
  })

  it('a segment\'s style is a plain style object', () => {
    expectTypeOf<SegmentedControlItemProps['style']>().toEqualTypeOf<CSSProperties | undefined>()
  })

  it('a segment is always a native button: nativeButton and render are not props', () => {
    expectTypeOf<Extract<keyof SegmentedControlItemProps, 'nativeButton' | 'render'>>().toEqualTypeOf<never>()
  })

  it('ref is a normal prop: the track div, and the segment button', () => {
    expectTypeOf<SegmentedControlRootProps['ref']>().toEqualTypeOf<Ref<HTMLDivElement> | undefined>()
    expectTypeOf<SegmentedControlItemProps['ref']>().toEqualTypeOf<Ref<HTMLButtonElement> | undefined>()
  })

  it('each part takes its props type as it is', () => {
    expectTypeOf<Parameters<typeof SegmentedControlRoot>[0]>().toEqualTypeOf<SegmentedControlRootProps>()
    expectTypeOf<Parameters<typeof SegmentedControlItem>[0]>().toEqualTypeOf<SegmentedControlItemProps>()
  })
})

describe('what Base UI gives passes through, untouched (R-5.7-5)', () => {
  it('the form props of the track are Base UI\'s', () => {
    expectTypeOf<SegmentedControlRootProps['name']>().toEqualTypeOf<Base.Props['name']>()
    expectTypeOf<SegmentedControlRootProps['form']>().toEqualTypeOf<Base.Props['form']>()
    expectTypeOf<SegmentedControlRootProps['required']>().toEqualTypeOf<Base.Props['required']>()
    expectTypeOf<SegmentedControlRootProps['inputRef']>().toEqualTypeOf<Base.Props['inputRef']>()
    expectTypeOf<SegmentedControlRootProps['disabled']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<SegmentedControlRootProps['readOnly']>().toEqualTypeOf<boolean | undefined>()
  })

  it('a segment\'s disabled, readOnly and inputRef are Base UI\'s', () => {
    expectTypeOf<SegmentedControlItemProps['disabled']>().toEqualTypeOf<Radio.Root.Props['disabled']>()
    expectTypeOf<SegmentedControlItemProps['readOnly']>().toEqualTypeOf<Radio.Root.Props['readOnly']>()
    expectTypeOf<SegmentedControlItemProps['inputRef']>().toEqualTypeOf<Radio.Root.Props['inputRef']>()
  })
})

describe('the name is the shared group name (R-5.6-1)', () => {
  it('is GroupName: an aria-label or an aria-labelledby, never an id alone', () => {
    expectTypeOf<Accepts<SegmentedControlName, { 'aria-label': string }>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<SegmentedControlName, { 'aria-labelledby': string }>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<SegmentedControlName, { id: string }>>().toEqualTypeOf<false>()
  })
})
