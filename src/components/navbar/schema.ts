// R-8.3-1: zod lives here only, and components import this file with `import type`.
import { z } from 'zod'

import { NAVBAR_BOUNDARIES } from './boundaries.js'
import { NAVBAR_DEFAULTS, NAVBAR_SKELETON_DEFAULTS } from './constants.js'

// R-8.3-3: .meta() is last in each chain, or zod drops it from the JSON Schema output.
export const navbarSchema = z.object({
  sticky: z.boolean().default(NAVBAR_DEFAULTS.sticky)
    .meta({ description: 'NavbarRoot: the bar stays at the top while the page scrolls, and publishes its height as --tc-sticky-top.' }),
  current: z.boolean().default(NAVBAR_DEFAULTS.current)
    .meta({ description: 'NavbarLink: the link of the page being read. It sets aria-current="page" and draws the link heavier.' }),
  // R-5.7-7: bounded here and clamped where it is read.
  links: z.number().int().min(NAVBAR_BOUNDARIES.skeletonLinksMin).max(NAVBAR_BOUNDARIES.skeletonLinksMax)
    .default(NAVBAR_SKELETON_DEFAULTS.links)
    .meta({ description: 'NavbarSkeleton: how many links the placeholder holds, clamped to 1 and 50.' }),
})

export type NavbarSchemaInput = z.input<typeof navbarSchema>
