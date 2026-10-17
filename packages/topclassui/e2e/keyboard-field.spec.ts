import { expect, test, type Page } from '@playwright/test'

import { DIRECTIONS } from '../scripts/lib/harness.js'
import { expectRing } from './keys.js'
import { liveErrors, openLive } from './live.js'

// R-5.6-1 for Field, which has no keys of its own: that it takes none from the eleven controls it wraps. Each is one
// tab stop with its ring, in order both ways, and the keys of the composite ones still work inside it, mirrored in RTL.
// field.spec.ts has the labels, Space on a checkbox in a form, and that no ring is cut.

const STOPS = [
  ['textbox', 'Email'], ['textbox', 'Bio'], ['checkbox', 'Terms'], ['switch', 'Digest'], ['radio', 'Free'], ['radio', 'Board'],
  ['slider', 'Volume'], ['textbox', 'Guests'], ['textbox', 'Code'], ['combobox', 'Country'], ['combobox', 'City'],
] as const

const stop = (page: Page, [role, name]: readonly [Parameters<Page['getByRole']>[0], string]) => page.locator('#demo').getByRole(role, { name, exact: true })

test.describe('live: every control keeps its keys inside a Field', () => {
  test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

  for (const direction of DIRECTIONS) {
    test(`${direction}: Tab stops once on each of the eleven controls with its ring, and Shift+Tab walks them back`, async ({ page }) => {
      await openLive(page, 'field--controls', { direction })
      for (const control of STOPS) {
        await page.keyboard.press('Tab')
        await expect(stop(page, control), `Tab to ${control[1]}`).toBeFocused()
        await expectRing(page, control[1])
      }
      await page.keyboard.press('Tab')
      expect(await page.evaluate(() => document.activeElement?.closest('#demo') ?? null), 'Tab past City leaves the form').toBeNull()
      for (const control of [...STOPS].reverse()) {
        await page.keyboard.press('Shift+Tab')
        await expect(stop(page, control), `Shift+Tab to ${control[1]}`).toBeFocused()
        await expectRing(page, control[1])
      }
    })

    test(`${direction}: Space ticks the box and the switch; the arrows choose in the radio group, mirrored, and Tab leaves it in one step`, async ({ page }) => {
      const [forward, back] = direction === 'ltr' ? ['ArrowRight', 'ArrowLeft'] : ['ArrowLeft', 'ArrowRight']
      await openLive(page, 'field--controls', { direction })
      await stop(page, ['checkbox', 'Terms']).focus()
      await page.keyboard.press('Space')
      await expect(stop(page, ['checkbox', 'Terms'])).toBeChecked()
      await page.keyboard.press('Tab')
      await page.keyboard.press('Space')
      await expect(stop(page, ['switch', 'Digest'])).toBeChecked()
      await page.keyboard.press('Tab')
      await expect(stop(page, ['radio', 'Free'])).toBeFocused()
      await page.keyboard.press(forward)
      await expect(stop(page, ['radio', 'Pro'])).toBeFocused()
      await expect(stop(page, ['radio', 'Pro'])).toBeChecked()
      await expectRing(page, 'Pro')
      await page.keyboard.press(back)
      await expect(stop(page, ['radio', 'Free'])).toBeChecked()
      await page.keyboard.press(forward)
      await page.keyboard.press('Tab')
      await expect(stop(page, ['radio', 'Board'])).toBeFocused()
      await page.keyboard.press(forward)
      await expect(stop(page, ['radio', 'Table'])).toBeChecked()
      await page.keyboard.press('Shift+Tab')
      await expect(stop(page, ['radio', 'Pro']), 'Shift+Tab comes back to the checked radio').toBeFocused()
    })
  }
})
