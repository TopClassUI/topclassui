import type { ComponentPropsWithRef, ReactNode } from 'react'
import { describe, expectTypeOf, it } from 'vitest'

import type { FormErrors } from '#shared/form-errors.js'
import type { FormActionFunction, FormActionProps, FormActionState, FormProps } from '../types.js'

/** Assignability as a value, so a rejected prop is a passing assertion. */
type Accepts<Union, Candidate> = Candidate extends Union ? true : false

interface Values { errors?: FormErrors, values?: { email?: string } }
interface Required { errors?: FormErrors, step: number }

describe('Form', () => {
  it('is a native form: every attribute, the action a URL or a Server Action', () => {
    expectTypeOf<FormProps>().toEqualTypeOf<ComponentPropsWithRef<'form'>>()
    expectTypeOf<Accepts<FormProps['action'], string>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<FormProps['action'], (formData: FormData) => Promise<void>>>().toEqualTypeOf<true>()
  })
})

describe('FormAction', () => {
  it('its state holds the errors by name, and a state of your own adds to it', () => {
    expectTypeOf<FormActionState['errors']>().toEqualTypeOf<FormErrors | undefined>()
    expectTypeOf<Accepts<FormActionState, Values>>().toEqualTypeOf<true>()
  })

  it('the action takes the last state and the entries, and answers with the next, now or later', () => {
    expectTypeOf<FormActionFunction<Values>>().toEqualTypeOf<(state: Values, formData: FormData) => Values | Promise<Values>>()
    expectTypeOf<FormActionProps<Values>['action']>().toEqualTypeOf<FormActionFunction<Values>>()
  })

  it('children are nodes, or a function of the state and pending', () => {
    expectTypeOf<FormActionProps<Values>['children']>().toEqualTypeOf<ReactNode | ((state: Values, pending: boolean) => ReactNode)>()
  })

  it('initialState may be left out when {} is a state, and is required when a key of the state is', () => {
    expectTypeOf<Accepts<FormActionProps<Values>, { action: FormActionFunction<Values> }>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<FormActionProps<Required>, { action: FormActionFunction<Required> }>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<FormActionProps<Required>, { action: FormActionFunction<Required>, initialState: Required }>>().toEqualTypeOf<true>()
  })

  it('takes no action attribute of its own kind, and none of the three React writes for a function action', () => {
    expectTypeOf<Accepts<keyof FormActionProps, 'method' | 'encType' | 'target'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof FormActionProps, 'permalink' | 'initialState' | 'noValidate' | 'ref' | 'className'>>().toEqualTypeOf<true>()
    expectTypeOf<FormActionProps['permalink']>().toEqualTypeOf<string | undefined>()
  })
})
