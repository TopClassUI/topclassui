import { readFileSync } from 'node:fs'

import { expect, test, type Page } from '@playwright/test'

import { TARGETS } from '../../../packages/topclassui/scripts/lib/targets.js'
import { LIVE_PAGES, LOCALES, hrefOf } from '../content/pages'
import { axeViolations } from './pages'

interface Entry { slug: string; page: boolean; content: unknown }
const { components } = JSON.parse(readFileSync(new URL('../.generated/components.json', import.meta.url), 'utf8')) as { components: Entry[] }
const SLUGS = components.filter((entry) => entry.page && entry.content !== null).map((entry) => entry.slug)

// The sitemap's URLs, read from the same registry app/sitemap.ts reads.
const SITEMAP = LOCALES.flatMap((locale) => [
  ...LIVE_PAGES.map((page) => hrefOf(page, locale)),
  ...SLUGS.map((slug) => `/${locale}/docs/components/${slug}`),
])
// Home, the catalog, a guide and a component page, at the narrowest phone, the widest one and a tablet.
const SAMPLES = LOCALES.flatMap((locale) => ['', '/docs/components', '/docs/installation', '/docs/components/table'].map((path) => `/${locale}${path}`))
const WIDTHS = [360, 418, 768] as const

/** The library's own boxes under 44 px on a phone, each left to the component job named (packages/topclassui, not the site). */
const LIBRARY_SHORTFALLS: Record<string, string> = {
  'otp-field': 'the cells shrink to 41 px in a 288 px card, with no coarse min-width: job 114 figma/forms-1',
  'number-field': 'the input between its two 44 px steppers keeps 16 px of a 106 px field: job 114 figma/forms-1',
}

/** Paints every deferred section and scrolls once to the bottom and back, so the lazy islands below the fold mount. */
async function settle(page: Page) {
  await page.addStyleTag({ content: '* { content-visibility: visible !important; }' })
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += window.innerHeight) {
      window.scrollTo(0, y)
      await new Promise((resolve) => setTimeout(resolve, 40))
    }
    window.scrollTo(0, 0)
  })
  await page.waitForLoadState('networkidle')
}

/** The elements wider than the page, named by tag and class, when the document scrolls sideways. */
async function overflowOf(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const root = document.documentElement
    if (root.scrollWidth <= root.clientWidth) return []
    const wide = [...document.body.querySelectorAll('*')].filter((element) => {
      const box = element.getBoundingClientRect()
      return box.width > 0 && (box.right > root.clientWidth + 0.5 || box.left < -0.5)
    })
    // The outermost offenders only: a child of a wide element says nothing new.
    const outermost = wide.filter((element) => !wide.some((other) => other !== element && other.contains(element)))
    return [`scrollWidth ${root.scrollWidth} > ${root.clientWidth}`, ...outermost.map((element) => `${element.tagName.toLowerCase()}.${(element.getAttribute('class') ?? '').slice(0, 80)}`)]
  })
}

/** How many rows the header's visible items sit on: items whose vertical centres lie within 12 px share a row. */
async function navbarRows(page: Page): Promise<number> {
  return page.locator('header').first().evaluate((header) => {
    const centres = [...header.querySelectorAll('a, button, [role="button"], input')]
      .map((element) => element.getBoundingClientRect())
      .filter((box) => box.width > 1 && box.height > 1)
      .map((box) => box.top + box.height / 2)
      .sort((a, b) => a - b)
    let rows = 0
    let last = Number.NEGATIVE_INFINITY
    for (const centre of centres) {
      if (centre - last > 12) rows++
      last = centre
    }
    return rows
  })
}

/** Every visible target under 44 CSS px; a link inside a sentence is exempt from SC 2.5.8 and a pre is a scroll region. */
async function smallTargets(page: Page, path = ''): Promise<string[]> {
  const shortfalls = Object.keys(LIBRARY_SHORTFALLS)
  const pageSlug = path.split('/docs/components/')[1] ?? ''
  return page.locator(TARGETS).evaluateAll((all, [owned, slug]) => all.flatMap((element) => {
    const box = element.getBoundingClientRect()
    const style = getComputedStyle(element)
    if (box.width <= 1 || box.height <= 1 || style.visibility === 'hidden' || element.closest('[inert], [aria-hidden="true"]') !== null) return []
    if (element.closest('p, pre') !== null) return []
    const demo = element.closest('[data-component]')?.getAttribute('data-component') ?? (element.closest('main') === null ? '' : slug)
    if (element.tagName === 'INPUT' && owned.includes(demo)) return []
    if (Math.min(box.width, box.height) >= 44) return []
    const label = element.getAttribute('aria-label') ?? element.textContent.trim().slice(0, 40)
    return [`${element.tagName.toLowerCase()} "${label}" ${Math.round(box.width)}x${Math.round(box.height)}`]
  }), [shortfalls, pageSlug] as const)
}

async function measure(page: Page, path: string) {
  const response = await page.goto(path)
  expect(response?.status(), path).toBe(200)
  await settle(page)
  return { overflow: await overflowOf(page), rows: await navbarRows(page), small: await smallTargets(page, path) }
}

test.describe('on a phone', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })

  test('the sitemap lists every live page and every component page in both locales', () => {
    // Written out: 14 live pages and 49 component pages, twice.
    expect(SITEMAP).toHaveLength(126)
  })

  for (const path of SITEMAP) {
    test(`${path} at 390: no sideways scroll, the navbar on two rows at most, targets of 44 px, axe clean`, async ({ page }) => {
      test.setTimeout(90_000)
      const { overflow, rows, small } = await measure(page, path)
      expect(overflow, 'horizontal overflow').toEqual([])
      expect(rows, 'navbar rows').toBeLessThanOrEqual(2)
      expect(small, 'targets under 44 px').toEqual([])
      expect(await axeViolations(page, { demoCopies: true })).toEqual([])
    })
  }

  for (const locale of LOCALES) {
    test(`/${locale}/docs/installation at 390: the menu opens a drawer inside the screen with the mode, the languages and GitHub`, async ({ page }) => {
      await page.goto(`/${locale}/docs/installation`)
      await page.locator('header button[aria-haspopup="dialog"]').click()
      const drawer = page.getByRole('dialog')
      await expect(drawer).toBeVisible()
      await expect(drawer.getByRole('radio')).toHaveCount(3)
      await expect(drawer.locator('a[hreflang]')).toHaveCount(2)
      await expect(drawer.locator('a[href^="https://github.com/"]')).toHaveCount(1)
      await page.waitForTimeout(400)
      const box = await drawer.boundingBox()
      expect(box?.x ?? -1).toBeGreaterThanOrEqual(0)
      expect((box?.x ?? 0) + (box?.width ?? 391)).toBeLessThanOrEqual(390)
      expect(await smallTargets(page)).toEqual([])
      expect(await axeViolations(page)).toEqual([])
    })
  }

  for (const width of WIDTHS) {
    for (const path of SAMPLES) {
      test(`${path} at ${width}: no sideways scroll, the navbar on two rows at most, targets of 44 px`, async ({ page }) => {
        test.setTimeout(90_000)
        await page.setViewportSize({ width, height: 844 })
        const { overflow, rows, small } = await measure(page, path)
        expect(overflow, 'horizontal overflow').toEqual([])
        expect(rows, 'navbar rows').toBeLessThanOrEqual(2)
        expect(small, 'targets under 44 px').toEqual([])
      })
    }
  }
})
