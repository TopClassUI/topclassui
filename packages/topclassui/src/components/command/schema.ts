// R-8.3-1: zod lives here only, and components import this file with `import type`.
import { z } from 'zod'

import { COLLECTION_BOUNDARIES } from '#shared/contracts/collection.js'
import { COMMAND_BOUNDARIES } from './boundaries.js'
import { COMMAND_DEFAULTS } from './constants.js'

// R-8.3-3: .meta() is last in each chain, or zod drops it from the JSON Schema output.
export const commandSchema = z.object({
  visibleRows: z.number().int().min(COMMAND_BOUNDARIES.visibleRowsMin).max(COMMAND_BOUNDARIES.visibleRowsMax)
    .default(COMMAND_DEFAULTS.visibleRows)
    .meta({ description: 'Rows the list shows before it scrolls, clamped to 1 to 100; left out, the --tc-list-rows knob.' }),
  loadMoreThreshold: z.number().int().min(COLLECTION_BOUNDARIES.loadMoreThresholdMin)
    .max(COLLECTION_BOUNDARIES.loadMoreThresholdMax).default(COMMAND_DEFAULTS.loadMoreThreshold)
    .meta({ description: 'Rows from the end at which loadMore is called, clamped to 0 to 200.' }),
  virtualize: z.union([z.literal('auto'), z.boolean()]).default(COMMAND_DEFAULTS.virtualize)
    .meta({ description: 'Windowing: auto mounts only the rows in view above the provider threshold (200).' }),
  shortcut: z.string().min(1).nullable().default(COMMAND_DEFAULTS.shortcut)
    .meta({ description: 'The key that opens it with Ctrl or Cmd, wherever focus is; null for none.' }),
  defaultOpen: z.boolean().default(COMMAND_DEFAULTS.defaultOpen)
    .meta({ description: 'Whether it starts open, when open is not controlled.' }),
})

export type CommandSchemaInput = z.input<typeof commandSchema>
