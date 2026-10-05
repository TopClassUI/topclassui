// R-8.3-1: zod lives here only, and components import this file with `import type`.
import { z } from 'zod'

import { SIZES } from '#shared/contracts/size.js'
import { BUTTON_DEFAULTS, BUTTON_TONES, BUTTON_VARIANTS } from './constants.js'

export const buttonSchema = z.object({
  variant: z.enum(BUTTON_VARIANTS).default(BUTTON_DEFAULTS.variant),
  tone: z.enum(BUTTON_TONES).default(BUTTON_DEFAULTS.tone),
  size: z.enum(SIZES).default(BUTTON_DEFAULTS.size),
  loading: z.boolean().default(BUTTON_DEFAULTS.loading),
  fullWidth: z.boolean().default(BUTTON_DEFAULTS.fullWidth),
})

export type ButtonSchemaInput = z.input<typeof buttonSchema>
