// No 'use client': a client bundle gets it only when a client file imports it.
import { useId } from 'react'

import { Svg } from '#components/svg/index.js'
import { BORDER, FOCUS_RING } from '#shared/classes.js'
import { cn } from '#shared/cn.js'
import { en } from '#shared/labels/en.js'
import { renderLink } from '#shared/link.js'
// Named here as well, so a consumer program that never compiles shared/ gets the --tc-* keys.
import type {} from '#shared/style-tokens.js'
import {
  BODY_CELL, BOX, CAPTION, CELL_ALIGN, EMPTY_CELL, EMPTY_WORDS, HEADER_CELL, HEADER_LABEL, LINK_ALIGN,
  ROW_FILL, ROW_HEADER, SORT_LINK, STICKY_BOX, STICKY_CELL,
} from './classes.js'
import { SORT_ICONS, SORT_LABELS, TABLE_COLUMN_DEFAULTS, TABLE_DEFAULTS } from './constants.js'
import { columnsOf, directionOf } from './lib.js'
import type { TableCaption, TableProps } from './types.js'

/** A real table in a box that scrolls sideways. Sorting is a link per header, so it costs
 * no JavaScript: the server answers the link with the rows in their new order. */
export function Table<T, Caption extends TableCaption = TableCaption>({
  items,
  getKey,
  columns,
  caption,
  captionVisible = TABLE_DEFAULTS.captionVisible,
  sort,
  striped = TABLE_DEFAULTS.striped,
  stickyFirstColumn = TABLE_DEFAULTS.stickyFirstColumn,
  emptyFallback,
  link,
  labels = en,
  className,
  ...rest
}: TableProps<T, Caption>) {
  // R-5.1-1 allows useId: the caption can be any node, so the region is named by reference.
  const captionId = useId()
  const shown = columnsOf(columns)
  // No columns is as empty as no items: a row per item with no cell in it shows nothing.
  const empty = items.length === 0 || shown.length === 0
  const sticks = (index: number) => stickyFirstColumn && index === 0

  // The rest goes first: the role, the name and the tab stop are what keep a scrolling box reachable.
  return (
    <div
      {...rest}
      role="region"
      aria-labelledby={captionId}
      aria-label={undefined}
      tabIndex={shown.length === 0 ? undefined : 0}
      data-striped={striped ? '' : undefined}
      data-sticky-first-column={stickyFirstColumn ? '' : undefined}
      data-empty={empty ? '' : undefined}
      className={cn(BOX, BORDER, FOCUS_RING, stickyFirstColumn && STICKY_BOX, className)}
    >
      {/* border-separate: under border-collapse the table paints the lines, and a sticky cell leaves its own behind. */}
      <table className="w-full border-separate border-spacing-0">
        <caption id={captionId} className={captionVisible ? CAPTION.visible : CAPTION.hidden}>{caption}</caption>
        <thead>
          <tr>
            {shown.map((column, index) => {
              const align = column.align ?? TABLE_COLUMN_DEFAULTS.align
              const direction = directionOf(sort, column.key)
              const headerId = `${captionId}-h${String(index)}`
              // aria-sort is not read out everywhere, so the caret carries the same words.
              const caret = direction === undefined ? null : (
                <Svg icon={SORT_ICONS[direction]} label={labels.table[SORT_LABELS[direction]]} flipRtl={false} className="ms-1" />
              )
              // A header is read out with every cell under it, so "Sort by" and the caret stay out of its name.
              const plain = column.sortHref === undefined && direction === undefined
              const header = plain ? column.header : <span id={headerId} className={HEADER_LABEL}>{column.header}</span>
              return (
                <th
                  key={column.key}
                  scope="col"
                  aria-sort={direction}
                  aria-labelledby={plain ? undefined : headerId}
                  className={cn(HEADER_CELL, CELL_ALIGN[align], sticks(index) && STICKY_CELL, column.className)}
                >
                  {column.sortHref === undefined ? <>{header}{caret}</> : renderLink('Table', link, column.sortHref, {
                    className: cn(SORT_LINK, LINK_ALIGN[align]),
                    children: (
                      <>
                        <span className="sr-only">{`${labels.table.sortBy} `}</span>
                        {header}
                        {caret}
                      </>
                    ),
                  })}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {empty ? (
            <tr>
              <td colSpan={Math.max(shown.length, 1)} className={EMPTY_CELL}>
                <div className={EMPTY_WORDS}>{emptyFallback ?? labels.state.empty}</div>
              </td>
            </tr>
          ) : items.map((item, row) => {
            const tinted = striped && row % 2 === 1
            const fill = tinted ? ROW_FILL.striped : ROW_FILL.plain
            return (
              <tr key={getKey(item)} className={tinted ? fill : undefined}>
                {shown.map((column, index) => {
                  const Cell = column.rowHeader ? 'th' : 'td'
                  return (
                    <Cell
                      key={column.key}
                      scope={column.rowHeader ? 'row' : undefined}
                      className={cn(
                        BODY_CELL,
                        column.rowHeader && ROW_HEADER,
                        CELL_ALIGN[column.align ?? TABLE_COLUMN_DEFAULTS.align],
                        // Its own fill: a sticky cell with none lets the columns scrolling under it show through.
                        sticks(index) && STICKY_CELL,
                        sticks(index) && fill,
                        column.className,
                      )}
                    >
                      {column.cell(item)}
                    </Cell>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export { TableSkeleton } from './skeleton.js'
export type {
  TableAlign, TableCaption, TableColumn, TableColumns, TableDesignProps, TableProps, TableSkeletonDesignProps,
  TableSkeletonProps, TableSort, TableSortDirection,
} from './types.js'
