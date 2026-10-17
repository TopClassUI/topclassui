import { expect, test, type Locator, type Page } from '@playwright/test'

import { DIRECTIONS, MODES } from '../scripts/lib/harness.js'
import { withScrollbar } from './overlay.js'
import { urlFor } from './pages.js'
import { contrast, paintedRgb, pixelsOf } from './pixels.js'

// SCROLLBAR in a real browser: every scroll container draws the native bar thin, in the two tokens of its mode.
// A sideways scroller, a block-axis one, and the code block, which sets the two tokens to its own fill.
const SCROLLERS = [
  { demo: 'table--sticky-first-column', element: (page: Page) => page.locator('table').first().locator('xpath=..'), axis: 'x' },
  { demo: 'textarea--long-content', element: (page: Page) => page.locator('textarea').nth(1), axis: 'y' },
  { demo: 'code-block--long-line', element: (page: Page) => page.locator('pre').first(), axis: 'x' },
] as const

/** As Chromium computes them: the thumb, then a transparent track, so the surface under it shows. */
const THEMED = {
  light: 'oklch(0.556 0 none) rgba(0, 0, 0, 0)',
  dark: 'oklch(0.708 0 none) rgba(0, 0, 0, 0)',
  ocean: 'oklch(0.556 0 none) rgba(0, 0, 0, 0)',
} as const

/** The code block: halfway between its fill and its text, on its fill. */
const BLOCK = {
  light: 'oklch(0.602497 0.0000248993 none) oklch(0.205 0 none)',
  dark: 'oklch(0.5575 0 none) oklch(0.97 0 none)',
  ocean: 'oklch(0.602497 0.0000248993 none) oklch(0.205 0 none)',
} as const

const bar = (scroller: Locator) => scroller.evaluate((element) => {
  const style = getComputedStyle(element)
  return {
    width: style.scrollbarWidth,
    color: style.scrollbarColor,
    scrolls: Math.max(element.scrollWidth - element.clientWidth, element.scrollHeight - element.clientHeight),
  }
})

for (const mode of MODES) {
  for (const direction of DIRECTIONS) {
    test(`${mode} ${direction}: every scroller draws the thin native bar in the colours of its mode`, async ({ page }) => {
      for (const { demo, element } of SCROLLERS) {
        await page.goto(urlFor(demo, mode, direction))
        const read = await bar(element(page))
        expect(read.scrolls, `${demo}: it scrolls`).toBeGreaterThan(0)
        const colors = demo.startsWith('code-block') ? BLOCK[mode] : THEMED[mode]
        expect({ width: read.width, color: read.color }, demo).toEqual({ width: 'thin', color: colors })
      }
    })
  }
}

for (const scheme of ['light', 'dark'] as const) {
  test(`forced colours, ${scheme} palette: the colours compute to auto, so the browser draws its system colours`, async ({ page }) => {
    await page.emulateMedia({ forcedColors: 'active', colorScheme: scheme })
    for (const mode of MODES) {
      for (const { demo, element } of SCROLLERS) {
        await page.goto(urlFor(demo, mode, 'ltr'))
        expect(await page.evaluate(() => matchMedia('(forced-colors: active)').matches)).toBe(true)
        const read = await bar(element(page))
        expect({ width: read.width, color: read.color }, `${demo} ${mode}`).toEqual({ width: 'thin', color: 'auto' })
      }
    }
  })
}

test.describe('the bar as painted, where the browser draws one', () => {
  for (const mode of MODES) {
    withScrollbar(`${mode}: the table's bar is thinner than a classic one, and its thumb stands 3:1 off the box it scrolls`, async ({ barPage: page }) => {
      for (const direction of DIRECTIONS) {
        await page.goto(urlFor('table--sticky-first-column', mode, direction))
        const box = page.locator('table').first().locator('xpath=..')
        const size = await box.evaluate((element) => {
          const style = getComputedStyle(element)
          const edges = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth)
          const rect = element.getBoundingClientRect()
          return { bar: (element as HTMLElement).offsetHeight - element.clientHeight - edges, left: rect.left + element.clientLeft, top: rect.top + element.clientTop, width: element.clientWidth, height: element.clientHeight }
        })
        const where = `${mode} ${direction}`
        expect(size.bar, `${where}: a bar is drawn, thinner than the classic 15 px`).toBeGreaterThan(0)
        expect(size.bar, where).toBeLessThan(15)
        const fill = await paintedRgb(box, 'background-color')
        const row = await pixelsOf(page, { x: Math.ceil(size.left), y: Math.floor(size.top + size.height + size.bar / 2), width: Math.floor(size.width) - 1, height: 1 })
        const thumb = row.map((pixel, column) => ({ pixel, column })).filter(({ pixel }) => contrast(pixel, fill) >= 1.5)
        expect(thumb.length, `${where}: a thumb`).toBeGreaterThan(0)
        const middle = thumb[Math.floor(thumb.length / 2)]?.pixel ?? fill
        expect(contrast(middle, fill), `${where}: the thumb on the box`).toBeGreaterThanOrEqual(3)
        const track = row.filter((pixel) => contrast(pixel, fill) < 1.05)
        expect(track.length, `${where}: the track is the box's own fill`).toBeGreaterThan(0)
      }
    })
  }
})
