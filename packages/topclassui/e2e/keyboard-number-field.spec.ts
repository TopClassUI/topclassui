import { expect, test, type Locator, type Page } from '@playwright/test'

import { DIRECTIONS } from '../scripts/lib/harness.js'
import { expectNoRing, expectRing, walk } from './keyboard.js'
import { liveErrors, openLive } from './live.js'

// R-5.6-1, the Authoring Practices spin button keys in Chromium, the same in both directions: ArrowUp increases, ArrowDown
// decreases, Home and End go to the limits, the steppers take no stop. number-field.keyboard.dom.test.tsx in happy-dom.

const inputOf = (page: Page, name: string) => page.getByRole('textbox', { name, exact: true })
const groupOf = (input: Locator) => input.locator('xpath=..')

/** Presses each key in turn and reads the input after it. */
async function steps(page: Page, input: Locator, keys: readonly string[]): Promise<string[]> {
  const out: string[] = []
  for (const key of keys) {
    await page.keyboard.press(key)
    out.push(`${key} ${await input.inputValue()}`)
  }
  return out
}

test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

for (const direction of DIRECTIONS) {
  test.describe(direction, () => {
    test('Tab goes from input to input: no stepper is a stop, and a disabled field is skipped', async ({ page }) => {
      await openLive(page, 'number-field--state-matrix', { direction })
      expect(await walk(page, 3)).toEqual(['Empty', 'Invalid', 'Read-only'])
      expect(await walk(page, 2, 'Shift+Tab')).toEqual(['Invalid', 'Empty'])
    })

    test('the focused input paints the ring around its whole group, steppers included', async ({ page }) => {
      await openLive(page, 'number-field--basic', { direction })
      const input = page.locator('#number-field-basic-guests')
      await expectNoRing(groupOf(input), 'the group at rest')
      await page.keyboard.press('Tab')
      await expect(input).toBeFocused()
      await expectRing(groupOf(input), 'the group')
      expect(await groupOf(input).locator('button').count()).toBe(2)
    })

    test('ArrowUp adds a step and ArrowDown takes one away; Home goes to min and End to max, and no key passes them', async ({ page }) => {
      await openLive(page, 'number-field--basic', { direction })
      await page.keyboard.press('Tab')
      expect(await steps(page, page.locator('#number-field-basic-guests'), ['ArrowUp', 'ArrowUp', 'ArrowDown', 'End', 'ArrowUp', 'Home', 'ArrowDown']))
        .toEqual(['ArrowUp 3', 'ArrowUp 4', 'ArrowDown 3', 'End 8', 'ArrowUp 8', 'Home 1', 'ArrowDown 1'])
    })

    test('with Shift the arrows move by 10, with Alt by 0.1; Page Up and Page Down are not built', async ({ page }) => {
      await openLive(page, 'number-field--limits', { direction })
      await walk(page, 2)
      expect(await steps(page, inputOf(page, 'Hours'), ['ArrowUp', 'Shift+ArrowDown', 'Alt+ArrowUp', 'Shift+ArrowUp', 'PageUp', 'PageDown']))
        .toEqual(['ArrowUp 2', 'Shift+ArrowDown 0', 'Alt+ArrowUp 0.1', 'Shift+ArrowUp 10.1', 'PageUp 10.1', 'PageDown 10.1'])
    })

    test('a read-only field takes the focus and the ring, and no key changes it', async ({ page }) => {
      await openLive(page, 'number-field--state-matrix', { direction })
      await walk(page, 3)
      const input = inputOf(page, 'Read-only')
      await expect(input).toBeFocused()
      await expectRing(groupOf(input), 'the read-only group')
      expect(await steps(page, input, ['ArrowUp', 'ArrowDown', 'Home', 'End', '5'])).toEqual(['ArrowUp 12', 'ArrowDown 12', 'Home 12', 'End 12', '5 12'])
    })
  })
}
