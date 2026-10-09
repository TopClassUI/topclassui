import type { ReactElement, ReactNode } from 'react'
import { describe, expect, expectTypeOf, it } from 'vitest'

import type { IconData } from '#icons/types.js'
import type { Labels } from '#shared/labels/types.js'
import { SORT_ICONS, SORT_LABELS, TABLE_ALIGNS, TABLE_COLUMN_DEFAULTS, TABLE_DEFAULTS, TABLE_SORT_DIRECTIONS } from '../constants.js'
import type { Table } from '../index.js'
import type {
  TableAlign, TableColumn, TableDesignProps, TableProps, TableSort, TableSortDirection,
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

  it('names the defaults the spec names', () => {
    expect(TABLE_DEFAULTS).toEqual({ captionVisible: false, striped: false, stickyFirstColumn: false })
    expect(TABLE_COLUMN_DEFAULTS).toEqual({ align: 'start' })
  })
})

describe('a column is typed by the item', () => {
  it('hands cell the item type of the table', () => {
    expectTypeOf<TableColumn<Invoice>['cell']>().toEqualTypeOf<(item: Invoice) => ReactNode>()
    expectTypeOf<Parameters<TableColumn<Invoice>['cell']>[0]>().toEqualTypeOf<Invoice>()
  })

  it('rejects a cell written for another item', () => {
    type CustomerColumn = { key: string; header: string; cell: (item: Customer) => ReactNode }
    expectTypeOf<Accepts<TableColumn<Invoice>, CustomerColumn>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<TableColumn<Customer>, CustomerColumn>>().toEqualTypeOf<true>()
  })

  it('rejects a cell that returns something React cannot render', () => {
    type ObjectCell = { key: string; header: string; cell: (item: Invoice) => { amount: number } }
    expectTypeOf<Accepts<TableColumn<Invoice>, ObjectCell>>().toEqualTypeOf<false>()
  })

  it('rejects a cell that takes a second argument the table never passes', () => {
    type IndexedCell = { key: string; header: string; cell: (item: Invoice, index: number) => ReactNode }
    expectTypeOf<Accepts<TableColumn<Invoice>, IndexedCell>>().toEqualTypeOf<false>()
  })

  it('requires key, header and cell, and leaves sortHref and align optional', () => {
    expectTypeOf<Accepts<TableColumn<Invoice>, { key: string; header: string }>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<TableColumn<Invoice>, { header: string; cell: () => string }>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<TableColumn<Invoice>, { key: string; header: string; cell: () => string }>>().toEqualTypeOf<true>()
    expectTypeOf<TableColumn<Invoice>['sortHref']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<TableColumn<Invoice>['align']>().toEqualTypeOf<TableAlign | undefined>()
  })

  it('takes any node as a header, and a string key', () => {
    expectTypeOf<TableColumn<Invoice>['header']>().toEqualTypeOf<ReactNode>()
    expectTypeOf<TableColumn<Invoice>['key']>().toEqualTypeOf<string>()
  })
})

describe('the props are generic over the item', () => {
  it('takes a readonly list, so a frozen or as-const list is accepted', () => {
    expectTypeOf<TableProps<Invoice>['items']>().toEqualTypeOf<readonly Invoice[]>()
    expectTypeOf<TableProps<Invoice>['columns']>().toEqualTypeOf<readonly TableColumn<Invoice>[]>()
  })

  it('types getKey by the item, returning what React accepts as a key', () => {
    expectTypeOf<TableProps<Invoice>['getKey']>().toEqualTypeOf<(item: Invoice) => string | number>()
    expectTypeOf<Accepts<TableProps<Invoice>['getKey'], (item: Customer) => string>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<TableProps<Invoice>['getKey'], (item: Invoice) => boolean>>().toEqualTypeOf<false>()
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
    expectTypeOf<Accepts<TableProps<Invoice>['caption'], string>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<TableProps<Invoice>['caption'], ReactElement>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<TableProps<Invoice>['caption'], null>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<TableProps<Invoice>['caption'], undefined>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<TableProps<Invoice>['caption'], false>>().toEqualTypeOf<false>()
  })

  it('takes the fallback, the sort and the labels as the spec names them', () => {
    expectTypeOf<TableProps<Invoice>['emptyFallback']>().toEqualTypeOf<ReactNode>()
    expectTypeOf<TableProps<Invoice>['sort']>().toEqualTypeOf<TableSort | undefined>()
    expectTypeOf<TableSort>().toEqualTypeOf<{ key: string; direction: TableSortDirection }>()
    expectTypeOf<TableProps<Invoice>['labels']>().toEqualTypeOf<Labels | undefined>()
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

  it('takes none of what it writes itself', () => {
    expectTypeOf<Accepts<keyof TableProps<Invoice>, 'children'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof TableProps<Invoice>, 'dangerouslySetInnerHTML'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof TableProps<Invoice>, 'role'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof TableProps<Invoice>, 'tabIndex'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof TableProps<Invoice>, 'aria-label'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof TableProps<Invoice>, 'aria-labelledby'>>().toEqualTypeOf<false>()
  })

  it('has none of the props the spec leaves unbuilt', () => {
    expectTypeOf<Accepts<keyof TableProps<Invoice>, 'pageSize'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof TableProps<Invoice>, 'density'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof TableProps<Invoice>, 'variant'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof TableProps<Invoice>, 'size'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof TableProps<Invoice>, 'hasMore'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof TableProps<Invoice>, 'loadMore'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof TableProps<Invoice>, 'selectedKeys'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof TableProps<Invoice>, 'render'>>().toEqualTypeOf<false>()
  })
})

describe('the design props and the schema cannot drift', () => {
  it('is derived from the schema input: three optional booleans', () => {
    expectTypeOf<TableDesignProps>().toEqualTypeOf<{
      captionVisible?: boolean | undefined
      striped?: boolean | undefined
      stickyFirstColumn?: boolean | undefined
    }>()
  })

  it('is a subset of the component props, so every design prop is settable', () => {
    expectTypeOf<Accepts<keyof TableProps<Invoice>, keyof TableDesignProps>>().toEqualTypeOf<true>()
  })
})
