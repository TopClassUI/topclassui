import { expect, test, type Page } from '@playwright/test'

import { DIRECTIONS } from '../scripts/lib/harness.js'
import { SENTINEL, addSentinel, expectRing, expectRowRing, focused, pressTo } from './keyboard.js'
import { openLive } from './live.js'
import { atRest, expectClosed, openOverlay } from './overlay.js'

// R-5.6-1, the menu button pattern: Enter, Space and ArrowDown open the menu on its first item and ArrowUp on
// its last, the vertical arrows move and wrap through every item, a disabled one too, Home and End go to the
// ends, typing goes to the item that starts with it, Enter and Space pick an item, Escape and Tab close it.
// APG: Tab moves the focus out of the menu and closes it; that it lands after the trigger is Base UI's choice.

const MENU = '[role="menu"]'
const row = (page: Page, name: string) => page.locator(`${MENU} [role="menuitem"]`, { hasText: name })

/** Opens the menu of a focused trigger with a key and waits until it is at rest with an item focused. */
async function openWith(page: Page, key: string, lands: string): Promise<void> {
  await page.keyboard.press(key)
  const menu = page.locator(`${MENU}:visible`)
  await expect(menu).toBeVisible()
  await atRest(menu)
  await expect.poll(() => focused(page), { message: `${key} did not open the menu on ${lands}` }).toBe(lands)
}

for (const direction of DIRECTIONS) {
  test.describe(direction, () => {
    test('Enter opens it on the first item, the vertical arrows move and wrap with a ring on each row, Home and End go to the ends', async ({ page }) => {
      await openLive(page, 'dropdown--basic', { direction })
      await pressTo(page, 'Tab', 'Actions')
      await openWith(page, 'Enter', 'ProfileCtrl P')
      await expectRowRing(row(page, 'Profile'), 'Profile')
      await pressTo(page, 'ArrowDown', 'Settings')
      await expectRowRing(row(page, 'Settings'), 'Settings')
      await pressTo(page, 'ArrowDown', 'Duplicate')
      await pressTo(page, 'ArrowDown', 'Rename')
      await expectRowRing(row(page, 'Rename'), 'the disabled row')
      await pressTo(page, 'ArrowDown', 'DeleteDel')
      await pressTo(page, 'ArrowDown', 'ProfileCtrl P')
      await pressTo(page, 'ArrowUp', 'DeleteDel')
      await expectRowRing(row(page, 'Delete'), 'Delete')
      await pressTo(page, 'Home', 'ProfileCtrl P')
      await pressTo(page, 'End', 'DeleteDel')
    })

    test('Space and ArrowDown open it on the first item, ArrowUp on the last', async ({ page }) => {
      await openLive(page, 'dropdown--basic', { direction })
      await pressTo(page, 'Tab', 'Actions')
      for (const [key, lands] of [['Space', 'ProfileCtrl P'], ['ArrowDown', 'ProfileCtrl P'], ['ArrowUp', 'DeleteDel']] as const) {
        await openWith(page, key, lands)
        await page.keyboard.press('Escape')
        await expectClosed(page, MENU)
        await expect.poll(() => focused(page)).toBe('Actions')
      }
    })

    test('typing goes to the first item that starts with what was typed: a letter, or the start of a word', async ({ page }) => {
      await openLive(page, 'dropdown--basic', { direction })
      await pressTo(page, 'Tab', 'Actions')
      await openWith(page, 'Enter', 'ProfileCtrl P')
      await pressTo(page, 'd', 'Duplicate')
      await page.keyboard.press('Escape')
      await expectClosed(page, MENU)
      await openWith(page, 'Enter', 'ProfileCtrl P')
      await page.keyboard.type('de')
      await expect.poll(() => focused(page)).toBe('DeleteDel')
    })

    test('a disabled item takes the focus but neither Enter nor Space picks it: the menu stays open', async ({ page }) => {
      await openLive(page, 'dropdown--basic', { direction })
      await pressTo(page, 'Tab', 'Actions')
      await openWith(page, 'ArrowUp', 'DeleteDel')
      await pressTo(page, 'ArrowUp', 'Rename')
      await page.keyboard.press('Enter')
      await page.keyboard.press('Space')
      await expect(page.locator(`${MENU}:visible`)).toBeVisible()
      expect(await focused(page)).toBe('Rename')
    })

    test('Escape closes it and gives the focus and the ring back to the trigger; Tab closes it and goes on past the trigger', async ({ page }) => {
      await openLive(page, 'dropdown--basic', { direction })
      await addSentinel(page)
      await pressTo(page, 'Tab', 'Actions')
      await openWith(page, 'Enter', 'ProfileCtrl P')
      await pressTo(page, 'ArrowDown', 'Settings')
      await page.keyboard.press('Escape')
      await expectClosed(page, MENU)
      await expect.poll(() => focused(page)).toBe('Actions')
      await expectRing(page, 'the trigger after Escape')

      await openWith(page, 'Enter', 'ProfileCtrl P')
      await pressTo(page, 'Tab', SENTINEL)
      await expectClosed(page, MENU)
      await pressTo(page, 'Shift+Tab', 'Actions')
      await expectClosed(page, MENU)
    })

    for (const key of ['Enter', 'Space'] as const) {
      test(`${key} on an item picks it, closes the menu and gives the focus back to the trigger`, async ({ page }) => {
        await openLive(page, 'dropdown--basic', { direction })
        await pressTo(page, 'Tab', 'Actions')
        await openWith(page, 'Enter', 'ProfileCtrl P')
        await pressTo(page, 'ArrowDown', 'Settings')
        await page.keyboard.press(key)
        await expectClosed(page, MENU)
        await expect.poll(() => focused(page)).toBe('Actions')
      })
    }

    test('in a dialog: the menu opens over it, the first Escape closes the menu onto its trigger, the second the dialog onto its own', async ({ page }) => {
      await openLive(page, 'dropdown--in-dialog', { direction })
      await pressTo(page, 'Tab', 'Invite people')
      await openOverlay(page, page.getByRole('button', { name: 'Invite people' }), { by: 'keyboard' })
      await pressTo(page, 'Tab', 'Role')
      await openWith(page, 'Enter', 'Viewer')
      await pressTo(page, 'ArrowDown', 'Editor')
      await pressTo(page, 'ArrowDown', 'Owner')
      await pressTo(page, 'ArrowDown', 'Viewer')
      await page.keyboard.press('Escape')
      await expectClosed(page, MENU)
      await expect.poll(() => focused(page)).toBe('Role')
      await expect(page.getByRole('dialog')).toBeVisible()
      await page.keyboard.press('Escape')
      await expectClosed(page)
      await expect.poll(() => focused(page)).toBe('Invite people')
    })

    test('with links: the arrows walk the link rows with a ring, and Enter follows the focused one and closes the menu', async ({ page }) => {
      await openLive(page, 'dropdown--with-links', { direction })
      await pressTo(page, 'Tab', 'Help')
      await openWith(page, 'Enter', 'Documentation')
      await pressTo(page, 'ArrowDown', 'Changelog')
      await expectRowRing(row(page, 'Changelog'), 'Changelog')
      await pressTo(page, 'ArrowDown', 'Contact support')
      await pressTo(page, 'ArrowDown', 'Status page')
      await pressTo(page, 'ArrowDown', 'Documentation')
      await pressTo(page, 'End', 'Status page')
      await pressTo(page, 'ArrowUp', 'Contact support')
      await page.keyboard.press('Enter')
      await expect.poll(() => page.evaluate(() => location.hash)).toBe('#support')
      await expectClosed(page, MENU)
    })

    test('groups: the arrows pass over the group labels and go from the last row of one group to the first of the next', async ({ page }) => {
      await openLive(page, 'dropdown--groups', { direction })
      await pressTo(page, 'Tab', 'View')
      await openWith(page, 'Enter', 'Name')
      await pressTo(page, 'ArrowDown', 'Last edited')
      await pressTo(page, 'ArrowDown', 'Grid')
      await pressTo(page, 'ArrowDown', 'Table')
      await pressTo(page, 'ArrowUp', 'Grid')
      await pressTo(page, 'ArrowUp', 'Last edited')
    })
  })
}
