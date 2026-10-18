import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['lib/**/*.test.{ts,tsx}', 'scripts/**/*.test.ts', 'content/**/*.test.ts', 'components/**/*.test.{ts,tsx}', 'labels/**/*.test.ts', 'app/**/*.test.{ts,tsx}'],
    // The repo run loads 52 schemas and one TypeScript program: 5 s is not enough on a busy machine.
    testTimeout: 60_000,
  },
})
