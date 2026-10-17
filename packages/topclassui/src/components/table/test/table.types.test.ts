import type { ReactElement, ReactNode } from 'react'
import { describe, expect, expectTypeOf, it } from 'vitest'

import type { IconData } from '#icons/types.js'
import type { CollectionProps } from '#shared/contracts/collection.js'
import type { Labels } from '#shared/labels/types.js'
import { TABLE_BOUNDARIES } from '../boundaries.js'
import {
  SORT_ICONS, SORT_LABELS, TABLE_ALIGNS, TABLE_COLUMN_DEFAULTS, TABLE_DEFAULTS, TABLE_SKELETON_DEFAULTS, TABLE_SORT_DIRECTIONS,
} from '../constants.js'
import type { Table } from '../index.js'
import type {
  TableAlign, TableCaption, TableColumn, TableColumns, TableDesignProps, TableProps, TableSkeletonDesignProps,
  TableSkeletonProps, TableSort, TableSortDirection,
} from '../types.js'

/** Assignability as a value, so a rejected prop is a passing assertion. */
type Accepts<Union, Candidate> = Candidate extends Union ? true : false

interface Invoice { id: string; amount: number }
interface Customer { name: string }

describe('the unions come from the constants', () => {
  it('align is the two logical sides, never left or right (R-5.3-1)', () => {
    expectTypeOf<TableAlign>().toEqualTypeOf<'start' | 'end'>()
    expectTypeOf<Accepts<TableAlign, 'left'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<TableAlign, 'center'>>().toEqualTypeOf<false>()
    expect([...TABLE_ALIGNS]).toEqual(['start', 'end'])
  })

  it('a sort direction is spelled as aria-sort spells it', () => {
    expectTypeOf<TableSortDirection>().toEqualTypeOf<'ascending' | 'descending'>()
    expectTypeOf<Accepts<TableSortDirection, 'asc'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<TableSortDirection, 'none'>>().toEqualTypeOf<false>()
    expect([...TABLE_SORT_DIRECTIONS]).toEqual(['ascending', 'descending'])
  })

  it('types the caret and the label of every direction, so a third cannot ship without them', () => {
    expectTypeOf(SORT_ICONS).toEqualTypeOf<Record<TableSortDirection, IconData>>()
    expectTypeOf(SORT_LABELS).toEqualTypeOf<{ readonly ascending: 'sortedAscending'; readonly descending: 'sortedDescending' }>()
    expectTypeOf<Accepts<keyof Labels['table'], (typeof SORT_LABELS)[TableSortDirection]>>().toEqualTypeOf<true>()
  })

  it('names the defaults and the bounds, each written out', () => {
    expect(TABLE_DEFAULTS).toEqual({ captionVisible: false, striped: false, stickyFirstColumn: false, visibleRows: 7, virtualize: 'auto', loadMoreThreshold: 10 })
    expect(TABLE_COLUMN_DEFAULTS).toEqual({ align: 'start' })
    expect(TABLE_SKELETON_DEFAULTS).toEqual({ rows: 5, columns: 4 })
    expect(TABLE_BOUNDARIES).toEqual({ skeletonRowsMin: 1, skeletonRowsMax: 500, skeletonColumnsMin: 1, skeletonColumnsMax: 50 })
  })
})

describe('the props are generic over the item', () => {
  it('takes a readonly list, so a frozen or as-const list is accepted', () => {
    expectTypeOf<TableProps<Invoice>['items']>().toEqualTypeOf<readonly Invoice[]>()
  })

  it('takes columns with holes in them, so a flag can leave one out', () => {
    expectTypeOf<TableProps<Invoice>['columns']>().toEqualTypeOf<TableColumns<Invoice>>()
    expectTypeOf<TableColumns<Invoice>>().toEqualTypeOf<readonly (TableColumn<Invoice> | false | null | undefined)[]>()
    expectTypeOf<Accepts<TableProps<Invoice>['columns'], TableColumn<Invoice>[]>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<TableProps<Invoice>['columns'], (TableColumn<Invoice> | true)[]>>().toEqualTypeOf<false>()
  })

  it('types getKey by the item and returns a string, as the shared collection contract does', () => {
    expectTypeOf<TableProps<Invoice>['getKey']>().toEqualTypeOf<(item: Invoice) => string>()
    expectTypeOf<Accepts<TableProps<Invoice>['getKey'], (item: Customer) => string>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<TableProps<Invoice>['getKey'], (item: Invoice) => number>>().toEqualTypeOf<false>()
  })

  it('has not drifted from the contract in the three props it copies from it (R-8.5-1)', () => {
    type Shared = 'items' | 'getKey' | 'emptyFallback'
    expectTypeOf<Accepts<Pick<CollectionProps<Invoice>, Shared>, Pick<TableProps<Invoice>, Shared>>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<Pick<TableProps<Invoice>, Shared>, Pick<CollectionProps<Invoice>, Shared>>>().toEqualTypeOf<true>()
  })

  it('is one generic function component, so the item is inferred from items', () => {
    expectTypeOf<Parameters<typeof Table<Invoice>>[0]>().toEqualTypeOf<TableProps<Invoice>>()
  })

  it('requires items, getKey, columns and a caption', () => {
    type Props = TableProps<Invoice>
    type Required_ = { [K in keyof Props]-?: object extends Pick<Props, K> ? never : K }[keyof Props]
    expectTypeOf<Required_>().toEqualTypeOf<'items' | 'getKey' | 'columns' | 'caption'>()
  })

  it('refuses a caption that renders nothing, because the caption is the name (R-5.6-1)', () => {
    expectTypeOf<TableProps<Invoice>['caption']>().toEqualTypeOf<TableCaption>()
    expectTypeOf<Accepts<TableCaption, string>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<TableCaption, ReactElement>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<TableCaption, null>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<TableCaption, undefined>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<TableCaption, false>>().toEqualTypeOf<false>()
  })

  it('refuses the empty string literal too, and still takes any other string', () => {
    expectTypeOf<TableProps<Invoice, ''>['caption']>().toBeNever()
    expectTypeOf<TableProps<Invoice, 'Invoices'>['caption']>().toEqualTypeOf<'Invoices'>()
    expectTypeOf<TableProps<Invoice, string>['caption']>().toEqualTypeOf<string>()
  })

  it('gives a wrapper one type to hand its own caption on with', () => {
    expectTypeOf<Accepts<TableProps<Invoice>['caption'], TableCaption>>().toEqualTypeOf<true>()
    // In a tuple, or the check runs once per member of ReactNode and answers yes and no.
    expectTypeOf<Accepts<[TableProps<Invoice>['caption']], [ReactNode]>>().toEqualTypeOf<false>()
  })

  it('takes the fallback, the sort and the labels as the spec names them', () => {
    expectTypeOf<TableProps<Invoice>['emptyFallback']>().toEqualTypeOf<ReactNode>()
    expectTypeOf<TableProps<Invoice>['sort']>().toEqualTypeOf<TableSort | undefined>()
    expectTypeOf<TableSort>().toEqualTypeOf<{ key: string; direction: TableSortDirection }>()
    expectTypeOf<TableProps<Invoice>['labels']>().toEqualTypeOf<Labels | undefined>()
  })

  it('takes locale beside labels, so the pair getLabels returns spreads onto it', () => {
    expectTypeOf<TableProps<Invoice>['locale']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<Accepts<Pick<TableProps<Invoice>, 'labels' | 'locale'>, { locale: string; labels: Labels }>>()
      .toEqualTypeOf<true>()
  })

  it('takes the sort link as one element, named link and not render', () => {
    expectTypeOf<TableProps<Invoice>['link']>().toEqualTypeOf<ReactElement | undefined>()
    expectTypeOf<Accepts<keyof TableProps<Invoice>, 'render'>>().toEqualTypeOf<false>()
  })
})

describe('the props follow the vocabulary', () => {
  it('accepts className, style and ref, and ref is a normal prop', () => {
    expectTypeOf<TableProps<Invoice>['className']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<Accepts<keyof TableProps<Invoice>, 'style'>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<keyof TableProps<Invoice>, 'ref'>>().toEqualTypeOf<true>()
  })

  it('keeps the native div props, so id and aria-describedby still pass through', () => {
    expectTypeOf<Accepts<keyof TableProps<Invoice>, 'id'>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<keyof TableProps<Invoice>, 'aria-describedby'>>().toEqualTypeOf<true>()
  })

  it('declares none of what it writes itself, which is what refuses the four JSX checks by name', () => {
    expectTypeOf<Accepts<keyof TableProps<Invoice>, 'children'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof TableProps<Invoice>, 'dangerouslySetInnerHTML'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof TableProps<Invoice>, 'role'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof TableProps<Invoice>, 'tabIndex'>>().toEqualTypeOf<false>()
  })

  it('declares no aria-label and no aria-labelledby either, but that refuses nothing: they are ignored, as the README says', () => {
    // JSX never checks a hyphenated attribute it does not know, so both compile (table.compile.test) and neither is rendered (table.test).
    expectTypeOf<Accepts<keyof TableProps<Invoice>, 'aria-label'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof TableProps<Invoice>, 'aria-labelledby'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<TableProps<Invoice>, TableProps<Invoice> & { 'aria-label': string; 'aria-labelledby': string }>>().toEqualTypeOf<true>()
  })

  it('has none of the props the spec leaves unbuilt', () => {
    expectTypeOf<Accepts<keyof TableProps<Invoice>, 'pageSize'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof TableProps<Invoice>, 'density'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof TableProps<Invoice>, 'variant'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof TableProps<Invoice>, 'size'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof TableProps<Invoice>, 'selectedKeys'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof TableProps<Invoice>, 'stickyHeader'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof TableProps<Invoice>, 'loading'>>().toEqualTypeOf<false>()
  })
})

describe('the design props and the schema cannot drift', () => {
  it('is derived from the schema input: three optional booleans and the collection knobs', () => {
    expectTypeOf<TableDesignProps>().toEqualTypeOf<{
      captionVisible?: boolean | undefined
      striped?: boolean | undefined
      stickyFirstColumn?: boolean | undefined
      visibleRows?: number | undefined
      virtualize?: boolean | 'auto' | undefined
      loadMoreThreshold?: number | undefined
    }>()
    // R-8.5-1: the paging half of the shared contract; loadMore is a Server Action on a server page.
    expectTypeOf<Pick<TableProps<Invoice>, 'hasMore' | 'loadMore'>>().toEqualTypeOf<{ hasMore?: boolean | undefined; loadMore?: (() => void | Promise<void>) | undefined }>()
  })

  it('is a subset of the component props, so every design prop is settable', () => {
    expectTypeOf<Accepts<keyof TableProps<Invoice>, keyof TableDesignProps>>().toEqualTypeOf<true>()
  })
})

describe('the placeholder', () => {
  it('takes two counts from its own schema, and the caption toggle of the table it stands in for', () => {
    expectTypeOf<TableSkeletonDesignProps>().toEqualTypeOf<{ rows?: number | undefined; columns?: number | undefined }>()
    expectTypeOf<TableSkeletonProps['captionVisible']>().toEqualTypeOf<boolean | undefined>()
  })

  it('accepts className, style and ref, and nothing that would put content in it or un-hide it', () => {
    expectTypeOf<TableSkeletonProps['className']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<Accepts<keyof TableSkeletonProps, 'ref'>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<keyof TableSkeletonProps, 'children'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof TableSkeletonProps, 'dangerouslySetInnerHTML'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof TableSkeletonProps, 'aria-hidden'>>().toEqualTypeOf<false>()
  })

  it('takes nothing of the data: a placeholder has no items and no columns to read', () => {
    expectTypeOf<Accepts<keyof TableSkeletonProps, 'items'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof TableSkeletonProps, 'striped'>>().toEqualTypeOf<false>()
  })
})
