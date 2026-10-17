import type { ReactNode } from 'react'
import { describe, expect, expectTypeOf, it } from 'vitest'

import type { Labels } from '#shared/labels/types.js'
import { STEPPER_MARK_SIZE, STEPPER_MARK_STATUS, STEPPER_TITLE_SIZE, STEPPER_TITLE_STATUS } from '../classes.js'
import { STEPPER_DEFAULTS, STEPPER_SIZES, STEPPER_STATUSES } from '../constants.js'
import type { StepperItem, StepperProps, StepperStatus } from '../types.js'

/** Assignability as a value, so a rejected prop is a passing assertion. */
type Accepts<Union, Candidate> = Candidate extends Union ? true : false

type Unbuilt = 'defaultValue' | 'onValueChange' | 'activeStep' | 'orientation' | 'compact' | 'clickable'
  | 'showConnector' | 'tone' | 'variant' | 'disabled' | 'render'

describe('the unions come from the constants', () => {
  it('status is exactly the four drawn', () => {
    expectTypeOf<StepperStatus>().toEqualTypeOf<'done' | 'current' | 'todo' | 'error'>()
    expect([...STEPPER_STATUSES]).toEqual(['done', 'current', 'todo', 'error'])
    expectTypeOf<Accepts<StepperStatus, 'disabled'>>().toEqualTypeOf<false>()
  })

  it('size is the shared six', () => {
    expectTypeOf<StepperProps['size']>().toEqualTypeOf<'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'custom' | undefined>()
    expect([...STEPPER_SIZES]).toEqual(['xs', 'sm', 'md', 'lg', 'xl', 'custom'])
  })

  it('has a class for every size and every status in each table, so none ships unpainted', () => {
    expect(Object.keys(STEPPER_MARK_SIZE)).toEqual(['xs', 'sm', 'md', 'lg', 'xl', 'custom'])
    expect(Object.keys(STEPPER_TITLE_SIZE)).toEqual(['xs', 'sm', 'md', 'lg', 'xl', 'custom'])
    expect(Object.keys(STEPPER_MARK_STATUS)).toEqual(['done', 'current', 'todo', 'error'])
    expect(Object.keys(STEPPER_TITLE_STATUS)).toEqual(['done', 'current', 'todo', 'error'])
  })

  it('agrees with the defaults the spec names', () => {
    expect(STEPPER_DEFAULTS).toEqual({ size: 'md', locale: 'en' })
  })
})

describe('a step', () => {
  it('requires an id and a title, and nothing else', () => {
    expectTypeOf<Accepts<StepperItem, { id: string; title: string }>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<StepperItem, { title: string }>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<StepperItem, { id: string }>>().toEqualTypeOf<false>()
  })

  it('takes a node as its title and a status from the list', () => {
    expectTypeOf<StepperItem['title']>().toEqualTypeOf<ReactNode>()
    expectTypeOf<StepperItem['status']>().toEqualTypeOf<StepperStatus | undefined>()
  })

  it('takes a string id, as value does', () => {
    expectTypeOf<StepperItem['id']>().toEqualTypeOf<string>()
    expectTypeOf<Accepts<StepperItem, { id: number; title: string }>>().toEqualTypeOf<false>()
  })
})

describe('the props', () => {
  it('require items, a readonly list of steps', () => {
    expectTypeOf<StepperProps['items']>().toEqualTypeOf<readonly StepperItem[]>()
    expectTypeOf<Accepts<StepperProps, { value: string }>>().toEqualTypeOf<false>()
  })

  it('take value as the id of the current step, display only', () => {
    expectTypeOf<StepperProps['value']>().toEqualTypeOf<string | undefined>()
  })

  it('take labels and locale, so the pair getLabels returns spreads onto it', () => {
    expectTypeOf<StepperProps['labels']>().toEqualTypeOf<Labels | undefined>()
    expectTypeOf<StepperProps['locale']>().toEqualTypeOf<string | undefined>()
  })

  it('accept className, style and ref, and keep the native ol props', () => {
    expectTypeOf<StepperProps['className']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<Accepts<keyof StepperProps, 'style' | 'ref' | 'id' | 'aria-label'>>().toEqualTypeOf<true>()
  })

  it('take no role, no children and no dangerouslySetInnerHTML: the list is built from items', () => {
    expectTypeOf<Extract<keyof StepperProps, 'role' | 'children' | 'dangerouslySetInnerHTML'>>().toEqualTypeOf<never>()
  })

  it('have none of the props the spec leaves unbuilt, the function onValueChange above all', () => {
    expectTypeOf<Extract<keyof StepperProps, Unbuilt>>().toEqualTypeOf<never>()
  })
})
