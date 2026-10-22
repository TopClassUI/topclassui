// R-8.3-1: zod lives here only, and components import this file with `import type`.
import { z } from 'zod'

import { KBD_DEFAULTS } from './constants.js'

// R-8.3-3: .meta() is last in each chain, or zod drops it from the JSON Schema output.
export const kbdSchema = z.object({
  pressed: z.boolean().default(KBD_DEFAULTS.pressed)
    .meta({ description: 'The key is held down: the cap drops from the raised surface to the surface below it.' }),
  disabled: z.boolean().default(KBD_DEFAULTS.disabled)
    .meta({ description: 'The key does nothing here: muted text on the surface with the decorative line, still 4.5:1.' }),
})

export type KbdSchemaInput = z.input<typeof kbdSchema>
