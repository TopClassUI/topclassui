// R-8.3-1: zod lives here only, and components import this file with `import type`.
import { z } from 'zod'

import { sizeSchema } from '#shared/contracts/size.schema.js'
import { DIALOG_DEFAULTS } from './constants.js'

// R-8.3-3: .meta() is last in each chain, or zod drops it from the JSON Schema output.
export const dialogSchema = z.object({
  size: sizeSchema.default(DIALOG_DEFAULTS.size)
    .meta({ description: 'DialogPopup: the widest it grows, 320 to 640 px; custom sets no width.' }),
  closeButton: z.boolean().default(DIALOG_DEFAULTS.closeButton)
    .meta({ description: 'DialogHeader: whether it ends with the built-in close button.' }),
})

export type DialogSchemaInput = z.input<typeof dialogSchema>
