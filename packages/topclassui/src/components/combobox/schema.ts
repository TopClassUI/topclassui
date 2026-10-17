// R-8.3-1: zod lives here only, and components import this file with `import type`.
import { z } from 'zod'

import { TEXT_MAX_LENGTH } from '#shared/contracts/boundaries.js'
import { COLLECTION_BOUNDARIES } from '#shared/contracts/collection.js'
import { sizeSchema } from '#shared/contracts/size.schema.js'
import { COMBOBOX_DEFAULTS, COMBOBOX_PLACEMENTS, COMBOBOX_STATUSES } from './constants.js'

const { visibleRowsMin, visibleRowsMax, loadMoreThresholdMin, loadMoreThresholdMax } = COLLECTION_BOUNDARIES

// R-8.3-3: .meta() is last in each chain, or zod drops it from the JSON Schema output.
export const comboboxSchema = z.object({
  size: sizeSchema.default(COMBOBOX_DEFAULTS.size)
    .meta({ description: 'The height, padding and type step of the input; custom emits no size classes.' }),
  invalid: z.boolean().default(COMBOBOX_DEFAULTS.invalid)
    .meta({ description: 'Marks the value as wrong: sets aria-invalid on the input, whose line turns to danger and thickens.' }),
  fullWidth: z.boolean().default(COMBOBOX_DEFAULTS.fullWidth)
    .meta({ description: 'Fills its parent instead of taking the width of an Input.' }),
  placement: z.enum(COMBOBOX_PLACEMENTS).default(COMBOBOX_DEFAULTS.placement)
    .meta({ description: 'The side and alignment the list opens at; start and end mirror in Arabic.' }),
  visibleRows: z.number().int().min(visibleRowsMin).max(visibleRowsMax).default(COMBOBOX_DEFAULTS.visibleRows)
    .meta({ description: 'Rows the list shows before it scrolls, clamped. Left out, the --tc-list-rows knob applies.' }),
  virtualize: z.union([z.literal('auto'), z.boolean()]).default(COMBOBOX_DEFAULTS.virtualize)
    .meta({ description: 'auto windows the list above 200 options; true always, false never.' }),
  hasMore: z.boolean().default(COMBOBOX_DEFAULTS.hasMore)
    .meta({ description: 'More pages exist, so loadMore is called when the open list nears its end.' }),
  loadMoreThreshold: z.number().int().min(loadMoreThresholdMin).max(loadMoreThresholdMax)
    .default(COMBOBOX_DEFAULTS.loadMoreThreshold)
    .meta({ description: 'How many rows from the end loadMore is called, clamped.' }),
  status: z.enum(COMBOBOX_STATUSES).default(COMBOBOX_DEFAULTS.status)
    .meta({ description: 'loading draws a spinner and, with no options, says so; loading-more says so under the list.' }),
  maxLength: z.number().int().min(0).nullable().default(TEXT_MAX_LENGTH.search)
    .meta({ description: 'The cap on the typed query, 256 by default; null removes it. No counter is drawn.' }),
})

export type ComboboxSchemaInput = z.input<typeof comboboxSchema>
