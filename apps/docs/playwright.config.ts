import { existsSync } from 'node:fs'

import { defineConfig, devices } from '@playwright/test'

// The container ships one Chromium build; the pinned Playwright may expect another.
const INSTALLED = '/opt/pw-browsers/chromium'
const launch = existsSync(INSTALLED) ? { executablePath: INSTALLED } : {}

export const ORIGIN = 'http://localhost:4611'

/** S13 step 5: against `next start -p 4611` after `next build`, never against next dev. */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  workers: Number(process.env['TC_E2E_WORKERS'] ?? 4),
  forbidOnly: Boolean(process.env['CI']),
  retries: 0,
  reporter: process.env['CI'] ? 'github' : 'list',
  use: { ...devices['Desktop Chrome'], baseURL: ORIGIN, launchOptions: launch },
  webServer: {
    command: 'pnpm start',
    url: `${ORIGIN}/en`,
    reuseExistingServer: false,
    timeout: 120_000,
  },
})
