import { expect, test } from '@playwright/test'

import { DIRECTIONS } from '../scripts/lib/harness.js'
import { expectRing, focused, pressTo } from './keyboard.js'
import { openLive } from './live.js'
import { expectClosed, openOverlay } from './overlay.js'

// R-5.6-1, the modal dialog pattern on a sheet: opened from the keyboard the focus moves to its first control,
// Tab and Shift+Tab wrap inside it, Escape closes it and gives the focus back. R-5.6-3: the swipe that closes
// a sheet has a keyboard path, Escape, and a button path, the x every sheet ends with, by Enter or by Space.

/** The x every sheet ends with, as each direction's labels name it. */
const CLOSE = { ltr: 'Close this panel', rtl: 'إغلاق هذه اللوحة' } as const
/** The body of drawer--bottom, a tab stop because its list scrolls, read by its text: every country. */
const COUNTRIES = 'JordanEgyptMoroccoTunisiaAlgeriaLebanonIraqKuwaitQatarBahrainOmanYemenSudanLibyaPalestineSyriaMauritaniaSomaliaDjiboutiComorosTurkeyCyprusGreeceItaly'

for (const direction of DIRECTIONS) {
  const close = CLOSE[direction]

  test.describe(direction, () => {
    test('Enter opens it on its first control with a ring, and Tab and Shift+Tab wrap from the links to the x and round', async ({ page }) => {
      await openLive(page, 'drawer--start', { direction })
      await pressTo(page, 'Tab', 'Menu')
      const sheet = await openOverlay(page, page.getByRole('button', { name: 'Menu' }), { by: 'keyboard' })
      expect(await focused(page)).toBe('Documentation')
      expect(await sheet.evaluate((element) => element === document.activeElement)).toBe(false)
      await expectRing(page, 'the first link')
      for (const name of ['Components', 'Changelog', close]) {
        await pressTo(page, 'Tab', name)
        await expectRing(page, name)
      }
      await pressTo(page, 'Tab', 'Documentation')
      await pressTo(page, 'Shift+Tab', close)
      await pressTo(page, 'Shift+Tab', 'Changelog')
    })

    test('Escape closes it, the keyboard path for the swipe, and the focus goes back to the trigger with its ring', async ({ page }) => {
      await openLive(page, 'drawer--bottom', { direction })
      await pressTo(page, 'Tab', 'Country')
      await openOverlay(page, page.getByRole('button', { name: 'Country' }), { by: 'keyboard' })
      await expect.poll(() => focused(page)).toBe(COUNTRIES)
      await pressTo(page, 'Tab', 'Jordan')
      await page.keyboard.press('Escape')
      await expectClosed(page)
      await expect.poll(() => focused(page)).toBe('Country')
      await expectRing(page, 'the trigger after Escape')
    })

    for (const key of ['Enter', 'Space'] as const) {
      test(`${key} on the x closes the sheet, the button path for the swipe, and the focus goes back`, async ({ page }) => {
        await openLive(page, 'drawer--bottom', { direction })
        await pressTo(page, 'Tab', 'Country')
        await openOverlay(page, page.getByRole('button', { name: 'Country' }), { by: 'keyboard' })
        await pressTo(page, 'Shift+Tab', close)
        await expectRing(page, 'the x')
        await page.keyboard.press(key)
        await expectClosed(page)
        await expect.poll(() => focused(page)).toBe('Country')
      })
    }

    test('non-modal: it opens on its first control, Tab past the x closes it and goes on to the page, and Escape gives the focus back', async ({ page }) => {
      await openLive(page, 'drawer--non-modal', { direction })
      const trigger = page.getByRole('button', { name: 'Outline' })
      await pressTo(page, 'Tab', 'Outline')
      await openOverlay(page, trigger, { by: 'keyboard' })
      expect(await focused(page)).toBe('Done')
      await page.keyboard.press('Escape')
      await expectClosed(page)
      await expect.poll(() => focused(page)).toBe('Outline')

      await openOverlay(page, trigger, { by: 'keyboard' })
      await pressTo(page, 'Tab', close)
      await pressTo(page, 'Tab', 'Behind the panel')
      await expectClosed(page)
      await expectRing(page, 'the button beside the sheet')
    })

    test('trap-focus: it opens on its first control, and Tab and Shift+Tab go round inside it and never reach the page', async ({ page }) => {
      await openLive(page, 'drawer--trap-focus', { direction })
      await pressTo(page, 'Tab', 'Inspect')
      const sheet = await openOverlay(page, page.getByRole('button', { name: 'Inspect' }), { by: 'keyboard' })
      expect(await focused(page)).toBe('Done')
      for (const name of [close, 'Done', close]) {
        await pressTo(page, 'Tab', name)
        await expectRing(page, name)
      }
      await pressTo(page, 'Shift+Tab', 'Done')
      await pressTo(page, 'Shift+Tab', close)
      await expect(sheet).toBeVisible()
      await page.keyboard.press('Escape')
      await expectClosed(page)
      await expect.poll(() => focused(page)).toBe('Inspect')
    })

    test('opened on its scrolling body, Tab goes on to the first control in it, and Enter on a close control picks it and closes the sheet', async ({ page }) => {
      await openLive(page, 'drawer--bottom', { direction })
      await pressTo(page, 'Tab', 'Country')
      await openOverlay(page, page.getByRole('button', { name: 'Country' }), { by: 'keyboard' })
      await expect.poll(() => focused(page)).toBe(COUNTRIES)
      await expectRing(page, 'the scrolling body')
      await pressTo(page, 'Tab', 'Jordan')
      await pressTo(page, 'Tab', 'Egypt')
      await page.keyboard.press('Enter')
      await expectClosed(page)
      await expect.poll(() => focused(page)).toBe('Country')
    })
  })
}
