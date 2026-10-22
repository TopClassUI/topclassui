import { expect, test, type Page } from '@playwright/test'

import { DIRECTIONS } from '../scripts/lib/harness.js'
import { serverEntries } from './form.js'
import { expectNoRing, expectRing, focusedName } from './keyboard.js'
import { liveErrors, openLive } from './live.js'

// R-5.6-1, Base UI's OTP field in Chromium: one tab stop on the first empty cell, a character fills and moves on, the
// arrows keep their LTR meaning in RTL because a code reads left to right (DECISIONS, 15 October). otp-field.keyboard.dom.test.tsx.

const GROUP = '#demo [role="group"]'
const cellsOf = (page: Page) => page.locator(`${GROUP} input`)

/** The code as the cells show it, an empty cell as _, and the index of the focused cell. */
const state = (page: Page, group = GROUP) => page.evaluate((root) => {
  const cells = [...document.querySelectorAll<HTMLInputElement>(`${root} input`)]
  return { code: cells.map((cell) => cell.value || '_').join(''), at: cells.indexOf(document.activeElement as HTMLInputElement) }
}, group)

async function press(page: Page, ...keys: string[]) {
  for (const key of keys) await page.keyboard.press(key)
  return state(page)
}

test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

for (const direction of DIRECTIONS) {
  test.describe(direction, () => {
    test('Tab enters on the first empty cell, the one stop; the next Tab leaves and Shift+Tab comes back to it', async ({ page }) => {
      await openLive(page, 'otp-field--form', { direction })
      await page.keyboard.press('Tab')
      expect(await state(page)).toEqual({ code: '______', at: 0 })
      await page.keyboard.type('48')
      expect(await state(page)).toEqual({ code: '48____', at: 2 })
      await page.keyboard.press('Tab')
      expect(await focusedName(page)).toBe('Verify')
      await page.keyboard.press('Shift+Tab')
      expect(await state(page)).toEqual({ code: '48____', at: 2 })
      expect(await serverEntries(page)).toEqual([['code', '48']])
    })

    test('the focused cell paints the ring, and only that one', async ({ page }) => {
      await openLive(page, 'otp-field--basic', { direction })
      const cells = cellsOf(page)
      await expectNoRing(cells.first(), 'the first cell at rest')
      await page.keyboard.press('Tab')
      await expect(cells.first()).toBeFocused()
      await expectRing(cells.first(), 'the first cell')
      await page.keyboard.type('1')
      await expectRing(cells.nth(1), 'the next cell')
      await expectNoRing(cells.first(), 'the cell it left')
    })

    test('a character fills the cell and moves on; at the last cell the focus stays', async ({ page }) => {
      await openLive(page, 'otp-field--basic', { direction })
      await page.keyboard.press('Tab')
      expect(await press(page, '1', '2', '3', '4', '5', '6')).toEqual({ code: '123456', at: 5 })
      expect(await press(page, '7')).toEqual({ code: '123457', at: 5 })
    })

    test('ArrowLeft goes to the cell before and ArrowRight to the cell after, in every direction, stopping at the ends', async ({ page }) => {
      await openLive(page, 'otp-field--basic', { direction })
      await page.keyboard.press('Tab')
      await page.keyboard.type('1234')
      expect(await press(page, 'ArrowLeft')).toEqual({ code: '1234__', at: 3 })
      expect(await press(page, 'ArrowLeft', 'ArrowLeft', 'ArrowLeft', 'ArrowLeft')).toEqual({ code: '1234__', at: 0 })
      expect(await press(page, 'ArrowRight', 'ArrowRight')).toEqual({ code: '1234__', at: 2 })
    })

    test('Home and ArrowUp go to the first cell; End and ArrowDown to the first empty one; Control with an arrow likewise', async ({ page }) => {
      await openLive(page, 'otp-field--basic', { direction })
      await page.keyboard.press('Tab')
      await page.keyboard.type('12')
      expect(await press(page, 'Home')).toEqual({ code: '12____', at: 0 })
      expect(await press(page, 'End')).toEqual({ code: '12____', at: 2 })
      expect(await press(page, 'ArrowUp')).toEqual({ code: '12____', at: 0 })
      expect(await press(page, 'ArrowDown')).toEqual({ code: '12____', at: 2 })
      expect(await press(page, 'Control+ArrowLeft')).toEqual({ code: '12____', at: 0 })
      expect(await press(page, 'Control+ArrowRight')).toEqual({ code: '12____', at: 2 })
    })

    test('Backspace clears a cell and steps back; Delete closes the code up; Control with Backspace clears it all', async ({ page }) => {
      await openLive(page, 'otp-field--basic', { direction })
      await page.keyboard.press('Tab')
      await page.keyboard.type('1234')
      expect(await press(page, 'Backspace')).toEqual({ code: '123___', at: 3 })
      expect(await press(page, 'Backspace')).toEqual({ code: '12____', at: 2 })
      await page.keyboard.type('34')
      expect(await press(page, 'Home', 'ArrowRight', 'Delete')).toEqual({ code: '134___', at: 1 })
      expect(await press(page, 'Control+Backspace')).toEqual({ code: '______', at: 0 })
    })

    test('a read-only field takes the focus and the ring, and no character or Backspace changes it; a disabled one is no stop', async ({ page }) => {
      await openLive(page, 'otp-field--combined', { direction })
      const invalid = `${GROUP}:has(#otp-states-invalid)`
      const disabled = `${GROUP}:has(#otp-states-disabled)`
      const readOnly = `${GROUP}:has(#otp-states-read-only)`
      await page.keyboard.press('Tab')
      expect(await state(page, invalid)).toEqual({ code: '482913', at: 5 })
      await page.keyboard.press('Tab')
      expect(await state(page, invalid)).toEqual({ code: '482913', at: -1 })
      expect(await state(page, disabled)).toEqual({ code: '482___', at: -1 })
      expect(await state(page, readOnly)).toEqual({ code: '482913', at: 5 })
      await expectRing(page.locator(':focus'), 'the read-only cell')
      await page.keyboard.press('Backspace')
      await page.keyboard.press('7')
      expect(await state(page, readOnly)).toEqual({ code: '482913', at: 5 })
    })
  })
}
