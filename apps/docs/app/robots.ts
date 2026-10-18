import type { MetadataRoute } from 'next'

import { SITE_URL } from '../lib/site'

/** Allow all and name the sitemap. No disallow: /preview stays out of the index by its own noindex, which a disallow would hide (docs-site S6). */
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: '*', allow: '/' }, sitemap: `${SITE_URL}/sitemap.xml` }
}
