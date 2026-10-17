// R-8.3-1: zod lives here only, and components import this file with `import type`.
import { z } from 'zod'

import { DROPDOWN_BOUNDARIES } from './boundaries.js'
import { DROPDOWN_DEFAULTS, DROPDOWN_ITEM_TONES, DROPDOWN_PLACEMENTS } from './constants.js'

const { delayMin, delayMax } = DROPDOWN_BOUNDARIES

// R-8.3-3: .meta() is last in each chain, or zod drops it from the JSON Schema output.
export const dropdownSchema = z.object({
  placement: z.enum(DROPDOWN_PLACEMENTS).default(DROPDOWN_DEFAULTS.placement)
    .meta({ description: 'DropdownPopup, DropdownMenu: the side and alignment it opens at; start and end mirror in Arabic.' }),
  tone: z.enum(DROPDOWN_ITEM_TONES).default(DROPDOWN_DEFAULTS.tone)
    .meta({ description: 'DropdownItem, DropdownLinkItem: danger colours a destructive row; its label still has to say so.' }),
  delay: z.number().min(delayMin).max(delayMax).default(DROPDOWN_DEFAULTS.delay)
    .meta({ description: 'DropdownTrigger, with openOnHover: milliseconds of hover before it opens, clamped.' }),
  closeDelay: z.number().min(delayMin).max(delayMax).default(DROPDOWN_DEFAULTS.closeDelay)
    .meta({ description: 'DropdownTrigger, with openOnHover: milliseconds it stays open after the pointer leaves, clamped.' }),
})

export type DropdownSchemaInput = z.input<typeof dropdownSchema>
