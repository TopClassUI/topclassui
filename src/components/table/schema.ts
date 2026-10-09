// R-8.3-1: zod lives here only, and components import this file with `import type`.
import { z } from 'zod'

import { TABLE_BOUNDARIES } from './boundaries.js'
import { TABLE_DEFAULTS, TABLE_SKELETON_DEFAULTS } from './constants.js'

// R-8.3-3: .meta() is last in each chain, or zod drops it from the JSON Schema output.
export const tableSchema = z.object({
  captionVisible: z.boolean().default(TABLE_DEFAULTS.captionVisible)
    .meta({ description: 'Draws the caption above the header row; when false it is still read out, only not drawn.' }),
  striped: z.boolean().default(TABLE_DEFAULTS.striped)
    .meta({ description: 'Tints every second row, so the eye can follow a wide row across.' }),
  stickyFirstColumn: z.boolean().default(TABLE_DEFAULTS.stickyFirstColumn)
    .meta({ description: 'Keeps the first column in view while the others scroll sideways under it. It is cut with an ellipsis past `--tc-table-sticky-width`.' }),
})

export type TableSchemaInput = z.input<typeof tableSchema>

/** R-5.7-7: the two counts of TableSkeleton, bounded here and clamped where they are read. */
export const tableSkeletonSchema = z.object({
  rows: z.number().int().min(TABLE_BOUNDARIES.skeletonRowsMin).max(TABLE_BOUNDARIES.skeletonRowsMax)
    .default(TABLE_SKELETON_DEFAULTS.rows)
    .meta({ description: 'How many body rows the placeholder holds, clamped to the bounds: pass the page size you expect.' }),
  columns: z.number().int().min(TABLE_BOUNDARIES.skeletonColumnsMin).max(TABLE_BOUNDARIES.skeletonColumnsMax)
    .default(TABLE_SKELETON_DEFAULTS.columns)
    .meta({ description: 'How many columns the placeholder holds, clamped to the bounds.' }),
})

export type TableSkeletonSchemaInput = z.input<typeof tableSkeletonSchema>
