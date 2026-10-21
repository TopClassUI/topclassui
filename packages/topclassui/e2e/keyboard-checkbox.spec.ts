import { expect, test, type Page } from '@playwright/test'

import { DIRECTIONS } from '../scripts/lib/harness.js'
import { expectNoRing, expectRing, walk } from './keyboard.js'
import { liveErrors, openLive } from './live.js'

// R-5.6-1, the Authoring Practices checkbox in Chromium: Tab reaches each live box, Space toggles it, Enter submits
// the form as a native checkbox does, no arrow moves it. checkbox.keyboard.dom.test.tsx proves the same in happy-dom.

const boxOf = (page: Page, name: string) => page.getByRole('checkbox', { name, exact: true })

/** Counts the submits of the first form instead of letting the page navigate away. */
const countSubmits = (page: Page) => page.evaluate(() => {
  const form = document.querySelector('form')
  if (!form) throw new Error('countSubmits: no form on the page')
  form.dataset['submits'] = '0'
  form.addEventListener('submit', (event) => {
    event.preventDefault()
    form.dataset['submits'] = String(Number(form.dataset['submits']) + 1)
  })
})

test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

for (const direction of DIRECTIONS) {
  test.describe(direction, () => {
    test('Tab walks the live boxes in order and skips the disabled ones; Shift+Tab walks back', async ({ page }) => {
      await openLive(page, 'checkbox--combined', { direction })
      expect(await walk(page, 7)).toEqual(['Unchecked', 'Checked', 'Indeterminate', 'Invalid', 'Invalid, checked', 'Invalid, indeterminate', 'Read-only'])
      expect(await walk(page, 2, 'Shift+Tab')).toEqual(['Invalid, indeterminate', 'Invalid, checked'])
    })

    test('the focused checkbox paints the ring on its box, and the button itself none', async ({ page }) => {
      await openLive(page, 'checkbox--basic', { direction })
      const control = page.locator('#checkbox-basic-terms')
      const box = control.locator(':scope > span')
      await expectNoRing(box, 'the box at rest')
      await page.keyboard.press('Tab')
      await expect(control).toBeFocused()
      await expectNoRing(control, 'the button')
      await expectRing(box, 'the box')
    })

    test('Space toggles it once per press, off and on', async ({ page }) => {
      await openLive(page, 'checkbox--basic', { direction })
      await page.keyboard.press('Tab')
      const control = page.locator('#checkbox-basic-terms')
      await page.keyboard.press('Space')
      await expect(control).toHaveAttribute('aria-checked', 'false')
      await page.keyboard.press('Space')
      await expect(control).toHaveAttribute('aria-checked', 'true')
    })

    test('Enter leaves the state alone and submits the form; no arrow, Home or End moves it', async ({ page }) => {
      await openLive(page, 'checkbox--form', { direction })
      await countSubmits(page)
      await page.keyboard.press('Tab')
      const control = page.locator('#checkbox-form-terms')
      await expect(control).toBeFocused()
      for (const key of ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End']) await page.keyboard.press(key)
      await expect(control).toBeFocused()
      await page.keyboard.press('Enter')
      await expect(control).toHaveAttribute('aria-checked', 'true')
      await expect(page.locator('form')).toHaveAttribute('data-submits', '1')
    })

    test('Space on an indeterminate box leaves it mixed, its owner\'s to clear; on a read-only one changes nothing', async ({ page }) => {
      await openLive(page, 'checkbox--combined', { direction })
      await walk(page, 3)
      await expect(boxOf(page, 'Indeterminate')).toBeFocused()
      await page.keyboard.press('Space')
      await expect(boxOf(page, 'Indeterminate')).toHaveAttribute('aria-checked', 'mixed')
      await walk(page, 4)
      await expect(boxOf(page, 'Read-only')).toBeFocused()
      await expectRing(boxOf(page, 'Read-only').locator(':scope > span'), 'the read-only box')
      await page.keyboard.press('Space')
      await expect(boxOf(page, 'Read-only')).toHaveAttribute('aria-checked', 'true')
    })
  })
}
