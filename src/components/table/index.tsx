// No 'use client': a client bundle gets it only when a client file imports it.
import { useId } from 'react'

import { Svg } from '#components/svg/index.js'
import { BORDER, FOCUS_RING } from '#shared/classes.js'
import { cn } from '#shared/cn.js'
import { en } from '#shared/labels/en.js'
import {
  BODY_CELL, CAPTION, CELL_ALIGN, EMPTY_CELL, HEADER_CELL, LINK_ALIGN, ROW_FILL, SORT_LINK, STICKY_CELL,
} from './classes.js'
import { SORT_ICONS, SORT_LABELS, TABLE_COLUMN_DEFAULTS, TABLE_DEFAULTS } from './constants.js'
import type { TableProps, TableSort, TableSortDirection } from './types.js'

/** A JS caller can pass a direction no list holds: the column reads as unsorted, not a crash. */
const directionOf = (sort: TableSort | undefined, key: string): TableSortDirection | undefined =>
  sort?.key === key && Object.hasOwn(SORT_ICONS, sort.direction) ? sort.direction : undefined

/** A real table in a box that scrolls sideways. Sorting is a link per header, so it costs
 * no JavaScript: the server answers the link with the rows in their new order. */
export function Table<T>({
  items,
  getKey,
  columns,
  caption,
  captionVisible = TABLE_DEFAULTS.captionVisible,
  sort,
  striped = TABLE_DEFAULTS.striped,
  stickyFirstColumn = TABLE_DEFAULTS.stickyFirstColumn,
  emptyFallback,
  labels = en,
  className,
  ...rest
}: TableProps<T>) {
  // R-5.1-1 allows useId: the caption can be any node, so the region is named by reference.
  const captionId = useId()
  const sticks = (index: number) => stickyFirstColumn && index === 0

  // The rest goes first: the role, the name and the tab stop are what keep a scrolling box reachable.
  return (
    <div
      {...rest}
      role="region"
      aria-labelledby={captionId}
      tabIndex={0}
      data-striped={striped ? '' : undefined}
      data-sticky-first-column={stickyFirstColumn ? '' : undefined}
      data-empty={items.length === 0 ? '' : undefined}
      className={cn('overflow-x-auto rounded-box bg-surface-raised', BORDER, FOCUS_RING, className)}
    >
      {/* border-separate: under border-collapse the table paints the lines, and a sticky cell leaves its own behind. */}
      <table className="w-full border-separate border-spacing-0">
        <caption id={captionId} className={captionVisible ? CAPTION.visible : CAPTION.hidden}>{caption}</caption>
        <thead>
          <tr>
            {columns.map((column, index) => {
              const align = column.align ?? TABLE_COLUMN_DEFAULTS.align
              const direction = directionOf(sort, column.key)
              // aria-sort is not read out everywhere, so the caret carries the same words.
              const content = (
                <>
                  {column.header}
                  {direction === undefined ? null : (
                    <Svg icon={SORT_ICONS[direction]} label={labels.table[SORT_LABELS[direction]]} flipRtl={false} className="ms-1" />
                  )}
                </>
              )
              return (
                <th
                  key={column.key}
                  scope="col"
                  aria-sort={direction}
                  className={cn(HEADER_CELL, CELL_ALIGN[align], sticks(index) && STICKY_CELL)}
                >
                  {column.sortHref === undefined ? content : (
                    <a href={column.sortHref} className={cn(SORT_LINK, LINK_ALIGN[align])}>
                      <span className="sr-only">{`${labels.table.sortBy} `}</span>
                      {content}
                    </a>
                  )}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={Math.max(columns.length, 1)} className={EMPTY_CELL}>
                {emptyFallback ?? labels.state.empty}
              </td>
            </tr>
          ) : items.map((item, row) => {
            const tinted = striped && row % 2 === 1
            const fill = tinted ? ROW_FILL.striped : ROW_FILL.plain
            return (
              <tr key={getKey(item)} className={tinted ? fill : undefined}>
                {columns.map((column, index) => (
                  <td
                    key={column.key}
                    className={cn(
                      BODY_CELL,
                      CELL_ALIGN[column.align ?? TABLE_COLUMN_DEFAULTS.align],
                      // Its own fill: a sticky cell with none lets the columns scrolling under it show through.
                      sticks(index) && STICKY_CELL,
                      sticks(index) && fill,
                    )}
                  >
                    {column.cell(item)}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export type {
  TableAlign, TableColumn, TableDesignProps, TableProps, TableSort, TableSortDirection,
} from './types.js'
