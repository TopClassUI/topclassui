// R-8.3-1: zod lives here only, and components import this file with `import type`.
import { z } from 'zod'

import { COLLECTION_BOUNDARIES } from '#shared/contracts/collection.js'
import { TREE_VIEW_DEFAULTS, TREE_VIEW_STATUSES } from './constants.js'

const { visibleRowsMin, visibleRowsMax, loadMoreThresholdMin, loadMoreThresholdMax } = COLLECTION_BOUNDARIES

// R-8.3-3: .meta() is last in each chain, or zod drops it from the JSON Schema output.
export const treeViewSchema = z.object({
  visibleRows: z.number().int().min(visibleRowsMin).max(visibleRowsMax).default(TREE_VIEW_DEFAULTS.visibleRows)
    .meta({ description: 'Rows the tree shows before it scrolls, clamped. Left out, the --tc-list-rows knob applies.' }),
  virtualize: z.union([z.literal('auto'), z.boolean()]).default(TREE_VIEW_DEFAULTS.virtualize)
    .meta({ description: 'auto windows the tree above 200 visible rows; true always, false never.' }),
  loadMoreThreshold: z.number().int().min(loadMoreThresholdMin).max(loadMoreThresholdMax)
    .default(TREE_VIEW_DEFAULTS.loadMoreThreshold)
    .meta({ description: 'How many rows from the end loadMore is called, clamped.' }),
  status: z.enum(TREE_VIEW_STATUSES).default(TREE_VIEW_DEFAULTS.status)
    .meta({ description: 'loading and loading-more mark the tree busy and say so under it; empty says there is nothing.' }),
})

export type TreeViewSchemaInput = z.input<typeof treeViewSchema>
