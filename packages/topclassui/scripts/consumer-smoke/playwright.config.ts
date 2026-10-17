import { defineConfig, devices } from '@playwright/test'

import { URL_ENV } from '../lib/consumer-smoke.js'

const baseURL = process.env[URL_ENV]
if (!baseURL) throw new Error(`consumer-smoke: ${URL_ENV} is not set. pnpm test:consumers sets it and starts the app it names.`)

// One built consumer app at a time, on a server the runner started. No webServer here: the runner owns it.
export default defineConfig({
  testDir: '.',
  testMatch: 'consumer.spec.ts',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  reporter: 'list',
  use: { ...devices['Desktop Chrome'], baseURL },
})
