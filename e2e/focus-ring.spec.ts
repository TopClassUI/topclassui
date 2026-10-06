import { expect, test } from '@playwright/test'

import { MODES } from '../scripts/lib/harness.js'
import { urlFor } from './pages.js'

// R-5.6-1. A class-name assertion cannot see this: FOCUS_RING once paired
// outline-none with an outline width and painted nothing at all, with every
// unit test green. So it compares the pixels around the button before and after a Tab.
for (const mode of MODES) {
  test(`${mode}: tabbing to a button paints a visible ring`, async ({ page }) => {
    await page.goto(urlFor('button--variants', mode, 'ltr'))

    const first = page.locator('button').first()
    const box = await first.boundingBox()
    if (!box) throw new Error('no button to measure')

    // Clipped to the button and the 8px around it, so a changed pixel can only be the
    // ring; a full-page shot would also differ on a caret or a scrollbar.
    const clip = {
      x: Math.max(0, box.x - 8),
      y: Math.max(0, box.y - 8),
      width: box.width + 16,
      height: box.height + 16,
    }
    const before = await page.screenshot({ clip })
    await page.keyboard.press('Tab')
    await expect(first).toBeFocused()
    const after = await page.screenshot({ clip })

    // A ring changes pixels. Identical crops mean nothing was painted.
    expect(Buffer.compare(before, after), 'the focused button looks identical').not.toBe(0)

    const outline = await page.locator('button').first().evaluate((el) => {
      const style = getComputedStyle(el)
      return { style: style.outlineStyle, width: style.outlineWidth, color: style.outlineColor }
    })
    expect(outline.style, 'outline-style resolves to none under the reset').not.toBe('none')
    expect(Number.parseFloat(outline.width), 'outline-width').toBeGreaterThan(0)
  })
}
