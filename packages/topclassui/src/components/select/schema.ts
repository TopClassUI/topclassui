// R-8.3-1: zod lives here only, and components import this file with `import type`.
import { z } from 'zod'

import { COLLECTION_BOUNDARIES } from '#shared/contracts/collection.js'
import { sizeSchema } from '#shared/contracts/size.schema.js'
import { SELECT_DEFAULTS, SELECT_PLACEMENTS } from './constants.js'

const { visibleRowsMin, visibleRowsMax, loadMoreThresholdMin, loadMoreThresholdMax } = COLLECTION_BOUNDARIES

// R-8.3-3: .meta() is last in each chain, or zod drops it from the JSON Schema output.
export const selectSchema = z.object({
  size: sizeSchema.default(SELECT_DEFAULTS.size)
    .meta({ description: 'Select: the height, the inline padding and the type step of the trigger, and its width with them; custom emits no size classes.' }),
  invalid: z.boolean().default(SELECT_DEFAULTS.invalid)
    .meta({ description: 'Select: marks the choice as wrong: sets aria-invalid on the trigger, whose line turns to danger and thickens.' }),
  fullWidth: z.boolean().default(SELECT_DEFAULTS.fullWidth)
    .meta({ description: 'Select: the box fills the width of its parent instead of taking the width of an Input.' }),
  placement: z.enum(SELECT_PLACEMENTS).default(SELECT_DEFAULTS.placement)
    .meta({ description: 'Select: the side and alignment the list opens at; start and end mirror in Arabic.' }),
  visibleRows: z.number().min(visibleRowsMin).max(visibleRowsMax).default(SELECT_DEFAULTS.visibleRows)
    .meta({ description: 'Select: rows the list shows before it scrolls, clamped; left out, the --tc-list-rows knob applies.' }),
  loadMoreThreshold: z.number().int().min(loadMoreThresholdMin).max(loadMoreThresholdMax)
    .default(SELECT_DEFAULTS.loadMoreThreshold)
    .meta({ description: 'Select: rows from the end of the open list at which loadMore is called, clamped to 0 to 200.' }),
})

export type SelectSchemaInput = z.input<typeof selectSchema>
