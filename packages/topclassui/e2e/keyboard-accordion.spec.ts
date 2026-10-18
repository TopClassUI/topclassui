import { expect, test, type Page } from '@playwright/test'

import { DIRECTIONS } from '../scripts/lib/harness.js'
import { expectRing, focused, pressTo } from './keyboard.js'
import { openLive } from './live.js'

// R-5.6-1, the accordion pattern of the Authoring Practices: each header is a button in the tab order,
// Enter and Space toggle it, and the optional arrow, Home and End keys are left out (accordion.spec's choice).

const expanded = (page: Page) => page.locator('#demo button[aria-expanded]').evaluateAll((all) => all.map((one) => one.getAttribute('aria-expanded')))

for (const direction of DIRECTIONS) {
  test.describe(direction, () => {
    test('Tab and Shift+Tab walk the headers with a ring on each, and Enter and Space toggle the focused one', async ({ page }) => {
      await openLive(page, 'accordion--basic', { direction })
      for (const name of ['What is a server component?', 'Does it work in Arabic?', 'How big is the bundle?']) {
        await pressTo(page, 'Tab', name)
        await expectRing(page, name)
      }
      await page.keyboard.press('Enter')
      await expect.poll(() => expanded(page)).toEqual(['false', 'false', 'true'])
      await page.keyboard.press('Space')
      await expect.poll(() => expanded(page)).toEqual(['false', 'false', 'false'])
      await pressTo(page, 'Shift+Tab', 'Does it work in Arabic?')
      await page.keyboard.press('Space')
      await expect.poll(() => expanded(page)).toEqual(['false', 'true', 'false'])
      expect(await focused(page)).toBe('Does it work in Arabic?')
      await expectRing(page, 'the header after Space')
    })

    test('no arrow key, Home or End moves the focus or opens a panel', async ({ page }) => {
      await openLive(page, 'accordion--basic', { direction })
      await pressTo(page, 'Tab', 'What is a server component?')
      await pressTo(page, 'Tab', 'Does it work in Arabic?')
      for (const key of ['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'Home', 'End']) {
        await page.keyboard.press(key)
        expect(await focused(page), key).toBe('Does it work in Arabic?')
      }
      expect(await expanded(page)).toEqual(['false', 'false', 'false'])
    })

    test('with multiple, Enter and Space toggle each header alone and leave the others open', async ({ page }) => {
      await openLive(page, 'accordion--multiple', { direction })
      await pressTo(page, 'Tab', 'Plan')
      await pressTo(page, 'Tab', 'Seats')
      await pressTo(page, 'Tab', 'Invoices')
      await page.keyboard.press('Enter')
      await expect.poll(() => expanded(page)).toEqual(['true', 'true', 'true'])
      await pressTo(page, 'Shift+Tab', 'Seats')
      await page.keyboard.press('Space')
      await expect.poll(() => expanded(page)).toEqual(['true', 'false', 'true'])
    })

    test('first open: the open item is a stop like the others, Enter closes it, and Tab goes on through the headers', async ({ page }) => {
      await openLive(page, 'accordion--first-open', { direction })
      expect(await expanded(page)).toEqual(['true', 'false', 'false'])
      await pressTo(page, 'Tab', 'How do I install a component?')
      await expectRing(page, 'the open header')
      await page.keyboard.press('Enter')
      await expect.poll(() => expanded(page)).toEqual(['false', 'false', 'false'])
      await pressTo(page, 'Tab', 'Does it work in Arabic?')
      await pressTo(page, 'Tab', 'How big is the bundle?')
      await pressTo(page, 'Shift+Tab', 'Does it work in Arabic?')
      await page.keyboard.press('Space')
      await expect.poll(() => expanded(page)).toEqual(['false', 'true', 'false'])
    })

    test('a disabled header keeps its tab stop and its ring, and neither key opens it', async ({ page }) => {
      await openLive(page, 'accordion--disabled', { direction })
      await pressTo(page, 'Tab', 'Profile')
      await pressTo(page, 'Tab', 'Billing')
      await expectRing(page, 'the disabled header')
      await page.keyboard.press('Enter')
      await page.keyboard.press('Space')
      expect(await expanded(page)).toEqual(['false', 'false', 'false'])
      await pressTo(page, 'Tab', 'Members')
    })
  })
}
