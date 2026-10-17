import { expect, test, type Page } from '@playwright/test'

import { DIRECTIONS } from '../scripts/lib/harness.js'
import { expectRing, expectRowRing, focused, pressTo } from './keyboard.js'
import { openLive } from './live.js'
import { atRest, expectClosed } from './overlay.js'

// R-5.6-1, the combobox pattern with a listbox popup, inside a modal dialog: Ctrl+K opens it with the focus
// in the input, the focus never leaves the input while the vertical arrows move the active row (aria-activedescendant)
// and wrap, Enter runs the active row and closes, Escape closes, and both give the focus back.

/** The input, as each direction's labels name it. */
const INPUT = { ltr: 'Type a command or search', rtl: 'اكتب أمرًا أو ابحث' } as const

const active = (page: Page) => page.locator('[role="option"][data-highlighted]')
const ran = (page: Page) => page.getByTestId('ran')

async function openPalette(page: Page, input: string): Promise<void> {
  await page.keyboard.press('Control+k')
  const popup = page.locator('[role="dialog"]:visible')
  await expect(popup).toBeVisible()
  await atRest(popup)
  await expect.poll(() => focused(page)).toBe(input)
}

for (const direction of DIRECTIONS) {
  const input = INPUT[direction]

  test.describe(direction, () => {
    test('Ctrl+K opens it with the focus and the ring in the input, and Tab and Shift+Tab keep the focus there', async ({ page }) => {
      await openLive(page, 'command--basic', { direction })
      await pressTo(page, 'Tab', 'Search')
      await openPalette(page, input)
      await expectRing(page, 'the input')
      await pressTo(page, 'Tab', input)
      await pressTo(page, 'Shift+Tab', input)
    })

    test('the vertical arrows move the active row with a ring, wrap at both ends, and leave the focus in the input', async ({ page }) => {
      await openLive(page, 'command--basic', { direction })
      await pressTo(page, 'Tab', 'Search')
      await openPalette(page, input)
      await page.keyboard.press('ArrowDown')
      await expect(active(page)).toHaveText('Button')
      await expectRowRing(active(page), 'the first row')
      await page.keyboard.press('ArrowDown')
      await expect(active(page)).toHaveText('Button group')
      await page.keyboard.press('ArrowUp')
      await page.keyboard.press('ArrowUp')
      await expect(active(page)).toHaveText('Tooltip')
      await page.keyboard.press('ArrowDown')
      await expect(active(page)).toHaveText('Button')
      expect(await focused(page)).toBe(input)
      const controls = await page.getByRole('combobox').getAttribute('aria-activedescendant')
      expect(controls).toBe(await active(page).getAttribute('id'))
    })

    test('typing filters the rows, and Enter runs the active one once, closes, and gives the focus back to the trigger', async ({ page }) => {
      await openLive(page, 'command--basic', { direction })
      await pressTo(page, 'Tab', 'Search')
      await openPalette(page, input)
      await page.keyboard.type('dr')
      await page.keyboard.press('ArrowDown')
      await expect(active(page)).toHaveText('Drawer')
      await page.keyboard.press('Enter')
      await expectClosed(page)
      await expect(ran(page)).toHaveText('Ran Drawer, 1 in all.')
      await expect.poll(() => focused(page)).toBe('Search')
      await expectRing(page, 'the trigger after Enter')
    })

    test('Escape closes it, runs nothing, and gives the focus and the ring back to the trigger', async ({ page }) => {
      await openLive(page, 'command--basic', { direction })
      await pressTo(page, 'Tab', 'Search')
      await openPalette(page, input)
      await page.keyboard.press('ArrowDown')
      await page.keyboard.press('Escape')
      await expectClosed(page)
      await expect(ran(page)).toHaveText('Nothing ran yet.')
      await expect.poll(() => focused(page)).toBe('Search')
      await expectRing(page, 'the trigger after Escape')
    })

    test('groups: the arrows pass over the headings, from the last command of one group to the first of the next, and wrap', async ({ page }) => {
      await openLive(page, 'command--groups', { direction })
      await pressTo(page, 'Tab', 'Commands by group')
      await page.keyboard.press('Enter')
      await expect.poll(() => focused(page)).toBe(input)
      const order = ['New file', 'Open recent', 'Save all', 'Change the theme', 'Keyboard shortcuts', 'Read the docs', 'Report a problem']
      for (const name of order) {
        await page.keyboard.press('ArrowDown')
        await expect(active(page)).toHaveText(name)
      }
      await page.keyboard.press('ArrowDown')
      await expect(active(page)).toHaveText('New file')
      await page.keyboard.press('ArrowUp')
      await expect(active(page)).toHaveText('Report a problem')
      await page.keyboard.press('ArrowUp')
      await page.keyboard.press('ArrowUp')
      await expect(active(page)).toHaveText('Keyboard shortcuts')
      await expectRowRing(active(page), 'a row of the second group')
      expect(await focused(page)).toBe(input)
      await page.keyboard.press('Enter')
      await expectClosed(page)
      await expect(ran(page)).toHaveText('Ran Keyboard shortcuts.')
      await expect.poll(() => focused(page)).toBe('Commands by group')
    })

    test('the trigger opens it with Enter as well as Ctrl+K', async ({ page }) => {
      await openLive(page, 'command--basic', { direction })
      await pressTo(page, 'Tab', 'Search')
      await page.keyboard.press('Enter')
      await expect.poll(() => focused(page)).toBe(input)
    })
  })
}
