// R-8.3-1: zod lives here only, and components import this file with `import type`.
import { z } from 'zod'

import { sizeSchema } from '#shared/contracts/size.schema.js'
import { SPINNER_DEFAULTS, SPINNER_TONES } from './constants.js'

// R-8.3-3: .meta() is last in each chain, or zod drops it from the JSON Schema output.
export const spinnerSchema = z.object({
  size: sizeSchema.default(SPINNER_DEFAULTS.size)
    .meta({ description: 'The icon scale, 16 to 40 px; custom sets no size, so it follows the text at 1em.' }),
  tone: z.enum(SPINNER_TONES).default(SPINNER_DEFAULTS.tone)
    .meta({ description: 'The colour ramp it draws in; className="text-current" takes the text colour instead.' }),
})

export type SpinnerSchemaInput = z.input<typeof spinnerSchema>
