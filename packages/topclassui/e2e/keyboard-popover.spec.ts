import { expect, test } from '@playwright/test'

import { DIRECTIONS } from '../scripts/lib/harness.js'
import { SENTINEL, addSentinel, expectRing, focused, pressTo } from './keyboard.js'
import { openLive } from './live.js'
import { expectClosed, openOverlay } from './overlay.js'

// R-5.6-1: a popover is a dialog that does not hold the page. Enter or Space on the trigger opens it with the
// focus on its first control, Escape closes it and gives the focus back, Tab past its end closes it and goes on
// to the control after the trigger, and Shift+Tab past its start goes back to the trigger and leaves it open.
// A modal one holds Tab and wraps, as a dialog does.

/** The x a PopoverClose draws, as each direction's labels name it. */
const CLOSE = { ltr: 'Close', rtl: 'إغلاق' } as const

for (const direction of DIRECTIONS) {
  test.describe(direction, () => {
    test('Enter opens it on its first control with a ring, and Escape closes it and gives the trigger its focus and ring back', async ({ page }) => {
      await openLive(page, 'popover--basic', { direction })
      await pressTo(page, 'Tab', 'Share')
      await openOverlay(page, page.getByRole('button', { name: 'Share' }), { by: 'keyboard' })
      expect(await focused(page)).toBe('Copy link')
      await expectRing(page, 'Copy link')
      await page.keyboard.press('Escape')
      await expectClosed(page)
      await expect.poll(() => focused(page)).toBe('Share')
      await expectRing(page, 'the trigger after Escape')
    })

    test('Space opens it too, and Tab past its last control closes it and goes on to the control after the trigger', async ({ page }) => {
      await openLive(page, 'popover--basic', { direction })
      await addSentinel(page)
      await pressTo(page, 'Tab', 'Share')
      await page.keyboard.press('Space')
      await expect.poll(() => focused(page)).toBe('Copy link')
      await pressTo(page, 'Tab', SENTINEL)
      await expectClosed(page)
    })

    test('with a form: Tab goes through its fields and actions, and Shift+Tab past the first goes back to the trigger, from where Tab enters it again', async ({ page }) => {
      await openLive(page, 'popover--with-form', { direction })
      await pressTo(page, 'Tab', 'Rename')
      await openOverlay(page, page.getByRole('button', { name: 'Rename' }), { by: 'keyboard' })
      expect(await focused(page)).toBe('input')
      await expectRing(page, 'the field')
      await pressTo(page, 'Tab', 'Cancel')
      await pressTo(page, 'Tab', 'Save')
      await pressTo(page, 'Shift+Tab', 'Cancel')
      await pressTo(page, 'Shift+Tab', 'input')
      await pressTo(page, 'Shift+Tab', 'Rename')
      await expect(page.getByRole('dialog')).toBeVisible()
      await pressTo(page, 'Tab', 'input')
    })

    test('opened on hover, the keyboard still opens it with Enter and reaches its link', async ({ page }) => {
      await openLive(page, 'popover--hover', { direction })
      await pressTo(page, 'Tab', 'Billing details')
      await openOverlay(page, page.getByRole('button', { name: 'Billing details' }), { by: 'keyboard' })
      expect(await focused(page)).toBe('Read the guide')
      await expectRing(page, 'the link')
      await page.keyboard.press('Escape')
      await expectClosed(page)
      await expect.poll(() => focused(page)).toBe('Billing details')
    })

    test('modal: Tab and Shift+Tab wrap inside it, and Escape gives the focus back', async ({ page }) => {
      const close = CLOSE[direction]
      await openLive(page, 'popover--modal', { direction })
      await pressTo(page, 'Tab', 'Delete draft')
      await openOverlay(page, page.getByRole('button', { name: 'Delete draft' }), { by: 'keyboard' })
      expect(await focused(page)).toBe(close)
      for (const name of ['Keep it', 'Delete', close, 'Keep it']) {
        await pressTo(page, 'Tab', name)
        await expectRing(page, name)
      }
      await pressTo(page, 'Shift+Tab', close)
      await pressTo(page, 'Shift+Tab', 'Delete')
      await page.keyboard.press('Escape')
      await expectClosed(page)
      await expect.poll(() => focused(page)).toBe('Delete draft')
    })
  })
}
