import { readFileSync } from 'node:fs'

import { expect, test, type Page } from '@playwright/test'

import { TARGETS } from '../../../packages/topclassui/scripts/lib/targets.js'
import { STAGE, STATE_GRID, TRY_IT } from '../components/classes'
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
/** The two phones every page is read at in the dark: the common one and the narrowest. */
const PHONES = [{ width: 390, height: 844 }, { width: 360, height: 800 }] as const
/** A state cell's floor, 9rem, unless the strip itself is narrower. */
const CELL_MIN = 144

/** The library's own boxes under 44 px on a phone, each left to the component job named (packages/topclassui, not the site). */
const LIBRARY_SHORTFALLS: Record<string, string> = {
  'otp-field': 'the cells shrink to 41 px in a 288 px card, with no coarse min-width: job 114 figma/forms-1',
  'number-field': 'the input between its two 44 px steppers keeps 16 px of a 106 px field: job 114 figma/forms-1',
}

/** Cuts the library draws on purpose or owes, each left to the job named, matched by the start of the fault. */
const LIBRARY_CUTS: Record<string, string> = {
  'drawer div "sheet" cut by div': 'the states cell draws the side sheet mid-swipe, half out of its frame, as a picture',
  'tag a "Infrastructure, platform relia" text cut': 'tag/dummy/link.tsx puts the long label straight in the chip with no LABEL span, so it is cut with no ellipsis at every width: routed by job 148',
  'tag strong "Infrastructure, platform relia" cut by span': 'tag/dummy/element-label.tsx: an element as the label is clipped to the chip; only bare text gets the ellipsis',
  'tag em "Infrastructure, platform relia" cut by span': 'tag/dummy/element-label.tsx, the same',
  'tag code "sha256_9f86d081884c7d659a2feaa" cut by span': 'tag/dummy/element-label.tsx, the same',
}
/** Example stages the library's own demo holds wider than a phone, each left to the job named. */
const LIBRARY_STAGES: Record<string, string> = {
  popover: 'popover/dummy/placements.tsx keeps three 8rem columns under its max-w-[31.5rem], 504 px in a 326 px stage; w-full max-w-[31.5rem] gives two: routed by job 148',
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
    // A scroll-driven translate leaves a float error of 1/8192 px in the rect; a layout unit is 1/64 px, so a real shortfall still fails.
    if (Math.min(box.width, box.height) >= 44 - 0.01) return []
    const label = element.getAttribute('aria-label') ?? element.textContent.trim().slice(0, 40)
    return [`${element.tagName.toLowerCase()} "${label}" ${Math.round(box.width)}x${Math.round(box.height)}`]
  }), [shortfalls, pageSlug] as const)
}

/** Every stage, of the Previewer or of an example, whose demo is wider than the phone and scrolls it sideways. */
async function stageScrolls(page: Page, path: string): Promise<string[]> {
  const slug = path.split('/docs/components/')[1] ?? ''
  if (slug in LIBRARY_STAGES) return []
  return page.evaluate((stage) => [...document.querySelectorAll('main *')].filter((element) => {
    const name = element.getAttribute('class') ?? ''
    return (name === stage || name.startsWith(`${stage} `)) && element.scrollWidth > element.clientWidth + 1
  }).map((element) => {
    const owner = element.closest('[data-example-name]')?.getAttribute('data-example-name') ?? element.closest('[data-component]')?.getAttribute('data-component') ?? ''
    return `${owner} ${String(element.scrollWidth)} > ${String(element.clientWidth)}`
  }), STAGE)
}

/** Every state strip whose cells are crushed under 9rem, leave the strip, or let their state stick out of the cell. */
async function stripFaults(page: Page): Promise<string[]> {
  return page.evaluate(([grid, floor]) => [...document.querySelectorAll('ul')].filter((list) => list.getAttribute('class') === grid).flatMap((list) => {
    const owner = list.closest('[data-component]')?.getAttribute('data-component') ?? list.closest('main')?.querySelector('h1')?.textContent ?? ''
    const strip = list.getBoundingClientRect()
    return [...list.children].flatMap((cell) => {
      const box = cell.getBoundingClientRect()
      const label = `${owner} "${cell.textContent.trim().slice(0, 24)}"`
      if (box.width < Math.min(floor, strip.width) - 0.5) return [`${label} ${String(Math.round(box.width))} px wide`]
      if (box.left < strip.left - 0.5 || box.right > strip.right + 0.5) return [`${label} leaves the strip`]
      const out = [...cell.querySelectorAll('*')].some((element) => {
        const inner = element.getBoundingClientRect()
        if (inner.width <= 1 || element.closest('.sr-only') !== null) return false
        // A part that scrolls or clips its own content inside the cell answers for what it holds.
        for (let parent = element.parentElement; parent !== null && parent !== cell; parent = parent.parentElement) {
          if (getComputedStyle(parent).overflowX !== 'visible') return false
        }
        return inner.left < box.left - 0.5 || inner.right > box.right + 0.5
      })
      return out ? [`${label} sticks out of its cell`] : []
    })
  }), [STATE_GRID, CELL_MIN] as const)
}

/** Inside every card and page: a box cut by an ancestor that hides overflow, text cut without an ellipsis, code or a Try it control under 12 px. */
async function clipFaults(page: Page, path: string): Promise<string[]> {
  const slug = path.split('/docs/components/')[1] ?? ''
  const faults = await page.locator('main').evaluate((main, [tryIt, pageSlug]) => {
    const shown = (element: Element) => {
      const box = element.getBoundingClientRect()
      return box.width > 1 && box.height > 1 && getComputedStyle(element).visibility !== 'hidden' && element.closest('.sr-only, [aria-hidden="true"], [inert]') === null
    }
    const name = (element: Element) => `${element.closest('[data-component]')?.getAttribute('data-component') ?? pageSlug} ${element.tagName.toLowerCase()} "${element.textContent.trim().slice(0, 30)}"`
    const faults: string[] = []
    for (const element of main.querySelectorAll('*')) {
      if (!shown(element)) continue
      const box = element.getBoundingClientRect()
      for (let parent = element.parentElement; parent !== null && parent !== main; parent = parent.parentElement) {
        const overflow = getComputedStyle(parent).overflowX
        if (overflow === 'visible') continue
        // An ellipsis is R-5.2-7's truncation: the rendering is cut on purpose, the data is not.
        if ((overflow === 'hidden' || overflow === 'clip') && getComputedStyle(parent).textOverflow !== 'ellipsis') {
          const frame = parent.getBoundingClientRect()
          if (box.left < frame.left - 1 || box.right > frame.right + 1) faults.push(`${name(element)} cut by ${parent.tagName.toLowerCase()}`)
        }
        break
      }
      const style = getComputedStyle(element)
      const text = [...element.childNodes].some((node) => node.nodeType === Node.TEXT_NODE && (node.textContent ?? '').trim() !== '')
      if (!text) continue
      if (['hidden', 'clip'].includes(style.overflowX) && style.textOverflow !== 'ellipsis' && element.scrollWidth > element.clientWidth + 1) faults.push(`${name(element)} text cut`)
      const read = element.closest('pre') !== null || element.closest(`[class="${tryIt}"]`) !== null
      if (read && Number.parseFloat(style.fontSize) < 12) faults.push(`${name(element)} ${style.fontSize}`)
    }
    return faults
  }, [TRY_IT, slug] as const)
  return faults.filter((fault) => !Object.keys(LIBRARY_CUTS).some((known) => fault.startsWith(known)))
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

test.describe('on a phone in the dark', () => {
  test.use({ hasTouch: true, isMobile: true, colorScheme: 'dark' })

  for (const phone of PHONES) {
    for (const path of SITEMAP) {
      test(`${path} at ${String(phone.width)}: no sideways scroll, stages inside the phone, strips wrapping, nothing clipped, targets of 44 px`, async ({ page }) => {
        test.setTimeout(90_000)
        await page.setViewportSize(phone)
        const { overflow, rows, small } = await measure(page, path)
        expect(overflow, 'horizontal overflow').toEqual([])
        expect(rows, 'navbar rows').toBeLessThanOrEqual(2)
        expect(small, 'targets under 44 px').toEqual([])
        expect(await stageScrolls(page, path), 'stages scrolling sideways').toEqual([])
        expect(await stripFaults(page), 'state strips').toEqual([])
        expect(await clipFaults(page, path), 'clipped or small text').toEqual([])
      })
    }

    for (const locale of LOCALES) {
      test(`/${locale}/docs/components at ${String(phone.width)}: the open search palette sits inside the phone with options of 44 px`, async ({ page }) => {
        await page.setViewportSize(phone)
        await page.goto(`/${locale}/docs/components`)
        await page.locator('[data-search-button]').first().click()
        const dialog = page.getByRole('dialog')
        await expect(dialog.getByRole('option').first()).toBeVisible()
        await dialog.evaluate((element) => Promise.all(element.getAnimations({ subtree: true }).map((animation) => animation.finished)))
        const box = await dialog.boundingBox()
        expect(box?.x ?? -1).toBeGreaterThanOrEqual(0)
        expect((box?.x ?? 0) + (box?.width ?? phone.width + 1)).toBeLessThanOrEqual(phone.width)
        expect(await overflowOf(page), 'horizontal overflow').toEqual([])
        expect(await smallTargets(page), 'targets under 44 px').toEqual([])
      })
    }
  }
})
