import type { Combobox as Base } from '@base-ui/react/combobox'
import type { ReactNode, Ref } from 'react'
import { describe, expectTypeOf, it } from 'vitest'

// From the index, so a type it stops re-exporting fails here.
import type {
  Combobox, ComboboxDesignProps, ComboboxName, ComboboxPlacement, ComboboxProps, ComboboxStatus,
} from '../index.js'

/** Assignability as a value, so a rejected prop is a passing assertion. */
type Accepts<Union, Candidate> = Candidate extends Union ? true : false

type Sizes = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'custom'
type Item = { value: string, label: string, disabled?: boolean | undefined }

describe('the value is a string or null, never Base UI\'s any', () => {
  it('value and defaultValue are a string or null', () => {
    expectTypeOf<ComboboxProps['value']>().toEqualTypeOf<string | null | undefined>()
    expectTypeOf<ComboboxProps['defaultValue']>().toEqualTypeOf<string | null | undefined>()
  })

  it('onValueChange receives a string or null, and Base UI\'s details', () => {
    type Handler = NonNullable<ComboboxProps['onValueChange']>
    expectTypeOf<Parameters<Handler>[0]>().toEqualTypeOf<string | null>()
    expectTypeOf<Parameters<Handler>[1]>().toEqualTypeOf<Base.Root.ChangeEventDetails>()
  })

  it('items is required plain data: a value, a label and an optional disabled', () => {
    expectTypeOf<ComboboxProps['items']>().toEqualTypeOf<readonly Item[]>()
    expectTypeOf<Accepts<ComboboxProps, { 'aria-label': string }>>().toEqualTypeOf<false>()
  })
})

describe('the props Combobox adds come from the schema', () => {
  it('are the ten design props, all optional', () => {
    expectTypeOf<keyof ComboboxDesignProps>().toEqualTypeOf<
      'size' | 'invalid' | 'fullWidth' | 'placement' | 'visibleRows' | 'virtualize' | 'hasMore' | 'loadMoreThreshold' | 'status' | 'maxLength'
    >()
    expectTypeOf<ComboboxProps['size']>().toEqualTypeOf<Sizes | undefined>()
    expectTypeOf<ComboboxProps['placement']>().toEqualTypeOf<ComboboxPlacement | undefined>()
    expectTypeOf<ComboboxProps['status']>().toEqualTypeOf<ComboboxStatus | undefined>()
    expectTypeOf<ComboboxStatus>().toEqualTypeOf<'idle' | 'loading' | 'loading-more'>()
    expectTypeOf<ComboboxProps['virtualize']>().toEqualTypeOf<'auto' | boolean | undefined>()
    expectTypeOf<ComboboxProps['maxLength']>().toEqualTypeOf<number | null | undefined>()
    expectTypeOf<ComboboxProps['visibleRows']>().toEqualTypeOf<number | undefined>()
    expectTypeOf<ComboboxProps['loadMoreThreshold']>().toEqualTypeOf<number | undefined>()
  })

  it('loadMore, emptyFallback, the container and keepMounted', () => {
    expectTypeOf<ComboboxProps['loadMore']>().toEqualTypeOf<(() => void | Promise<void>) | undefined>()
    expectTypeOf<ComboboxProps['emptyFallback']>().toEqualTypeOf<ReactNode | undefined>()
    expectTypeOf<ComboboxProps['container']>().toEqualTypeOf<Base.Portal.Props['container']>()
    expectTypeOf<ComboboxProps['keepMounted']>().toEqualTypeOf<boolean | undefined>()
  })
})

describe('what is removed from the types', () => {
  it('multiple, virtualized, the filtered items, grid, inline, limit, the converters and children', () => {
    expectTypeOf<Extract<keyof ComboboxProps,
      'multiple' | 'virtualized' | 'filteredItems' | 'grid' | 'inline' | 'limit' | 'itemToStringLabel' | 'itemToStringValue'
      | 'isItemEqualToValue' | 'children'>>().toEqualTypeOf<never>()
  })

  it('no tone, no variant and no getKey: one look is drawn and the options are data', () => {
    expectTypeOf<Extract<keyof ComboboxProps, 'tone' | 'variant' | 'getKey'>>().toEqualTypeOf<never>()
  })
})

describe('the input is ours', () => {
  it('className is a string, never the state function Base UI also takes', () => {
    expectTypeOf<ComboboxProps['className']>().toEqualTypeOf<string | undefined>()
  })

  it('ref is a normal prop, to the visible input', () => {
    expectTypeOf<ComboboxProps['ref']>().toEqualTypeOf<Ref<HTMLInputElement> | undefined>()
  })

  it('takes its props type as it is', () => {
    expectTypeOf<Parameters<typeof Combobox>[0]>().toEqualTypeOf<ComboboxProps>()
  })
})

describe('what Base UI gives passes through, untouched (R-5.7-5)', () => {
  it('the form props, the query and the open state of the root are Base UI\'s', () => {
    type Root = Base.Root.Props<string, false, Item>
    expectTypeOf<ComboboxProps['name']>().toEqualTypeOf<Root['name']>()
    expectTypeOf<ComboboxProps['form']>().toEqualTypeOf<Root['form']>()
    expectTypeOf<ComboboxProps['required']>().toEqualTypeOf<Root['required']>()
    expectTypeOf<ComboboxProps['inputRef']>().toEqualTypeOf<Root['inputRef']>()
    expectTypeOf<ComboboxProps['modal']>().toEqualTypeOf<Root['modal']>()
    expectTypeOf<ComboboxProps['onOpenChange']>().toEqualTypeOf<Root['onOpenChange']>()
    expectTypeOf<ComboboxProps['inputValue']>().toEqualTypeOf<Root['inputValue']>()
    expectTypeOf<ComboboxProps['filter']>().toEqualTypeOf<Root['filter']>()
    expectTypeOf<ComboboxProps['onItemHighlighted']>().toEqualTypeOf<Root['onItemHighlighted']>()
  })
})

describe('the name is the shared control name (R-5.6-1)', () => {
  it('is ControlName: an id for a label, an aria-label or an aria-labelledby', () => {
    expectTypeOf<Accepts<ComboboxName, { id: string }>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<ComboboxName, { 'aria-label': string }>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<ComboboxName, { 'aria-labelledby': string }>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<ComboboxName, { title: string }>>().toEqualTypeOf<false>()
  })
})
