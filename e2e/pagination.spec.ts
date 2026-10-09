import { expect, test } from '@playwright/test'

import { DEMOS, urlFor } from './pages.js'

// A page number must stay inside its cell. Measured rather than asserted on a class
// name: in a fixed square the current page 12,345 read "2,345", because the digits
// past the fill were white on the page, and no unit test can see that.
const PAGINATION = DEMOS.filter((demo) => demo.startsWith('pagination--'))

/** What the link shows or is called, and how far its content runs past its box. */
const measureLinks = (links: Element[]) => links.map((link) => ({
  link: link.textContent === '' ? link.getAttribute('aria-label') : link.textContent,
  spill: link.scrollWidth - link.clientWidth,
}))

test('the set holds the five-digit demo, so the guard below has something to catch', () => {
  expect(PAGINATION).toContain('pagination--wide-numbers')
})

for (const demo of PAGINATION) {
  for (const direction of ['ltr', 'rtl'] as const) {
    test(`${demo} ${direction}: every number stays inside its link`, async ({ page }) => {
      await page.goto(urlFor(demo, 'light', direction))
      const links = await page.locator('nav a').evaluateAll(measureLinks)
      expect(links.length).toBeGreaterThan(0)
      expect(links.filter((link) => link.spill > 0)).toEqual([])
    })
  }
}

test.describe('in a 320 px viewport', () => {
  test.use({ viewport: { width: 320, height: 640 } })

  for (const demo of PAGINATION) {
    test(`${demo}: the row wraps, so the page does not scroll sideways`, async ({ page }) => {
      await page.goto(urlFor(demo, 'light', 'ltr'))
      const root = await page.evaluate(() => ({
        scroll: document.documentElement.scrollWidth,
        client: document.documentElement.clientWidth,
      }))
      expect(root.scroll, 'the page is wider than the viewport').toBeLessThanOrEqual(root.client)

      const links = await page.locator('nav a').evaluateAll(measureLinks)
      expect(links.filter((link) => link.spill > 0)).toEqual([])
    })
  }
})
