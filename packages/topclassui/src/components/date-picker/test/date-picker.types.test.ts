import type { Popover as Base } from '@base-ui/react/popover'
import type { Ref } from 'react'
import { describe, expectTypeOf, it } from 'vitest'

// From the index, so a type it stops re-exporting fails here.
import type { DatePicker, DatePickerDesignProps, DatePickerName, DatePickerPlacement, DatePickerProps } from '../index.js'

/** Assignability as a value, so a rejected prop is a passing assertion. */
type Accepts<Union, Candidate> = Candidate extends Union ? true : false

type Sizes = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'custom'

describe('the value is an ISO date string or null', () => {
  it('value and defaultValue are a string or null; onValueChange receives the chosen day\'s string', () => {
    expectTypeOf<DatePickerProps['value']>().toEqualTypeOf<string | null | undefined>()
    expectTypeOf<DatePickerProps['defaultValue']>().toEqualTypeOf<string | null | undefined>()
    expectTypeOf<Parameters<NonNullable<DatePickerProps['onValueChange']>>>().toEqualTypeOf<[value: string]>()
  })

  it('the open state is Base UI\'s root\'s', () => {
    expectTypeOf<DatePickerProps['open']>().toEqualTypeOf<Base.Root.Props['open']>()
    expectTypeOf<DatePickerProps['defaultOpen']>().toEqualTypeOf<Base.Root.Props['defaultOpen']>()
    expectTypeOf<DatePickerProps['onOpenChange']>().toEqualTypeOf<Base.Root.Props['onOpenChange']>()
    expectTypeOf<DatePickerProps['onOpenChangeComplete']>().toEqualTypeOf<Base.Root.Props['onOpenChangeComplete']>()
  })
})

describe('the props DatePicker adds come from the schema', () => {
  it('are size, invalid, fullWidth, placement, minDate, maxDate and firstDayOfWeek, all optional', () => {
    expectTypeOf<keyof DatePickerDesignProps>().toEqualTypeOf<'size' | 'invalid' | 'fullWidth' | 'placement' | 'minDate' | 'maxDate' | 'firstDayOfWeek'>()
    expectTypeOf<DatePickerProps['size']>().toEqualTypeOf<Sizes | undefined>()
    expectTypeOf<DatePickerProps['placement']>().toEqualTypeOf<DatePickerPlacement | undefined>()
    expectTypeOf<DatePickerProps['minDate']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<DatePickerProps['maxDate']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<DatePickerProps['firstDayOfWeek']>().toEqualTypeOf<number | undefined>()
  })

  it('the placeholder is text, the container is the Portal\'s, and the form props are plain', () => {
    expectTypeOf<DatePickerProps['placeholder']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<DatePickerProps['container']>().toEqualTypeOf<Base.Portal.Props['container']>()
    expectTypeOf<DatePickerProps['name']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<DatePickerProps['form']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<DatePickerProps['required']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<DatePickerProps['disabled']>().toEqualTypeOf<boolean | undefined>()
  })
})

describe('what is removed from the types', () => {
  it('the trigger\'s render, nativeButton, handle, payload, hover opening, children and type', () => {
    type Removed = 'render' | 'nativeButton' | 'handle' | 'payload' | 'openOnHover' | 'delay' | 'closeDelay' | 'children' | 'type'
    expectTypeOf<Extract<keyof DatePickerProps, Removed>>().toEqualTypeOf<never>()
  })

  it('nothing that is not built: no tone, no variant, no range, no locale, no keepMounted, no clearable', () => {
    type Unbuilt = 'tone' | 'variant' | 'mode' | 'locale' | 'keepMounted' | 'clearable' | 'showWeekNumbers' | 'isDateDisabled' | 'readOnly'
    expectTypeOf<Extract<keyof DatePickerProps, Unbuilt>>().toEqualTypeOf<never>()
  })
})

describe('the trigger is ours', () => {
  it('className is a string, never the state function Base UI also takes; ref is to the trigger button', () => {
    expectTypeOf<DatePickerProps['className']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<Accepts<DatePickerProps['className'], () => string>>().toEqualTypeOf<false>()
    expectTypeOf<DatePickerProps['ref']>().toEqualTypeOf<Ref<HTMLButtonElement> | undefined>()
  })

  it('takes its props type as it is', () => {
    expectTypeOf<Parameters<typeof DatePicker>[0]>().toEqualTypeOf<DatePickerProps>()
  })
})

describe('the name is the shared control name (R-5.6-1)', () => {
  it('is ControlName: an id for a label, an aria-label or an aria-labelledby, and nothing else', () => {
    expectTypeOf<Accepts<DatePickerName, { id: string }>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<DatePickerName, { 'aria-label': string }>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<DatePickerName, { 'aria-labelledby': string }>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<DatePickerName, { title: string }>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<DatePickerProps, { defaultValue: string }>>().toEqualTypeOf<false>()
  })
})
