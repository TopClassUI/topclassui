import type { ReactNode } from 'react'
import { describe, expectTypeOf, it } from 'vitest'

import type { TableAlign, TableColumn } from '../types.js'

/** Assignability as a value, so a rejected prop is a passing assertion. */
type Accepts<Union, Candidate> = Candidate extends Union ? true : false

interface Invoice { id: string; amount: number }
interface Customer { name: string }

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

  it('requires key, header and cell, and leaves the rest optional', () => {
    expectTypeOf<Accepts<TableColumn<Invoice>, { key: string; header: string }>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<TableColumn<Invoice>, { header: string; cell: () => string }>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<TableColumn<Invoice>, { key: string; header: string; cell: () => string }>>().toEqualTypeOf<true>()
    expectTypeOf<TableColumn<Invoice>['sortHref']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<TableColumn<Invoice>['align']>().toEqualTypeOf<TableAlign | undefined>()
  })

  it('takes a row header flag and a class of its own, the two things the Build this block left out', () => {
    expectTypeOf<TableColumn<Invoice>['rowHeader']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<TableColumn<Invoice>['className']>().toEqualTypeOf<string | undefined>()
    type Keys = keyof TableColumn<Invoice>
    expectTypeOf<Keys>().toEqualTypeOf<'key' | 'header' | 'cell' | 'sortHref' | 'align' | 'rowHeader' | 'className'>()
  })

  it('takes any node as a header, and a string key', () => {
    expectTypeOf<TableColumn<Invoice>['header']>().toEqualTypeOf<ReactNode>()
    expectTypeOf<TableColumn<Invoice>['key']>().toEqualTypeOf<string>()
  })
})
