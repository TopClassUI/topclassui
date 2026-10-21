import { expect, test, type Page } from '@playwright/test'

import { DIRECTIONS } from '../scripts/lib/harness.js'
import { expectNoRing, expectRing, focusedName, walk } from './keyboard.js'
import { liveErrors, openLive } from './live.js'
import { OPENED, atRest, expectClosed } from './overlay.js'

// R-5.6-1, the Authoring Practices select-only combobox in Chromium, both directions: the keys that open it, the keys
// inside the list, Escape and the focus back on the trigger. select.keyboard.dom.test.tsx in happy-dom; e2e/select.spec.ts
// already walks sixty rows and the letters on the closed trigger, which this spec does not repeat.

const POPUP = '[data-placement]'
const trigger = (page: Page, name = 'Country') => page.getByRole('combobox', { name, exact: true })
const popupOf = (page: Page) => page.locator(`${POPUP}${OPENED}`)
const hidden = (page: Page) => page.locator('#demo input[aria-hidden="true"]').first().inputValue()

async function opened(page: Page) {
  const popup = popupOf(page)
  await expect(popup).toBeVisible()
  await atRest(popup)
  return popup
}

/** Presses a key in the open list and names the option that has the focus. */
async function press(page: Page, key: string) {
  await page.keyboard.press(key)
  return focusedName(page)
}

test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

for (const direction of DIRECTIONS) {
  test.describe(direction, () => {
    test('Tab reaches each live trigger, one stop each, and skips a disabled one', async ({ page }) => {
      await openLive(page, 'select--states', { direction })
      expect(await walk(page, 6)).toEqual(['idle', 'hover', 'focus-visible', 'open', 'invalid', 'read-only'])
      expect(await walk(page, 1, 'Shift+Tab')).toEqual(['invalid'])
    })

    test('the focused trigger paints the ring, and the highlighted option paints it inside its edge', async ({ page }) => {
      await openLive(page, 'select--basic', { direction })
      await expectNoRing(trigger(page), 'the trigger at rest')
      await page.keyboard.press('Tab')
      await expect(trigger(page)).toBeFocused()
      await expectRing(trigger(page), 'the trigger')
      await page.keyboard.press('ArrowDown')
      const popup = await opened(page)
      const jordan = popup.getByRole('option', { name: 'Jordan', exact: true })
      await expect(jordan).toBeFocused()
      await expectRing(jordan, 'the highlighted option')
      await expectNoRing(popup.getByRole('option', { name: 'Egypt', exact: true }), 'an option the keyboard is not on')
    })

    // Base UI opens on a vertical arrow whatever the modifier, so Alt with one opens as the arrow does (useListNavigation.js:563-569).
    for (const key of ['ArrowDown', 'ArrowUp', 'Enter', 'Space', 'Alt+ArrowDown', 'Alt+ArrowUp'] as const) {
      test(`${key} on the closed trigger opens the list on the chosen option`, async ({ page }) => {
        await openLive(page, 'select--basic', { direction })
        await page.keyboard.press('Tab')
        await page.keyboard.press(key)
        await opened(page)
        await expect.poll(() => focusedName(page)).toBe('Jordan')
      })
    }

    // Base UI's trigger acts on the main-axis arrows, Enter and Space only (useListNavigation.js:536, :563).
    test('Home, End, PageUp and PageDown on the closed trigger leave it closed, focused and on the chosen option', async ({ page }) => {
      await openLive(page, 'select--basic', { direction })
      await page.keyboard.press('Tab')
      for (const key of ['Home', 'End', 'PageUp', 'PageDown']) {
        await page.keyboard.press(key)
        await page.evaluate(() => new Promise((done) => { requestAnimationFrame(() => { requestAnimationFrame(done) }) }))
        await expectClosed(page, POPUP)
        await expect(trigger(page), key).toBeFocused()
        await expect(trigger(page), key).toHaveText('Jordan')
      }
      expect(await hidden(page)).toBe('jo')
    })

    test('in the list the arrows move and stop at both ends, Home and End go to the ends, and a letter to the option it starts', async ({ page }) => {
      await openLive(page, 'select--basic', { direction })
      await page.keyboard.press('Tab')
      await page.keyboard.press('ArrowDown')
      await opened(page)
      const seen: string[] = []
      for (const key of ['ArrowDown', 'ArrowDown', 'ArrowDown', 'ArrowDown', 'ArrowUp', 'Home', 'ArrowUp', 'End', 'm']) seen.push(`${key} ${await press(page, key)}`)
      expect(seen).toEqual(['ArrowDown Egypt', 'ArrowDown Morocco', 'ArrowDown Saudi Arabia', 'ArrowDown Saudi Arabia', 'ArrowUp Morocco', 'Home Jordan', 'ArrowUp Jordan', 'End Saudi Arabia', 'm Morocco'])
    })

    test('the side arrows leave the list as it is: a list runs top to bottom in both directions', async ({ page }) => {
      await openLive(page, 'select--basic', { direction })
      await page.keyboard.press('Tab')
      await page.keyboard.press('ArrowDown')
      await opened(page)
      expect([await press(page, 'ArrowLeft'), await press(page, 'ArrowRight')]).toEqual(['Jordan', 'Jordan'])
      await expect(popupOf(page)).toBeVisible()
    })

    test('Enter chooses the focused option, closes the list and gives the focus back to the trigger', async ({ page }) => {
      await openLive(page, 'select--basic', { direction })
      await page.keyboard.press('Tab')
      await page.keyboard.press('ArrowDown')
      await opened(page)
      await page.keyboard.press('ArrowDown')
      await page.keyboard.press('Enter')
      await expectClosed(page, POPUP)
      await expect(trigger(page)).toBeFocused()
      await expect(trigger(page)).toHaveText('Egypt')
      expect(await hidden(page)).toBe('eg')
      await expectRing(trigger(page), 'the trigger the focus came back to')
    })

    test('Space chooses as Enter does', async ({ page }) => {
      await openLive(page, 'select--basic', { direction })
      await page.keyboard.press('Tab')
      await page.keyboard.press('ArrowDown')
      await opened(page)
      await page.keyboard.press('End')
      await page.keyboard.press('Space')
      await expectClosed(page, POPUP)
      await expect(trigger(page)).toBeFocused()
      expect(await hidden(page)).toBe('sa')
    })

    test('Escape closes with the value as it was and gives the focus back to the trigger', async ({ page }) => {
      await openLive(page, 'select--basic', { direction })
      await page.keyboard.press('Tab')
      await page.keyboard.press('ArrowDown')
      await opened(page)
      await page.keyboard.press('End')
      await page.keyboard.press('Escape')
      await expectClosed(page, POPUP)
      await expect(trigger(page)).toBeFocused()
      await expect(trigger(page)).toHaveText('Jordan')
      expect(await hidden(page)).toBe('jo')
    })

    test('a read-only trigger takes the focus and the ring; it opens, as Base UI\'s does (DECISIONS, 15 October), and no key changes it', async ({ page }) => {
      await openLive(page, 'select--states', { direction })
      await walk(page, 6)
      const readOnly = trigger(page, 'read-only')
      await expect(readOnly).toBeFocused()
      await expectRing(readOnly, 'the read-only trigger')
      await page.keyboard.press('ArrowDown')
      await opened(page)
      await page.keyboard.press('Home')
      await page.keyboard.press('Enter')
      await page.keyboard.press('Escape')
      await expectClosed(page, POPUP)
      await expect(readOnly).toBeFocused()
      await expect(readOnly).toHaveText('Jordan')
    })
  })
}
