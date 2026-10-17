import { SORT_ICONS } from './constants.js'
import type { TableColumn, TableColumns, TableSort, TableSortDirection } from './types.js'

/** A JS caller can pass a direction no list holds: the column reads as unsorted, not a crash. */
export const directionOf = (sort: TableSort | undefined, key: string): TableSortDirection | undefined =>
  sort?.key === key && Object.hasOwn(SORT_ICONS, sort.direction) ? sort.direction : undefined

/** The entries that are columns, in the order they were written. */
export const columnsOf = <T,>(columns: TableColumns<T>): TableColumn<T>[] =>
  columns.filter((column): column is TableColumn<T> => Boolean(column))
