import { expect, test, type Page } from '@playwright/test'

import { DIRECTIONS } from '../scripts/lib/harness.js'
import { expectRing, focused, pressTo } from './keyboard.js'
import { openLive } from './live.js'

// R-5.6-1: the toggle is the disclosure pattern, a button that Enter and Space open and close with the focus
// staying on it; the links are plain links that Tab walks in order with a ring each, collapsed or not.

const LABELS = {
  ltr: { collapse: 'Collapse the sidebar', expand: 'Expand the sidebar' },
  rtl: { collapse: 'طي الشريط الجانبي', expand: 'توسيع الشريط الجانبي' },
} as const
const LINKS = ['Home', 'Projects', 'Team', 'Settings']

const expanded = (page: Page) => page.locator('#demo button[aria-expanded]').getAttribute('aria-expanded')

for (const direction of DIRECTIONS) {
  const { collapse, expand } = LABELS[direction]

  test.describe(direction, () => {
    test('Tab goes from the toggle through every link with a ring on each, and Shift+Tab back', async ({ page }) => {
      await openLive(page, 'sidebar--basic', { direction })
      await pressTo(page, 'Tab', collapse)
      await expectRing(page, 'the toggle')
      for (const name of LINKS) {
        await pressTo(page, 'Tab', name)
        await expectRing(page, name)
      }
      for (const name of ['Team', 'Projects', 'Home', collapse]) await pressTo(page, 'Shift+Tab', name)
    })

    for (const key of ['Enter', 'Space'] as const) {
      test(`${key} collapses and expands it, the focus and the ring stay on the toggle, and its name follows`, async ({ page }) => {
        await openLive(page, 'sidebar--basic', { direction })
        await pressTo(page, 'Tab', collapse)
        await page.keyboard.press(key)
        await expect.poll(() => expanded(page)).toBe('false')
        expect(await focused(page)).toBe(expand)
        await expectRing(page, 'the toggle, collapsed')
        await page.keyboard.press(key)
        await expect.poll(() => expanded(page)).toBe('true')
        expect(await focused(page)).toBe(collapse)
      })
    }

    test('collapsed, Tab still reaches every link by its name, and Enter follows one', async ({ page }) => {
      await openLive(page, 'sidebar--basic', { direction })
      await pressTo(page, 'Tab', collapse)
      await page.keyboard.press('Enter')
      await expect.poll(() => expanded(page)).toBe('false')
      for (const name of LINKS) {
        await page.keyboard.press('Tab')
        await expect.poll(() => page.evaluate(() => document.activeElement?.getAttribute('href'))).toBe(`#${name.toLowerCase()}`)
        await expectRing(page, `${name}, collapsed`)
      }
      await page.keyboard.press('Enter')
      await expect.poll(() => page.evaluate(() => location.hash)).toBe('#settings')
    })
  })
}
