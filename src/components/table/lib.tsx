import { cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react'

import { renderElement } from '#shared/render.js'
import { SORT_ICONS } from './constants.js'
import type { TableColumn, TableColumns, TableSort, TableSortDirection } from './types.js'

/** A JS caller can pass a direction no list holds: the column reads as unsorted, not a crash. */
export const directionOf = (sort: TableSort | undefined, key: string): TableSortDirection | undefined =>
  sort?.key === key && Object.hasOwn(SORT_ICONS, sort.direction) ? sort.direction : undefined

/** The entries that are columns, in the order they were written. */
export const columnsOf = <T,>(columns: TableColumns<T>): TableColumn<T>[] =>
  columns.filter((column): column is TableColumn<T> => Boolean(column))

/** R-5.7-4: one sort link from the caller's element, or a plain anchor. The href is cloned
 * in first, because renderElement lets the element's own props win and its href is a stand-in. */
export function sortLink(
  link: ReactElement | undefined,
  href: string,
  className: string,
  children: ReactNode,
): ReactElement {
  // Said here, by the name of the prop: cloneElement would fail first, with React's own words.
  if (link !== undefined && !isValidElement(link)) {
    throw new TypeError('link must be an element, such as link={<Link href="" />}')
  }
  const element = cloneElement((link ?? <a />) as ReactElement<{ href?: string }>, { href })
  return renderElement(element, { className, children })
}
