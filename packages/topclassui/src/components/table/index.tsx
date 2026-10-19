// No 'use client': a client bundle gets it only when a client file imports it.
import { useId } from 'react'

import { Svg } from '#components/svg/index.js'
import { tray } from '#icons/data/tray.js'
import { clamp } from '#shared/clamp.js'
import { FOCUS_RING } from '#shared/classes.js'
import { cn } from '#shared/cn.js'
import { COLLECTION_BOUNDARIES } from '#shared/contracts/collection.js'
import { en } from '#shared/labels/en.js'
import { renderLink } from '#shared/link.js'
// Named here as well, so a consumer program that never compiles shared/ gets the --tc-* keys.
import type {} from '#shared/style-tokens.js'
import {
  BODY_CELL, BOX, BOX_CAP, BOX_VARIANT, CAPTION, CELL_ALIGN, CELL_DENSITY, EMPTY_CELL, EMPTY_ICON, EMPTY_WORDS, FOCUS_ROOM,
  HEAD, HEADER_CELL, HEADER_LABEL, LINK_ALIGN, ROW_HEADER, SORT_ICON, SORT_IDLE, SORT_LINK, STICKY_BOX, STICKY_CELL,
} from './classes.js'
import { TableRows } from './client.js'
import { SORT_ICONS, SORT_ICON_SIZE, SORT_IDLE_ICON, SORT_LABELS, TABLE_COLUMN_DEFAULTS, TABLE_DEFAULTS } from './constants.js'
import { columnsOf, directionOf } from './lib.js'
import type { TableCaption, TableCellMeta, TableProps } from './types.js'

const { visibleRowsMin, visibleRowsMax, loadMoreThresholdMin, loadMoreThresholdMax } = COLLECTION_BOUNDARIES

/** A real table in a box that scrolls both ways under a sticky header. The server runs getKey and every cell; the
 * body windows them in the browser (R-8.5-1). Sorting is a link per header, answered by the server. */
export function Table<T, Caption extends TableCaption = TableCaption>({
  items,
  getKey,
  columns,
  caption,
  captionVisible = TABLE_DEFAULTS.captionVisible,
  sort,
  selectedKeys,
  density = TABLE_DEFAULTS.density,
  variant = TABLE_DEFAULTS.variant,
  striped = TABLE_DEFAULTS.striped,
  stickyFirstColumn = TABLE_DEFAULTS.stickyFirstColumn,
  emptyFallback,
  visibleRows,
  virtualize = TABLE_DEFAULTS.virtualize,
  loadMoreThreshold = TABLE_DEFAULTS.loadMoreThreshold,
  hasMore,
  loadMore,
  link,
  labels = en,
  locale: _locale,
  className,
  ...rest
}: TableProps<T, Caption>) {
  // R-5.1-1 allows useId: the caption can be any node, so the region is named by reference.
  const captionId = useId()
  const shown = columnsOf(columns)
  // No columns is as empty as no items: a row per item with no cell in it shows nothing.
  const empty = items.length === 0 || shown.length === 0
  const sticks = (index: number) => stickyFirstColumn && index === 0
  const cells = shown.map((column, index): TableCellMeta => ({
    key: column.key,
    rowHeader: column.rowHeader === true,
    className: cn(BODY_CELL, CELL_DENSITY[density].body, column.rowHeader && ROW_HEADER, CELL_ALIGN[column.align ?? TABLE_COLUMN_DEFAULTS.align], sticks(index) && STICKY_CELL),
    sticky: sticks(index),
    own: column.className,
  }))
  // Left out, the --tc-list-rows knob applies: React writes no style for an undefined value.
  const rows = visibleRows === undefined ? undefined : clamp(visibleRows, visibleRowsMin, visibleRowsMax)

  // The rest goes first: the role, the name and the tab stop are what keep a scrolling box reachable.
  return (
    <div
      {...rest}
      role="region"
      aria-labelledby={captionId}
      aria-label={undefined}
      tabIndex={shown.length === 0 ? undefined : 0}
      data-density={density}
      data-variant={variant}
      data-striped={striped ? '' : undefined}
      data-sticky-first-column={stickyFirstColumn ? '' : undefined}
      data-empty={empty ? '' : undefined}
      style={{ ...rest.style, '--tc-list-rows': rows }}
      className={cn(BOX, BOX_CAP[density][captionVisible ? 'visible' : 'hidden'], FOCUS_ROOM, BOX_VARIANT[variant], FOCUS_RING, stickyFirstColumn && STICKY_BOX, className)}
    >
      {/* border-separate: under border-collapse the table paints the lines, and a sticky cell leaves its own behind. */}
      {/* ARIA: -1 while more pages may come, as the count of rows is not known yet. */}
      <table aria-rowcount={empty ? undefined : hasMore ? -1 : items.length + 1} className="w-full border-separate border-spacing-0">
        <caption id={captionId} className={captionVisible ? CAPTION.visible : CAPTION.hidden}>{caption}</caption>
        <thead className={HEAD}>
          <tr aria-rowindex={empty ? undefined : 1}>
            {shown.map((column, index) => {
              const align = column.align ?? TABLE_COLUMN_DEFAULTS.align
              const direction = directionOf(sort, column.key)
              const headerId = `${captionId}-h${String(index)}`
              // aria-sort is not read out everywhere, so the mark carries the same words; the idle pair says nothing new.
              const caret = direction === undefined ? column.sortHref === undefined ? null : (
                <Svg icon={SORT_IDLE_ICON} size={SORT_ICON_SIZE} flipRtl={false} className={SORT_IDLE} />
              ) : (
                <Svg icon={SORT_ICONS[direction]} size={SORT_ICON_SIZE} label={labels.table[SORT_LABELS[direction]]} flipRtl={false} className={SORT_ICON} />
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
                  className={cn(HEADER_CELL, CELL_DENSITY[density].header, CELL_ALIGN[align], sticks(index) && STICKY_CELL, column.className)}
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
        {empty ? (
          <tbody>
            <tr>
              <td colSpan={Math.max(shown.length, 1)} className={EMPTY_CELL}>
                <div className={EMPTY_WORDS}>
                  <Svg icon={tray} size={22} className={EMPTY_ICON} />
                  <span>{emptyFallback ?? labels.state.empty}</span>
                </div>
              </td>
            </tr>
          </tbody>
        ) : (
          <TableRows
            rows={items.map((item) => {
              const key = getKey(item)
              return { key, cells: shown.map((column) => column.cell(item)), selected: selectedKeys?.includes(key) === true }
            })}
            columns={cells}
            striped={striped}
            visibleRows={rows}
            virtualize={virtualize}
            hasMore={hasMore}
            loadMore={loadMore}
            loadMoreThreshold={clamp(loadMoreThreshold, loadMoreThresholdMin, loadMoreThresholdMax)}
          />
        )}
      </table>
    </div>
  )
}

export { TableSkeleton } from './skeleton.js'
export type {
  TableAlign, TableCaption, TableColumn, TableColumns, TableDesignProps, TableProps, TableSkeletonDesignProps,
  TableSkeletonProps, TableSort, TableSortDirection,
} from './types.js'
