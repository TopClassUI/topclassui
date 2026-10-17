// R-8.3-1: zod lives here only, and components import this file with `import type`.
import { z } from 'zod'

import { sizeSchema } from '#shared/contracts/size.schema.js'
import { PROGRESS_BOUNDARIES } from './boundaries.js'
import { PROGRESS_DEFAULTS, PROGRESS_TONES } from './constants.js'

// R-8.3-3: .meta() is last in each chain, or zod drops it from the JSON Schema output.
export const progressSchema = z.object({
  value: z.number().min(PROGRESS_BOUNDARIES.valueMin).max(PROGRESS_BOUNDARIES.valueMax)
    .default(PROGRESS_DEFAULTS.value)
    .meta({ description: 'How far along, as a percentage; anything outside 0-100 is clamped.' }),
  tone: z.enum(PROGRESS_TONES).default(PROGRESS_DEFAULTS.tone)
    .meta({ description: 'The colour of the bar; the track stays neutral in every tone.' }),
  size: sizeSchema.default(PROGRESS_DEFAULTS.size)
    .meta({ description: 'The shared size scale, which sets the track height; custom emits none.' }),
  indeterminate: z.boolean().default(PROGRESS_DEFAULTS.indeterminate)
    .meta({ description: 'For a wait of unknown length: no value is announced and a short bar pulses.' }),
})

export type ProgressSchemaInput = z.input<typeof progressSchema>
