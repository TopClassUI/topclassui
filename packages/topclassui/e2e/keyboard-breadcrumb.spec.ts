import { expect, test } from '@playwright/test'

import { DIRECTIONS } from '../scripts/lib/harness.js'
import { expectRing, focused, pressTo } from './keyboard.js'
import { openLive } from './live.js'

// R-5.6-1, the breadcrumb pattern: a navigation landmark of links that Tab walks in reading order, each with
// its ring; the page being read is no link and no stop, and no arrow key moves the focus.

const TRAIL = ['Home', 'Documentation', 'Components', 'Navigation and disclosure', 'Breadcrumb', 'Examples', 'Server rendering', 'Structured data']

for (const direction of DIRECTIONS) {
  test.describe(direction, () => {
    test('Tab and Shift+Tab walk every crumb with a link in reading order, with a ring on each, and skip the current page', async ({ page }) => {
      await openLive(page, 'breadcrumb--long-trail', { direction })
      for (const name of TRAIL) {
        await pressTo(page, 'Tab', name)
        await expectRing(page, name)
      }
      await page.keyboard.press('Tab')
      expect(await focused(page), 'the current page is no stop').toBe('(nothing)')
      await pressTo(page, 'Shift+Tab', 'Structured data')
      await pressTo(page, 'Shift+Tab', 'Server rendering')
    })

    test('no arrow key, Home or End moves the focus, and Enter follows the focused crumb', async ({ page }) => {
      await openLive(page, 'breadcrumb--basic', { direction })
      await pressTo(page, 'Tab', 'Home')
      await pressTo(page, 'Tab', 'Docs')
      for (const key of ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End']) {
        await page.keyboard.press(key)
        expect(await focused(page), key).toBe('Docs')
      }
      await page.keyboard.press('Enter')
      await expect(page).toHaveURL(/#docs$/)
    })
  })
}
