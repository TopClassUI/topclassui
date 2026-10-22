import { expect, test, type Page } from '@playwright/test'

import { MODES } from '../scripts/lib/harness.js'
import { DEMOS, urlFor } from './pages.js'
import { FORCED_CANVAS, inkOn, paintedIn, pixelsOf, rgbOf } from './pixels.js'

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

/** The palette's own Highlight and HighlightText, asked of the browser and not written here. */
const systemPair = (page: Page) => page.evaluate(() => {
  const probe = document.createElement('i')
  probe.style.backgroundColor = 'Highlight'
  probe.style.color = 'HighlightText'
  document.body.append(probe)
  const style = getComputedStyle(probe)
  const pair = { fill: style.backgroundColor, text: style.color }
  probe.remove()
  return pair
})

const CURRENT = 'nav a[aria-current="page"]'

// Forced colours erase a fill, and the fill was all that marked the current page. Measured,
// because a class list cannot see what went wrong on the way: a backplate that hid the digit,
// the theme's hover fill back under a pointer, and a ring at 2.4:1 on a black canvas.
for (const scheme of ['light', 'dark'] as const) {
  test.describe(`forced colours, ${scheme} palette`, () => {
    // No motion, so a fill under the pointer is the settled one and not a frame of its transition.
    test.use({ forcedColors: 'active', colorScheme: scheme, reducedMotion: 'reduce' })

    test('the current page is a box in the system pair, with its digit painted on the fill', async ({ page }) => {
      await page.goto(urlFor('pagination--middle', 'light', 'ltr'))
      expect(await page.evaluate(() => matchMedia('(forced-colors: active)').matches)).toBe(true)
      const pair = await systemPair(page)
      const current = page.locator(CURRENT)
      await expect(current).toHaveCSS('background-color', pair.fill)
      await expect(current).toHaveCSS('color', pair.text)

      const box = await current.boundingBox()
      const other = await page.locator('nav a:not([aria-current])').first().boundingBox()
      if (!box || !other) throw new Error('no cell to measure')
      // The wide md cell Figma 138:1269 draws: 40 wide, 28 tall.
      expect([box.width, box.height]).toEqual([40, 28])
      // 1,120 pixels less the rounded corners and the digit. Another page has a stroke and no fill.
      const fill = rgbOf(pair.fill)
      expect(paintedIn(await pixelsOf(page, box), fill), 'pixels of fill in the current page').toBeGreaterThan(900)
      expect(paintedIn(await pixelsOf(page, other), fill), 'pixels of fill in another page').toBe(0)

      // The digit's own rectangle: a backplate covers every pixel of fill inside it.
      const digit = await current.evaluate((el) => {
        const range = document.createRange()
        range.selectNodeContents(el)
        const { x, y, width, height } = range.getBoundingClientRect()
        return { x, y, width, height }
      })
      const around = await pixelsOf(page, digit)
      expect(paintedIn(around, fill), 'pixels of fill around the digit').toBeGreaterThan(40)
      expect(inkOn(around, fill, 4.5), 'pixels of digit at 4.5:1 on the fill').toBeGreaterThan(10)
    })

    test('the pair stays under a pointer and while pressed, where the theme fill came back', async ({ page }) => {
      await page.goto(urlFor('pagination--middle', 'light', 'ltr'))
      const pair = await systemPair(page)
      const current = page.locator(CURRENT)

      await current.hover()
      expect(await current.evaluate((el) => el.matches(':hover'))).toBe(true)
      await expect(current).toHaveCSS('background-color', pair.fill)

      await page.mouse.down()
      expect(await current.evaluate((el) => el.matches(':active'))).toBe(true)
      await expect(current).toHaveCSS('background-color', pair.fill)
      // Released off the link, so the press is not a click that leaves the page.
      await page.mouse.move(0, 0)
      await page.mouse.up()
    })

    for (const mode of MODES) {
      test(`${mode} theme: the focused current page keeps a ring at 3:1 against the canvas`, async ({ page }) => {
        await page.goto(urlFor('pagination--middle', mode, 'ltr'))
        const current = page.locator(CURRENT)
        // First, Previous, 1, 5 and then 6: by keyboard, so :focus-visible matches.
        for (let stop = 0; stop < 5; stop++) await page.keyboard.press('Tab')
        await expect(current).toBeFocused()

        const box = await current.boundingBox()
        if (!box) throw new Error('no cell to measure')
        const band = { x: box.x - 6, y: box.y - 6, width: box.width + 12, height: 5 }
        const ring = inkOn(await pixelsOf(page, band), FORCED_CANVAS[scheme])
        expect(ring, 'pixels of ring at 3:1 over the focused current page').toBeGreaterThanOrEqual(20)
      })
    }
  })
}

test('outside forced colours the current page keeps the fill of its theme, and no system colour', async ({ page }) => {
  await page.goto(urlFor('pagination--middle', 'light', 'ltr'))
  expect(await page.evaluate(() => matchMedia('(forced-colors: active)').matches)).toBe(false)
  const current = page.locator(CURRENT)
  // blue-600 with a white digit, as Tailwind writes them.
  await expect(current).toHaveCSS('background-color', 'oklch(0.546 0.245 262.881)')
  await expect(current).toHaveCSS('color', 'rgb(255, 255, 255)')
  await expect(current).toHaveCSS('forced-color-adjust', 'auto')
})
