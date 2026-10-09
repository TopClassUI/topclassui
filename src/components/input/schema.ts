// R-8.3-1: zod lives here only, and components import this file with `import type`.
import { z } from 'zod'

import { sizeSchema } from '#shared/contracts/size.schema.js'
import { INPUT_DEFAULTS } from './constants.js'

// R-8.3-3: .meta() is last in each chain, or zod drops it from the JSON Schema output.
export const inputSchema = z.object({
  size: sizeSchema.default(INPUT_DEFAULTS.size)
    .meta({ description: 'The shared control scale; custom emits no size classes.' }),
  invalid: z.boolean().default(INPUT_DEFAULTS.invalid)
    .meta({ description: 'Marks the value as wrong: sets aria-invalid and turns the border to danger.' }),
  fullWidth: z.boolean().default(INPUT_DEFAULTS.fullWidth)
    .meta({ description: 'Stretches the input to the width of its container.' }),
})

export type InputSchemaInput = z.input<typeof inputSchema>
