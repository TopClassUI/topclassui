// R-8.3-1: zod lives here only, and components import this file with `import type`.
import { z } from 'zod'

import { SKELETON_BOUNDARIES } from './boundaries.js'
import { SKELETON_DEFAULTS, SKELETON_VARIANTS } from './constants.js'

// R-8.3-3: .meta() is last in each chain, or zod drops it from the JSON Schema output.
export const skeletonSchema = z.object({
  variant: z.enum(SKELETON_VARIANTS).default(SKELETON_DEFAULTS.variant)
    .meta({ description: 'The shape it holds the place of: lines of text, a circle, a rectangle or a card.' }),
  rows: z.number().int().min(SKELETON_BOUNDARIES.rowsMin).max(SKELETON_BOUNDARIES.rowsMax)
    .default(SKELETON_DEFAULTS.rows)
    .meta({ description: 'How many lines the text shape holds, clamped to the bounds; the other shapes ignore it.' }),
})

export type SkeletonSchemaInput = z.input<typeof skeletonSchema>
