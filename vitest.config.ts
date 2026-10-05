import { defineConfig } from 'vitest/config'

import { PROJECTS } from './scripts/lib/test-projects.js'

// Four projects per PLAN.md 17.1: node, dom, react-server, and an SSR render with no DOM.
// The patterns live in scripts/lib so a test can prove they stay symmetric.
const ENVIRONMENT: Record<string, { environment: string; setupFiles?: string[] }> = {
  node: { environment: 'node' },
  dom: { environment: 'happy-dom', setupFiles: ['./test/setup-dom.ts'] },
  rsc: { environment: 'node' },
  ssr: { environment: 'node' },
}

// PLAN 17.1: under react-server, server-only is empty and React has no client hooks.
// externalConditions too: server-only is a dependency, so Node resolves it.
const REACT_SERVER = { resolve: { conditions: ['react-server'], externalConditions: ['react-server'] } }

export default defineConfig({
  test: {
    projects: PROJECTS.map((project) => ({
      test: {
        name: project.name,
        ...ENVIRONMENT[project.name],
        include: project.include,
        exclude: project.exclude,
      },
      ...(project.name === 'rsc' ? { ssr: REACT_SERVER } : {}),
    })),
  },
})
