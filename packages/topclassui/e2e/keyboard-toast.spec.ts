import { expect, test, type Page } from '@playwright/test'

import { DIRECTIONS } from '../scripts/lib/harness.js'
import { expectRing, focused, pressTo } from './keyboard.js'
import { openLive } from './live.js'
import { atRest } from './overlay.js'

// R-5.6-1: a toast never takes the focus. F6 or Tab reaches it, Tab walks the toast, its action and its x,
// and Escape closes the focused toast. R-5.6-3: the swipe that closes a toast has a keyboard path, Escape,
// and a button path, the x, by Enter or by Space. Each gives the focus back to where it came from.

const ROOTS = '[role="region"] > [role="dialog"], [role="region"] > [role="alertdialog"]'
const shown = (page: Page) => page.locator(`:is(${ROOTS}):visible`)
const CLOSE = { ltr: 'Dismiss this notification', rtl: 'إغلاق هذا الإشعار' } as const
const OFFLINE = 'You are offlineChanges are kept here until you reconnect.'

/** Opens a demo, focuses its first button and presses Enter, which adds one toast; returns once it is at rest. */
async function raise(page: Page, demo: string, direction: (typeof DIRECTIONS)[number], trigger: string): Promise<void> {
  await openLive(page, demo, { direction })
  await pressTo(page, 'Tab', trigger)
  await page.keyboard.press('Enter')
  await expect(shown(page)).toHaveCount(1)
  await atRest(shown(page).first())
  expect(await focused(page), 'a new toast takes no focus').toBe(trigger)
}

for (const direction of DIRECTIONS) {
  const close = CLOSE[direction]

  test.describe(direction, () => {
    test('F6 reaches the region, Tab walks the toast, its action and its x with a ring on each', async ({ page }) => {
      await raise(page, 'toast--with-action', direction, 'Archive')
      await page.keyboard.press('F6')
      await expect.poll(() => page.evaluate(() => document.activeElement?.getAttribute('role'))).toBe('region')
      for (const name of ['Project archivedUndo', 'Undo', close]) {
        await pressTo(page, 'Tab', name)
        await expectRing(page, name)
      }
      await pressTo(page, 'Shift+Tab', 'Undo')
    })

    test('reached by Tab, Escape closes the focused toast and the focus goes back to the trigger with its ring', async ({ page }) => {
      await raise(page, 'toast--sticky', direction, 'Go offline')
      await pressTo(page, 'Tab', OFFLINE)
      await page.keyboard.press('Escape')
      await expect(shown(page)).toHaveCount(0)
      await expect.poll(() => focused(page)).toBe('Go offline')
      await expectRing(page, 'the trigger after Escape')
    })

    for (const key of ['Enter', 'Space'] as const) {
      test(`reached by Tab, ${key} on the x closes it and the focus goes back to the trigger`, async ({ page }) => {
        await raise(page, 'toast--sticky', direction, 'Go offline')
        await pressTo(page, 'Tab', OFFLINE)
        await pressTo(page, 'Tab', close)
        await page.keyboard.press(key)
        await expect(shown(page)).toHaveCount(0)
        await expect.poll(() => focused(page)).toBe('Go offline')
      })
    }

    test('reached by F6, Escape closes it and the focus goes back to where it was', async ({ page }) => {
      await raise(page, 'toast--sticky', direction, 'Go offline')
      await page.keyboard.press('F6')
      await pressTo(page, 'Tab', OFFLINE)
      await page.keyboard.press('Escape')
      await expect(shown(page)).toHaveCount(0)
      await expect.poll(() => focused(page)).toBe('Go offline')
    })

    test('Escape on the page closes no toast, and closing one of several moves the focus to the next', async ({ page }) => {
      await openLive(page, 'toast--many', { direction })
      await pressTo(page, 'Tab', 'Twenty messages')
      await page.keyboard.press('Enter')
      await expect(shown(page)).toHaveCount(3)
      await page.keyboard.press('Escape')
      await expect(shown(page)).toHaveCount(3)
      await page.keyboard.press('F6')
      await page.keyboard.press('Tab')
      const first = await focused(page)
      await page.keyboard.press('Escape')
      await expect.poll(() => focused(page)).not.toBe(first)
      expect(await page.evaluate(() => document.activeElement?.closest('[role="region"]') !== null)).toBe(true)
      await expectRing(page, 'the next toast')
    })
  })
}
