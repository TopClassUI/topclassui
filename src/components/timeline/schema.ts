// R-8.3-1: zod lives here only, and components import this file with `import type`.
import { z } from 'zod'

import { TIMELINE_BOUNDARIES } from './boundaries.js'
import { TIMELINE_SKELETON_DEFAULTS } from './constants.js'

// R-8.3-3: .meta() is last in each chain, or zod drops it from the JSON Schema output.
/** R-5.7-7: the one count of TimelineSkeleton, bounded here and clamped where it is read. */
export const timelineSkeletonSchema = z.object({
  rows: z.number().int().min(TIMELINE_BOUNDARIES.skeletonRowsMin).max(TIMELINE_BOUNDARIES.skeletonRowsMax)
    .default(TIMELINE_SKELETON_DEFAULTS.rows)
    .meta({ description: 'How many events the placeholder holds, clamped to the bounds: pass the count you expect.' }),
})

export type TimelineSkeletonSchemaInput = z.input<typeof timelineSkeletonSchema>
