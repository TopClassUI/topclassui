import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    exclude: ['test/fixtures/**', 'node_modules/**'],
    environment: 'node',
    // The copy test builds the registry and type-checks two copied trees.
    testTimeout: 180_000,
    hookTimeout: 180_000,
  },
})
