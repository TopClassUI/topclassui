// R-8.3-1: zod lives here only, and components import this file with `import type`.
import { z } from 'zod'

import { sizeSchema } from '#shared/contracts/size.schema.js'
import { SEGMENTED_CONTROL_DEFAULTS } from './constants.js'

// R-8.3-3: .meta() is last in each chain, or zod drops it from the JSON Schema output.
export const segmentedControlSchema = z.object({
  size: sizeSchema.default(SEGMENTED_CONTROL_DEFAULTS.size)
    .meta({ description: 'SegmentedControlRoot: the height of the track and the padding and type step of every segment; custom emits none.' }),
  fullWidth: z.boolean().default(SEGMENTED_CONTROL_DEFAULTS.fullWidth)
    .meta({ description: 'SegmentedControlRoot: the track fills its parent and its segments share it equally. For a few short segments.' }),
  invalid: z.boolean().default(SEGMENTED_CONTROL_DEFAULTS.invalid)
    .meta({ description: 'SegmentedControlRoot: marks the choice as wrong: sets aria-invalid on the track, whose line turns to danger and thickens.' }),
})

export type SegmentedControlSchemaInput = z.input<typeof segmentedControlSchema>
