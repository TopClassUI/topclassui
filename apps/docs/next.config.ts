import { resolve } from 'node:path'

import createMDX from '@next/mdx'
import type { NextConfig } from 'next'

import { LIVE_GUIDES } from './content/pages'

const REPO = resolve(import.meta.dirname, '..', '..')
const firstGuide = LIVE_GUIDES[0]?.path ?? '/'

/** Every response: no MIME sniffing, the origin only to other sites, and no powerful feature the site never uses. */
const SECURITY_HEADERS = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()' },
]

/** Only file names that carry a content hash; HTML, the OG images and public/ keep Next's revalidating default. */
const IMMUTABLE = 'public, max-age=31536000, immutable'

const config: NextConfig = {
  pageExtensions: ['ts', 'tsx', 'mdx'],
  // Relative imports into packages/topclassui/dist resolve from inside apps/docs only with the repo as the root.
  turbopack: { root: REPO },
  outputFileTracingRoot: REPO,
  // Still experimental in 16.3.8: without it app/global-not-found.tsx is ignored (docs-site page 20).
  experimental: { globalNotFound: true },
  poweredByHeader: false,
  headers() {
    // Next sets the same value on /_next/static itself and warns that a custom one can break next dev, so it is written for builds only.
    const hashed = process.env.NODE_ENV === 'production' ? [{ source: '/_next/static/:path*', headers: [{ key: 'Cache-Control', value: IMMUTABLE }] }] : []
    return Promise.resolve([{ source: '/:path*', headers: SECURITY_HEADERS }, ...hashed])
  },
  redirects() {
    return Promise.resolve([
      { source: '/', destination: '/en', permanent: true },
      { source: '/:locale(en|ar)/docs', destination: `/:locale${firstGuide}`, permanent: true },
    ])
  },
}

const withMDX = createMDX({
  options: {
    // Strings, not functions: the Turbopack loader cannot take a function value.
    remarkPlugins: ['remark-frontmatter', 'remark-gfm', resolve(import.meta.dirname, 'lib', 'remark-meta.mjs'), resolve(import.meta.dirname, 'lib', 'remark-sections.mjs')],
  },
})

export default withMDX(config)
