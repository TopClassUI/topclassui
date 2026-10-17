// R-8.3-1: zod lives here only, and components import this file with `import type`.
import { z } from 'zod'

import { CODE_BLOCK_DEFAULTS } from './constants.js'

// R-8.3-3: .meta() is last in each chain, and every field needs one for the props table.
export const codeBlockSchema = z.object({
  showCopy: z.boolean().default(CODE_BLOCK_DEFAULTS.showCopy)
    .meta({ description: 'Shows a button in the header that copies the code: the one part that runs in the browser.' }),
  wrap: z.boolean().default(CODE_BLOCK_DEFAULTS.wrap)
    .meta({ description: 'Breaks a long line instead of scrolling it sideways; the code is then no tab stop.' }),
})

export type CodeBlockSchemaInput = z.input<typeof codeBlockSchema>
