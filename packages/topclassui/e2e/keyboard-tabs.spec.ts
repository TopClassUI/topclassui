import { expect, test, type Locator, type Page } from '@playwright/test'

import { DIRECTIONS } from '../scripts/lib/harness.js'
import { expectRing, focused, inlineKeys, pressTo, tabStops } from './keyboard.js'
import { openLive } from './live.js'

// R-5.6-1, the tabs pattern with manual activation: one tab stop per list (a roving tabindex), the
// arrows move the focus and wrap, mirrored right to left, Home and End go to the ends, Enter and Space open.

const tabsOf = (page: Page) => page.locator('#demo [role="tablist"]').first().locator('[role="tab"]')
const selected = (tabs: Locator) => tabs.evaluateAll((all) => all.filter((tab) => tab.getAttribute('aria-selected') === 'true').map((tab) => tab.textContent))

for (const direction of DIRECTIONS) {
  const { next, previous } = inlineKeys(direction)

  test.describe(direction, () => {
    test(`${next} and ${previous} move the focus and the one tab stop, and wrap at both ends, with a ring on each tab`, async ({ page }) => {
      await openLive(page, 'tabs--basic', { direction })
      const tabs = tabsOf(page)
      await pressTo(page, 'Tab', 'Overview')
      await expectRing(page, 'Overview')
      expect(await tabStops(tabs)).toEqual(['Overview'])

      await pressTo(page, next, 'Activity')
      await expectRing(page, 'Activity')
      expect(await tabStops(tabs)).toEqual(['Activity'])
      await pressTo(page, next, 'Settings')
      await pressTo(page, next, 'Overview')
      await pressTo(page, previous, 'Settings')
      await expectRing(page, 'Settings')
      expect(await selected(tabs), 'an arrow opens nothing').toEqual(['Overview'])
    })

    test('Home and End go to the first and the last tab, and the vertical arrows do nothing', async ({ page }) => {
      await openLive(page, 'tabs--basic', { direction })
      await pressTo(page, 'Tab', 'Overview')
      await pressTo(page, 'End', 'Settings')
      await pressTo(page, 'Home', 'Overview')
      for (const key of ['ArrowDown', 'ArrowUp']) {
        await page.keyboard.press(key)
        expect(await focused(page), key).toBe('Overview')
      }
    })

    test('Enter and Space open the focused tab, and Tab goes on to its panel and Shift+Tab back to it', async ({ page }) => {
      await openLive(page, 'tabs--basic', { direction })
      const tabs = tabsOf(page)
      await pressTo(page, 'Tab', 'Overview')
      await pressTo(page, next, 'Activity')
      await page.keyboard.press('Enter')
      await expect.poll(() => selected(tabs)).toEqual(['Activity'])
      await pressTo(page, next, 'Settings')
      await page.keyboard.press('Space')
      await expect.poll(() => selected(tabs)).toEqual(['Settings'])

      await pressTo(page, 'Tab', 'Only an owner can rename or delete this project.')
      await expectRing(page, 'the panel')
      await pressTo(page, 'Shift+Tab', 'Settings')
    })

    test('a disabled tab is an arrow stop with a ring that Enter and Space do not open', async ({ page }) => {
      await openLive(page, 'tabs--disabled', { direction })
      const tabs = tabsOf(page)
      await pressTo(page, 'Tab', 'Overview')
      await pressTo(page, next, 'Changelog')
      await expectRing(page, 'the disabled tab')
      await page.keyboard.press('Enter')
      await page.keyboard.press('Space')
      expect(await selected(tabs)).toEqual(['Overview'])
      await pressTo(page, next, 'Props')
    })
  })
}
