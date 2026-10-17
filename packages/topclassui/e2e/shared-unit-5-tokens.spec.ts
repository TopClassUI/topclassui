import { expect, test, type Page } from '@playwright/test'

import { openLive } from './live.js'

// What the three unit 5 tokens of src/tokens.css promise and only a browser can show, on the probes of
// e2e/fixtures/shared-unit-5-tokens.tsx: one tree level is 18 px at density 1, a row's depth multiplies it, and a
// meter's bar is empty until its value is set. A value the browser refuses would leave a probe as wide as its 200 px track.

const PROBES = ['indent', 'level-root', 'level-3', 'meter-root', 'meter-40'] as const

async function fixture(page: Page): Promise<void> {
  await openLive(page, 'separator--horizontal')
  await page.addScriptTag({ type: 'module', url: '/e2e/fixtures/shared-unit-5-tokens.tsx' })
  await expect(page.locator('#meter-40')).toBeVisible()
}

/** The rendered width of every probe, in CSS px. */
const widths = (page: Page) => page.evaluate((ids) => Object.fromEntries(
  ids.map((id) => [id, document.getElementById(id)?.getBoundingClientRect().width ?? -1]),
), PROBES)

test('at density 1: one level is 18 px, a row at the root is not indented, a row three deep is 54 px in', async ({ page }) => {
  await fixture(page)
  expect(await widths(page)).toEqual({ 'indent': 18, 'level-root': 0, 'level-3': 54, 'meter-root': 0, 'meter-40': 80 })
})

test('the indent follows the density knob on the root', async ({ page }) => {
  await fixture(page)
  await page.evaluate(() => { document.documentElement.style.setProperty('--tc-density', '1.25') })
  expect(await widths(page)).toEqual({ 'indent': 22.5, 'level-root': 0, 'level-3': 67.5, 'meter-root': 0, 'meter-40': 80 })
})

test('the indent follows text zoom: a root of 32 px doubles it', async ({ page }) => {
  await fixture(page)
  await page.addStyleTag({ content: 'html { font-size: 32px }' })
  expect(await widths(page)).toEqual({ 'indent': 36, 'level-root': 0, 'level-3': 108, 'meter-root': 0, 'meter-40': 80 })
})
