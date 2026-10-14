// R-8.3-1: zod lives here only, and components import this file with `import type`.
import { z } from 'zod'

import { sizeSchema } from '#shared/contracts/size.schema.js'
import { NUMBER_FIELD_BOUNDARIES as BOUNDS } from './boundaries.js'
import { NUMBER_FIELD_DEFAULTS } from './constants.js'

const limit = z.number().min(BOUNDS.limitMin).max(BOUNDS.limitMax)

// R-8.3-3: .meta() is last in each chain, or zod drops it from the JSON Schema output.
export const numberFieldSchema = z.object({
  size: sizeSchema.default(NUMBER_FIELD_DEFAULTS.size)
    .meta({ description: 'The control scale: the height of the field and its type step; custom emits no size classes.' }),
  invalid: z.boolean().default(NUMBER_FIELD_DEFAULTS.invalid)
    .meta({ description: 'Marks the value as wrong: sets aria-invalid on the input, and the line of the field turns to danger and thickens.' }),
  fullWidth: z.boolean().default(NUMBER_FIELD_DEFAULTS.fullWidth)
    .meta({ description: 'Fills the width of its parent instead of taking the width of an Input.' }),
  min: limit.optional()
    .meta({ description: 'The smallest value. Home goes to it; a default or a value under it is raised to it. Clamped to -1e15.' }),
  max: limit.optional()
    .meta({ description: 'The largest value. End goes to it; a default or a value over it is lowered to it. Clamped to 1e15.' }),
  step: z.union([z.number().min(BOUNDS.stepMin).max(BOUNDS.limitMax), z.literal('any')]).default(NUMBER_FIELD_DEFAULTS.step)
    .meta({ description: 'What an arrow key and a stepper add or take away, and the step the form validates against; any turns that check off.' }),
})

export type NumberFieldSchemaInput = z.input<typeof numberFieldSchema>
