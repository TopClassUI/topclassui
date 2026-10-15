// R-8.3-1: zod lives here only, and components import this file with `import type`.
import { z } from 'zod'

import { sizeSchema } from '#shared/contracts/size.schema.js'
import { STEPPER_DEFAULTS } from './constants.js'

// R-8.3-3: .meta() is last in each chain, or zod drops it from the JSON Schema output.
export const stepperSchema = z.object({
  size: sizeSchema.default(STEPPER_DEFAULTS.size)
    .meta({ description: 'The size of the circles (24 to 48 px) and of the titles; custom emits none.' }),
})

export type StepperSchemaInput = z.input<typeof stepperSchema>
