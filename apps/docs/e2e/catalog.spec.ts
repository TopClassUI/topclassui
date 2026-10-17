import { readFileSync } from 'node:fs'

import { expect, test } from '@playwright/test'

import { axeViolations, collectErrors, openIn } from './pages'

interface Section { id: string; slugs: string[] }
const { sections } = JSON.parse(readFileSync(new URL('../.generated/components.json', import.meta.url), 'utf8')) as { sections: Section[] }

const LOCALES = [{ locale: 'en', dir: 'ltr' }, { locale: 'ar', dir: 'rtl' }] as const
const MODES = ['light', 'dark', 'ocean'] as const
const COUNTS = { actions: 4, forms: 13, display: 7, data: 4, feedback: 6, overlays: 6, navigation: 6 }

for (const { locale, dir } of LOCALES) {
  for (const mode of MODES) {
    test(`the catalog lists 46 cards in ${locale} in ${mode}, hydrates, and passes axe`, async ({ page }) => {
      test.setTimeout(300_000)
      const errors = collectErrors(page)
      await openIn(page, `/${locale}/docs/components`, mode)
      const html = page.locator('html')
      await expect(html).toHaveAttribute('dir', dir)
      await expect(html).toHaveAttribute('data-theme', mode)
      await expect(page.locator('h1')).toHaveCount(1)
      await expect(page.locator('main article[data-component]')).toHaveCount(46)
      for (const [id, count] of Object.entries(COUNTS)) {
        await expect(page.locator(`section[data-section="${id}"] article[data-component]`), id).toHaveCount(count)
      }
      await page.waitForLoadState('networkidle')
      expect(await axeViolations(page, { demoCopies: true })).toEqual([])
      expect(errors).toEqual([])
    })
  }
}

test('the cards follow content/sections.ts, section by section', async ({ page }) => {
  await page.goto('/en/docs/components')
  const shown = await page.locator('section[data-section]').evaluateAll((nodes) => nodes.map((node) => ({
    id: node.getAttribute('data-section'),
    slugs: [...node.querySelectorAll('article[data-component]')].map((card) => card.getAttribute('data-component')),
  })))
  expect(shown).toEqual(sections.map(({ id, slugs }) => ({ id, slugs })))
})

test('each card heading links to its component page', async ({ page }) => {
  await page.goto('/ar/docs/components')
  await expect(page.locator('[data-component="select"] h2 a')).toHaveAttribute('href', '/ar/docs/components/select')
})

for (const { locale } of LOCALES) {
  test(`the catalog shifts less than 0.02 while it scrolls to the end, in ${locale}`, async ({ page }) => {
    test.setTimeout(300_000)
    await page.addInitScript(() => {
      const record = window as unknown as { shift: number }
      record.shift = 0
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) {
          if (!entry.hadRecentInput) record.shift += entry.value
        }
      }).observe({ type: 'layout-shift', buffered: true })
    })
    await page.goto(`/${locale}/docs/components`)
    await page.waitForLoadState('networkidle')
    for (;;) {
      const done = await page.evaluate(() => {
        window.scrollBy(0, window.innerHeight * 0.75)
        return window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 1
      })
      await page.waitForTimeout(120)
      if (done) break
    }
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)
    const shift = await page.evaluate(() => (window as unknown as { shift: number }).shift)
    expect(shift).toBeLessThan(0.02)
  })
}

test('the catalog does not scroll sideways at 390 px', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  for (const { locale } of LOCALES) {
    await page.goto(`/${locale}/docs/components`)
    const wider = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
    expect(wider, locale).toBe(false)
  }
})
