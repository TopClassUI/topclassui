// R-8.3-1: zod lives here only, and components import this file with `import type`.
import { z } from 'zod'

import { sizeSchema } from '#shared/contracts/size.schema.js'
import { METER_BOUNDARIES } from './boundaries.js'
import { METER_DEFAULTS, METER_TONES } from './constants.js'

const { limitMin, limitMax } = METER_BOUNDARIES

// R-8.3-3: .meta() is last in each chain, or zod drops it from the JSON Schema output.
export const meterSchema = z.object({
  value: z.number().min(limitMin).max(limitMax).default(METER_DEFAULTS.value)
    .meta({ description: 'The reading, clamped between min and max before it reaches ARIA or the bar.' }),
  min: z.number().min(limitMin).max(limitMax).default(METER_DEFAULTS.min)
    .meta({ description: 'The low end of the range, where the track is empty.' }),
  max: z.number().min(limitMin).max(limitMax).default(METER_DEFAULTS.max)
    .meta({ description: 'The high end of the range, where the track is full; raised to min when below it.' }),
  tone: z.enum(METER_TONES).default(METER_DEFAULTS.tone)
    .meta({ description: 'The colour of the bar; the track stays neutral in every tone.' }),
  size: sizeSchema.default(METER_DEFAULTS.size)
    .meta({ description: 'The shared size scale, which sets the track height; custom emits none.' }),
})

export type MeterSchemaInput = z.input<typeof meterSchema>
