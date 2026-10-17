import { expect, test, type Page } from '@playwright/test'

import { DIRECTIONS } from '../scripts/lib/harness.js'
import { expectRing, focused, pressTo } from './keyboard.js'
import { openLive } from './live.js'

// R-5.6-1, the tooltip pattern: the tooltip shows while its trigger has the keyboard focus, Escape hides
// it and leaves the focus where it was, and it goes when the focus leaves. The trigger is the only tab stop.

/** Found by its data attributes, so the role and the link are asserted, never assumed by the locator. */
const shown = (page: Page) => page.locator('[data-placement][data-open]:visible')

/** The focused trigger's description link, and the id and role of the one tooltip on show. */
const pairing = (page: Page) => page.evaluate(() => {
  const popup = document.querySelector('[data-placement][data-open]')
  return {
    describedBy: document.activeElement?.getAttribute('aria-describedby') ?? null,
    id: popup?.id ?? null,
    role: popup?.getAttribute('role') ?? null,
  }
})

for (const direction of DIRECTIONS) {
  test.describe(direction, () => {
    test('Tab to the trigger shows the tooltip and the ring, and Escape hides it with the focus still there', async ({ page }) => {
      await openLive(page, 'tooltip--basic', { direction })
      await pressTo(page, 'Tab', 'Copy link')
      await expectRing(page, 'the trigger')
      await expect(shown(page)).toHaveText('Copy link')
      const open = await pairing(page)
      expect(open.role).toBe('tooltip')
      expect(open.id).toMatch(/^_[rR]_[0-9a-zA-Z]+_$/)
      expect(open.describedBy).toBe(open.id)
      await page.keyboard.press('Escape')
      await expect(shown(page)).toHaveCount(0)
      expect(await focused(page)).toBe('Copy link')
      expect(await pairing(page)).toEqual({ describedBy: null, id: null, role: null })
      await expectRing(page, 'the trigger after Escape')
    })

    test('the tooltip goes with the focus: Shift+Tab off the trigger hides it, and Tab back shows it again', async ({ page }) => {
      await openLive(page, 'tooltip--basic', { direction })
      await pressTo(page, 'Tab', 'Copy link')
      await expect(shown(page)).toHaveCount(1)
      await page.keyboard.press('Shift+Tab')
      await expect(shown(page)).toHaveCount(0)
      await pressTo(page, 'Tab', 'Copy link')
      await expect(shown(page)).toHaveText('Copy link')
    })

    test('nothing in the tooltip takes the focus: Tab goes from one trigger to the next', async ({ page }) => {
      await openLive(page, 'tooltip--placements', { direction })
      await page.keyboard.press('Tab')
      const first = await focused(page)
      await expect(shown(page)).toHaveCount(1)
      const before = await pairing(page)
      await page.keyboard.press('Tab')
      const second = await focused(page)
      expect(second).not.toBe(first)
      // Each trigger names its own popup, never the one it took over from.
      await expect.poll(async () => (await pairing(page)).describedBy).not.toBe(before.describedBy)
      const after = await pairing(page)
      expect(after.describedBy).toBe(after.id)
      expect(await page.evaluate(() => document.activeElement?.closest('[data-placement]') ?? null)).toBeNull()
      await expectRing(page, second)
    })

    test('disabled: the trigger keeps its tab stop and ring, and no tooltip opens on focus', async ({ page }) => {
      await openLive(page, 'tooltip--disabled', { direction })
      await pressTo(page, 'Tab', 'Rename')
      await expectRing(page, 'the trigger')
      await expect(shown(page)).toHaveCount(0)
    })
  })
}
