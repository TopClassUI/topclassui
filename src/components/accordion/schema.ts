// R-8.3-1: zod lives here only, and components import this file with `import type`.
import { z } from 'zod'

import { ACCORDION_BOUNDARIES } from './boundaries.js'
import { ACCORDION_DEFAULTS, ACCORDION_SKELETON_DEFAULTS } from './constants.js'

const { headingLevelMin, headingLevelMax, skeletonItemsMin, skeletonItemsMax } = ACCORDION_BOUNDARIES

// R-8.3-3: .meta() is last in each chain, or zod drops it from the JSON Schema output.
export const accordionSchema = z.object({
  hiddenUntilFound: z.boolean().default(ACCORDION_DEFAULTS.hiddenUntilFound)
    .meta({ description: 'AccordionRoot: closed panels stay in the HTML, where find-in-page and a crawler read them.' }),
  headingLevel: z.number().int().min(headingLevelMin).max(headingLevelMax).default(ACCORDION_DEFAULTS.headingLevel)
    .meta({ description: 'AccordionItem: the level of the heading its trigger sits in, clamped to h2 through h6.' }),
  items: z.number().int().min(skeletonItemsMin).max(skeletonItemsMax).default(ACCORDION_SKELETON_DEFAULTS.items)
    .meta({ description: 'AccordionSkeleton: how many closed items the placeholder holds, clamped to 1 and 100.' }),
})

export type AccordionSchemaInput = z.input<typeof accordionSchema>
