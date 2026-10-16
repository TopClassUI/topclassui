// R-8.3-1: zod lives here only, and components import this file with `import type`.
import { z } from 'zod'

import { sizeSchema } from '#shared/contracts/size.schema.js'
import { DRAWER_DEFAULTS, DRAWER_PLACEMENTS } from './constants.js'

// R-8.3-3: .meta() is last in each chain, or zod drops it from the JSON Schema output.
export const drawerSchema = z.object({
  placement: z.enum(DRAWER_PLACEMENTS).default(DRAWER_DEFAULTS.placement)
    .meta({ description: 'DrawerRoot: the edge the sheet slides from; start and end follow the direction.' }),
  size: sizeSchema.default(DRAWER_DEFAULTS.size)
    .meta({ description: 'DrawerRoot: the widest a start or an end sheet grows, 256 to 480 px; custom sets no width.' }),
})

export type DrawerSchemaInput = z.input<typeof drawerSchema>
