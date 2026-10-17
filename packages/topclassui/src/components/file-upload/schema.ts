// R-8.3-1: zod lives here only, and components import this file with `import type`.
import { z } from 'zod'

import { COLLECTION_BOUNDARIES } from '#shared/contracts/collection.js'
import { FILE_UPLOAD_BOUNDARIES } from './boundaries.js'
import { FILE_UPLOAD_DEFAULTS } from './constants.js'

const { maxFilesMin, maxFilesMax, maxSizeMin, maxSizeMax } = FILE_UPLOAD_BOUNDARIES
const { visibleRowsMin, visibleRowsMax } = COLLECTION_BOUNDARIES

// R-8.3-3: .meta() is last in each chain, or zod drops it from the JSON Schema output.
export const fileUploadSchema = z.object({
  maxFiles: z.number().int().min(maxFilesMin).max(maxFilesMax).default(FILE_UPLOAD_DEFAULTS.maxFiles)
    .meta({ description: 'How many files the list keeps, clamped to 1 to 100; above 1 the input takes several at once.' }),
  maxSize: z.number().int().min(maxSizeMin).max(maxSizeMax).default(FILE_UPLOAD_DEFAULTS.maxSize)
    .meta({ description: 'The largest file accepted, in bytes, clamped to 1 to 10 GiB; checked in the browser only.' }),
  invalid: z.boolean().default(FILE_UPLOAD_DEFAULTS.invalid)
    .meta({ description: 'Marks the files as wrong: sets aria-invalid on the input, and the line of the zone turns to danger and thickens.' }),
  visibleRows: z.number().min(visibleRowsMin).max(visibleRowsMax).default(FILE_UPLOAD_DEFAULTS.visibleRows)
    .meta({ description: 'Rows the list shows before it scrolls, clamped; left out, the --tc-list-rows knob applies.' }),
})

export type FileUploadSchemaInput = z.input<typeof fileUploadSchema>
