import { existsSync } from 'node:fs'

import { defineConfig, devices } from '@playwright/test'

// The container ships one Chromium build; a pinned Playwright may expect another.
const INSTALLED = '/opt/pw-browsers/chromium'
const launch = existsSync(INSTALLED) ? { executablePath: INSTALLED } : {}

// PLAN 17.1: Linux-only baselines. The harness is static, so no server is needed.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env['CI']),
  retries: 0,
  reporter: process.env['CI'] ? 'github' : 'list',
  use: { ...devices['Desktop Chrome'], launchOptions: launch },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], launchOptions: launch } }],
})
