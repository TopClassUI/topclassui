import { expect, test, type Page } from '@playwright/test'

import { DIRECTIONS } from '../scripts/lib/harness.js'
import { expectRing } from './keys.js'
import { liveErrors, openLive } from './live.js'
import { urlFor } from './pages.js'

// R-5.6-1 for CodeBlock: the copy button is a button and the pre a scrollable region, its own tab stop. code-block.spec.ts
// has Enter and Space copying, ArrowRight scrolling and the rings in pixels; here the computed ring on each stop, and the
// arrows both ways in both directions, since the code reads left to right in an Arabic page too.

const [PRE, BUTTON] = ['#demo pre', '#demo button']
const scrollLeft = (page: Page) => page.locator(PRE).evaluate((pre) => Math.round(pre.scrollLeft))

test.describe('the code block by keyboard', () => {
  for (const direction of DIRECTIONS) {
    test(`${direction}: the copy button, then the pre, each with its ring; ArrowRight reads on along the line and ArrowLeft comes back`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 })
      await openLive(page, 'code-block--long-line', { direction })
      await page.keyboard.press('Tab')
      await expect(page.locator(BUTTON)).toBeFocused()
      await expectRing(page, 'the copy button')
      await page.keyboard.press('Tab')
      await expect(page.locator(PRE)).toBeFocused()
      await expectRing(page, 'the pre')
      expect(await scrollLeft(page)).toBe(0)
      for (let step = 0; step < 3; step++) await page.keyboard.press('ArrowRight')
      await expect.poll(() => scrollLeft(page)).toBeGreaterThan(0)
      for (let step = 0; step < 6; step++) await page.keyboard.press('ArrowLeft')
      await expect.poll(() => scrollLeft(page)).toBe(0)
      await expectRing(page, 'the pre, after the arrows')
      expect(await liveErrors(page)).toEqual([])
    })

    test(`${direction}: with no copy button and no script, the pre is the one stop of the block, with its ring`, async ({ page }) => {
      await page.goto(urlFor('code-block--no-copy', 'light', direction))
      await page.keyboard.press('Tab')
      await expect(page.locator(PRE)).toBeFocused()
      await expectRing(page, 'the pre')
      await page.keyboard.press('Tab')
      expect(await page.evaluate(() => document.activeElement?.closest('#demo') ?? null)).toBeNull()
    })
  }
})
