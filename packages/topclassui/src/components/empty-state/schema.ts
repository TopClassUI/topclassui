// R-8.3-1: zod lives here only, and components import this file with `import type`.
import { z } from 'zod'

import { EMPTY_STATE_DEFAULTS } from './constants.js'

// R-8.3-3: .meta() is last in each chain, and every field needs one for the props table.
export const emptyStateSchema = z.object({
  compact: z.boolean().default(EMPTY_STATE_DEFAULTS.compact)
    .meta({ description: 'The tight form the previewer\'s states strip draws: a 24 px icon, half the padding and the next type step down.' }),
  bordered: z.boolean().default(EMPTY_STATE_DEFAULTS.bordered)
    .meta({ description: 'The dashed box on the page\'s surface; false draws the icon and the words bare, with no padding, for a cell that is already a box.' }),
})

export type EmptyStateSchemaInput = z.input<typeof emptyStateSchema>
