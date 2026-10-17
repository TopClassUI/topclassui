import { readFileSync } from 'node:fs'

import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

interface Entry { slug: string; page: boolean; content: unknown; demos: { name: string }[] }

const { components } = JSON.parse(readFileSync(new URL('../.generated/components.json', import.meta.url), 'utf8')) as { components: Entry[] }
const DEMOS = components.filter((entry) => entry.page && entry.content !== null)
  .flatMap((entry) => entry.demos.map((demo) => `${entry.slug}/${demo.name}`))
const THEMES = ['light', 'dark', 'ocean'] as const
const DIRS = [{ dir: 'ltr', lang: 'en' }, { dir: 'rtl', lang: 'ar' }] as const

test('the route has every demo of the Actions and Data components', () => {
  expect(DEMOS.length).toBe(78)
})

for (const theme of THEMES) {
  for (const { dir, lang } of DIRS) {
    test(`every demo renders alone in ${theme} ${dir}, noindex, and passes axe`, async ({ page }) => {
      test.setTimeout(240_000)
      for (const key of DEMOS) {
        const response = await page.goto(`/preview/${theme}/${dir}/${key}`)
        expect(response?.status(), key).toBe(200)
        const html = page.locator('html')
        await expect(html).toHaveAttribute('data-theme', theme)
        await expect(html).toHaveAttribute('dir', dir)
        await expect(html).toHaveAttribute('lang', lang)
        await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow')
        await expect(page.locator('nav, header, footer, aside')).toHaveCount(0)
        expect(await page.locator('main > *').count(), key).toBeGreaterThan(1)
        const results = await new AxeBuilder({ page }).analyze()
        expect(results.violations.map((v) => `${key} ${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([])
      }
    })
  }
}

test('the blank baseline holds nothing but its hidden name', async ({ page }) => {
  for (const theme of THEMES) {
    for (const { dir } of DIRS) {
      const response = await page.goto(`/preview/${theme}/${dir}/blank/empty`)
      expect(response?.status()).toBe(200)
      await expect(page.locator('main > *')).toHaveCount(1)
      await expect(page.locator('main > h1.sr-only')).toHaveText('blank/empty')
    }
  }
})

test('an address outside the generated set is a 404', async ({ page }) => {
  expect((await page.goto('/preview/sepia/ltr/button/variants'))?.status()).toBe(404)
  expect((await page.goto('/preview/light/ltr/button/nope'))?.status()).toBe(404)
})
