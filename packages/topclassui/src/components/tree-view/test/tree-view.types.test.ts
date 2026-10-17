import type { ReactNode, Ref } from 'react'
import { describe, expectTypeOf, it } from 'vitest'

// From the index, so a type it stops re-exporting fails here.
import type { TreeNode, TreeView, TreeViewDesignProps, TreeViewName, TreeViewProps, TreeViewStatus } from '../index.js'

/** Assignability as a value, so a rejected prop is a passing assertion. */
type Accepts<Union, Candidate> = Candidate extends Union ? true : false

describe('the node is plain data', () => {
  it('an id, a label, an optional element icon, disabled and children', () => {
    expectTypeOf<TreeNode['id']>().toEqualTypeOf<string>()
    expectTypeOf<TreeNode['label']>().toEqualTypeOf<string>()
    expectTypeOf<TreeNode['icon']>().toEqualTypeOf<ReactNode | undefined>()
    expectTypeOf<TreeNode['disabled']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<TreeNode['children']>().toEqualTypeOf<readonly TreeNode[] | undefined>()
    expectTypeOf<TreeViewProps['items']>().toEqualTypeOf<readonly TreeNode[]>()
  })
})

describe('the value and the expanded ids (choice 28)', () => {
  it('value and defaultValue are an id or null; onValueChange receives the id', () => {
    expectTypeOf<TreeViewProps['value']>().toEqualTypeOf<string | null | undefined>()
    expectTypeOf<TreeViewProps['defaultValue']>().toEqualTypeOf<string | null | undefined>()
    expectTypeOf<TreeViewProps['onValueChange']>().toEqualTypeOf<((id: string) => void) | undefined>()
  })

  it('expanded and defaultExpanded are read-only id lists, and onExpandedChange receives one', () => {
    expectTypeOf<TreeViewProps['expanded']>().toEqualTypeOf<readonly string[] | undefined>()
    expectTypeOf<TreeViewProps['defaultExpanded']>().toEqualTypeOf<readonly string[] | undefined>()
    expectTypeOf<TreeViewProps['onExpandedChange']>().toEqualTypeOf<((ids: readonly string[]) => void) | undefined>()
  })
})

describe('the props TreeView adds come from the schema', () => {
  it('are the four design props, all optional', () => {
    expectTypeOf<keyof TreeViewDesignProps>().toEqualTypeOf<'visibleRows' | 'virtualize' | 'loadMoreThreshold' | 'status'>()
    expectTypeOf<TreeViewProps['status']>().toEqualTypeOf<TreeViewStatus | undefined>()
    expectTypeOf<TreeViewStatus>().toEqualTypeOf<'idle' | 'loading' | 'loading-more' | 'empty'>()
    expectTypeOf<TreeViewProps['virtualize']>().toEqualTypeOf<'auto' | boolean | undefined>()
    expectTypeOf<TreeViewProps['visibleRows']>().toEqualTypeOf<number | undefined>()
    expectTypeOf<TreeViewProps['loadMoreThreshold']>().toEqualTypeOf<number | undefined>()
  })

  it('hasMore, loadMore and the two fallbacks', () => {
    expectTypeOf<TreeViewProps['hasMore']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<TreeViewProps['loadMore']>().toEqualTypeOf<(() => void | Promise<void>) | undefined>()
    expectTypeOf<TreeViewProps['loadingFallback']>().toEqualTypeOf<ReactNode | undefined>()
    expectTypeOf<TreeViewProps['emptyFallback']>().toEqualTypeOf<ReactNode | undefined>()
  })
})

describe('what is not offered', () => {
  it('no getKey, selectedItem, size, selectionMode, error fallback or retry; no tabIndex or role of the caller', () => {
    expectTypeOf<Extract<keyof TreeViewProps,
      'getKey' | 'selectedItem' | 'size' | 'selectionMode' | 'errorFallback' | 'onRetry' | 'tabIndex' | 'role' | 'children'>>().toEqualTypeOf<never>()
  })
})

describe('the tree element is the caller\'s', () => {
  it('className is a string, ref a normal prop to the div', () => {
    expectTypeOf<TreeViewProps['className']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<TreeViewProps['ref']>().toEqualTypeOf<Ref<HTMLDivElement> | undefined>()
    expectTypeOf<Parameters<typeof TreeView>[0]>().toEqualTypeOf<TreeViewProps>()
  })
})

describe('the name is the shared group name (R-5.6-1)', () => {
  it('is GroupName: an aria-label or an aria-labelledby, never an id alone', () => {
    expectTypeOf<Accepts<TreeViewName, { 'aria-label': string }>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<TreeViewName, { 'aria-labelledby': string }>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<TreeViewName, { id: string }>>().toEqualTypeOf<false>()
  })
})
