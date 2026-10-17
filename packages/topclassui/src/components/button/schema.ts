// R-8.3-1: zod lives here only, and components import this file with `import type`.
import { z } from 'zod'

import { sizeSchema } from '#shared/contracts/size.schema.js'
import { BUTTON_DEFAULTS, BUTTON_TONES, BUTTON_VARIANTS } from './constants.js'

// R-8.3-3: .meta() is last in each chain, or zod drops it from the JSON Schema output.
export const buttonSchema = z.object({
  variant: z.enum(BUTTON_VARIANTS).default(BUTTON_DEFAULTS.variant)
    .meta({ description: 'How much weight the button carries on the page.' }),
  tone: z.enum(BUTTON_TONES).default(BUTTON_DEFAULTS.tone)
    .meta({ description: 'The meaning it signals, which picks its colour ramp.' }),
  size: sizeSchema.default(BUTTON_DEFAULTS.size)
    .meta({ description: 'The shared control scale; custom emits no size classes.' }),
  loading: z.boolean().default(BUTTON_DEFAULTS.loading)
    .meta({ description: 'Shows a spinner, marks the button busy and blocks clicks.' }),
  fullWidth: z.boolean().default(BUTTON_DEFAULTS.fullWidth)
    .meta({ description: 'Stretches the button to the width of its container.' }),
})

export type ButtonSchemaInput = z.input<typeof buttonSchema>
