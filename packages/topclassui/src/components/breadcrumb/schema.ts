// R-8.3-1: zod lives here only, and components import this file with `import type`.
import { z } from 'zod'

import { BREADCRUMB_BOUNDARIES } from './boundaries.js'
import { BREADCRUMB_DEFAULTS, BREADCRUMB_SITE_URL_PATTERN } from './constants.js'

const { min: maxItemsMin, max: maxItemsMax } = BREADCRUMB_BOUNDARIES.maxItems

// R-8.3-3: .meta() is last in each chain, and every field needs one for the props table.
export const breadcrumbSchema = z.object({
  siteUrl: z.string().regex(BREADCRUMB_SITE_URL_PATTERN).optional()
    .meta({ description: 'The origin of the site, such as `https://example.com` with no trailing slash. Given, the trail is also written as BreadcrumbList JSON-LD with absolute URLs; left out, no JSON-LD is written.' }),
  showHome: z.boolean().default(BREADCRUMB_DEFAULTS.showHome)
    .meta({ description: 'Draws the first crumb as a house icon; its label is still read by a screen reader.' }),
  maxItems: z.number().int().min(maxItemsMin).max(maxItemsMax).default(BREADCRUMB_DEFAULTS.maxItems)
    .meta({ description: 'Folds a longer trail to the first crumb, three dots and the last `maxItems - 1`; clamped to 2-100. The JSON-LD keeps every crumb.' }),
})

export type BreadcrumbSchemaInput = z.input<typeof breadcrumbSchema>
