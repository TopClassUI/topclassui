import { expect, test, type Page } from '@playwright/test'

import { DIRECTIONS, MODES } from '../scripts/lib/harness.js'
import { urlFor } from './pages.js'
import { FORCED_CANVAS, inkOn, pixelsOf } from './pixels.js'

// The Unit 3 skeletons, measured where a class list cannot: each stands beside the component it holds the
// place of, in a [data-pair] wrapper, and must be its box; and forced colours, which erase every fill, keep a line.

/** Each demo, what to measure on the real side and on the skeleton side of a pair, whether the widths must match too,
 * and its shapes, written out. Command's real rows exist only inside Base UI's open palette, so it has no pair here. */
const FIRST = ':scope > :first-child'
const LAST = ':scope > :last-child'
const PAGES = [
  { demo: 'accordion--skeleton', pairs: 2, real: FIRST, skeleton: LAST, width: true, shapes: 8, line: 'outline' },
  { demo: 'banner--skeleton', pairs: 2, real: '[role="region"]', skeleton: LAST, width: true, shapes: 3, line: 'outline' },
  { demo: 'command--skeleton', pairs: 0, real: FIRST, skeleton: LAST, width: false, shapes: 6, line: 'outline' },
  { demo: 'navbar--skeleton', pairs: 1, real: 'header', skeleton: LAST, width: true, shapes: 6, line: 'outline' },
  { demo: 'rating--skeleton', pairs: 6, real: FIRST, skeleton: LAST, width: true, shapes: 35, line: 'outline' },
  { demo: 'sidebar--skeleton', pairs: 1, real: 'nav', skeleton: `${LAST} > div`, width: true, shapes: 10, line: 'outline' },
  { demo: 'sidebar--skeleton-collapsed', pairs: 1, real: 'nav', skeleton: `${LAST} > div`, width: true, shapes: 5, line: 'outline' },
  { demo: 'tabs--skeleton', pairs: 10, real: '[role="tablist"]', skeleton: `${LAST} > div`, width: false, shapes: 30, line: 'outline' },
  // The tag keeps its transparent border, which forced colours paint, as the input skeleton does.
  { demo: 'tag--skeleton', pairs: 5, real: FIRST, skeleton: LAST, width: false, shapes: 5, line: 'border' },
  { demo: 'timeline--skeleton', pairs: 2, real: FIRST, skeleton: LAST, width: true, shapes: 12, line: 'outline' },
] as const

const SHAPES = '#demo .animate-pulse'

/** Runs in the page: the box of the real element and of the skeleton in every pair. */
const boxesOf = (page: Page, real: string, skeleton: string) => page.locator('#demo [data-pair]').evaluateAll(
  (pairs, [r, s]) => pairs.map((pair) => {
    const box = (selector: string | undefined) => {
      const rect = pair.querySelector(selector ?? '')?.getBoundingClientRect()
      return rect ? { width: rect.width, height: rect.height } : { width: -1, height: -1 }
    }
    return { name: pair.getAttribute('data-pair'), real: box(r), skeleton: box(s) }
  }),
  [real, skeleton],
)

async function expectSameBoxes(page: Page, { demo, pairs, real, skeleton, width }: (typeof PAGES)[number], direction: string) {
  await page.goto(urlFor(demo, 'light', direction))
  const found = await boxesOf(page, real, skeleton)
  expect(found, demo).toHaveLength(pairs)
  for (const pair of found) {
    const name = String(pair.name)
    expect(pair.real.height, `${name}: the real element`).toBeGreaterThan(0)
    expect(Math.abs(pair.skeleton.height - pair.real.height), `${name}: ${String(pair.skeleton.height)} tall against ${String(pair.real.height)}`).toBeLessThan(0.5)
    if (width) expect(Math.abs(pair.skeleton.width - pair.real.width), `${name}: ${String(pair.skeleton.width)} wide against ${String(pair.real.width)}`).toBeLessThan(0.5)
  }
}

const PAIRED = PAGES.filter((page_) => page_.pairs > 0)

for (const direction of DIRECTIONS) {
  for (const page_ of PAIRED) {
    test(`fine pointer ${direction}: ${page_.demo} is as tall as what it stands in for`, async ({ page }) => {
      await expectSameBoxes(page, page_, direction)
    })
  }
}

test.describe('under a coarse pointer', () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } })
  for (const direction of DIRECTIONS) {
    for (const page_ of PAIRED) {
      test(`${direction}: ${page_.demo} keeps the 44 px floor of what it stands in for`, async ({ page }) => {
        await expectSameBoxes(page, page_, direction)
      })
    }
  }
})

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
        const found = await page.locator(SHAPES).evaluateAll(kept === 'outline' ? outlines : borders)
        expect(found).toHaveLength(shapes)
        for (const edge of found) expect(edge).toBe('solid 1px')
        for (const shape of await page.locator(SHAPES).all()) {
          // A screenshot clip must lie in the viewport, and a demo of thirty shapes runs past it.
          await shape.scrollIntoViewIfNeeded()
          const box = await shape.boundingBox()
          if (!box) throw new Error('no shape to measure')
          const around = { x: box.x - 2, y: box.y - 2, width: box.width + 4, height: box.height + 4 }
          const line = inkOn(await pixelsOf(page, around), FORCED_CANVAS[scheme])
          expect(line, `pixels at 3:1 around a ${String(box.width)} x ${String(box.height)} shape`)
            .toBeGreaterThanOrEqual(box.width + box.height)
        }
      })
    }
  })
}

for (const mode of MODES) {
  test(`${mode}: outside forced colours no Unit 3 skeleton shape has an outline, and the fill alone draws it`, async ({ page }) => {
    for (const { demo, shapes } of PAGES) {
      await page.goto(urlFor(demo, mode, 'ltr'))
      const found = await page.locator(SHAPES).evaluateAll(outlines)
      expect(found, demo).toHaveLength(shapes)
      expect(found.filter((outline) => outline !== 'none'), demo).toEqual([])
    }
  })
}
