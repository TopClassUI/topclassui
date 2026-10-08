// R-8.3-1: zod lives here only, and components import this file with `import type`.
import { z } from 'zod'

import { SEPARATOR_DEFAULTS, SEPARATOR_ORIENTATIONS } from './constants.js'

// R-8.3-3: .meta() is last in each chain, or zod drops it from the JSON Schema output.
export const separatorSchema = z.object({
  orientation: z.enum(SEPARATOR_ORIENTATIONS).default(SEPARATOR_DEFAULTS.orientation)
    .meta({ description: 'Which way the line runs: across its container, or down the height of a flex row.' }),
  decorative: z.boolean().default(SEPARATOR_DEFAULTS.decorative)
    .meta({ description: 'Keeps the line out of the accessibility tree; false announces it as a separator.' }),
})

export type SeparatorSchemaInput = z.input<typeof separatorSchema>
