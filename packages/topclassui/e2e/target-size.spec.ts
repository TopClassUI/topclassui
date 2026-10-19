import { expect, test } from '@playwright/test'

import { TARGETS as INTERACTIVE } from '../scripts/lib/targets.js'
import { DEMOS, urlFor } from './pages.js'

// R-5.6-2, measured rather than asserted on a class name: 24 CSS px on any
// pointer, 44 under a coarse one. The unit test proves the token; this proves
// the box a finger actually has to hit. The selector and why it skips an input: scripts/lib/targets.ts.

// A skeleton demo has nothing interactive by design, so the guard that the
// selector works at all is one count across the whole set, not one per demo.
// It stops at the first demo with a target: loading all 204 took 37 s on a busy machine, past the 30 s limit.
test('the selector finds interactive elements somewhere in the set', async ({ page }) => {
  let total = 0
  for (const demo of DEMOS) {
    await page.goto(urlFor(demo, 'light', 'ltr'))
    total += await page.locator(INTERACTIVE).count()
    if (total > 0) break
  }
  expect(total).toBeGreaterThan(0)
})

for (const demo of DEMOS) {
  test(`${demo}: every interactive box clears 24 CSS px`, async ({ page }) => {
    await page.goto(urlFor(demo, 'light', 'ltr'))
    const boxes = await page.locator(INTERACTIVE).all()

    for (const box of boxes) {
      // A box with display: none is no target: Pagination keeps its page links in the HTML of the compact row.
      if (!await box.isVisible()) continue
      const size = await box.boundingBox()
      const label = (await box.textContent())?.trim() ?? '(no text)'
      expect(size, label).not.toBeNull()
      expect(size?.width ?? 0, `${label} width`).toBeGreaterThanOrEqual(24)
      expect(size?.height ?? 0, `${label} height`).toBeGreaterThanOrEqual(24)
    }
  })
}

test.describe('under a coarse pointer', () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } })

  for (const demo of DEMOS) {
    test(`${demo}: every interactive box clears 44 CSS px`, async ({ page }) => {
      await page.goto(urlFor(demo, 'light', 'ltr'))
      for (const box of await page.locator(INTERACTIVE).all()) {
        if (!await box.isVisible()) continue
        const size = await box.boundingBox()
        const label = (await box.textContent())?.trim() ?? '(no text)'
        expect(size?.width ?? 0, `${label} width`).toBeGreaterThanOrEqual(44)
        expect(size?.height ?? 0, `${label} height`).toBeGreaterThanOrEqual(44)
      }
    })
  }
})
