import { resolve } from 'node:path'

import createMDX from '@next/mdx'
import type { NextConfig } from 'next'

import { LIVE_GUIDES } from './content/pages'

const REPO = resolve(import.meta.dirname, '..', '..')
const firstGuide = LIVE_GUIDES[0]?.path ?? '/'

const config: NextConfig = {
  pageExtensions: ['ts', 'tsx', 'mdx'],
  // Relative imports into packages/topclassui/dist resolve from inside apps/docs only with the repo as the root.
  turbopack: { root: REPO },
  outputFileTracingRoot: REPO,
  // Still experimental in 16.3.8: without it app/global-not-found.tsx is ignored (docs-site page 20).
  experimental: { globalNotFound: true },
  poweredByHeader: false,
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
