import { expect, test, type Page } from '@playwright/test'

import { DIRECTIONS } from '../scripts/lib/harness.js'
import { expectNoRing, expectRing, walk } from './ring.js'
import { liveErrors, openLive } from './live.js'
import { OPENED, atRest, expectClosed } from './overlay.js'

// R-5.6-1, the editable combobox of the Authoring Practices in Chromium, both directions: the focus stays on the input
// and aria-activedescendant names the row. combobox.keyboard.dom.test.tsx in happy-dom; e2e/combobox.spec.ts walks
// the long lists, which this spec does not repeat.

const POPUP = '[data-placement]'
const inputOf = (page: Page, name = 'Framework') => page.getByRole('combobox', { name, exact: true })
const popupOf = (page: Page) => page.locator(`${POPUP}${OPENED}`)

/** The text of the row aria-activedescendant names, or null while the highlight is on the input. */
const active = (page: Page, name = 'Framework') => inputOf(page, name).evaluate((input) => {
  const id = input.getAttribute('aria-activedescendant')
  return id === null ? null : (document.getElementById(id)?.textContent ?? '(missing)')
})

async function opened(page: Page) {
  const popup = popupOf(page)
  await expect(popup).toBeVisible()
  await atRest(popup)
  return popup
}

async function press(page: Page, key: string, name?: string) {
  await page.keyboard.press(key)
  return active(page, name)
}

test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

for (const direction of DIRECTIONS) {
  test.describe(direction, () => {
    test('Tab reaches each live input, one stop each, and skips a disabled one', async ({ page }) => {
      await openLive(page, 'combobox--states', { direction })
      expect(await walk(page, 3)).toEqual(['Invalid', 'Read-only', 'One option disabled'])
      expect(await walk(page, 1, 'Shift+Tab')).toEqual(['Read-only'])
    })

    test('the focused input paints the ring and keeps the focus while the list is open; the highlighted row paints it too', async ({ page }) => {
      await openLive(page, 'combobox--basic', { direction })
      await expectNoRing(inputOf(page), 'the input at rest')
      await page.keyboard.press('Tab')
      await expect(inputOf(page)).toBeFocused()
      await expectRing(inputOf(page), 'the input')
      await page.keyboard.press('ArrowDown')
      const popup = await opened(page)
      await expect(inputOf(page)).toBeFocused()
      await expectRing(popup.getByRole('option', { name: 'Next.js', exact: true }), 'the highlighted row')
      await expectNoRing(popup.getByRole('option', { name: 'Astro', exact: true }), 'a row the keyboard is not on')
    })

    test('ArrowDown opens on the first row and ArrowUp on the last; the arrows move and wrap through the input', async ({ page }) => {
      await openLive(page, 'combobox--basic', { direction })
      await page.keyboard.press('Tab')
      expect(await press(page, 'ArrowDown')).toBe('Next.js')
      await opened(page)
      expect([await press(page, 'ArrowDown'), await press(page, 'ArrowUp'), await press(page, 'ArrowUp'), await press(page, 'ArrowUp')])
        .toEqual(['Astro', 'Next.js', null, 'Angular'])
      await page.keyboard.press('Escape')
      await expectClosed(page, POPUP)
      expect(await press(page, 'ArrowUp')).toBe('Angular')
    })

    test('the side arrows, Home and End move the caret only: the highlight stays and the list stays open', async ({ page }) => {
      await openLive(page, 'combobox--basic', { direction })
      await page.keyboard.press('Tab')
      await page.keyboard.type('a')
      await opened(page)
      expect(await press(page, 'ArrowDown')).toBe('Astro')
      for (const key of ['ArrowLeft', 'ArrowRight', 'Home', 'End']) expect(await press(page, key), key).toBe('Astro')
      await expect(popupOf(page)).toBeVisible()
      await expect(inputOf(page)).toHaveValue('a')
    })

    test('typing opens the list on the matches; Enter chooses the highlighted row and closes, the focus still on the input', async ({ page }) => {
      await openLive(page, 'combobox--basic', { direction })
      await page.keyboard.press('Tab')
      await page.keyboard.type('vel')
      const popup = await opened(page)
      await expect(popup.getByRole('option')).toHaveText(['SvelteKit'])
      await page.keyboard.press('ArrowDown')
      await page.keyboard.press('Enter')
      await expectClosed(page, POPUP)
      await expect(inputOf(page)).toBeFocused()
      await expect(inputOf(page)).toHaveValue('SvelteKit')
    })

    test('Escape closes the list and keeps the value; a second Escape, on the closed input, clears it', async ({ page }) => {
      await openLive(page, 'combobox--basic', { direction })
      await page.keyboard.press('Tab')
      await page.keyboard.press('ArrowDown')
      await page.keyboard.press('Enter')
      await expect(inputOf(page)).toHaveValue('Next.js')
      await page.keyboard.press('ArrowDown')
      await opened(page)
      await page.keyboard.press('Escape')
      await expectClosed(page, POPUP)
      await expect(inputOf(page)).toBeFocused()
      await expect(inputOf(page)).toHaveValue('Next.js')
      await page.keyboard.press('Escape')
      await expect(inputOf(page)).toHaveValue('')
    })

    // AriaCombobox.js:1014: read-only locks the value, not the browsing; ComboboxInput.js:294 stops the Enter.
    test('a read-only input opens on the arrows and the highlight moves and wraps, but Enter, a letter and Backspace change nothing', async ({ page }) => {
      await openLive(page, 'combobox--states', { direction })
      await walk(page, 2)
      const name = 'Read-only'
      await expect(inputOf(page, name)).toHaveValue('Saudi Arabia')
      expect(await press(page, 'ArrowDown', name)).toBe('Saudi Arabia')
      await opened(page)
      expect([await press(page, 'ArrowDown', name), await press(page, 'ArrowDown', name), await press(page, 'ArrowUp', name)]).toEqual([null, 'Jordan', null])
      expect(await press(page, 'ArrowUp', name)).toBe('Saudi Arabia')
      expect(await press(page, 'ArrowUp', name)).toBe('Morocco')
      await page.keyboard.press('Enter')
      await page.keyboard.type('x')
      await page.keyboard.press('Backspace')
      await expect(inputOf(page, name)).toHaveValue('Saudi Arabia')
      await page.keyboard.press('Escape')
      await expectClosed(page, POPUP)
      await expect(inputOf(page, name)).toBeFocused()
      await expect(inputOf(page, name)).toHaveValue('Saudi Arabia')
    })

    test('a disabled option takes the highlight and Enter does not choose it', async ({ page }) => {
      await openLive(page, 'combobox--states', { direction })
      await walk(page, 3)
      const name = 'One option disabled'
      expect([await press(page, 'ArrowDown', name), await press(page, 'ArrowDown', name), await press(page, 'ArrowDown', name)]).toEqual(['Jordan', 'Egypt', 'Morocco'])
      await page.keyboard.press('Enter')
      await expect(popupOf(page)).toBeVisible()
      await expect(inputOf(page, name)).toHaveValue('')
    })
  })
}
