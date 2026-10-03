import { defineConfig } from 'vitest/config'

// Three projects, as PLAN.md section 17.1 specifies: pure code in Node, components
// in a DOM, and a server render with no DOM at all so an accidental window breaks.
export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'node',
          environment: 'node',
          include: ['scripts/**/*.test.ts', 'eslint-rules/**/*.test.ts', 'src/**/*.test.ts'],
          exclude: ['src/**/*.dom.test.ts', 'src/**/*.ssr.test.tsx'],
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
        test: {
          name: 'ssr',
          environment: 'node',
          include: ['src/**/*.ssr.test.{ts,tsx}', 'src/**/*.test.tsx'],
          exclude: ['src/**/*.dom.test.{ts,tsx}'],
        },
      },
    ],
  },
})
