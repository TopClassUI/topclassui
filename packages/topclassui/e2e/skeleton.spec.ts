import { expect, test } from '@playwright/test'

import { MODES } from '../scripts/lib/harness.js'
import { urlFor } from './pages.js'
import { FORCED_CANVAS, inkOn, pixelsOf } from './pixels.js'

// A skeleton is drawn by its fill alone, and forced colours erase every fill. Measured, the
// shared Skeleton, ButtonSkeleton and CardSkeleton painted nothing at all there: a page that
// was loading looked empty. A class list cannot see that, nor that the line they keep is painted.

/** Each page and the shapes on it, written out: three rows and three shapes, 1 + 3 + 5 rows, three buttons, two cards,
 * four fields, and a table of four columns: four header bars and sixteen cell bars. The field keeps the transparent
 * border of the field it stands for, which forced colours paint: an outline beside it would draw the edge twice. */
const PAGES = [
  { demo: 'skeleton--variants', shapes: 6, line: 'outline' },
  { demo: 'skeleton--rows', shapes: 9, line: 'outline' },
  { demo: 'button--skeleton', shapes: 3, line: 'outline' },
  { demo: 'card--skeleton', shapes: 2, line: 'outline' },
  { demo: 'input--skeleton', shapes: 4, line: 'border' },
  { demo: 'table--skeleton', shapes: 20, line: 'outline' },
] as const

const SHAPES = '#demo .animate-pulse'

const outlines = (elements: Element[]) => elements.map((el) => {
  const style = getComputedStyle(el)
  return style.outlineStyle === 'none' ? 'none' : `${style.outlineStyle} ${style.outlineWidth}`
})

const borders = (elements: Element[]) => elements.map((el) => {
  const style = getComputedStyle(el)
  return style.borderTopStyle === 'none' ? 'none' : `${style.borderTopStyle} ${style.borderTopWidth}`
})

for (const scheme of ['light', 'dark'] as const) {
  test.describe(`forced colours, ${scheme} palette`, () => {
    test.use({ forcedColors: 'active', colorScheme: scheme })

    for (const { demo, shapes, line: kept } of PAGES) {
      test(`${demo}: every shape keeps a line once its fill is gone, and the line is painted`, async ({ page }) => {
        await page.goto(urlFor(demo, 'light', 'ltr'))
        expect(await page.evaluate(() => matchMedia('(forced-colors: active)').matches)).toBe(true)
        const found = await page.locator(SHAPES).evaluateAll(kept === 'outline' ? outlines : borders)
        expect(found).toHaveLength(shapes)
        for (const edge of found) expect(edge).toBe('solid 1px')

        // The pixels too: a computed outline can still paint nothing, or paint the canvas colour.
        for (const shape of await page.locator(SHAPES).all()) {
          const box = await shape.boundingBox()
          if (!box) throw new Error('no shape to measure')
          const around = { x: box.x - 2, y: box.y - 2, width: box.width + 4, height: box.height + 4 }
          const line = inkOn(await pixelsOf(page, around), FORCED_CANVAS[scheme])
          // A frame one pixel wide is twice this; half of it allows for a circle and its smoothed edge.
          expect(line, `pixels at 3:1 around a ${String(box.width)} x ${String(box.height)} shape`)
            .toBeGreaterThanOrEqual(box.width + box.height)
        }
      })
    }
  })
}

for (const mode of MODES) {
  test(`${mode}: outside forced colours no shape has an outline, and the fill alone draws it`, async ({ page }) => {
    for (const { demo, shapes } of PAGES) {
      await page.goto(urlFor(demo, mode, 'ltr'))
      const found = await page.locator(SHAPES).evaluateAll(outlines)
      expect(found, demo).toHaveLength(shapes)
      expect(found.filter((outline) => outline !== 'none'), demo).toEqual([])
    }
  })
}
