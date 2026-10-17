import { expect, test, type Page } from '@playwright/test'

import { DIRECTIONS } from '../scripts/lib/harness.js'
import { expectNoRing, expectRing, walk } from './ring.js'
import { liveErrors, openLive } from './live.js'

// R-5.6-1, the Authoring Practices switch in Chromium: Tab reaches each live one, Space and Enter toggle it, no
// arrow moves it, in both directions. src/components/switch/test/switch.keyboard.dom.test.tsx proves the same in happy-dom.

const switchOf = (page: Page, name: string) => page.getByRole('switch', { name, exact: true })

test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

for (const direction of DIRECTIONS) {
  test.describe(direction, () => {
    test('Tab walks the live switches in order and skips the disabled ones; Shift+Tab walks back', async ({ page }) => {
      await openLive(page, 'switch--states', { direction })
      expect(await walk(page, 5)).toEqual(['Off', 'On', 'Invalid', 'Invalid, on', 'Read-only'])
      expect(await walk(page, 4, 'Shift+Tab')).toEqual(['Invalid, on', 'Invalid', 'On', 'Off'])
    })

    test('the focused switch paints the ring on its track, and the button itself none', async ({ page }) => {
      await openLive(page, 'switch--basic', { direction })
      const control = page.locator('#switch-basic-digest')
      await expectNoRing(control.locator(':scope > span'), 'the track at rest')
      await page.keyboard.press('Tab')
      await expect(control).toBeFocused()
      await expectNoRing(control, 'the button')
      await expectRing(control.locator(':scope > span'), 'the track')
    })

    test('Space and Enter toggle it once per press', async ({ page }) => {
      await openLive(page, 'switch--basic', { direction })
      await page.keyboard.press('Tab')
      const control = page.locator('#switch-basic-digest')
      await expect(control).toBeFocused()
      await page.keyboard.press('Space')
      await expect(control).toHaveAttribute('aria-checked', 'false')
      await page.keyboard.press('Space')
      await expect(control).toHaveAttribute('aria-checked', 'true')
      await page.keyboard.press('Enter')
      await expect(control).toHaveAttribute('aria-checked', 'false')
      await page.keyboard.press('Enter')
      await expect(control).toHaveAttribute('aria-checked', 'true')
    })

    test('no arrow, Home or End toggles it or moves the focus', async ({ page }) => {
      await openLive(page, 'switch--basic', { direction })
      await page.keyboard.press('Tab')
      const control = page.locator('#switch-basic-digest')
      for (const key of ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End']) await page.keyboard.press(key)
      await expect(control).toBeFocused()
      await expect(control).toHaveAttribute('aria-checked', 'true')
    })

    test('a read-only switch takes the focus and the ring, and neither Space nor Enter changes it', async ({ page }) => {
      await openLive(page, 'switch--states', { direction })
      const control = switchOf(page, 'Read-only')
      await walk(page, 5)
      await expect(control).toBeFocused()
      await expectRing(control.locator(':scope > span'), 'the track')
      await page.keyboard.press('Space')
      await page.keyboard.press('Enter')
      await expect(control).toHaveAttribute('aria-checked', 'true')
    })
  })
}
