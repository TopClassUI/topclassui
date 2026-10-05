import { defineConfig } from 'vitest/config'

import { PROJECTS } from './scripts/lib/test-projects.js'

// Four projects per PLAN.md 17.1: node, dom, react-server, and an SSR render with no DOM.
// The patterns live in scripts/lib so a test can prove they stay symmetric.
const [node, dom, rsc, ssr] = PROJECTS

export default defineConfig({
  test: {
    projects: [
      { test: { name: 'node', environment: 'node', include: node?.include, exclude: node?.exclude } },
      {
        test: {
          name: 'dom',
          environment: 'happy-dom',
          setupFiles: ['./test/setup-dom.ts'],
          include: dom?.include,
        },
      },
      {
        // PLAN 17.1: under react-server, server-only is empty and React has no client hooks.
        test: { name: 'rsc', environment: 'node', include: rsc?.include },
        // externalConditions too: server-only is a dependency, so Node resolves it.
        ssr: { resolve: { conditions: ['react-server'], externalConditions: ['react-server'] } },
      },
      { test: { name: 'ssr', environment: 'node', include: ssr?.include, exclude: ssr?.exclude } },
    ],
  },
})
