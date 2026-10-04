import { defineConfig } from 'vitest/config'

// Four projects per PLAN.md 17.1: node, dom, react-server, and an SSR render with no DOM.
export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'node',
          environment: 'node',
          include: ['scripts/**/*.test.ts', 'eslint-rules/**/*.test.ts', 'src/**/*.test.ts'],
          exclude: ['src/**/*.dom.test.ts', 'src/**/*.ssr.test.tsx', 'src/**/*.rsc.test.ts'],
        },
      },
      {
        test: {
          name: 'dom',
          environment: 'happy-dom',
          setupFiles: ['./test/setup-dom.ts'],
          include: ['src/**/*.dom.test.{ts,tsx}'],
        },
      },
      {
        // PLAN 17.1: under react-server, server-only is empty and React has no client hooks.
        test: {
          name: 'rsc',
          environment: 'node',
          include: ['src/**/*.rsc.test.{ts,tsx}'],
        },
        // externalConditions too: server-only is a dependency, so Node resolves it.
        ssr: { resolve: { conditions: ['react-server'], externalConditions: ['react-server'] } },
      },
      {
        test: {
          name: 'ssr',
          environment: 'node',
          include: ['src/**/*.ssr.test.{ts,tsx}', 'src/**/*.test.tsx'],
          exclude: ['src/**/*.dom.test.{ts,tsx}', 'src/**/*.rsc.test.{ts,tsx}'],
        },
      },
    ],
  },
})
