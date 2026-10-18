import { expect, test, type Page } from '@playwright/test'

import { DIRECTIONS } from '../scripts/lib/harness.js'
import { expectRing, focused, pressTo } from './keyboard.js'
import { openLive } from './live.js'

// R-5.6-1: a banner is a region with its action and its x in the tab order. Enter or Space on the x dismisses
// it, and the focus goes on to the next tab stop, never the body (APG, persistence of focus).

const DISMISS = { ltr: 'Dismiss', rtl: 'إغلاق' } as const
const banners = (page: Page) => page.locator('#demo [role="region"]').evaluateAll((all) => all.map((one) => one.getAttribute('aria-label')))
const whose = (page: Page) => page.evaluate(() => document.activeElement?.closest('[role="region"]')?.getAttribute('aria-label') ?? null)

for (const direction of DIRECTIONS) {
  const dismiss = DISMISS[direction]

  test.describe(direction, () => {
    test('Tab goes from the action to each x and Shift+Tab back, with a ring on each', async ({ page }) => {
      await openLive(page, 'banner--dismissible', { direction })
      await pressTo(page, 'Tab', 'Read the changelog')
      await expectRing(page, 'the action')
      await pressTo(page, 'Tab', dismiss)
      expect(await whose(page)).toBe('Release announcement')
      await expectRing(page, 'the first x')
      await pressTo(page, 'Tab', dismiss)
      expect(await whose(page)).toBe('Maintenance notice')
      await expectRing(page, 'the second x')
      await pressTo(page, 'Shift+Tab', dismiss)
      expect(await whose(page)).toBe('Release announcement')
    })

    for (const key of ['Enter', 'Space'] as const) {
      test(`${key} on an x dismisses its banner, and the focus and the ring go on to the next banner's x`, async ({ page }) => {
        await openLive(page, 'banner--dismissible', { direction })
        await pressTo(page, 'Tab', 'Read the changelog')
        await pressTo(page, 'Tab', dismiss)
        await page.keyboard.press(key)
        await expect.poll(() => banners(page)).toEqual(['Maintenance notice'])
        await expect.poll(() => whose(page)).toBe('Maintenance notice')
        expect(await focused(page)).toBe(dismiss)
        await expectRing(page, 'the next x')
      })
    }

    test('a banner with nothing to press is no tab stop', async ({ page }) => {
      await openLive(page, 'banner--minimal', { direction })
      await page.keyboard.press('Tab')
      expect(await whose(page)).toBeNull()
    })
  })
}
