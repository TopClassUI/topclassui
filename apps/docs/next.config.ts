import { resolve } from 'node:path'

import type { NextConfig } from 'next'

// The repository root, so the generated demo map's imports into packages/topclassui/dist resolve (S1).
const root = resolve(import.meta.dirname, '..', '..')

const config: NextConfig = {
  turbopack: { root },
  outputFileTracingRoot: root,
  redirects: () => Promise.resolve([
      { source: '/', destination: '/en', permanent: true },
      { source: '/:locale(en|ar)/docs', destination: '/:locale/docs/installation', permanent: true },
    ]),
}

export default config
