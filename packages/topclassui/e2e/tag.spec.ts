import { expect, test } from '@playwright/test'

import { DIRECTIONS } from '../scripts/lib/harness.js'
import { urlFor } from './pages.js'

/**
 * Measured, because a class name cannot see it: `max-w-full` and `truncate min-w-0` were
 * both pinned by unit tests while an element label ran 2319 px out of a 182 px chip, and
 * no spec had ever opened a tag page.
 */

/**
 * Every narrow box of each demo, written out: what happens to each chip's label, and the
 * chip's height. One line is 34 px at md and 22 px at xs: a 20 or 16 px line, twice the
 * padding-y of the size, and a 1 px border on each side.
 */
const PAGES = {
  // Bare text: three boxes, then two tags sharing a row that does not wrap.
  'tag--long-label': {
    labels: [['ellipsis'], ['ellipsis'], ['ellipsis'], ['ellipsis', 'ellipsis']],
    heights: [[34], [34], [22], [34, 34]],
  },
  // A <strong>, an <em> beside an icon and an unbroken <code>: no span of their own.
  'tag--element-label': {
    labels: [['clipped'], ['clipped'], ['clipped']],
    heights: [[34], [34], [22]],
  },
  // tagVariants() on an anchor: the label in its own span, then bare text.
  'tag--link': {
    labels: [['ellipsis'], ['clipped']],
    heights: [[34], [34]],
  },
} as const

/** Runs in the page: each narrow box, the chips in it, and what leaves the box or the page. */
function probe() {
  const SLACK = 0.5

  const boxes = [...document.querySelectorAll('[data-narrow]')].map((box) => {
    const outer = box.getBoundingClientRect()

    const chips = [...box.querySelectorAll('[data-tone], a[href]')].map((chip) => {
      const rect = chip.getBoundingClientRect()
      const cut = [...chip.children].some((child) =>
        getComputedStyle(child).textOverflow === 'ellipsis' && child.scrollWidth > child.clientWidth)
      // Wider than the chip, or a short label would pass and prove nothing.
      const wider = chip.scrollWidth > chip.clientWidth
      return {
        label: cut ? 'ellipsis' : wider ? 'clipped' : 'fits',
        height: Math.round(rect.height),
        leavesTheBox: rect.left < outer.left - SLACK || rect.right > outer.right + SLACK,
      }
    })

    // A label that is wider than its chip and not clipped by it scrolls the box.
    return { chips, overflow: box.scrollWidth - box.clientWidth }
  })

  // The body, not the root: headless Chromium hides scrollbars, so the root's clientWidth
  // still counts the stable gutter and 10 px of overflow would pass unseen.
  return { boxes, scrollWidth: document.documentElement.scrollWidth, pageWidth: document.body.clientWidth }
}

test.describe('on a phone 320 px wide', () => {
  test.use({ viewport: { width: 320, height: 800 } })

  for (const direction of DIRECTIONS) {
    for (const [demo, expected] of Object.entries(PAGES)) {
      test(`${demo} ${direction}: every chip is one line inside its 200 px box`, async ({ page }) => {
        await page.goto(urlFor(demo, 'light', direction))
        const { boxes, scrollWidth, pageWidth } = await page.evaluate(probe)

        // Soft, so one run names every guarantee that broke, not only the first.
        expect.soft(boxes.map((box) => box.chips.map((chip) => chip.label)), 'what happens to each label').toEqual(expected.labels)
        expect.soft(boxes.map((box) => box.chips.map((chip) => chip.height)), 'a chip is not one line tall').toEqual(expected.heights)
        for (const box of boxes) {
          expect.soft(box.overflow, 'a label runs out of its chip and scrolls the box').toBe(0)
          for (const chip of box.chips) expect.soft(chip.leavesTheBox, 'a chip leaves its box').toBe(false)
        }
        expect.soft(scrollWidth, 'the page scrolls sideways').toBeLessThanOrEqual(pageWidth)
      })
    }
  }
})
