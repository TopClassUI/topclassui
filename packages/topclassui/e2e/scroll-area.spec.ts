import { expect, test, type Page } from '@playwright/test'

import { DIRECTIONS } from '../scripts/lib/harness.js'
import { liveErrors, openLive } from './live.js'

// SCROLL_AREA around real Buttons, in a real browser. Tab scrolls a control only just into view, flush
// with the edge of the area, and the ring is drawn outside the control: the area must keep that much clear.
// No overlay on this branch uses the constant yet, so a fixture module is loaded into a live page.
const FIXTURE = '/e2e/fixtures/scroll-area.tsx'

interface Focused { name: string | null, above: number, below: number }

/** The focused control, and the space between it and the two block edges of the area it scrolled in. */
const focused = (page: Page) => page.evaluate((): Focused => {
  const area = document.getElementById('area')
  const control = document.activeElement
  if (!area || !control) return { name: null, above: 0, below: 0 }
  const top = area.getBoundingClientRect().top + area.clientTop
  const box = control.getBoundingClientRect()
  return { name: control.textContent, above: box.top - top, below: top + area.clientHeight - box.bottom }
})

async function tabTo(page: Page, key: 'Tab' | 'Shift+Tab', name: string): Promise<Focused> {
  await page.keyboard.press(key)
  await expect(page.getByRole('button', { name, exact: true })).toBeFocused()
  return focused(page)
}

for (const direction of DIRECTIONS) {
  test.describe(`a scroll area, ${direction}`, () => {
    test.beforeEach(async ({ page }) => {
      await openLive(page, 'separator--horizontal', { direction })
      await page.addScriptTag({ type: 'module', url: FIXTURE })
      await expect(page.locator('#area button')).toHaveCount(12)
    })

    test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

    test('holds twelve controls in room for four, and their ring reaches 4 px outside them', async ({ page }) => {
      const area = await page.locator('#area').evaluate((element) => ({
        scrolls: element.scrollHeight - element.clientHeight,
        padding: `${getComputedStyle(element).scrollPaddingTop} ${getComputedStyle(element).scrollPaddingBottom}`,
      }))
      expect(area.scrolls).toBeGreaterThan(300)
      expect(area.padding).toBe('4px 4px')

      await page.locator('#before').focus()
      await tabTo(page, 'Tab', 'Field 1')
      const ring = await page.evaluate(() => {
        const style = getComputedStyle(document.activeElement ?? document.body)
        return `${style.outlineStyle} ${style.outlineWidth} ${style.outlineOffset}`
      })
      expect(ring).toBe('solid 2px 2px')
    })

    test('every control Tab brings into view keeps 4 px between it and both edges, forward and back', async ({ page }) => {
      await page.locator('#before').focus()
      const cut: string[] = []
      const visit = async (key: 'Tab' | 'Shift+Tab', index: number) => {
        const { above, below } = await tabTo(page, key, `Field ${String(index)}`)
        if (above < 4 || below < 4) cut.push(`${key} to Field ${String(index)}: ${String(above)} px above, ${String(below)} px below`)
      }
      for (let index = 1; index <= 12; index++) await visit('Tab', index)
      for (let index = 11; index >= 1; index--) await visit('Shift+Tab', index)
      expect(cut).toEqual([])
    })
  })
}
