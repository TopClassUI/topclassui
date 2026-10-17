// R-8.3-1: zod lives here only, and components import this file with `import type`.
import { z } from 'zod'

import { sizeSchema } from '#shared/contracts/size.schema.js'
import { CHECKBOX_DEFAULTS } from './constants.js'

// R-8.3-3: .meta() is last in each chain, or zod drops it from the JSON Schema output.
export const checkboxSchema = z.object({
  size: sizeSchema.default(CHECKBOX_DEFAULTS.size)
    .meta({ description: 'The toggle scale of the drawn box and its mark; custom emits no size classes.' }),
  invalid: z.boolean().default(CHECKBOX_DEFAULTS.invalid)
    .meta({ description: 'Marks the value as wrong: sets aria-invalid, and the line of the box turns to danger and thickens.' }),
})

export type CheckboxSchemaInput = z.input<typeof checkboxSchema>
