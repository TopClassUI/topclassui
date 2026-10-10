import { existsSync } from 'node:fs'

import { defineConfig, devices } from '@playwright/test'

import { liveOrigin } from './scripts/lib/live-harness.js'

// The container ships one Chromium build; a pinned Playwright may expect another.
const INSTALLED = '/opt/pw-browsers/chromium'
const launch = existsSync(INSTALLED) ? { executablePath: INSTALLED } : {}

// PLAN 17.1: Linux-only baselines. The static pages are files and need no server; the live
// ones, where a demo is hydrated and can open, come from `pnpm harness:serve`.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env['CI']),
  retries: 0,
  reporter: process.env['CI'] ? 'github' : 'list',
  use: { ...devices['Desktop Chrome'], launchOptions: launch },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], launchOptions: launch } }],
  webServer: {
    command: 'pnpm harness:serve',
    url: `${liveOrigin()}/`,
    // Never reused: a server already on the port may be another worktree's, serving that one's source.
    reuseExistingServer: false,
    timeout: 120_000,
  },
})
