'use client'

import { cn } from '#shared/cn.js'
import { ROW, ROW_FILL, SPACER } from './classes.js'
import { useTableRows } from './hook.js'
import type { TableRowsProps } from './types.js'

/** The body of a Table, in the browser: the rows windowing mounts, each cell as the server rendered it, a spacer for
 * the rows above and below, and the row's place in the whole table for a screen reader. */
export function TableRows(props: TableRowsProps) {
  const body = useTableRows(props)
  const spacer = (edge: 'start' | 'end') => (
    <tr aria-hidden="true">
      <td colSpan={props.columns.length} className={SPACER[edge]} />
    </tr>
  )
  return (
    <tbody ref={body.bodyRef} style={body.style}>
      {body.spacers.start ? spacer('start') : null}
      {body.rows.map(({ item: row, index }) => {
        const tinted = props.striped && index % 2 === 1
        const fill = tinted ? ROW_FILL.striped : ROW_FILL.plain
        return (
          <tr
            key={row.key}
            ref={body.rowRef?.(index)}
            aria-rowindex={index + 2}
            aria-selected={row.selected ? true : undefined}
            data-selected={row.selected ? '' : undefined}
            data-hover={row.hovered ? '' : undefined}
            className={cn(ROW, tinted && fill)}
          >
            {props.columns.map((column, at) => {
              const Cell = column.rowHeader ? 'th' : 'td'
              // Its own fill: a sticky cell with none lets the columns scrolling under it show through.
              return (
                <Cell key={column.key} scope={column.rowHeader ? 'row' : undefined} className={cn(column.className, column.sticky && fill, column.own)}>
                  {row.cells[at]}
                </Cell>
              )
            })}
          </tr>
        )
      })}
      {body.spacers.end ? spacer('end') : null}
    </tbody>
  )
}
