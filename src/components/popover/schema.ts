// R-8.3-1: zod lives here only, and components import this file with `import type`.
import { z } from 'zod'

import { POPOVER_BOUNDARIES } from './boundaries.js'
import { POPOVER_DEFAULTS, POPOVER_PLACEMENTS } from './constants.js'

const { delayMin, delayMax } = POPOVER_BOUNDARIES

// R-8.3-3: .meta() is last in each chain, or zod drops it from the JSON Schema output.
export const popoverSchema = z.object({
  placement: z.enum(POPOVER_PLACEMENTS).default(POPOVER_DEFAULTS.placement)
    .meta({ description: 'PopoverPopup: the side and alignment it opens at; start and end mirror in Arabic.' }),
  delay: z.number().min(delayMin).max(delayMax).default(POPOVER_DEFAULTS.delay)
    .meta({ description: 'PopoverTrigger, with openOnHover: milliseconds of hover before it opens, clamped.' }),
  closeDelay: z.number().min(delayMin).max(delayMax).default(POPOVER_DEFAULTS.closeDelay)
    .meta({ description: 'PopoverTrigger, with openOnHover: milliseconds it stays open after the pointer leaves, clamped.' }),
})

export type PopoverSchemaInput = z.input<typeof popoverSchema>
