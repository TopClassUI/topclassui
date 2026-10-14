// R-8.3-1: zod lives here only, and components import this file with `import type`.
import { z } from 'zod'

import { BANNER_DEFAULTS, BANNER_TONES } from './constants.js'

// R-8.3-3: .meta() is last in each chain, or zod drops it from the JSON Schema output.
export const bannerSchema = z.object({
  tone: z.enum(BANNER_TONES).default(BANNER_DEFAULTS.tone)
    .meta({ description: 'What the message means, which picks the soft fill and the text colour on it.' }),
  dismissible: z.boolean().default(BANNER_DEFAULTS.dismissible)
    .meta({ description: 'Adds an x that hides the banner and remembers it in this browser. Requires `id`.' }),
})

export type BannerSchemaInput = z.input<typeof bannerSchema>
