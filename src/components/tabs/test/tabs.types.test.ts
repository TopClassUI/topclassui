import type { Tabs } from '@base-ui/react/tabs'
import type { Ref } from 'react'
import { describe, expectTypeOf, it } from 'vitest'

// From the index, so a type it stops re-exporting fails here.
import type {
  TabsDesignProps, TabsListName, TabsListProps, TabsPanelProps, TabsRootProps, TabsTabProps, TabsVariant,
} from '../index.js'

/** Assignability as a value, so a rejected prop is a passing assertion. */
type Accepts<Union, Candidate> = Candidate extends Union ? true : false

describe('the look is on the root', () => {
  it('variant is exactly the two looks', () => {
    expectTypeOf<TabsVariant>().toEqualTypeOf<'line' | 'enclosed'>()
    expectTypeOf<TabsRootProps['variant']>().toEqualTypeOf<TabsVariant | undefined>()
  })

  it('size is the shared scale, custom included', () => {
    expectTypeOf<TabsRootProps['size']>().toEqualTypeOf<'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'custom' | undefined>()
  })

  it('neither is on the list, a tab or a panel: they follow their root', () => {
    expectTypeOf<Accepts<keyof TabsListProps, 'variant'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof TabsListProps, 'size'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof TabsTabProps, 'variant'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof TabsTabProps, 'size'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof TabsPanelProps, 'variant'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof TabsPanelProps, 'size'>>().toEqualTypeOf<false>()
  })

  it('the design props are the four of the schema, each optional', () => {
    expectTypeOf<keyof TabsDesignProps>().toEqualTypeOf<'variant' | 'size' | 'keepMounted' | 'tabs'>()
    expectTypeOf<Accepts<TabsDesignProps, Record<string, never>>>().toEqualTypeOf<true>()
  })
})

describe('a tablist must be named (R-5.6-1)', () => {
  it('takes aria-label alone, and aria-labelledby alone, and both', () => {
    expectTypeOf<Accepts<TabsListName, { 'aria-label': string }>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<TabsListName, { 'aria-labelledby': string }>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<TabsListName, { 'aria-label': string, 'aria-labelledby': string }>>().toEqualTypeOf<true>()
  })

  it('refuses neither, and refuses a name that may be undefined', () => {
    expectTypeOf<Accepts<TabsListName, Record<string, never>>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<TabsListName, { 'aria-label': undefined }>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<TabsListName, { 'aria-label'?: string }>>().toEqualTypeOf<false>()
  })

  it('the props of the list carry that rule: an object with neither name is not a TabsListProps', () => {
    expectTypeOf<Accepts<TabsListProps, { activateOnFocus: boolean }>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<TabsListProps, { 'aria-label': string, activateOnFocus: boolean }>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<TabsListProps, { 'aria-labelledby': string }>>().toEqualTypeOf<true>()
  })
})

describe('every Base UI prop passes through untouched (R-5.7-5)', () => {
  it('the root keeps value, defaultValue, onValueChange and orientation as Base UI types them', () => {
    expectTypeOf<TabsRootProps['value']>().toEqualTypeOf<Tabs.Root.Props['value']>()
    expectTypeOf<TabsRootProps['defaultValue']>().toEqualTypeOf<Tabs.Root.Props['defaultValue']>()
    expectTypeOf<TabsRootProps['onValueChange']>().toEqualTypeOf<Tabs.Root.Props['onValueChange']>()
    expectTypeOf<TabsRootProps['orientation']>().toEqualTypeOf<'horizontal' | 'vertical' | undefined>()
  })

  it('the list keeps activateOnFocus and loopFocus', () => {
    expectTypeOf<TabsListProps['activateOnFocus']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<TabsListProps['loopFocus']>().toEqualTypeOf<boolean | undefined>()
  })

  it('a tab needs a value, and keeps disabled, render and nativeButton', () => {
    expectTypeOf<Accepts<TabsTabProps, Record<string, never>>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<TabsTabProps, { value: string }>>().toEqualTypeOf<true>()
    expectTypeOf<TabsTabProps['disabled']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<TabsTabProps['render']>().toEqualTypeOf<Tabs.Tab.Props['render']>()
    expectTypeOf<TabsTabProps['nativeButton']>().toEqualTypeOf<boolean | undefined>()
  })

  it('a panel needs a value, and keepMounted is a plain optional boolean', () => {
    expectTypeOf<Accepts<TabsPanelProps, Record<string, never>>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<TabsPanelProps, { value: string }>>().toEqualTypeOf<true>()
    expectTypeOf<TabsPanelProps['keepMounted']>().toEqualTypeOf<boolean | undefined>()
  })
})

describe('className, style and ref on every part (R-5.7-3)', () => {
  it('className is a string on each: the state function Base UI also takes is refused, so cn() always has a string', () => {
    expectTypeOf<TabsRootProps['className']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<TabsListProps['className']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<TabsTabProps['className']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<TabsPanelProps['className']>().toEqualTypeOf<string | undefined>()
  })

  it('ref is a normal prop on each, to the element the part renders', () => {
    expectTypeOf<TabsRootProps['ref']>().toEqualTypeOf<Ref<HTMLDivElement> | undefined>()
    expectTypeOf<TabsListProps['ref']>().toEqualTypeOf<Ref<HTMLDivElement> | undefined>()
    expectTypeOf<TabsTabProps['ref']>().toEqualTypeOf<Ref<HTMLButtonElement> | undefined>()
    expectTypeOf<TabsPanelProps['ref']>().toEqualTypeOf<Ref<HTMLDivElement> | undefined>()
  })

  it('style and the standard attributes are there too', () => {
    expectTypeOf<Accepts<keyof TabsRootProps, 'style' | 'id' | 'onClick' | 'aria-describedby'>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<keyof TabsPanelProps, 'style' | 'id' | 'tabIndex' | 'lang'>>().toEqualTypeOf<true>()
  })
})
