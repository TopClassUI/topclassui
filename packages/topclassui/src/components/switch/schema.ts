// R-8.3-1: zod lives here only, and components import this file with `import type`.
import { z } from 'zod'

import { sizeSchema } from '#shared/contracts/size.schema.js'
import { SWITCH_DEFAULTS } from './constants.js'

// R-8.3-3: .meta() is last in each chain, or zod drops it from the JSON Schema output.
export const switchSchema = z.object({
  size: sizeSchema.default(SWITCH_DEFAULTS.size)
    .meta({ description: 'The toggle scale of the track and its thumb; custom emits no size classes.' }),
  invalid: z.boolean().default(SWITCH_DEFAULTS.invalid)
    .meta({ description: 'Marks the value as wrong: sets aria-invalid, and the line of the track turns to danger and thickens.' }),
})

export type SwitchSchemaInput = z.input<typeof switchSchema>
