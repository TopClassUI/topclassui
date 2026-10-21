import { expect, test, type Locator, type Page } from '@playwright/test'

import { DIRECTIONS } from '../scripts/lib/harness.js'
import { serverEntries } from './form.js'
import { expectNoRing, expectRing, walk } from './keyboard.js'
import { liveErrors, openLive } from './live.js'

// R-5.6-1 and R-5.6-3, the Authoring Practices slider in Chromium: every key in both directions, the ring on the knob,
// two stops for a range, and a keyboard path to every value a drag reaches. slider.keyboard.dom.test.tsx in happy-dom.

const thumbIn = (page: Page, name: string) => page.getByRole('slider', { name, exact: true })
const knobOf = (input: Locator) => input.locator('xpath=../span')
const valueOf = (input: Locator) => input.getAttribute('aria-valuenow')
/** The names of a range's two thumbs come from the labels of the provider's locale. */
const PAIR = { ltr: ['Minimum', 'Maximum'], rtl: ['الحد الأدنى', 'الحد الأقصى'] } as const

/** Presses each key in turn and reads the value after it. */
async function steps(page: Page, input: Locator, keys: readonly string[]): Promise<string[]> {
  const out: string[] = []
  for (const key of keys) {
    await page.keyboard.press(key)
    out.push(`${key} ${String(await valueOf(input))}`)
  }
  return out
}

test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

for (const direction of DIRECTIONS) {
  // The track runs from the inline start: in RTL it starts at the right, so ArrowLeft raises the value.
  const [raise, lower] = direction === 'ltr' ? ['ArrowRight', 'ArrowLeft'] : ['ArrowLeft', 'ArrowRight']

  const [low, high] = PAIR[direction]

  test.describe(direction, () => {
    test('Tab reaches each live thumb and skips a disabled slider; Shift+Tab walks back', async ({ page }) => {
      await openLive(page, 'slider--combined', { direction })
      expect(await walk(page, 4)).toEqual(['Live', 'Invalid', low, high])
      expect(await walk(page, 3, 'Shift+Tab')).toEqual([low, 'Invalid', 'Live'])
    })

    test('the focused thumb paints the ring on its knob, and the input and the thumb none', async ({ page }) => {
      await openLive(page, 'slider--basic', { direction })
      const input = thumbIn(page, 'Volume')
      await expectNoRing(knobOf(input), 'the knob at rest')
      await page.keyboard.press('Tab')
      await expect(input).toBeFocused()
      await expectNoRing(input.locator('xpath=..'), 'the thumb')
      await expectRing(knobOf(input), 'the knob')
    })

    test(`${raise} and ArrowUp add a step, ${lower} and ArrowDown take one away; Page Up, Page Down and Shift move by 10`, async ({ page }) => {
      await openLive(page, 'slider--basic', { direction })
      await page.keyboard.press('Tab')
      expect(await steps(page, thumbIn(page, 'Volume'), [raise, lower, 'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', `Shift+${raise}`, `Shift+${lower}`, 'Shift+ArrowUp', 'Shift+ArrowDown']))
        .toEqual([`${raise} 65`, `${lower} 60`, 'ArrowUp 65', 'ArrowDown 60', 'PageUp 70', 'PageDown 60', `Shift+${raise} 70`, `Shift+${lower} 60`, 'Shift+ArrowUp 70', 'Shift+ArrowDown 60'])
    })

    test('End goes to max and Home to min, and no key passes either', async ({ page }) => {
      await openLive(page, 'slider--basic', { direction })
      await page.keyboard.press('Tab')
      expect(await steps(page, thumbIn(page, 'Volume'), ['End', raise, 'ArrowUp', 'PageUp', 'Home', lower, 'ArrowDown', 'PageDown']))
        .toEqual(['End 100', `${raise} 100`, 'ArrowUp 100', 'PageUp 100', 'Home 0', `${lower} 0`, 'ArrowDown 0', 'PageDown 0'])
    })

    test('R-5.6-3: the keys reach every value a drag reaches, step by step, and the form sends the one they chose', async ({ page }) => {
      await openLive(page, 'slider--form', { direction })
      await page.keyboard.press('Tab')
      const input = thumbIn(page, 'Volume')
      await page.keyboard.press('Home')
      const seen: string[] = []
      for (let press = 0; press < 20; press += 1) {
        await page.keyboard.press(raise)
        seen.push(String(await valueOf(input)))
      }
      expect(seen).toEqual(['5', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55', '60', '65', '70', '75', '80', '85', '90', '95', '100'])
      await page.keyboard.press('PageDown')
      expect(await serverEntries(page)).toEqual([['volume', '90']])
    })

    test('a range: two stops in order; each thumb moves alone, and neither key takes one past the other', async ({ page }) => {
      await openLive(page, 'slider--range', { direction })
      expect(await walk(page, 2)).toEqual([low, high])
      await expectRing(knobOf(thumbIn(page, high)), 'the knob of Maximum')
      await page.keyboard.press(lower)
      expect([await valueOf(thumbIn(page, low)), await valueOf(thumbIn(page, high))]).toEqual(['20', '75'])
      await page.keyboard.press('Home')
      expect([await valueOf(thumbIn(page, low)), await valueOf(thumbIn(page, high))]).toEqual(['20', '20'])
      await page.keyboard.press('Shift+Tab')
      await expect(thumbIn(page, low)).toBeFocused()
      await page.keyboard.press(raise)
      expect([await valueOf(thumbIn(page, low)), await valueOf(thumbIn(page, high))]).toEqual(['20', '20'])
      await page.keyboard.press('Tab')
      await page.keyboard.press('End')
      await page.keyboard.press('Shift+Tab')
      await page.keyboard.press('End')
      expect([await valueOf(thumbIn(page, low)), await valueOf(thumbIn(page, high))]).toEqual(['100', '100'])
    })
  })
}
