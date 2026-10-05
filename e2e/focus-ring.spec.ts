import { expect, test } from '@playwright/test'

import { MODES } from '../scripts/lib/harness.js'
import { urlFor } from './pages.js'

// R-5.6-1. A class-name assertion cannot see this: FOCUS_RING once paired
// outline-none with an outline width and painted nothing at all, with every
// unit test green. So this counts ring-coloured pixels before and after a Tab.
for (const mode of MODES) {
  test(`${mode}: tabbing to a button paints a visible ring`, async ({ page }) => {
    await page.goto(urlFor('button--variants', mode, 'ltr'))

    const ringPixels = async () => {
      const first = page.locator('button').first()
      const box = await first.boundingBox()
      if (!box) throw new Error('no button to measure')
      const shot = await page.screenshot({
        clip: {
          x: Math.max(0, box.x - 8),
          y: Math.max(0, box.y - 8),
          width: box.width + 16,
          height: box.height + 16,
        },
      })
      return shot.byteLength
    }

    const before = await page.screenshot({ fullPage: false })
    await page.keyboard.press('Tab')
    await expect(page.locator('button').first()).toBeFocused()
    const after = await page.screenshot({ fullPage: false })

    expect(await ringPixels()).toBeGreaterThan(0)
    // A ring changes pixels. Identical screenshots mean nothing was painted.
    expect(Buffer.compare(before, after), 'the focused page looks identical').not.toBe(0)

    const outline = await page.locator('button').first().evaluate((el) => {
      const style = getComputedStyle(el)
      return { style: style.outlineStyle, width: style.outlineWidth, color: style.outlineColor }
    })
    expect(outline.style, 'outline-style resolves to none under the reset').not.toBe('none')
    expect(Number.parseFloat(outline.width), 'outline-width').toBeGreaterThan(0)
  })
}
