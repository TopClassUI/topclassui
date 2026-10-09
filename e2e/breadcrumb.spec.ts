import { expect, test, type Page } from '@playwright/test'

import { DIRECTIONS, MODES } from '../scripts/lib/harness.js'
import { urlFor } from './pages.js'

/**
 * Measured, because a class name cannot see it: `flex-wrap`, `truncate` and
 * `rtl:-scale-x-100` were pinned as strings, while nothing proved that a long trail fits
 * a phone, that a label is really cut, or that the caret points the way the trail runs.
 */

/** Runs in the page: where each crumb sits, and which labels are really cut. */
function probe() {
  const SLACK = 0.5
  const nav = document.querySelector('nav')
  if (!nav) throw new Error('no breadcrumb on the page')
  const box = nav.getBoundingClientRect()
  const leaves = (el: Element) => {
    const own = el.getBoundingClientRect()
    return own.left < box.left - SLACK || own.right > box.right + SLACK
  }
  const items = [...nav.querySelectorAll('li')]
  const labels = items.flatMap((item) => [...item.querySelectorAll(':scope > span, :scope > a > span')])

  return {
    crumbs: items.length,
    labels: labels.length,
    strayCrumbs: items.filter(leaves).length,
    strayLabels: labels.filter(leaves).length,
    cut: labels.filter((label) => label.scrollWidth > label.clientWidth).length,
    ellipsis: labels.filter((label) => getComputedStyle(label).textOverflow === 'ellipsis').length,
    rows: new Set(items.map((item) => Math.round(item.getBoundingClientRect().top))).size,
    // The body, not the root: headless Chromium hides scrollbars, so the root's clientWidth
    // still counts the stable gutter and 15 px of overflow would pass unseen.
    scrollWidth: document.documentElement.scrollWidth,
    pageWidth: document.body.clientWidth,
  }
}

test.describe('twelve long crumbs on a phone 320 px wide', () => {
  test.use({ viewport: { width: 320, height: 800 } })

  for (const direction of DIRECTIONS) {
    test(`${direction}: the trail stays inside the page and every label ends in an ellipsis`, async ({ page }) => {
      await page.goto(urlFor('breadcrumb--deep-trail', 'light', direction))
      const trail = await page.evaluate(probe)

      expect(trail.crumbs).toBe(12)
      expect(trail.labels).toBe(12)
      expect(trail.scrollWidth, 'the page scrolls sideways').toBeLessThanOrEqual(trail.pageWidth)
      expect(trail.strayCrumbs, 'a crumb lies outside the nav').toBe(0)
      expect(trail.strayLabels, 'a label lies outside the nav').toBe(0)
      expect(trail.cut, 'labels wider than the box they are shown in').toBe(12)
      expect(trail.ellipsis, 'labels that end a cut with an ellipsis').toBe(12)
      expect(trail.rows, 'each crumb takes a row of its own').toBe(12)
    })
  }
})

test.describe('the same twelve crumbs on a desktop 1280 px wide', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  // Or the phone test could pass with a label that is cut at every width.
  test('nothing is cut, and the crumbs share rows', async ({ page }) => {
    await page.goto(urlFor('breadcrumb--deep-trail', 'light', 'ltr'))
    const trail = await page.evaluate(probe)

    expect(trail.crumbs).toBe(12)
    expect(trail.cut).toBe(0)
    expect(trail.rows).toBeLessThan(12)
    expect(trail.strayCrumbs).toBe(0)
    expect(trail.scrollWidth).toBeLessThanOrEqual(trail.pageWidth)
  })
})

/** Runs in the page: which way each caret is painted, and on which side its crumb sits. */
function carets() {
  return [...document.querySelectorAll('nav li')].flatMap((item) => {
    const svg = item.querySelector<SVGSVGElement>(':scope > svg')
    const path = svg?.querySelector('path')
    const crumb = item.lastElementChild
    const matrix = path?.getScreenCTM()
    if (!svg || !path || !crumb || !matrix) return []

    // caret-right is drawn with its point at the largest x of its own coordinates.
    const shape = path.getBBox()
    const middle = shape.y + shape.height / 2
    const tip = new DOMPoint(shape.x + shape.width, middle).matrixTransform(matrix)
    const tail = new DOMPoint(shape.x, middle).matrixTransform(matrix)
    const box = svg.getBoundingClientRect()
    const next = crumb.getBoundingClientRect()

    return [{
      scale: getComputedStyle(svg).scale,
      points: tip.x > tail.x ? 'right' : 'left',
      crumbIsOnThe: next.left + next.width / 2 > box.left + box.width / 2 ? 'right' : 'left',
    }]
  })
}

test.describe('the separator points along the trail', () => {
  test('left to right, the caret points right, at the crumb it leads to', async ({ page }) => {
    await page.goto(urlFor('breadcrumb--basic', 'light', 'ltr'))
    const expected = { scale: 'none', points: 'right', crumbIsOnThe: 'right' }
    expect(await page.evaluate(carets)).toEqual([expected, expected])
  })

  test('right to left, it is mirrored and points left, where the next crumb is', async ({ page }) => {
    await page.goto(urlFor('breadcrumb--basic', 'light', 'rtl'))
    const expected = { scale: '-1 1', points: 'left', crumbIsOnThe: 'left' }
    expect(await page.evaluate(carets)).toEqual([expected, expected])
  })

  test('inside a dir="rtl" block on a left-to-right page, it follows the block', async ({ page }) => {
    await page.goto(urlFor('breadcrumb--rtl', 'light', 'ltr'))
    const expected = { scale: '-1 1', points: 'left', crumbIsOnThe: 'left' }
    expect(await page.evaluate(carets)).toEqual([expected, expected])
  })
})

/** Whether the current page is painted differently at its own weight than at a link's. */
async function weightIsPainted(page: Page) {
  const current = page.locator('nav [aria-current="page"]')
  const weights = {
    link: await page.locator('nav a').first().evaluate((el) => getComputedStyle(el).fontWeight),
    current: await current.evaluate((el) => getComputedStyle(el).fontWeight),
  }
  const own = await current.screenshot()
  // style, only to measure: the same text at the weight of a link.
  await current.evaluate((el) => { (el as HTMLElement).style.fontWeight = '400' })
  const asLink = await current.screenshot()
  return { weights, painted: Buffer.compare(own, asLink) !== 0 }
}

for (const mode of MODES) {
  test(`${mode}: the current page is told from a link by its weight, not by colour alone`, async ({ page }) => {
    await page.goto(urlFor('breadcrumb--basic', mode, 'ltr'))
    const { weights, painted } = await weightIsPainted(page)

    expect(weights).toEqual({ link: '400', current: '600' })
    // A weight the font has no face for is a class that paints nothing.
    expect(painted, 'the current page looks the same at the weight of a link').toBe(true)
  })

  test(`${mode}: tabbing to a crumb paints a ring around the link`, async ({ page }) => {
    await page.goto(urlFor('breadcrumb--basic', mode, 'ltr'))
    const first = page.locator('nav a').first()
    const box = await first.boundingBox()
    if (!box) throw new Error('no link to measure')

    const clip = { x: Math.max(0, box.x - 8), y: Math.max(0, box.y - 8), width: box.width + 16, height: box.height + 16 }
    const before = await page.screenshot({ clip })
    await page.keyboard.press('Tab')
    await expect(first).toBeFocused()
    const after = await page.screenshot({ clip })

    expect(Buffer.compare(before, after), 'the focused link looks identical').not.toBe(0)
    const outline = await first.evaluate((el) => {
      const style = getComputedStyle(el)
      return { style: style.outlineStyle, width: style.outlineWidth, offset: style.outlineOffset }
    })
    expect(outline).toEqual({ style: 'solid', width: '2px', offset: '2px' })
  })
}

/** CanvasText and Canvas as Chromium emulates them for each palette. */
const SYSTEM = {
  light: { text: 'rgb(0, 0, 0)', canvas: 'rgb(255, 255, 255)' },
  dark: { text: 'rgb(255, 255, 255)', canvas: 'rgb(0, 0, 0)' },
} as const

for (const scheme of ['light', 'dark'] as const) {
  test.describe(`forced colours, ${scheme} palette`, () => {
    test.use({ forcedColors: 'active', colorScheme: scheme })

    for (const mode of MODES) {
      // A colour set on the svg itself is kept, so the caret was grey on a black canvas.
      test(`${mode}: the caret takes the system text colour, so the crumbs keep their divider`, async ({ page }) => {
        await page.goto(urlFor('breadcrumb--basic', mode, 'ltr'))
        const fills = await page.locator('nav svg path').evaluateAll((paths) => paths.map((path) => getComputedStyle(path).fill))
        const canvas = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)

        expect(fills).toEqual([SYSTEM[scheme].text, SYSTEM[scheme].text])
        expect(canvas).toBe(SYSTEM[scheme].canvas)
      })
    }

    test('the current page keeps its weight, which the palette cannot take away', async ({ page }) => {
      await page.goto(urlFor('breadcrumb--basic', 'light', 'ltr'))
      const { weights, painted } = await weightIsPainted(page)

      expect(weights).toEqual({ link: '400', current: '600' })
      expect(painted).toBe(true)
    })
  })
}
