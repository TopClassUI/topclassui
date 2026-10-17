import { expect, test, type Page } from '@playwright/test'

import { DIRECTIONS, MODES } from '../scripts/lib/harness.js'
import { urlFor } from './pages.js'
import { FORCED_CANVAS, inkOn, pixelsOf } from './pixels.js'

// TreeViewSkeleton beside the tree it stands in for, on the same page: what a class list cannot prove is that the
// two boxes are the same size, so nothing moves when the tree arrives.

const DEMO = 'tree-view--skeleton'
const SKELETON = '#demo div[aria-hidden="true"]'
const SHAPES = `${SKELETON} .animate-pulse`

/** The box of the skeleton and of the tree, each row's height, and where each row's first bar or slot starts on the inline start. */
const measure = (page: Page) => page.evaluate((selector) => {
  const skeleton = document.querySelector(selector)
  const tree = document.querySelector('#demo [role="tree"]')
  const rowsOf = (box: Element | null, rows: Element[]) => {
    const frame = box?.getBoundingClientRect()
    const rtl = box !== null && getComputedStyle(box).direction === 'rtl'
    return {
      size: frame ? `${String(Math.round(frame.width))} x ${String(Math.round(frame.height))}` : 'none',
      heights: rows.map((row) => Math.round(row.getBoundingClientRect().height * 10) / 10),
      starts: rows.map((row) => {
        const own = row.getBoundingClientRect()
        const first = row.firstElementChild?.getBoundingClientRect()
        return Math.round((rtl ? own.right - (first?.right ?? 0) : (first?.left ?? 0) - own.left) * 10) / 10
      }),
    }
  }
  return {
    skeleton: rowsOf(skeleton, [...(skeleton?.children ?? [])]),
    tree: rowsOf(tree, [...(tree?.querySelectorAll('[role="treeitem"]') ?? [])]),
  }
}, SKELETON)

test.describe('the box of the tree it stands in for', () => {
  for (const direction of DIRECTIONS) {
    for (const coarse of [false, true]) {
      test(`${direction}${coarse ? ', under a finger' : ''}: five rows as tall as the tree's, indented as a tree, in a box the tree's size`, async ({ browser }) => {
        const context = await browser.newContext(coarse ? { hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } } : {})
        const page = await context.newPage()
        await page.goto(urlFor(DEMO, 'light', direction))
        const found = await measure(page)
        const row = coarse ? 44 : 40
        expect(found.skeleton.heights).toEqual([row, row, row, row, row])
        expect(found.tree.heights).toEqual([row, row, row, row, row])
        expect(found.skeleton.size).toBe(found.tree.size)
        // The tree's slots start 8 px in at level 1 and 26 at level 2; the skeleton's levels are 0, 1, 1, 0, 0.
        expect(found.skeleton.starts).toEqual([8, 26, 26, 8, 8])
        expect(found.tree.starts).toEqual([8, 26, 26, 8, 8])
        await context.close()
      })
    }
  }

  test('a narrow phone squeezes the label bars and never scrolls the page sideways', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 480 })
    for (const direction of DIRECTIONS) {
      await page.goto(urlFor(DEMO, 'light', direction))
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.body.clientWidth), direction).toBeLessThanOrEqual(0)
      const outside = await page.locator(SKELETON).evaluate((box) => {
        const frame = box.getBoundingClientRect()
        return [...box.querySelectorAll('span')].filter((bar) => {
          const r = bar.getBoundingClientRect()
          return r.left < frame.left - 0.5 || r.right > frame.right + 0.5
        }).length
      })
      expect(outside, direction).toBe(0)
    }
  })
})

// Forced colours erase every fill, and a bar drawn by its fill alone paints nothing there (e2e/skeleton.spec).
for (const scheme of ['light', 'dark'] as const) {
  test.describe(`forced colours, ${scheme} palette`, () => {
    test.use({ forcedColors: 'active', colorScheme: scheme })

    test('every bar keeps a line once its fill is gone, and the line is painted', async ({ page }) => {
      await page.goto(urlFor(DEMO, 'light', 'ltr'))
      expect(await page.evaluate(() => matchMedia('(forced-colors: active)').matches)).toBe(true)
      const found = await page.locator(SHAPES).evaluateAll((elements) => elements.map((el) => {
        const style = getComputedStyle(el)
        return style.outlineStyle === 'none' ? 'none' : `${style.outlineStyle} ${style.outlineWidth}`
      }))
      expect(found).toEqual(Array.from({ length: 10 }, () => 'solid 1px'))

      for (const shape of await page.locator(SHAPES).all()) {
        const box = await shape.boundingBox()
        if (!box) throw new Error('no shape to measure')
        const around = { x: box.x - 2, y: box.y - 2, width: box.width + 4, height: box.height + 4 }
        const line = inkOn(await pixelsOf(page, around), FORCED_CANVAS[scheme])
        expect(line, `pixels at 3:1 around a ${String(box.width)} x ${String(box.height)} shape`).toBeGreaterThanOrEqual(box.width + box.height)
      }
    })
  })
}

for (const mode of MODES) {
  test(`${mode}: outside forced colours no bar has an outline, and the fill alone draws it`, async ({ page }) => {
    await page.goto(urlFor(DEMO, mode, 'ltr'))
    const found = await page.locator(SHAPES).evaluateAll((elements) => elements.map((el) => getComputedStyle(el).outlineStyle))
    expect(found).toEqual(Array.from({ length: 10 }, () => 'none'))
  })
}
