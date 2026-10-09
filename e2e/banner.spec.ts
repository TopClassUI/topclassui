import { expect, test } from '@playwright/test'

import { DIRECTIONS } from '../scripts/lib/harness.js'
import { urlFor } from './pages.js'

/**
 * Measured, because a class name cannot see it: `min-w-0 flex-1` was pinned by a unit
 * test while the message beside a long action was 0 px wide, one letter per line.
 */

/** Every demo with an action beside a message, written out so a deleted one fails here. */
const WITH_ACTION = ['banner--basic', 'banner--long-action', 'banner--long-text', 'banner--rtl', 'banner--with-action']

/** Runs in the page: each banner's boxes, and what is placed or painted outside them. */
function probe() {
  const SLACK = 0.5
  const leaves = (box: DOMRect, left: number, right: number) => left < box.left - SLACK || right > box.right + SLACK
  const all = [...document.querySelectorAll('[role="region"]')]

  const banners = all.map((banner) => {
    const row = banner.getBoundingClientRect()
    const message = banner.querySelector(':scope > div')?.getBoundingClientRect()
    const action = banner.querySelector(':scope > a, :scope > button')?.getBoundingClientRect()

    const strayChildren = [...banner.children].filter((child) => {
      const box = child.getBoundingClientRect()
      return leaves(row, box.left, box.right) || box.top < row.top - SLACK || box.bottom > row.bottom + SLACK
    }).length

    let strayInk = 0
    const texts = document.createTreeWalker(banner, NodeFilter.SHOW_TEXT)
    for (let text = texts.nextNode(); text; text = texts.nextNode()) {
      const slot = (text.parentElement?.closest('[role="region"] > *') ?? banner).getBoundingClientRect()
      // A truncated Button label is clipped by its own box, so only what shows is ink.
      let from = -Infinity
      let to = Infinity
      for (let el = text.parentElement; el && el !== banner; el = el.parentElement) {
        if (getComputedStyle(el).overflowX === 'visible') continue
        const clip = el.getBoundingClientRect()
        from = Math.max(from, clip.left)
        to = Math.min(to, clip.right)
      }
      const range = document.createRange()
      range.selectNodeContents(text)
      for (const rect of range.getClientRects()) {
        const left = Math.max(rect.left, from)
        const right = Math.min(rect.right, to)
        if (right > left && (leaves(slot, left, right) || leaves(row, left, right))) strayInk++
      }
    }

    return {
      name: banner.getAttribute('aria-label') ?? banner.getAttribute('aria-labelledby') ?? '',
      message: message && action ? message.width : null,
      actionBelowMessage: message && action ? action.top >= message.bottom - SLACK : null,
      strayChildren,
      strayInk,
      position: getComputedStyle(banner).position,
      covers: all.filter((other) => {
        const box = other.getBoundingClientRect()
        return other !== banner && box.top < row.bottom - SLACK && box.bottom > row.top + SLACK
      }).length,
    }
  })

  // The body, not the root: headless Chromium hides scrollbars, so the root's clientWidth
  // still counts the stable gutter and 15 px of overflow would pass unseen.
  return { banners, scrollWidth: document.documentElement.scrollWidth, pageWidth: document.body.clientWidth }
}

for (const width of [320, 390]) {
  test.describe(`on a phone ${String(width)} px wide`, () => {
    test.use({ viewport: { width, height: 800 } })

    for (const direction of DIRECTIONS) {
      for (const demo of WITH_ACTION) {
        test(`${demo} ${direction}: the action never squeezes the message`, async ({ page }) => {
          await page.goto(urlFor(demo, 'light', direction))
          const { banners, scrollWidth, pageWidth } = await page.evaluate(probe)

          const paired = banners.filter((banner) => banner.message !== null)
          expect(paired.length, 'no banner here has an action beside a message').toBeGreaterThan(0)

          for (const banner of banners) {
            // basis-40 is 10rem: 160 CSS px at the 16 px root of every harness page.
            if (banner.message !== null) expect(banner.message, `${banner.name}: the message width`).toBeGreaterThanOrEqual(160)
            expect(banner.strayChildren, `${banner.name}: a child lies outside the row`).toBe(0)
            expect(banner.strayInk, `${banner.name}: text is painted outside its own box`).toBe(0)
            expect(banner.position, `${banner.name}: it left the page flow`).toBe('static')
            expect(banner.covers, `${banner.name}: it covers another banner instead of pushing it down`).toBe(0)
          }
          expect(scrollWidth, 'the page scrolls sideways').toBeLessThanOrEqual(pageWidth)
        })
      }

      test(`banner--long-action ${direction}: a long action takes a line of its own under the message`, async ({ page }) => {
        await page.goto(urlFor('banner--long-action', 'light', direction))
        const { banners } = await page.evaluate(probe)
        expect(banners.map((banner) => banner.actionBelowMessage)).toEqual([true, true])
      })
    }
  })
}

/** The soft fill is the only thing that marks a banner, and forced colours remove it. */
const edges = (banners: Element[]) => banners.map((banner) => {
  const style = getComputedStyle(banner)
  return {
    width: style.borderBottomWidth,
    style: style.borderBottomStyle,
    contrasts: style.borderBottomColor !== getComputedStyle(document.body).backgroundColor,
  }
})

for (const scheme of ['light', 'dark'] as const) {
  test.describe(`forced colours, ${scheme} palette`, () => {
    test.use({ forcedColors: 'active', colorScheme: scheme })

    test('every tone keeps a bottom edge once the fill is gone', async ({ page }) => {
      await page.goto(urlFor('banner--tones', 'light', 'ltr'))
      const found = await page.locator('[role="region"]').evaluateAll(edges)
      expect(found).toHaveLength(6)
      for (const edge of found) expect(edge).toEqual({ width: '1px', style: 'solid', contrasts: true })

      // The pixels too: a computed border can still paint nothing.
      const box = await page.locator('[role="region"]').first().boundingBox()
      if (!box) throw new Error('no banner to measure')
      const row = (y: number) => page.screenshot({ clip: { x: box.x, y, width: box.width, height: 1 } })
      const lastRow = await row(box.y + box.height - 1)
      const fill = await row(box.y + box.height - 4)
      expect(Buffer.compare(lastRow, fill), 'the last row looks like the row above it').not.toBe(0)
    })
  })
}

test('outside forced colours there is no edge: the fill marks the row', async ({ page }) => {
  await page.goto(urlFor('banner--tones', 'light', 'ltr'))
  const found = await page.locator('[role="region"]').evaluateAll(edges)
  expect(found).toHaveLength(6)
  for (const edge of found) expect(edge.width).toBe('0px')
})
