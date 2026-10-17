// R-8.3-1: zod lives here only, and components import this file with `import type`.
import { z } from 'zod'

import { TEXT_MAX_LENGTH } from '#shared/contracts/boundaries.js'
import { sizeSchema } from '#shared/contracts/size.schema.js'
import { TEXTAREA_BOUNDARIES } from './boundaries.js'
import { TEXTAREA_DEFAULTS } from './constants.js'

// R-8.3-3: .meta() is last in each chain, or zod drops it from the JSON Schema output.
export const textareaSchema = z.object({
  size: sizeSchema.default(TEXTAREA_DEFAULTS.size)
    .meta({ description: 'The shared control scale: the padding and the type step. custom emits no size classes.' }),
  invalid: z.boolean().default(TEXTAREA_DEFAULTS.invalid)
    .meta({ description: 'Marks the value as wrong: sets aria-invalid, and the border turns to danger and thickens.' }),
  fullWidth: z.boolean().default(TEXTAREA_DEFAULTS.fullWidth)
    .meta({ description: 'Stretches the textarea, and the box around it with autosize or showCount, to the width of its container.' }),
  rows: z.number().int().min(TEXTAREA_BOUNDARIES.rowsMin).max(TEXTAREA_BOUNDARIES.rowsMax)
    .default(TEXTAREA_DEFAULTS.rows)
    .meta({ description: 'The lines it shows, and the least it shrinks to with autosize; clamped to 1-40.' }),
  maxRows: z.number().int().min(TEXTAREA_BOUNDARIES.maxRowsMin).max(TEXTAREA_BOUNDARIES.maxRowsMax)
    .default(TEXTAREA_DEFAULTS.maxRows)
    .meta({ description: 'With autosize, the most lines it grows to before it scrolls; clamped to 1-40 and never under rows.' }),
  maxLength: z.number().int().min(TEXTAREA_BOUNDARIES.maxLengthMin).max(TEXTAREA_BOUNDARIES.maxLengthMax)
    .nullable().default(TEXT_MAX_LENGTH.textarea)
    .meta({ description: 'The character cap: your number, 5000 by default, or null for none; clamped to 0-2147483647 and rounded down.' }),
  autosize: z.boolean().default(TEXTAREA_DEFAULTS.autosize)
    .meta({ description: 'Grows with the text from rows up to maxRows once the page has hydrated; loads the small client half.' }),
  showCount: z.boolean().default(TEXTAREA_DEFAULTS.showCount)
    .meta({ description: 'Always shows the count against the cap under the field; with autosize alone it shows from nine tenths of it.' }),
  validate: z.boolean().default(TEXTAREA_DEFAULTS.validate)
    .meta({ description: 'Holds a pasted or scripted value to the cap after hydration and stops the submit; autosize and showCount do it already.' }),
})

export type TextareaSchemaInput = z.input<typeof textareaSchema>
