import { readFileSync } from 'node:fs'

import { type Page, expect, test } from '@playwright/test'

import { collectErrors } from './pages'

interface Entry { slug: string; name: string; page: boolean; content: { title: { en: string; ar: string } } | null }
const { components } = JSON.parse(readFileSync(new URL('../.generated/components.json', import.meta.url), 'utf8')) as { components: Entry[] }
const PAGES = components.filter((entry) => entry.page && entry.content !== null)

const LOCALES = [{ locale: 'en', name: 'Search the docs' }, { locale: 'ar', name: 'ابحث في التوثيق' }] as const

async function openSearch(page: Page, path: string) {
  await page.goto(path)
  await page.waitForLoadState('networkidle')
  await page.locator('[data-search-button]').click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByRole('option').first()).toBeVisible()
  return dialog
}

test('the index is fetched on the first open only, and the palette is named', async ({ page }) => {
  const fetched: string[] = []
  page.on('request', (request) => { if (request.url().includes('/search/')) fetched.push(new URL(request.url()).pathname) })
  await page.goto('/en/docs/components')
  await page.waitForLoadState('networkidle')
  expect(fetched).toEqual([])
  const dialog = await openSearch(page, '/en/docs/components')
  await expect(dialog).toHaveAccessibleName('Search the docs')
  expect(fetched).toEqual(['/search/en.json'])
})

for (const { locale, name } of LOCALES) {
  test(`search finds all ${String(PAGES.length)} component pages by their title and by their name, in ${locale}`, async ({ page }) => {
    test.setTimeout(300_000)
    const errors = collectErrors(page)
    const dialog = await openSearch(page, `/${locale}/docs/components`)
    await expect(dialog).toHaveAccessibleName(name)
    const input = dialog.getByRole('combobox')
    const missed: string[] = []
    for (const entry of PAGES) {
      const title = entry.content?.title[locale] ?? ''
      for (const query of [title, entry.name]) {
        await input.fill(query)
        const row = dialog.getByRole('option').filter({ hasText: title })
        if (!(await row.first().waitFor({ timeout: 3000 }).then(() => true, () => false))) missed.push(`${entry.slug} by "${query}"`)
      }
    }
    expect(missed).toEqual([])
    expect(errors).toEqual([])
  })
}

test('Ctrl K opens the search, Enter goes to the active row, in Arabic', async ({ page }) => {
  await page.goto('/ar/docs/components')
  await page.waitForLoadState('networkidle')
  await page.keyboard.press('Control+k')
  const dialog = page.getByRole('dialog')
  await dialog.getByRole('combobox').fill('Pagination')
  await expect(dialog.getByRole('option').first()).toContainText('ترقيم الصفحات')
  await page.keyboard.press('Enter')
  await page.waitForURL('**/ar/docs/components/pagination')
  await expect(page.locator('h1')).toHaveText('ترقيم الصفحات')
})

test('on the Command page, Ctrl K opens the site search alone, not a demo palette beside it', async ({ page }) => {
  await page.goto('/en/docs/components/command')
  await page.waitForLoadState('networkidle')
  await page.keyboard.press('Control+k')
  await expect(page.getByRole('dialog', { name: 'Search the docs' })).toBeVisible()
  await expect(page.getByRole('dialog')).toHaveCount(1)
})

test('the button says Ctrl K and names the shortcut for assistive technology', async ({ page }) => {
  await page.goto('/en/docs/components')
  const button = page.locator('[data-search-button]')
  await expect(button).toHaveAccessibleName('Search')
  await expect(button).toHaveAttribute('aria-keyshortcuts', 'Control+K')
  await expect(button).toContainText('Ctrl K')
})
