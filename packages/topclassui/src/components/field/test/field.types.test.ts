import type { ReactNode } from 'react'
import { describe, expectTypeOf, it } from 'vitest'

import type { FieldControl, FieldDesignProps, FieldLiveProps, FieldProps } from '../types.js'

/** Assignability as a value, so a rejected prop is a passing assertion. */
type Accepts<Union, Candidate> = Candidate extends Union ? true : false

describe('the control object (choice 7)', () => {
  it('is the six keys, with aria-labelledby for every control', () => {
    expectTypeOf<keyof FieldControl>().toEqualTypeOf<'id' | 'name' | 'required' | 'aria-labelledby' | 'aria-describedby' | 'aria-invalid'>()
  })

  it('always carries an id, a name, required and a label id; a description only when one is rendered; invalid only as true', () => {
    expectTypeOf<FieldControl['id']>().toEqualTypeOf<string>()
    expectTypeOf<FieldControl['aria-labelledby']>().toEqualTypeOf<string>()
    expectTypeOf<FieldControl['required']>().toEqualTypeOf<boolean>()
    expectTypeOf<FieldControl['aria-describedby']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<FieldControl['aria-invalid']>().toEqualTypeOf<true | undefined>()
  })
})

describe('the props', () => {
  it('the design props are the three the schema holds', () => {
    expectTypeOf<keyof FieldDesignProps>().toEqualTypeOf<'required' | 'inline' | 'invalid'>()
  })

  it('name, label and a function child are required', () => {
    expectTypeOf<Accepts<FieldProps, { label: 'L', children: (c: FieldControl) => ReactNode }>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<FieldProps, { name: 'n', children: (c: FieldControl) => ReactNode }>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<FieldProps, { name: 'n', label: 'L' }>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<FieldProps, { name: 'n', label: 'L', children: (c: FieldControl) => ReactNode }>>().toEqualTypeOf<true>()
  })

  it('the child is a function, never an element (choice 8)', () => {
    expectTypeOf<FieldProps['children']>().toEqualTypeOf<(control: FieldControl) => ReactNode>()
  })

  it('error is one message or the array Zod gives', () => {
    expectTypeOf<FieldProps['error']>().toEqualTypeOf<string | readonly string[] | undefined>()
  })

  it('FieldLive takes the same props', () => {
    expectTypeOf<FieldLiveProps>().toEqualTypeOf<FieldProps>()
  })
})
