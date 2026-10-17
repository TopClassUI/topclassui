import { expect, test, type Locator, type Page } from '@playwright/test'

import { DIRECTIONS } from '../scripts/lib/harness.js'
import { expectRing, focusName } from './keys.js'
import { liveErrors, openLive } from './live.js'
import { expectClosed, focusIsInside } from './overlay.js'

// R-5.6-1, the Authoring Practices date picker dialog, beside date-picker.spec.ts, which has the arrows, Home, End,
// PageUp, PageDown and Enter: here Space wherever Enter works, the Shift pages and ArrowUp in both directions, the
// roving tabindex of the grid, and the ring on every stop of the dialog and on the trigger the focus returns to.

const POPUP = '[role="dialog"][data-placement]'
const DEMO = { ltr: 'date-picker--basic', rtl: 'date-picker--rtl' } as const
const CLOSE = { ltr: ['Previous month', 'Next month', 'Close'], rtl: ['الشهر السابق', 'الشهر التالي', 'إغلاق'] } as const

const trigger = (page: Page) => page.locator('#demo button[aria-haspopup="dialog"]').first()
const hiddenValue = (page: Page) => page.locator('#demo input[aria-hidden="true"]').first().inputValue()
/** The days of the grid that are a tab stop, by name, and whether the one focused is among them. */
const stops = (popup: Locator) => popup.locator('[role="grid"] [tabindex="0"]').evaluateAll((all) => all.map((el) => `${el.getAttribute('aria-label') ?? ''}${el === document.activeElement ? ' (focused)' : ''}`))

async function openWith(page: Page, key: 'Enter' | 'Space'): Promise<Locator> {
  await trigger(page).focus()
  await page.keyboard.press(key)
  const popup = page.locator(POPUP).last()
  await expect(popup).toBeVisible()
  await expect.poll(() => focusIsInside(popup)).toBe(true)
  return popup
}

async function press(page: Page, key: string, name: string): Promise<void> {
  await page.keyboard.press(key)
  await expect.poll(() => focusName(page), { message: key }).toBe(name)
}

test.describe('live: the date picker dialog by keyboard', () => {
  test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

  for (const direction of DIRECTIONS) {
    const chosen = direction === 'ltr' ? 'Tuesday, September 22, 2026' : 'الثلاثاء، 22 سبتمبر 2026'

    for (const key of ['Enter', 'Space'] as const) {
      test(`${direction}: ${key} on the trigger opens on the chosen day, the one tab stop of the grid, with the ring`, async ({ page }) => {
        await openLive(page, DEMO[direction], { direction })
        await page.keyboard.press('Tab')
        await expect(trigger(page)).toBeFocused()
        await expectRing(page, 'the trigger')
        const popup = await openWith(page, key)
        await expect.poll(() => focusName(page)).toBe(chosen)
        expect(await stops(popup)).toEqual([`${chosen} (focused)`])
        await expectRing(page, 'the chosen day')
      })
    }

    test(`${direction}: ArrowUp and the Shift pages move the day and carry the one tab stop; Space chooses it`, async ({ page }) => {
      await openLive(page, DEMO[direction], { direction })
      const popup = await openWith(page, 'Enter')
      const steps = direction === 'ltr'
        ? [
            ['Shift+PageDown', 'Wednesday, September 22, 2027'],
            ['ArrowUp', 'Wednesday, September 15, 2027'],
            ['Shift+PageUp', 'Tuesday, September 15, 2026'],
            ['PageUp', 'Saturday, August 15, 2026'],
          ]
        : [
            ['Shift+PageDown', 'الأربعاء، 22 سبتمبر 2027'],
            ['ArrowUp', 'الأربعاء، 15 سبتمبر 2027'],
            ['Shift+PageUp', 'الثلاثاء، 15 سبتمبر 2026'],
            ['PageUp', 'السبت، 15 أغسطس 2026'],
          ]
      for (const [key = '', name = ''] of steps) {
        await press(page, key, name)
        expect(await stops(popup), key).toEqual([`${name} (focused)`])
        await expectRing(page, key)
      }
      await page.keyboard.press('Space')
      await expectClosed(page, POPUP)
      await expect(trigger(page)).toBeFocused()
      await expectRing(page, 'the trigger, after Space')
      expect(await hiddenValue(page)).toBe('2026-08-15')
    })

    test(`${direction}: each stop of the dialog draws the ring; Space on the month buttons turns the month`, async ({ page }) => {
      await openLive(page, DEMO[direction], { direction })
      const popup = await openWith(page, 'Enter')
      const [previous = '', next = '', close = ''] = CLOSE[direction]
      for (const name of [previous, next, close, chosen]) {
        await press(page, 'Tab', name)
        await expectRing(page, name)
      }
      await press(page, 'Shift+Tab', close)
      await press(page, 'Shift+Tab', next)
      const heading = popup.getByRole('heading')
      await expect(heading).toHaveText(direction === 'ltr' ? 'September 2026' : 'سبتمبر 2026')
      await page.keyboard.press('Space')
      await expect(heading).toHaveText(direction === 'ltr' ? 'October 2026' : 'أكتوبر 2026')
      await expect(popup.getByRole('button', { name: next, exact: true })).toBeFocused()
      await press(page, 'Shift+Tab', previous)
      await page.keyboard.press('Space')
      await expect(heading).toHaveText(direction === 'ltr' ? 'September 2026' : 'سبتمبر 2026')
      await press(page, 'Tab', next)
      await press(page, 'Tab', close)
      await page.keyboard.press('Space')
      await expectClosed(page, POPUP)
      await expect(trigger(page)).toBeFocused()
      expect(await hiddenValue(page)).toBe('2026-09-22')
    })

    test(`${direction}: with nothing chosen, Enter opens on today with the ring, the keys start there, and Space chooses`, async ({ page }) => {
      await page.clock.setFixedTime(new Date(2026, 9, 15, 12))
      await openLive(page, 'date-picker--states', { direction })
      const empty = trigger(page)
      const popup = await openWith(page, 'Enter')
      const [today, next, home] = direction === 'ltr'
        ? ['Thursday, October 15, 2026', 'Friday, October 16, 2026', 'Sunday, October 11, 2026']
        : ['الخميس، 15 أكتوبر 2026', 'الجمعة، 16 أكتوبر 2026', 'السبت، 10 أكتوبر 2026']
      await expect.poll(() => focusName(page)).toBe(today)
      expect(await stops(popup)).toEqual([`${today} (focused)`])
      await expectRing(page, 'today')
      await press(page, direction === 'ltr' ? 'ArrowRight' : 'ArrowLeft', next)
      await press(page, 'Home', home)
      await expectRing(page, 'Home from today')
      await page.keyboard.press('Space')
      await expectClosed(page, POPUP)
      await expect(empty).toBeFocused()
      expect(await hiddenValue(page)).toBe(direction === 'ltr' ? '2026-10-11' : '2026-10-10')
    })

    test(`${direction}: Escape after moving keeps the value, returns the focus to the trigger, and the ring with it`, async ({ page }) => {
      await openLive(page, DEMO[direction], { direction })
      await openWith(page, 'Enter')
      for (const key of ['ArrowDown', 'ArrowDown', 'PageDown']) await page.keyboard.press(key)
      await page.keyboard.press('Escape')
      await expectClosed(page, POPUP)
      await expect(trigger(page)).toBeFocused()
      await expectRing(page, 'the trigger, after Escape')
      expect(await hiddenValue(page)).toBe('2026-09-22')
      await page.keyboard.press('Space')
      await expect.poll(() => focusName(page)).toBe(chosen)
    })
  }
})
