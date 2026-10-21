// R-8.3-1: zod lives here only, and components import this file with `import type`.
import { z } from 'zod'

import { COLLECTION_BOUNDARIES } from '#shared/contracts/collection.js'
import { TABLE_BOUNDARIES } from './boundaries.js'
import { TABLE_DEFAULTS, TABLE_DENSITIES, TABLE_SKELETON_DEFAULTS, TABLE_VARIANTS } from './constants.js'

// R-8.3-3: .meta() is last in each chain, or zod drops it from the JSON Schema output.
export const tableSchema = z.object({
  captionVisible: z.boolean().default(TABLE_DEFAULTS.captionVisible)
    .meta({ description: 'Draws the caption above the header row; when false it is still read out, only not drawn.' }),
  density: z.enum(TABLE_DENSITIES).default(TABLE_DEFAULTS.density)
    .meta({ description: 'How tall a row is: comfortable, or compact for a long list read at a glance.' }),
  variant: z.enum(TABLE_VARIANTS).default(TABLE_DEFAULTS.variant)
    .meta({ description: 'outline draws a hairline round the box; plain leaves it out, for a table already inside a card.' }),
  striped: z.boolean().default(TABLE_DEFAULTS.striped)
    .meta({ description: 'Tints every second row, so the eye can follow a wide row across.' }),
  stickyFirstColumn: z.boolean().default(TABLE_DEFAULTS.stickyFirstColumn)
    .meta({ description: 'Keeps the first column in view while the others scroll sideways under it. It is cut with an ellipsis past `--tc-table-sticky-width`.' }),
  visibleRows: z.number().int().min(COLLECTION_BOUNDARIES.visibleRowsMin).max(COLLECTION_BOUNDARIES.visibleRowsMax)
    .default(TABLE_DEFAULTS.visibleRows)
    .meta({ description: 'Body rows the box shows before it scrolls under its sticky header, clamped to 1 to 20; left out, the --tc-list-rows knob.' }),
  virtualize: z.union([z.literal('auto'), z.boolean()]).default(TABLE_DEFAULTS.virtualize)
    .meta({ description: 'Windowing: auto mounts only the rows in view above the provider threshold (200); false keeps every row in the HTML.' }),
  loadMoreThreshold: z.number().int().min(COLLECTION_BOUNDARIES.loadMoreThresholdMin)
    .max(COLLECTION_BOUNDARIES.loadMoreThresholdMax).default(TABLE_DEFAULTS.loadMoreThreshold)
    .meta({ description: 'Rows from the end at which loadMore is called, clamped to 0 to 200.' }),
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
