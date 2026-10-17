// R-8.3-1: zod lives here only, and components import this file with `import type`.
import { z } from 'zod'

import { sizeSchema } from '#shared/contracts/size.schema.js'
import { TABS_BOUNDARIES } from './boundaries.js'
import { TABS_DEFAULTS, TABS_SKELETON_DEFAULTS, TABS_VARIANTS } from './constants.js'

// R-8.3-3: .meta() is last in each chain, or zod drops it from the JSON Schema output.
export const tabsSchema = z.object({
  variant: z.enum(TABS_VARIANTS).default(TABS_DEFAULTS.variant)
    .meta({ description: 'TabsRoot: line underlines the active tab, enclosed lifts it onto a raised surface.' }),
  size: sizeSchema.default(TABS_DEFAULTS.size)
    .meta({ description: 'TabsRoot: the height, padding and type step of every tab; custom emits none.' }),
  keepMounted: z.boolean().default(TABS_DEFAULTS.keepMounted)
    .meta({ description: 'TabsPanel: whether a panel that is not active stays in the HTML, hidden.' }),
  // R-5.7-7: bounded here and clamped where it is read.
  tabs: z.number().int().min(TABS_BOUNDARIES.skeletonTabsMin).max(TABS_BOUNDARIES.skeletonTabsMax)
    .default(TABS_SKELETON_DEFAULTS.tabs)
    .meta({ description: 'TabsSkeleton: how many tabs the placeholder holds, clamped to 1 and 50.' }),
})

export type TabsSchemaInput = z.input<typeof tabsSchema>
