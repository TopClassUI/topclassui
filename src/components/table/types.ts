import type { ComponentPropsWithRef, ReactElement, ReactNode } from 'react'

import type { Labels } from '#shared/labels/types.js'
import type { TABLE_ALIGNS, TABLE_SORT_DIRECTIONS } from './constants.js'
import type { TableSchemaInput, TableSkeletonSchemaInput } from './schema.js'

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
  /** Makes each cell the header of its row, which a screen reader reads with the other cells of that row. */
  rowHeader?: boolean | undefined
  /** Classes for the header cell and every body cell, merged last: `whitespace-normal`, `min-w-40`, `hidden sm:table-cell`. */
  className?: string | undefined
}

/** The column the rows are sorted by now, and which way. */
export interface TableSort {
  key: string
  direction: TableSortDirection
}

/** What can name a table: any node but the three that render nothing. */
export type TableCaption = Exclude<ReactNode, boolean | null | undefined>

/** `Caption` itself, unless it is the empty string, which would leave the table unnamed. */
type NonEmpty<Caption> = Caption & (Caption extends '' ? never : unknown)

/** The columns as a caller writes them: `cond && {...}` leaves a false behind, and that hides one. */
export type TableColumns<T> = readonly (TableColumn<T> | false | null | undefined)[]

/** No content, and the attributes that make the scrolling box a named tab stop. */
type Owned =
  'children' | 'dangerouslySetInnerHTML' | 'role' | 'tabIndex' | 'aria-label' | 'aria-labelledby'

export interface TableProps<T, Caption extends TableCaption = TableCaption>
  extends Omit<ComponentPropsWithRef<'div'>, Owned>, TableDesignProps {
  /** The rows, already sorted and paged: Table renders what it is given. */
  items: readonly T[]
  /** A stable identity for a row, as the shared collection contract has it. It becomes the React key. */
  getKey: (item: T) => string
  /** The columns, in reading order. A false, null or undefined entry is skipped, so `cond && {...}` hides one. */
  columns: TableColumns<T>
  /** What the table holds, in real words. It is the only name of the table and of its scrolling region. */
  caption: NonEmpty<Caption>
  /** The column the rows are sorted by, which gets `aria-sort` and a caret. */
  sort?: TableSort | undefined
  /** Shown in one row across every column when there are no items. `null` also gives `labels.state.empty`. */
  emptyFallback?: ReactNode | undefined
  /** The element every sort link is cloned from, such as `link={<Link href="" />}`; its `href` is replaced with the column's `sortHref`. */
  link?: ReactElement | undefined
  /** The built-in strings: the empty row and the words of the sort links. Defaults to English. */
  labels?: Labels | undefined
}

// R-8.3-4: derived from the schema, as the design props of the table are.
export type TableSkeletonDesignProps = {
  [K in keyof TableSkeletonSchemaInput]?: TableSkeletonSchemaInput[K] | undefined
}

/** No content and no way to un-hide it: the placeholder only holds the table's shape. */
export type TableSkeletonProps =
  Omit<ComponentPropsWithRef<'div'>, 'children' | 'dangerouslySetInnerHTML' | 'aria-hidden'>
  & TableSkeletonDesignProps
  & Pick<TableDesignProps, 'captionVisible'>
