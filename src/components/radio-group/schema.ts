// R-8.3-1: zod lives here only, and components import this file with `import type`.
import { z } from 'zod'

import { sizeSchema } from '#shared/contracts/size.schema.js'
import { RADIO_GROUP_BOUNDARIES } from './boundaries.js'
import { RADIO_GROUP_DEFAULTS, RADIO_GROUP_ORIENTATIONS, RADIO_GROUP_SKELETON_DEFAULTS } from './constants.js'

// R-8.3-3: .meta() is last in each chain, or zod drops it from the JSON Schema output.
export const radioGroupSchema = z.object({
  size: sizeSchema.default(RADIO_GROUP_DEFAULTS.size)
    .meta({ description: 'RadioGroupRoot: the toggle scale of every circle and the type step of its label; custom emits no size classes.' }),
  orientation: z.enum(RADIO_GROUP_ORIENTATIONS).default(RADIO_GROUP_DEFAULTS.orientation)
    .meta({ description: 'RadioGroupRoot: a column, or a row that wraps. Layout only, written as data-orientation; the arrow keys do not change.' }),
  invalid: z.boolean().default(RADIO_GROUP_DEFAULTS.invalid)
    .meta({ description: 'RadioGroupRoot: marks the choice as wrong: sets aria-invalid on the group, and every circle turns to danger and thickens.' }),
})

export type RadioGroupSchemaInput = z.input<typeof radioGroupSchema>

/** R-5.7-7: the count of RadioGroupSkeleton, bounded here and clamped where it is read. */
export const radioGroupSkeletonSchema = z.object({
  items: z.number().int().min(RADIO_GROUP_BOUNDARIES.skeletonItemsMin).max(RADIO_GROUP_BOUNDARIES.skeletonItemsMax)
    .default(RADIO_GROUP_SKELETON_DEFAULTS.items)
    .meta({ description: 'How many radios the placeholder holds, clamped to the bounds: pass the count of the group it stands in for.' }),
})

export type RadioGroupSkeletonSchemaInput = z.input<typeof radioGroupSkeletonSchema>
