// R-8.3-1: zod lives here only, and components import this file with `import type`.
import { z } from 'zod'

import { sizeSchema } from '#shared/contracts/size.schema.js'
import { RATING_BOUNDARIES } from './boundaries.js'
import { RATING_DEFAULTS } from './constants.js'

// R-8.3-3: .meta() is last in each chain, or zod drops it from the JSON Schema output.
export const ratingSchema = z.object({
  value: z.number().min(0).max(RATING_BOUNDARIES.maxMax).default(RATING_DEFAULTS.value)
    .meta({ description: 'The rating shown, clamped to 0 and max. Read-only, it is drawn to the nearest half; editing, it is the checked step, and passing it makes the rating controlled.' }),
  max: z.number().int().min(RATING_BOUNDARIES.maxMin).max(RATING_BOUNDARIES.maxMax).default(RATING_DEFAULTS.max)
    .meta({ description: 'How many stars, rounded and clamped to 1-10.' }),
  size: sizeSchema.default(RATING_DEFAULTS.size)
    .meta({ description: 'The star, from the icon scale: 16, 20, 24, 32 or 40 px. custom draws it at 1em, so it follows your font size.' }),
  readOnly: z.boolean().default(RATING_DEFAULTS.readOnly)
    .meta({ description: 'true renders stars on the server and ships no script. false renders a radio group, which hydrates.' }),
  defaultValue: z.number().min(0).max(RATING_BOUNDARIES.maxMax).default(RATING_DEFAULTS.value)
    .meta({ description: 'Editing only: the step checked at first when value is not passed, rounded to a whole star. 0 checks none.' }),
  disabled: z.boolean().default(RATING_DEFAULTS.disabled)
    .meta({ description: 'Editing only: every radio is disabled, so it takes no key, no click and is not submitted.' }),
})

export type RatingSchemaInput = z.input<typeof ratingSchema>
