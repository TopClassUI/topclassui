import { expect, test, type Locator, type Page } from '@playwright/test'

import { DIRECTIONS } from '../scripts/lib/harness.js'
import { DEMOS, urlFor } from './pages.js'

// What a class list cannot show, each measured failing before it was fixed: a hidden
// span that widened the page, cells stacked word by word, a dimmed Button painted over
// the stuck column, and a focused control lying under it (WCAG 2.2 SC 2.4.11).
const TABLES = DEMOS.filter((demo) => demo.startsWith('table--'))
const STUCK = ['table--sticky-first-column', 'table--rtl']

test('the set holds the table demos, so a renamed folder cannot empty the loops below', () => {
  expect(TABLES.length).toBeGreaterThan(5)
  for (const demo of STUCK) expect(TABLES).toContain(demo)
})

test.describe('at 390 px', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  for (const demo of TABLES) {
    for (const direction of DIRECTIONS) {
      test(`${demo} ${direction}: the box scrolls, never the page`, async ({ page }) => {
        await page.goto(urlFor(demo, 'light', direction))
        const measured = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
          boxes: [...document.querySelectorAll('[role="region"]')].map((box) => {
            const { left, right } = box.getBoundingClientRect()
            return { left, right }
          }),
        }))

        expect(measured.boxes.length).toBeGreaterThan(0)
        // An sr-only span is absolute: unless the box contains it, a far column widens the page.
        expect(measured.scrollWidth, 'the page is wider than the viewport').toBeLessThanOrEqual(measured.clientWidth)
        // scrollWidth cannot see what hangs off the start edge, where nothing can scroll to it.
        for (const box of measured.boxes) {
          expect(box.left, 'a box starts off the page').toBeGreaterThanOrEqual(0)
          expect(box.right, 'a box ends off the page').toBeLessThanOrEqual(measured.clientWidth)
        }
      })
    }
  }

  test('a narrow box scrolls sideways instead of stacking a date word by word', async ({ page }) => {
    await page.goto(urlFor('table--caption', 'light', 'ltr'))
    const measured = await page.locator('[role="region"]').first().evaluate((box) => ({
      scrolls: box.scrollWidth > box.clientWidth,
      head: box.querySelector('thead tr')?.getBoundingClientRect().height ?? 0,
      rows: [...box.querySelectorAll('tbody tr')].map((row) => row.getBoundingClientRect().height),
    }))
    // One line of 14 px type, 12 px of padding each way and the row line: measured 85 before cells kept to one line.
    expect(measured.rows.length).toBeGreaterThan(0)
    for (const height of measured.rows) expect(height).toBeLessThan(50)
    expect(measured.head).toBeLessThan(40)
    expect(measured.scrolls, 'the table fits, so this measured nothing').toBe(true)
  })

  test('the placeholder is exactly as tall as the table it stands in for, so nothing moves when the rows arrive', async ({ page }) => {
    await page.goto(urlFor('table--skeleton', 'light', 'ltr'))
    const placeholder = await page.locator('#demo [aria-hidden="true"]').first().boundingBox()
    const table = await page.locator('[role="region"]').first().boundingBox()
    expect(placeholder?.height ?? 0).toBeGreaterThan(100)
    expect(placeholder?.height).toBe(table?.height)
    expect(placeholder?.width).toBe(table?.width)
  })
})

/** Pixels that differ between two screenshots, decoded in the page: Playwright exports no PNG reader. */
async function changedPixels(page: Page, before: Buffer, after: Buffer): Promise<number> {
  return page.evaluate(async ([first, second]) => {
    const read = async (base64: string) => {
      const image = new Image()
      image.src = `data:image/png;base64,${base64}`
      await image.decode()
      const canvas = document.createElement('canvas')
      canvas.width = image.width
      canvas.height = image.height
      const context = canvas.getContext('2d')
      if (!context) throw new Error('no canvas to read the screenshot with')
      context.drawImage(image, 0, 0)
      return context.getImageData(0, 0, image.width, image.height)
    }
    const [a, b] = [await read(first), await read(second)]
    if (a.width !== b.width || a.height !== b.height) return -1
    let changed = 0
    for (let i = 0; i < a.data.length; i += 4) {
      if (a.data[i] !== b.data[i] || a.data[i + 1] !== b.data[i + 1] || a.data[i + 2] !== b.data[i + 2]) changed += 1
    }
    return changed
  }, [before.toString('base64'), after.toString('base64')] as const)
}

/** The first dimmed Button of the box and the stuck cell of its row, as the page lays them out now. */
const dimmedRow = (box: Locator) => box.evaluate((el) => {
  const button = el.querySelector('tbody button[disabled]')
  const stuck = button?.closest('tr')?.firstElementChild
  if (!button || !stuck) throw new Error('the demo has no disabled Button in a row to scroll under the stuck column')
  const [b, s] = [button.getBoundingClientRect(), stuck.getBoundingClientRect()]
  return {
    button: { left: b.left, right: b.right },
    stuck: { x: s.x, y: s.y, width: s.width, height: s.height, left: s.left, right: s.right },
    opacity: getComputedStyle(button).opacity,
    rtl: getComputedStyle(el).direction === 'rtl',
  }
})

for (const direction of DIRECTIONS) {
  test(`${direction}: the stuck column keeps its pixels while a dimmed Button scrolls under it`, async ({ page }) => {
    await page.goto(urlFor('table--sticky-first-column', 'light', direction))
    const box = page.locator('[data-sticky-first-column]').first()

    const rest = await dimmedRow(box)
    // opacity below 1 is what makes a stacking context, and so what paints over a cell with no z-index.
    expect(Number(rest.opacity)).toBeLessThan(1)
    // One pixel in from every side, so the row line and a sub-pixel edge are not in the picture.
    const clip = { x: Math.ceil(rest.stuck.x) + 1, y: Math.ceil(rest.stuck.y) + 1, width: Math.floor(rest.stuck.width) - 3, height: Math.floor(rest.stuck.height) - 3 }
    const before = await page.screenshot({ clip })

    // Slide the row along until the button lies 8 px inside the stuck cell.
    const shift = rest.rtl ? rest.button.right - rest.stuck.right + 8 : rest.button.left - rest.stuck.left - 8
    await box.evaluate((el, by) => { el.scrollLeft += by }, shift)
    const under = await dimmedRow(box)

    // The cell did not move, and the button really is behind it: otherwise this proves nothing.
    expect(under.stuck.x).toBeCloseTo(rest.stuck.x, 0)
    const overlap = Math.min(under.button.right, under.stuck.right) - Math.max(under.button.left, under.stuck.left)
    expect(overlap, 'the button never reached the stuck column').toBeGreaterThan(20)

    const after = await page.screenshot({ clip })
    // Measured before the fix: more than 2,000 changed pixels. A stray anti-aliased edge is under 50.
    expect(await changedPixels(page, before, after), 'the button is painted over the stuck column').toBeLessThan(50)
  })
}

/** How much of the focused control is clear of the stuck cell of its own row, in CSS px. */
const clearOfStuck = (page: Page) => page.evaluate(() => {
  const focused = document.activeElement
  const box = focused?.closest('[data-sticky-first-column]')
  const stuck = focused?.closest('tr')?.firstElementChild
  // Not in a row of a table with a stuck column, or inside the stuck cell itself: nothing to measure.
  if (!focused || !box || focused === box || !stuck || stuck.contains(focused)) return null
  const [f, s] = [focused.getBoundingClientRect(), stuck.getBoundingClientRect()]
  const covered = Math.max(0, Math.min(f.right, s.right) - Math.max(f.left, s.left))
  return { name: focused.textContent.trim(), width: f.width, clear: f.width - covered }
})

for (const demo of STUCK) {
  for (const direction of DIRECTIONS) {
    test(`${demo} ${direction}: a focused control is never under the stuck column`, async ({ page }) => {
      await page.goto(urlFor(demo, 'light', direction))
      const box = page.locator('[data-sticky-first-column]').first()
      const rtl = await box.evaluate((el) => getComputedStyle(el).direction === 'rtl')

      // The keys are how a keyboard gets here at all, so prove they scroll before relying on it.
      await box.focus()
      await expect(async () => {
        await page.keyboard.press(rtl ? 'ArrowLeft' : 'ArrowRight')
        expect(Math.abs(await box.evaluate((el) => el.scrollLeft))).toBeGreaterThan(30)
      }).toPass({ timeout: 10_000 })

      const stops: { name: string; width: number; clear: number }[] = []
      // Each offset puts a different column under the stuck one; the walk goes forwards, then back.
      for (const offset of [80, 120, 160]) {
        for (const key of ['Tab', 'Shift+Tab']) {
          await box.evaluate((el, to) => { el.scrollLeft = to }, rtl ? -offset : offset)
          await box.focus()
          // Backwards starts from the far side of the box: a first Tab leaves it only when no control follows.
          if (key === 'Shift+Tab') await box.evaluate((el) => { [...el.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')].at(-1)?.focus() })
          for (let press = 0; press < 40; press++) {
            await page.keyboard.press(key)
            if (!(await box.evaluate((el) => el.contains(document.activeElement) && el !== document.activeElement))) break
            const stop = await clearOfStuck(page)
            if (stop) stops.push(stop)
          }
        }
      }

      // The loop found controls to focus, or an empty walk would pass.
      expect(stops.length).toBeGreaterThan(8)
      // Chromium stops scrolling once 32 px of a control are in view, so that much, or all of a narrower one, is the floor.
      expect(stops.filter((stop) => stop.clear < Math.min(stop.width, 32) - 1), 'under the stuck column while focused').toEqual([])
    })
  }
}
