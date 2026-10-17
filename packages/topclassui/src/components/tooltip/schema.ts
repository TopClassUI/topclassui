// R-8.3-1: zod lives here only, and components import this file with `import type`.
import { z } from 'zod'

import { TOOLTIP_BOUNDARIES } from './boundaries.js'
import { TOOLTIP_DEFAULTS, TOOLTIP_PLACEMENTS } from './constants.js'

const { delayMin, delayMax } = TOOLTIP_BOUNDARIES

// R-8.3-3: .meta() is last in each chain, or zod drops it from the JSON Schema output.
export const tooltipSchema = z.object({
  placement: z.enum(TOOLTIP_PLACEMENTS).default(TOOLTIP_DEFAULTS.placement)
    .meta({ description: 'TooltipPopup: the side and alignment it opens at; start and end mirror in Arabic.' }),
  delay: z.number().min(delayMin).max(delayMax).default(TOOLTIP_DEFAULTS.delay)
    .meta({ description: 'TooltipTrigger: milliseconds of hover before it opens, clamped to the limits.' }),
  closeDelay: z.number().min(delayMin).max(delayMax).default(TOOLTIP_DEFAULTS.closeDelay)
    .meta({ description: 'TooltipTrigger: milliseconds it stays open after the pointer leaves, clamped.' }),
})

export type TooltipSchemaInput = z.input<typeof tooltipSchema>
