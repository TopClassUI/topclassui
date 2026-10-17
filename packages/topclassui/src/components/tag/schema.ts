// R-8.3-1: zod lives here only, and components import this file with `import type`.
import { z } from 'zod'

import { sizeSchema } from '#shared/contracts/size.schema.js'
import { TAG_DEFAULTS, TAG_TONES } from './constants.js'

// R-8.3-3: .meta() is last in each chain, or zod drops it from the JSON Schema output.
export const tagSchema = z.object({
  tone: z.enum(TAG_TONES).default(TAG_DEFAULTS.tone)
    .meta({ description: 'The meaning it signals, which picks the soft tint and its label colour.' }),
  size: sizeSchema.default(TAG_DEFAULTS.size)
    .meta({ description: 'The shared size scale; custom emits no size classes.' }),
})

export type TagSchemaInput = z.input<typeof tagSchema>
