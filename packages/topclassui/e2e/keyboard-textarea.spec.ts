import { expect, test, type Locator, type Page } from '@playwright/test'

import { DIRECTIONS } from '../scripts/lib/harness.js'
import { serverEntries } from './form.js'
import { expectNoRing, expectRing, walk } from './keyboard.js'
import { liveErrors, openLive } from './live.js'

// R-5.6-1 for a textarea, which the Authoring Practices give no pattern of its own: the native keys, in Chromium, in
// both directions. Tab leaves it rather than typing a tab, Enter types a line and never submits, the caret keys move.

const areaOf = (page: Page, name: string) => page.getByRole('textbox', { name, exact: true })
const caret = (area: Locator) => area.evaluate((el) => (el as HTMLTextAreaElement).selectionStart)

test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

for (const direction of DIRECTIONS) {
  test.describe(direction, () => {
    test('Tab reaches each live textarea, a full one too, and skips a disabled one; Shift+Tab walks back', async ({ page }) => {
      await openLive(page, 'textarea--states', { direction })
      expect(await walk(page, 5)).toEqual(['idle', 'hover', 'focus-visible', 'invalid', 'Message at its limit'])
      expect(await walk(page, 2, 'Shift+Tab')).toEqual(['invalid', 'focus-visible'])
    })

    test('the focused textarea paints the ring', async ({ page }) => {
      await openLive(page, 'textarea--basic', { direction })
      const area = page.locator('#textarea-basic-bio')
      await expectNoRing(area, 'the textarea at rest')
      await page.keyboard.press('Tab')
      await expect(area).toBeFocused()
      await expectRing(area, 'the textarea')
    })

    test('Tab leaves the textarea instead of typing a tab, and Enter types a new line instead of submitting', async ({ page }) => {
      await openLive(page, 'textarea--form', { direction })
      const message = page.locator('#textarea-form-message')
      await page.keyboard.press('Tab')
      await expect(message).toBeFocused()
      await page.keyboard.press('End')
      await page.keyboard.press('Enter')
      await page.keyboard.type('there')
      await expect(message).toHaveValue('Hello\nthere')
      await page.keyboard.press('Tab')
      await expect(page.locator('#textarea-form-notes')).toBeFocused()
      await expect(message).toHaveValue('Hello\nthere')
      expect(await serverEntries(page)).toEqual([['message', 'Hello\nthere'], ['notes', '']])
      await expect(page).toHaveURL(/textarea--form/)
    })

    test('Home and End go to the ends of the line, and ArrowUp and ArrowDown move between lines', async ({ page }) => {
      await openLive(page, 'textarea--form', { direction })
      const message = page.locator('#textarea-form-message')
      await page.keyboard.press('Tab')
      await page.keyboard.press('Control+End')
      await page.keyboard.press('Enter')
      await page.keyboard.type('World')
      const seen: string[] = []
      for (const key of ['Home', 'End', 'ArrowUp', 'Home', 'ArrowDown', 'Control+Home', 'Control+End']) {
        await page.keyboard.press(key)
        seen.push(`${key} ${String(await caret(message))}`)
      }
      expect(seen).toEqual(['Home 6', 'End 11', 'ArrowUp 5', 'Home 0', 'ArrowDown 6', 'Control+Home 0', 'Control+End 11'])
    })

    test('a read-only textarea takes the focus and the ring, and a key types nothing into it', async ({ page }) => {
      await openLive(page, 'textarea--read-only', { direction })
      await walk(page, 1)
      const area = areaOf(page, 'Read-only')
      await expect(area).toBeFocused()
      await expectRing(area, 'the read-only textarea')
      await page.keyboard.type('x')
      await page.keyboard.press('Enter')
      await page.keyboard.press('Backspace')
      await expect(area).toHaveValue('Kept as it was sent')
    })
  })
}
