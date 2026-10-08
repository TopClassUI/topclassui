// R-8.3-1: zod lives here only, and components import this file with `import type`.
import { z } from 'zod'

import { ALERT_DEFAULTS, ALERT_TONES, ALERT_VARIANTS } from './constants.js'

// R-8.3-3: .meta() is last in each chain, or zod drops it from the JSON Schema output.
export const alertSchema = z.object({
  variant: z.enum(ALERT_VARIANTS).default(ALERT_DEFAULTS.variant)
    .meta({ description: 'How much weight the alert carries on the page: a tint, a fill or an outline.' }),
  tone: z.enum(ALERT_TONES).default(ALERT_DEFAULTS.tone)
    .meta({ description: 'What the message means, which picks its colour ramp and its default icon.' }),
})

export type AlertSchemaInput = z.input<typeof alertSchema>
