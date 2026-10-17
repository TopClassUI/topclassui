// R-8.3-1: zod lives here only, and components import this file with `import type`.
import { z } from 'zod'

import { FIELD_DEFAULTS } from './constants.js'

// R-8.3-3: .meta() is last in each chain, or zod drops it from the JSON Schema output.
export const fieldSchema = z.object({
  required: z.boolean().default(FIELD_DEFAULTS.required)
    .meta({ description: 'Passes required to the control, which tells a screen reader, and shows an asterisk that is only seen.' }),
  inline: z.boolean().default(FIELD_DEFAULTS.inline)
    .meta({ description: 'The control first and the label beside it, the hint and the error under the label: for a Checkbox or a Switch.' }),
  invalid: z.boolean().optional()
    .meta({ description: 'Sets aria-invalid on the control. Without it, true when error holds a message and false when it holds none.' }),
})

export type FieldSchemaInput = z.input<typeof fieldSchema>
