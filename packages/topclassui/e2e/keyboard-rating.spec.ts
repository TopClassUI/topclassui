import { expect, test, type Page } from '@playwright/test'

import { DIRECTIONS } from '../scripts/lib/harness.js'
import { expectRing, inlineKeys } from './keyboard.js'
import { openLive } from './live.js'

// R-5.6-1, the radio group pattern: one tab stop, the checked star; the arrows move and check, wrap at both
// ends, and the inline arrows mirror right to left; Space checks the focused star. The ring is on the
// label round the invisible radio (FOCUS_RING_WITHIN).

/** Which star has the focus and which is checked, counted from 1; 0 for none. */
const where = (page: Page) => page.evaluate(() => {
  const radios = [...document.querySelectorAll('#demo input[type="radio"]')]
  return { focus: radios.indexOf(document.activeElement as Element) + 1, checked: radios.findIndex((radio) => (radio as HTMLInputElement).checked) + 1 }
})

async function enter(page: Page, demo: string, direction: (typeof DIRECTIONS)[number]): Promise<void> {
  await openLive(page, demo, { direction })
  await page.locator('#demo h2').click()
  await page.keyboard.press('Tab')
}

for (const direction of DIRECTIONS) {
  const { next, previous } = inlineKeys(direction)

  test.describe(direction, () => {
    test(`Tab enters on the checked star with a ring on its label, and ${next} and ArrowDown check the next one`, async ({ page }) => {
      await enter(page, 'rating--editable', direction)
      expect(await where(page)).toEqual({ focus: 3, checked: 3 })
      await expectRing(page, 'the checked star', 'label')
      await page.keyboard.press(next)
      expect(await where(page)).toEqual({ focus: 4, checked: 4 })
      await expectRing(page, 'the fourth star', 'label')
      await page.keyboard.press('ArrowDown')
      expect(await where(page)).toEqual({ focus: 5, checked: 5 })
    })

    test(`${previous} and ArrowUp check the previous star, and the arrows wrap at both ends`, async ({ page }) => {
      await enter(page, 'rating--editable', direction)
      await page.keyboard.press(previous)
      expect(await where(page)).toEqual({ focus: 2, checked: 2 })
      await page.keyboard.press('ArrowUp')
      expect(await where(page)).toEqual({ focus: 1, checked: 1 })
      await page.keyboard.press(previous)
      expect(await where(page), 'from the first to the last').toEqual({ focus: 5, checked: 5 })
      await page.keyboard.press(next)
      expect(await where(page), 'from the last to the first').toEqual({ focus: 1, checked: 1 })
    })

    test('Space keeps the focused star checked, and Tab leaves the group and Shift+Tab comes back to the checked star', async ({ page }) => {
      await enter(page, 'rating--editable', direction)
      await page.keyboard.press('Space')
      expect(await where(page)).toEqual({ focus: 3, checked: 3 })
      await page.keyboard.press('Tab')
      expect(await where(page)).toEqual({ focus: 0, checked: 3 })
      await page.keyboard.press('Shift+Tab')
      expect(await where(page)).toEqual({ focus: 3, checked: 3 })
      await expectRing(page, 'the star after Shift+Tab', 'label')
    })

    test('read-only and disabled ratings take no tab stop', async ({ page }) => {
      for (const demo of ['rating--read-only', 'rating--disabled']) {
        await openLive(page, demo, { direction })
        await page.mouse.click(2, 2)
        await page.keyboard.press('Tab')
        expect((await where(page)).focus, demo).toBe(0)
      }
    })
  })
}
