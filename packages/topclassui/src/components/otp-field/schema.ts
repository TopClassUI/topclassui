// R-8.3-1: zod lives here only, and components import this file with `import type`.
import { z } from 'zod'

import { sizeSchema } from '#shared/contracts/size.schema.js'
import { OTP_FIELD_BOUNDARIES } from './boundaries.js'
import { OTP_FIELD_DEFAULTS, OTP_FIELD_VALIDATION_TYPES } from './constants.js'

const { lengthMin, lengthMax, groupSizeMin } = OTP_FIELD_BOUNDARIES

// R-8.3-3: .meta() is last in each chain, or zod drops it from the JSON Schema output.
export const otpFieldSchema = z.object({
  length: z.number().int().min(lengthMin).max(lengthMax).default(OTP_FIELD_DEFAULTS.length)
    .meta({ description: 'The number of cells, one character each. Clamped between 1 and 12; past eight items the row wraps.' }),
  size: sizeSchema.default(OTP_FIELD_DEFAULTS.size)
    .meta({ description: 'The control scale of each square cell and its type step; custom emits no size classes.' }),
  invalid: z.boolean().default(OTP_FIELD_DEFAULTS.invalid)
    .meta({ description: 'Marks the code as wrong: sets aria-invalid on every cell, whose line turns to danger and thickens.' }),
  groupSize: z.number().int().min(groupSizeMin).max(lengthMax).default(OTP_FIELD_DEFAULTS.groupSize)
    .meta({ description: 'Draws a separator after every this many cells; 0 draws none. Clamped between 0 and length.' }),
  validationType: z.enum(OTP_FIELD_VALIDATION_TYPES).default(OTP_FIELD_DEFAULTS.validationType)
    .meta({ description: 'The characters a cell keeps: numeric takes Arabic-Indic and Persian digits too; none keeps any.' }),
})

export type OtpFieldSchemaInput = z.input<typeof otpFieldSchema>
