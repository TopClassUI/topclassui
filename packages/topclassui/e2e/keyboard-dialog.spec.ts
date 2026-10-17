import { expect, test } from '@playwright/test'

import { DIRECTIONS } from '../scripts/lib/harness.js'
import { expectRing, focused, pressTo } from './keyboard.js'
import { openLive } from './live.js'
import { atRest, expectClosed, openOverlay } from './overlay.js'

// R-5.6-1, the modal dialog pattern: Enter or Space on the trigger opens it with the focus on its first
// control, Tab and Shift+Tab wrap inside it, Escape and every close button shut it and give the focus back.

/** The built-in x, as each direction's labels name it. */
const CLOSE = { ltr: 'Close this dialog', rtl: 'إغلاق هذا الحوار' } as const

for (const direction of DIRECTIONS) {
  const close = CLOSE[direction]
  test.describe(direction, () => {
    test('Enter opens it on the first control, Tab and Shift+Tab wrap inside it with a ring on each stop', async ({ page }) => {
      await openLive(page, 'dialog--basic', { direction })
      await pressTo(page, 'Tab', 'Publish')
      const popup = await openOverlay(page, page.getByRole('button', { name: 'Publish' }), { by: 'keyboard' })
      expect(await focused(page)).toBe(close)
      await expectRing(page, 'the x')
      for (const name of ['Cancel', 'Publish now', close]) {
        await pressTo(page, 'Tab', name)
        await expectRing(page, name)
      }
      await pressTo(page, 'Shift+Tab', 'Publish now')
      await pressTo(page, 'Shift+Tab', 'Cancel')
      await pressTo(page, 'Shift+Tab', close)
      await pressTo(page, 'Shift+Tab', 'Publish now')
      await expect(popup).toBeVisible()
    })

    test('Escape closes it and the focus goes back to the trigger, with its ring', async ({ page }) => {
      await openLive(page, 'dialog--basic', { direction })
      await pressTo(page, 'Tab', 'Publish')
      await openOverlay(page, page.getByRole('button', { name: 'Publish' }), { by: 'keyboard' })
      await pressTo(page, 'Tab', 'Cancel')
      await page.keyboard.press('Escape')
      await expectClosed(page)
      await expect.poll(() => focused(page)).toBe('Publish')
      await expectRing(page, 'the trigger after Escape')
    })

    test('Space opens it too, and Enter and Space on a close button shut it and give the focus back', async ({ page }) => {
      await openLive(page, 'dialog--basic', { direction })
      const trigger = page.getByRole('button', { name: 'Publish', exact: true })
      await pressTo(page, 'Tab', 'Publish')
      await page.keyboard.press('Space')
      const popup = page.getByRole('dialog')
      await expect(popup).toBeVisible()
      await atRest(popup)
      await pressTo(page, 'Tab', 'Cancel')
      await page.keyboard.press('Enter')
      await expectClosed(page)
      await expect.poll(() => focused(page)).toBe('Publish')

      await openOverlay(page, trigger, { by: 'keyboard' })
      await pressTo(page, 'Shift+Tab', 'Publish now')
      await page.keyboard.press('Space')
      await expectClosed(page)
      await expect.poll(() => focused(page)).toBe('Publish')
    })

    test('non-modal: Escape closes it and gives the focus back, and Tab past its last control leaves it', async ({ page }) => {
      await openLive(page, 'dialog--non-modal', { direction })
      const trigger = page.getByRole('button', { name: 'Find and replace' })
      await pressTo(page, 'Tab', 'Find and replace')
      await openOverlay(page, trigger, { by: 'keyboard' })
      await page.keyboard.press('Escape')
      await expectClosed(page)
      await expect.poll(() => focused(page)).toBe('Find and replace')

      await openOverlay(page, trigger, { by: 'keyboard' })
      await pressTo(page, 'Tab', 'Done')
      await pressTo(page, 'Tab', 'Behind the panel')
      await expectRing(page, 'the button behind the panel')
    })
  })
}
