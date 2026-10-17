// R-8.3-1: zod lives here only, and components import this file with `import type`.
import { z } from 'zod'

import { SIDEBAR_BOUNDARIES } from './boundaries.js'
import { SIDEBAR_DEFAULTS, SIDEBAR_SKELETON_DEFAULTS } from './constants.js'

// R-8.3-3: .meta() is last in each chain, or zod drops it from the JSON Schema output.
export const sidebarSchema = z.object({
  defaultOpen: z.boolean().default(SIDEBAR_DEFAULTS.defaultOpen)
    .meta({ description: 'SidebarRoot: whether the rail starts expanded. false starts it as a column of icons, in the server HTML too.' }),
  open: z.boolean().optional()
    .meta({ description: 'SidebarRoot: the state, held by the caller. Pair it with onOpenChange, in a client file.' }),
  current: z.boolean().default(SIDEBAR_DEFAULTS.current)
    .meta({ description: 'SidebarLink: the page being read. It sets aria-current="page" and draws the row filled, bold and marked.' }),
  expanded: z.boolean().default(SIDEBAR_SKELETON_DEFAULTS.expanded)
    .meta({ description: 'SidebarSkeleton: whether the rail it stands in for is expanded. Pass what its defaultOpen or open will be.' }),
  // R-5.7-7: bounded here and clamped where it is read.
  links: z.number().int().min(SIDEBAR_BOUNDARIES.skeletonLinksMin).max(SIDEBAR_BOUNDARIES.skeletonLinksMax)
    .default(SIDEBAR_SKELETON_DEFAULTS.links)
    .meta({ description: 'SidebarSkeleton: how many link rows the placeholder holds, clamped to 1 and 200.' }),
})

export type SidebarSchemaInput = z.input<typeof sidebarSchema>
