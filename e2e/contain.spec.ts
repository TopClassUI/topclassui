import { expect, test } from '@playwright/test'

import { MODES } from '../scripts/lib/harness.js'
import { urlFor } from './pages.js'

/**
 * A long label must shrink the control, never the layout. Measured rather than
 * asserted on a class name: `truncate` on the control itself clips with no ellipsis,
 * because a bare string inside `inline-flex` is an anonymous flex item, and a unit
 * test on the class list cannot see that.
 */
for (const mode of MODES) {
  for (const direction of ['ltr', 'rtl'] as const) {
    test(`${mode} ${direction}: a long label stays inside its box`, async ({ page }) => {
      await page.goto(urlFor('button--long-label', mode, direction))

      const boxes = await page.locator('[data-narrow]').all()
      expect(boxes.length).toBeGreaterThan(0)

      for (const box of boxes) {
        const outer = await box.boundingBox()
        const control = await box.locator('button').first().boundingBox()
        if (!outer || !control) throw new Error('nothing to measure')
        // One pixel of tolerance for sub-pixel rounding at a fractional zoom.
        expect(control.width, 'the control is wider than its container').toBeLessThanOrEqual(outer.width + 1)
        expect(control.x + control.width).toBeLessThanOrEqual(outer.x + outer.width + 1)
      }

      const label = page.locator('button span.truncate').first()
      await expect(label).toHaveCSS('text-overflow', 'ellipsis')
      // The label really is cut off, or the assertion above proves nothing.
      const cut = await label.evaluate((el) => el.scrollWidth > Math.ceil(el.clientWidth))
      expect(cut, 'the label is not actually truncated').toBe(true)
    })
  }
}
