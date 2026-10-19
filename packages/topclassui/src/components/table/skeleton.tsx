import { clamp } from '#shared/clamp.js'
import { cn } from '#shared/cn.js'
import { TABLE_BOUNDARIES } from './boundaries.js'
import { BODY_CELL, BOX_VARIANT, CAPTION, CELL_DENSITY, HEADER_CELL, SKELETON_BAR, SKELETON_BOX, SKELETON_WIDTH } from './classes.js'
import { TABLE_DEFAULTS, TABLE_SKELETON_DEFAULTS } from './constants.js'
import type { TableSkeletonProps } from './types.js'

/** Holds a table's place while its rows load. It is the table's own box and cells around
 * lines of nothing, so the rows stream in without moving the page (PLAN 8.2). */
export function TableSkeleton({
  rows = TABLE_SKELETON_DEFAULTS.rows,
  columns = TABLE_SKELETON_DEFAULTS.columns,
  captionVisible = TABLE_DEFAULTS.captionVisible,
  density = TABLE_DEFAULTS.density,
  variant = TABLE_DEFAULTS.variant,
  className,
  ...rest
}: TableSkeletonProps) {
  // R-5.7-7; trunc too, or rows={2.5} asks for half a row.
  const rowCount = Math.trunc(clamp(rows, TABLE_BOUNDARIES.skeletonRowsMin, TABLE_BOUNDARIES.skeletonRowsMax))
  const columnCount = Math.trunc(clamp(columns, TABLE_BOUNDARIES.skeletonColumnsMin, TABLE_BOUNDARIES.skeletonColumnsMax))
  const cells = Array.from({ length: columnCount }, (_, column) => column)

  return (
    <div className={cn(SKELETON_BOX, BOX_VARIANT[variant], className)} {...rest} aria-hidden>
      <table className="w-full border-separate border-spacing-0">
        {captionVisible ? (
          <caption className={CAPTION.visible}>
            <span className={cn(SKELETON_BAR, SKELETON_WIDTH.cell)} />
          </caption>
        ) : null}
        <thead>
          <tr>
            {cells.map((column) => (
              <th key={column} className={cn(HEADER_CELL, CELL_DENSITY[density].header)}>
                <span className={cn(SKELETON_BAR, SKELETON_WIDTH.header)} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rowCount }, (_, row) => (
            <tr key={row}>
              {cells.map((column) => (
                <td key={column} className={cn(BODY_CELL, CELL_DENSITY[density].body)}>
                  <span className={cn(SKELETON_BAR, SKELETON_WIDTH.cell)} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
