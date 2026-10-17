import { existsSync } from 'node:fs'

import { defineConfig, devices } from '@playwright/test'

// The container ships one Chromium build; a pinned Playwright may expect another.
const INSTALLED = '/opt/pw-browsers/chromium'
const launch = existsSync(INSTALLED) ? { executablePath: INSTALLED } : {}

const ORIGIN = 'http://localhost:4611'

// S13 rule 5: against next start, never next dev, so what is measured is the static build.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  workers: Number(process.env['TC_E2E_WORKERS'] ?? 4),
  retries: 0,
  reporter: 'list',
  use: { ...devices['Desktop Chrome'], baseURL: ORIGIN, launchOptions: launch },
  webServer: { command: 'pnpm exec next start -p 4611', url: `${ORIGIN}/en/docs/components/button`, reuseExistingServer: false, timeout: 120_000 },
})
