import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

import { TARGETS } from '../../../packages/topclassui/scripts/lib/targets.js'

const MODES = ['light', 'dark', 'ocean'] as const
const ROUTES = ['/docs/colors', '/docs/icons', '/docs/theming', '/docs/rtl', '/docs/server-first', '/docs/accessibility', '/changelog'] as const
const PATHS = ROUTES.flatMap((route) => [`/en${route}`, `/ar${route}`])
const NEXT = {
  '/docs/colors': '/docs/icons',
  '/docs/icons': '/docs/theming',
  '/docs/theming': '/docs/rtl',
  '/docs/rtl': '/docs/server-first',
  '/docs/server-first': '/docs/accessibility',
  '/docs/accessibility': '/docs/components',
  '/changelog': null,
} as const satisfies Record<(typeof ROUTES)[number], string | null>

async function openIn(page: Page, path: string, mode: (typeof MODES)[number]) {
  await page.addInitScript((value) => { localStorage.setItem('tc-theme', value) }, mode)
  await page.goto(path)
  await expect(page.locator('html')).toHaveAttribute('data-theme', mode)
}

for (const path of PATHS) {
  for (const mode of MODES) {
    test(`${path} in ${mode}: axe finds no WCAG 2.2 AA violation`, async ({ page }) => {
      await openIn(page, path, mode)
      const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']).analyze()
      expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([])
    })
  }

  test(`${path}: one h1 and the landmarks`, async ({ page }) => {
    await page.goto(path)
    await expect(page.locator('h1')).toHaveCount(1)
    await expect(page.locator('main#main')).toHaveCount(1)
    await expect(page.locator('footer')).toHaveCount(1)
  })

  test(`${path}: every visible interactive box clears 24 CSS px, and 44 under a coarse pointer`, async ({ page, browser }) => {
    await page.goto(path)
    for (const box of await page.locator(TARGETS).all()) {
      const size = await box.boundingBox()
      if (!(await box.isVisible()) || (size?.width ?? 0) <= 1) continue
      const label = (await box.getAttribute('aria-label')) ?? (await box.textContent())?.trim() ?? ''
      expect(Math.min(size?.width ?? 0, size?.height ?? 0), label).toBeGreaterThanOrEqual(24)
    }
    const context = await browser.newContext({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } })
    const coarse = await context.newPage()
    await coarse.goto(path)
    for (const box of await coarse.locator(TARGETS).all()) {
      const size = await box.boundingBox()
      if (!(await box.isVisible()) || (size?.width ?? 0) <= 1) continue
      // A link inside a sentence is exempt from SC 2.5.8; a pre is a scroll region, not a target.
      if (await box.evaluate((el) => el.closest('p, pre') !== null)) continue
      const label = (await box.getAttribute('aria-label')) ?? (await box.textContent())?.trim() ?? ''
      expect(Math.min(size?.width ?? 0, size?.height ?? 0), label).toBeGreaterThanOrEqual(44)
    }
    await context.close()
  })

  test(`${path}: no horizontal scroll at 390 px`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(path)
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(overflow).toBeLessThanOrEqual(0)
  })

  test(`${path}: On this page links to a heading of the page, and Next follows the registry`, async ({ page }) => {
    await page.goto(path)
    const toc = page.getByRole('navigation', { name: path.startsWith('/ar') ? 'في هذه الصفحة' : 'On this page' })
    const hrefs = await toc.locator('a[href^="#"]').evaluateAll((all) => all.map((el) => el.getAttribute('href') ?? ''))
    expect(hrefs.length).toBeGreaterThan(0)
    for (const href of hrefs) await expect(page.locator(`h2[id="${href.slice(1)}"]`)).toHaveCount(1)
    const locale = path.slice(0, 3)
    const next = NEXT[path.slice(3) as (typeof ROUTES)[number]]
    const card = page.locator('main a[href]').last()
    if (next === null) {
      await expect(page.locator(`main a[href="${locale}/changelog"]`)).toHaveCount(0)
    } else {
      await expect(card).toHaveAttribute('href', `${locale}${next}`)
      await card.click()
      await expect(page).toHaveURL(new RegExp(`${locale}${next}$`))
    }
  })

  test(`${path}: canonical and hreflang are present and reciprocal`, async ({ page }) => {
    await page.goto(path)
    const own = await page.locator('link[rel="alternate"][hreflang]').evaluateAll((all): Record<string, string | null> =>
      Object.fromEntries(all.map((el) => [el.getAttribute('hreflang') ?? '', el.getAttribute('href')])))
    expect(Object.keys(own).sort()).toEqual(['ar', 'en', 'x-default'])
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://topclassui.com${path}`)
  })
}

test('Icons: the search and the filter hide tiles, and the count follows', async ({ page }) => {
  await page.goto('/en/docs/icons')
  await expect(page.getByRole('status').filter({ hasText: 'results' })).toHaveText('84 results')
  await page.getByRole('radio', { name: 'Directional' }).click()
  await expect(page.getByRole('status').filter({ hasText: 'results' })).toHaveText('16 results')
  await page.getByRole('searchbox', { name: 'Search 84 icons' }).fill('caret')
  await expect(page.getByRole('status').filter({ hasText: 'results' })).toHaveText('7 results')
  await expect(page.getByRole('button', { name: 'Copy the code for gear' })).toBeHidden()
  await page.getByRole('radio', { name: 'All' }).click()
  await page.getByRole('searchbox', { name: 'Search 84 icons' }).fill('fill')
  await expect(page.getByRole('status').filter({ hasText: 'results' })).toHaveText('3 results')
})

test('Icons: a tile copies its Icon code and says so', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.goto('/en/docs/icons')
  await page.getByRole('button', { name: 'Copy the code for gear' }).click()
  await expect(page.getByRole('status').filter({ hasText: 'Copied' })).toHaveText('Copied <Icon name="gear" />')
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('<Icon name="gear" />')
})

test('Colors: the radius and density sliders set their knobs on main only', async ({ page }) => {
  await page.goto('/en/docs/colors')
  const radius = page.getByRole('slider', { name: 'Radius (rem)' })
  await radius.focus()
  await page.keyboard.press('ArrowRight')
  await expect(page.locator('main#main')).toHaveAttribute('style', /--tc-radius: 0\.625rem/)
  const density = page.getByRole('slider', { name: 'Density' })
  await density.focus()
  await page.keyboard.press('ArrowLeft')
  await expect(page.locator('main#main')).toHaveAttribute('style', /--tc-density: 0\.95/)
  expect(await page.evaluate(() => document.documentElement.style.getPropertyValue('--tc-radius'))).toBe('')
})

test('Theming: the scoped panel recomputes inside data-theme="ocean"', async ({ page }) => {
  await openIn(page, '/en/docs/theming', 'dark')
  const [pagePanel, scoped] = await page.locator('figure:has(button)').all()
  const fill = (el: Element) => getComputedStyle(el.querySelector('button') ?? el).backgroundColor
  expect(await scoped?.getAttribute('data-theme')).toBe('ocean')
  expect(await pagePanel?.evaluate(fill)).not.toBe(await scoped?.evaluate(fill))
})

test('Right to left: the pair renders the pagination demo in both directions', async ({ page }) => {
  await page.goto('/en/docs/rtl')
  await expect(page.locator('figure[dir="ltr"] nav')).toHaveCount(1)
  await expect(page.locator('figure [dir="rtl"][lang="ar"] nav')).toHaveCount(1)
})
