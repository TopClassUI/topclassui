// R-8.3-1: zod lives here only, and components import this file with `import type`.
import { z } from 'zod'

import { sizeSchema } from '#shared/contracts/size.schema.js'
import { BADGE_DEFAULTS, BADGE_TONES, BADGE_VARIANTS } from './constants.js'

// R-8.3-3: .meta() is last in each chain, or zod drops it from the JSON Schema output.
export const badgeSchema = z.object({
  variant: z.enum(BADGE_VARIANTS).default(BADGE_DEFAULTS.variant)
    .meta({ description: 'How loudly the badge stands out: a fill, a tint or an outline.' }),
  tone: z.enum(BADGE_TONES).default(BADGE_DEFAULTS.tone)
    .meta({ description: 'The meaning it signals, which picks its colour ramp.' }),
  size: sizeSchema.default(BADGE_DEFAULTS.size)
    .meta({ description: 'The shared size scale; custom emits no size classes.' }),
})

export type BadgeSchemaInput = z.input<typeof badgeSchema>
