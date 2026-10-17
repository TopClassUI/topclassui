// R-8.3-1: zod lives here only, and components import this file with `import type`.
import { z } from 'zod'

import { NAVBAR_DEFAULTS } from './constants.js'

// R-8.3-3: .meta() is last in each chain, or zod drops it from the JSON Schema output.
export const navbarSchema = z.object({
  sticky: z.boolean().default(NAVBAR_DEFAULTS.sticky)
    .meta({ description: 'NavbarRoot: the bar stays at the top while the page scrolls, and publishes its height as --tc-sticky-top.' }),
  current: z.boolean().default(NAVBAR_DEFAULTS.current)
    .meta({ description: 'NavbarLink: the link of the page being read. It sets aria-current="page" and draws the link heavier.' }),
})

export type NavbarSchemaInput = z.input<typeof navbarSchema>
