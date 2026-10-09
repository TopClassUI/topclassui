// R-8.3-1: zod lives here only, and components import this file with `import type`.
import { z } from 'zod'

import { TABLE_DEFAULTS } from './constants.js'

// R-8.3-3: .meta() is last in each chain, or zod drops it from the JSON Schema output.
export const tableSchema = z.object({
  captionVisible: z.boolean().default(TABLE_DEFAULTS.captionVisible)
    .meta({ description: 'Draws the caption above the header row; when false it is still read out, only not drawn.' }),
  striped: z.boolean().default(TABLE_DEFAULTS.striped)
    .meta({ description: 'Tints every second row, so the eye can follow a wide row across.' }),
  stickyFirstColumn: z.boolean().default(TABLE_DEFAULTS.stickyFirstColumn)
    .meta({ description: 'Keeps the first column in view while the others scroll sideways under it.' }),
})

export type TableSchemaInput = z.input<typeof tableSchema>
