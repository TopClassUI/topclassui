import type { ComponentPropsWithRef, ReactNode } from 'react'

import type { Labels } from '#shared/labels/types.js'
import type { TABLE_ALIGNS, TABLE_SORT_DIRECTIONS } from './constants.js'
import type { TableSchemaInput } from './schema.js'

export type TableAlign = (typeof TABLE_ALIGNS)[number]

export type TableSortDirection = (typeof TABLE_SORT_DIRECTIONS)[number]

// R-8.3-4: derived from the schema, so the props and the validation cannot drift apart.
export type TableDesignProps = {
  [K in keyof TableSchemaInput]?: TableSchemaInput[K] | undefined
}

/** One column: what its header says and how it reads a cell out of an item. */
export interface TableColumn<T> {
  /** Unique in the table: the React key of the column, and what `sort.key` names. */
  key: string
  /** The column header. */
  header: ReactNode
  /** The cell of one row, read from its item. */
  cell: (item: T) => ReactNode
  /** Makes the header a link to this URL, which the server answers with the sorted rows. */
  sortHref?: string | undefined
  /** `end` for numbers, so the digits line up; it follows the reading direction. */
  align?: TableAlign | undefined
}

/** The column the rows are sorted by now, and which way. */
export interface TableSort {
  key: string
  direction: TableSortDirection
}

/** No content, and the three attributes that make the scrolling box a named tab stop. */
type Owned =
  'children' | 'dangerouslySetInnerHTML' | 'role' | 'tabIndex' | 'aria-label' | 'aria-labelledby'

export interface TableProps<T>
  extends Omit<ComponentPropsWithRef<'div'>, Owned>, TableDesignProps {
  /** The rows, already sorted and paged: Table renders what it is given. */
  items: readonly T[]
  /** A stable identity for a row, which becomes its React key. */
  getKey: (item: T) => string | number
  /** The columns, in reading order. */
  columns: readonly TableColumn<T>[]
  /** What the table holds. It names the table and its scrolling region, so it cannot be nothing. */
  caption: Exclude<ReactNode, boolean | null | undefined>
  /** The column the rows are sorted by, which gets `aria-sort` and a caret. */
  sort?: TableSort | undefined
  /** Shown in one row across every column when there are no items. Defaults to `labels.state.empty`. */
  emptyFallback?: ReactNode | undefined
  /** The built-in strings: the empty row and the words of the sort links. Defaults to English. */
  labels?: Labels | undefined
}
