// R-8.3-1: zod lives here only, and components import this file with `import type`.
import { z } from 'zod'

import { sizeSchema } from '#shared/contracts/size.schema.js'
import { INPUT_DEFAULTS } from './constants.js'

// R-8.3-3: .meta() is last in each chain, or zod drops it from the JSON Schema output.
export const inputSchema = z.object({
  size: sizeSchema.default(INPUT_DEFAULTS.size)
    .meta({ description: 'The shared control scale; custom emits no size classes.' }),
  invalid: z.boolean().default(INPUT_DEFAULTS.invalid)
    .meta({ description: 'Marks the value as wrong: sets aria-invalid, and the border turns to danger and thickens.' }),
  fullWidth: z.boolean().default(INPUT_DEFAULTS.fullWidth)
    .meta({ description: 'Stretches the input to the width of its container.' }),
  validate: z.boolean().default(INPUT_DEFAULTS.validate)
    .meta({ description: 'Holds a pasted or scripted value to maxLength, pattern, min, max and step after hydration, and stops the submit; loads a small client half.' }),
})

export type InputSchemaInput = z.input<typeof inputSchema>
