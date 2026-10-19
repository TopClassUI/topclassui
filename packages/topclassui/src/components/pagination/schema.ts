// R-8.3-1: zod lives here only, and components import this file with `import type`.
import { z } from 'zod'

import { sizeSchema } from '#shared/contracts/size.schema.js'
import { PAGINATION_BOUNDARIES } from './boundaries.js'
import { PAGINATION_DEFAULTS } from './constants.js'

// R-8.3-3: .meta() is last in each chain, or zod drops it from the JSON Schema output.
export const paginationSchema = z.object({
  value: z.number().int()
    .min(PAGINATION_BOUNDARIES.pageMin).max(PAGINATION_BOUNDARIES.pageCountMax)
    .meta({ description: 'The current page, counted from 1; anything outside 1 to pageCount is clamped.' }),
  pageCount: z.number().int()
    .min(PAGINATION_BOUNDARIES.pageMin).max(PAGINATION_BOUNDARIES.pageCountMax)
    .meta({ description: 'How many pages there are; a fraction is rounded up and anything below 1 is one page.' }),
  siblingCount: z.number().int()
    .min(PAGINATION_BOUNDARIES.siblingCountMin).max(PAGINATION_BOUNDARIES.siblingCountMax)
    .default(PAGINATION_DEFAULTS.siblingCount)
    .meta({ description: 'How many pages show on each side of the current one; clamped to 0-3.' }),
  boundaryCount: z.number().int()
    .min(PAGINATION_BOUNDARIES.boundaryCountMin).max(PAGINATION_BOUNDARIES.boundaryCountMax)
    .default(PAGINATION_DEFAULTS.boundaryCount)
    .meta({ description: 'How many pages always show at each end of the list; clamped to 0-3.' }),
  size: sizeSchema.default(PAGINATION_DEFAULTS.size)
    .meta({ description: 'The control scale each cell takes its height from; custom emits no size classes.' }),
  disabled: z.boolean().default(PAGINATION_DEFAULTS.disabled)
    .meta({ description: 'Every cell is dimmed and none is a link, the current page included.' }),
})

export type PaginationSchemaInput = z.input<typeof paginationSchema>
