import { expect, test } from '@playwright/test'

import { DIRECTIONS } from '../scripts/lib/harness.js'
import { DEMOS, urlFor } from './pages.js'

// The compact row on a phone: first, previous, "3 of 12", next and last on one line, each a 44 px target,
// with the page links still in the HTML. Measured, since a class name cannot show what a 390 px screen draws.
const PAGINATION = DEMOS.filter((demo) => demo.startsWith('pagination--'))

/** Each nav as the browser draws it: the boxes on screen, and the pages its links lead to. */
const readNavs = () => [...document.querySelectorAll('nav')].map((nav) => {
  const page = (href: string | null) => Number(/page-(\d+)/.exec(href ?? '')?.[1])
  const shown = [...nav.querySelectorAll('li')].filter((item) => item.checkVisibility())
  const links = [...nav.querySelectorAll('a[href]')]
  const visible = links.filter((link) => link.checkVisibility())
  const status = nav.querySelector('li.pagination-compact')
  return {
    name: nav.getAttribute('aria-label'),
    disabled: nav.hasAttribute('data-disabled'),
    // The row centres its items, so a line is one centre whatever the height of each box.
    lines: [...new Set(shown.map((item) => {
      const box = item.getBoundingClientRect()
      return Math.round(box.top + box.height / 2)
    }))],
    status: status?.checkVisibility() === true ? status.textContent : null,
    current: page(nav.querySelector('[aria-current="page"]')?.getAttribute('href') ?? null),
    // The highest page any link leads to, read from the hrefs so the Arabic row needs no parsing.
    count: Math.max(...links.map((link) => page(link.getAttribute('href')))),
    reached: visible.map((link) => page(link.getAttribute('href'))).sort((a, b) => a - b),
    linksInHtml: links.length,
    boxes: visible.map((link) => {
      const box = link.getBoundingClientRect()
      return { label: link.getAttribute('aria-label'), width: box.width, height: box.height }
    }),
  }
})

/** The pages first, previous, next and last lead to from `current` of `count`, written out. */
const neighbours = (current: number, count: number) =>
  [...new Set([1, current - 1, current + 1, count])].filter((page) => page >= 1 && page <= count && page !== current)
    .sort((a, b) => a - b)

test('the set holds the first, middle and last page, so every branch of the row is measured', () => {
  expect(PAGINATION).toEqual(expect.arrayContaining(['pagination--first-page', 'pagination--middle', 'pagination--last-page']))
})

for (const pointer of ['fine', 'coarse'] as const) {
  test.describe(`at 390 px under a ${pointer} pointer`, () => {
    test.use({ viewport: { width: 390, height: 844 }, hasTouch: pointer === 'coarse', isMobile: pointer === 'coarse' })

    for (const demo of PAGINATION) {
      for (const direction of DIRECTIONS) {
        test(`${demo} ${direction}: one line, and every page reachable from the four controls`, async ({ page }) => {
          await page.goto(urlFor(demo, 'light', direction))
          const navs = await page.evaluate(readNavs)
          expect(navs.length).toBeGreaterThan(0)
          for (const nav of navs) {
            expect(nav.lines, `${String(nav.name)} wraps`).toHaveLength(1)
            expect(nav.status, `${String(nav.name)} shows no "current of total"`).not.toBeNull()
            // Disabled, every cell is a dead span by design, so there is no link to reach.
            if (nav.disabled) {
              expect(nav.linksInHtml, `${String(nav.name)} kept a link`).toBe(0)
              continue
            }
            // Next leads to current + 1 and previous to current - 1, so walking either way reaches every page.
            expect([...new Set(nav.reached)], String(nav.name)).toEqual(neighbours(nav.current, nav.count))
            expect(nav.linksInHtml, `${String(nav.name)} dropped its page links`).toBeGreaterThan(nav.reached.length)
          }
        })
      }
    }
  })
}

test.describe('at 390 px under a coarse pointer', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })

  test('the middle page reads "6 of 12" between four 44 px links', async ({ page }) => {
    await page.goto(urlFor('pagination--middle', 'dark', 'ltr'))
    const [nav] = await page.evaluate(readNavs)
    expect(nav?.status).toBe('6 of 12')
    expect(nav?.reached).toEqual([1, 5, 7, 12])
    expect(nav?.linksInHtml).toBe(9)
    for (const box of nav?.boxes ?? []) {
      expect(box.width, String(box.label)).toBeGreaterThanOrEqual(44)
      expect(box.height, String(box.label)).toBeGreaterThanOrEqual(44)
    }
  })
})

test.describe('at 1280 px under a fine pointer', () => {
  test('the full row stays: every page link on screen and no "current of total"', async ({ page }) => {
    await page.goto(urlFor('pagination--middle', 'dark', 'ltr'))
    const [nav] = await page.evaluate(readNavs)
    expect(nav?.status).toBeNull()
    expect(nav?.reached).toEqual([1, 1, 5, 5, 6, 7, 7, 12, 12])
  })
})

test.describe('at 1280 px in a cell sized to its content', () => {
  /** Each nav moved into a centred flex cell of the given width, as the docs' states strip lays it out. */
  const intoCells = (width: number) => {
    for (const nav of document.querySelectorAll('nav')) {
      const cell = document.createElement('div')
      cell.style.cssText = `display: flex; justify-content: center; width: ${String(width)}px`
      nav.replaceWith(cell)
      cell.append(nav)
    }
  }

  test('a row that fits its 227 px cell stays full, on one line and inside the cell', async ({ page }) => {
    await page.goto(urlFor('pagination--states', 'dark', 'ltr'))
    await page.evaluate(intoCells, 227)
    const widths = await page.evaluate(() => [...document.querySelectorAll('nav')].map((nav) => nav.getBoundingClientRect().width))
    for (const nav of await page.evaluate(readNavs)) {
      expect(nav.status, String(nav.name)).toBeNull()
      expect(nav.lines, `${String(nav.name)} wraps`).toHaveLength(1)
    }
    for (const width of widths) expect(width).toBeLessThanOrEqual(227)
  })

  test('a row that does not fit its 160 px cell turns compact, on one line and inside the cell', async ({ page }) => {
    await page.goto(urlFor('pagination--states', 'dark', 'ltr'))
    await page.evaluate(intoCells, 160)
    const widths = await page.evaluate(() => [...document.querySelectorAll('nav')].map((nav) => nav.getBoundingClientRect().width))
    for (const nav of await page.evaluate(readNavs)) {
      expect(nav.status, String(nav.name)).toMatch(/^[123] of 3$/)
      expect(nav.lines, `${String(nav.name)} wraps`).toHaveLength(1)
    }
    for (const width of widths) expect(width).toBeLessThanOrEqual(160)
  })
})
