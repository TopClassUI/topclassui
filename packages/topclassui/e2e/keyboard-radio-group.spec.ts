import { expect, test, type Page } from '@playwright/test'

import { DIRECTIONS } from '../scripts/lib/harness.js'
import { expectNoRing, expectRing, focusedName, tabIndexes, walk } from './keyboard.js'
import { liveErrors, openLive } from './live.js'

// R-5.6-1, the Authoring Practices radio group in Chromium: one tab stop that roves, the arrows move, select and wrap,
// the side arrows follow reading order, Space selects. radio-group.keyboard.dom.test.tsx proves the same in happy-dom.

const radioOf = (page: Page, name: string) => page.getByRole('radio', { name, exact: true })
const checked = (page: Page) => page.locator('#demo [role="radio"][aria-checked="true"]').evaluateAll((all) => all.map((el) => el.parentElement?.textContent ?? ''))

/** Presses a key and reads where the focus went and which radio is checked. */
async function press(page: Page, key: string) {
  await page.keyboard.press(key)
  return { focus: await focusedName(page), checked: await checked(page) }
}

test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

for (const direction of DIRECTIONS) {
  const [forward, back] = direction === 'ltr' ? ['ArrowRight', 'ArrowLeft'] : ['ArrowLeft', 'ArrowRight']

  test.describe(direction, () => {
    test('Tab enters on the checked radio, the only stop; the next Tab leaves and Shift+Tab comes back to it', async ({ page }) => {
      await openLive(page, 'radio-group--states', { direction })
      expect(await walk(page, 3)).toEqual(['Invalid, checked', 'Live, checked', 'Read-only, checked'])
      expect(await walk(page, 1, 'Shift+Tab')).toEqual(['Live, checked'])
      expect(await tabIndexes(page.getByRole('radiogroup', { name: 'One disabled' }).getByRole('radio'))).toEqual(['0', '-1', '-1'])
    })

    test('the focused radio paints the ring on its circle, and the button itself none', async ({ page }) => {
      await openLive(page, 'radio-group--basic', { direction })
      const control = radioOf(page, 'Yearly')
      const circle = control.locator(':scope > span')
      await expectNoRing(circle, 'the circle at rest')
      await page.keyboard.press('Tab')
      await expect(control).toBeFocused()
      await expectNoRing(control, 'the button')
      await expectRing(circle, 'the circle')
    })

    test('ArrowDown and ArrowUp move to the next and the one before, select it, and wrap; the tab stop follows', async ({ page }) => {
      await openLive(page, 'radio-group--basic', { direction })
      await page.keyboard.press('Tab')
      expect(await press(page, 'ArrowDown')).toEqual({ focus: 'Lifetime', checked: ['Lifetime'] })
      expect(await press(page, 'ArrowDown')).toEqual({ focus: 'Monthly', checked: ['Monthly'] })
      expect(await press(page, 'ArrowUp')).toEqual({ focus: 'Lifetime', checked: ['Lifetime'] })
      expect(await tabIndexes(page.getByRole('radio'))).toEqual(['-1', '-1', '0'])
      await expectRing(radioOf(page, 'Lifetime').locator(':scope > span'), 'the circle the arrows landed on')
    })

    test(`${forward} is the next radio in reading order and ${back} the one before, both wrapping`, async ({ page }) => {
      await openLive(page, 'radio-group--horizontal', { direction })
      await page.keyboard.press('Tab')
      expect(await press(page, forward)).toEqual({ focus: 'Large', checked: ['Large'] })
      expect(await press(page, forward)).toEqual({ focus: 'Extra large', checked: ['Extra large'] })
      expect(await press(page, forward)).toEqual({ focus: 'Small', checked: ['Small'] })
      expect(await press(page, back)).toEqual({ focus: 'Extra large', checked: ['Extra large'] })
    })

    test('the arrows pass over a disabled radio', async ({ page }) => {
      await openLive(page, 'radio-group--states', { direction })
      await walk(page, 2)
      expect(await press(page, forward)).toEqual({ focus: 'Live', checked: ['Invalid, checked', 'Disabled, checked', 'Live', 'Read-only, checked'] })
      expect(await press(page, back)).toEqual({ focus: 'Live, checked', checked: ['Invalid, checked', 'Disabled, checked', 'Live, checked', 'Read-only, checked'] })
    })

    // Base UI's composite moves the focus in a read-only group, and RadioRoot.js:138 keeps the focus from checking.
    test('in a read-only group the arrows move the focus, wrapping, and check nothing; Space checks nothing either', async ({ page }) => {
      await openLive(page, 'radio-group--states', { direction })
      await walk(page, 3)
      const others = ['Invalid, checked', 'Disabled, checked', 'Live, checked']
      expect(await press(page, forward)).toEqual({ focus: 'Read-only', checked: [...others, 'Read-only, checked'] })
      expect(await press(page, 'Space')).toEqual({ focus: 'Read-only', checked: [...others, 'Read-only, checked'] })
      expect(await press(page, forward)).toEqual({ focus: 'Read-only, checked', checked: [...others, 'Read-only, checked'] })
      expect(await press(page, back)).toEqual({ focus: 'Read-only', checked: [...others, 'Read-only, checked'] })
      expect(await press(page, 'ArrowDown')).toEqual({ focus: 'Read-only, checked', checked: [...others, 'Read-only, checked'] })
      expect(await press(page, 'ArrowUp')).toEqual({ focus: 'Read-only', checked: [...others, 'Read-only, checked'] })
      await expectRing(radioOf(page, 'Read-only').locator(':scope > span'), 'the read-only circle the arrows landed on')
    })

    test('Space selects the focused radio; Enter, Home and End change nothing', async ({ page }) => {
      await openLive(page, 'radio-group--basic', { direction })
      await page.keyboard.press('Tab')
      await radioOf(page, 'Monthly').focus()
      expect(await press(page, 'Enter')).toEqual({ focus: 'Monthly', checked: ['Yearly'] })
      expect(await press(page, 'Home')).toEqual({ focus: 'Monthly', checked: ['Yearly'] })
      expect(await press(page, 'End')).toEqual({ focus: 'Monthly', checked: ['Yearly'] })
      expect(await press(page, 'Space')).toEqual({ focus: 'Monthly', checked: ['Monthly'] })
    })
  })
}
