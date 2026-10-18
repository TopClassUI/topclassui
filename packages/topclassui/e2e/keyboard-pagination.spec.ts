import { expect, test } from '@playwright/test'

import { DIRECTIONS } from '../scripts/lib/harness.js'
import { expectRing, focused, pressTo } from './keyboard.js'
import { openLive } from './live.js'

// R-5.6-1: pagination is a navigation landmark of links. Tab walks them in reading order with a ring on each,
// the current page says so and stays a stop, a control with nowhere to go is no stop, and Enter follows a link.

const MIDDLE = ['First page', 'Previous', 'Page 1', 'Page 5', 'Page 6 of 12', 'Page 7', 'Page 12', 'Next', 'Last page']

for (const direction of DIRECTIONS) {
  test.describe(direction, () => {
    test('Tab and Shift+Tab walk every link in reading order with a ring on each', async ({ page }) => {
      await openLive(page, 'pagination--middle', { direction })
      for (const name of MIDDLE) {
        await pressTo(page, 'Tab', name)
        await expectRing(page, name)
      }
      for (const name of [...MIDDLE].reverse().slice(1)) await pressTo(page, 'Shift+Tab', name)
    })

    test('the current page is a stop that says so, and no arrow key, Home or End moves the focus', async ({ page }) => {
      await openLive(page, 'pagination--middle', { direction })
      for (const name of MIDDLE.slice(0, 5)) await pressTo(page, 'Tab', name)
      expect(await page.evaluate(() => document.activeElement?.getAttribute('aria-current'))).toBe('page')
      for (const key of ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End']) {
        await page.keyboard.press(key)
        expect(await focused(page), key).toBe('Page 6 of 12')
      }
    })

    test('on the first page, First and Previous are no stops: Tab starts on the current page', async ({ page }) => {
      await openLive(page, 'pagination--first-page', { direction })
      await pressTo(page, 'Tab', 'Page 1 of 12')
      await expectRing(page, 'the current page')
    })

    test('Enter follows the focused link', async ({ page }) => {
      await openLive(page, 'pagination--middle', { direction })
      for (const name of MIDDLE.slice(0, 8)) await pressTo(page, 'Tab', name)
      const request = page.waitForRequest((sent) => sent.url().endsWith('/blog?page=7'))
      await page.keyboard.press('Enter')
      await request
    })
  })
}
