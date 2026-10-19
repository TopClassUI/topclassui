// R-8.3-1: zod lives here only, and components import this file with `import type`.
import { z } from 'zod'

import { BREADCRUMB_SITE_URL_PATTERN } from './constants.js'

// R-8.3-3: .meta() is last in each chain, and every field needs one for the props table.
export const breadcrumbSchema = z.object({
  siteUrl: z.string().regex(BREADCRUMB_SITE_URL_PATTERN).optional()
    .meta({ description: 'The origin of the site, such as `https://example.com` with no trailing slash. Given, the trail is also written as BreadcrumbList JSON-LD with absolute URLs; left out, no JSON-LD is written.' }),
})

export type BreadcrumbSchemaInput = z.input<typeof breadcrumbSchema>
