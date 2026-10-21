import AxeBuilder from '@axe-core/playwright'
import { type Page, expect, test } from '@playwright/test'

const SLUGS = ['table', 'tree-view', 'timeline', 'stepper'] as const
const LOCALES = [{ locale: 'en', dir: 'ltr' }, { locale: 'ar', dir: 'rtl' }] as const
const MODES = ['light', 'dark', 'ocean'] as const

/** Every console error and uncaught exception: a hydration mismatch is one of them. */
function collectErrors(page: Page): string[] {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  // The site's icon is the shell's (S6 manifest.ts); until it lands the browser's own /favicon.ico request 404s.
  page.on('console', (message) => {
    if (message.type() === 'error' && !message.location().url.endsWith('/favicon.ico')) errors.push(`${message.text()} ${message.location().url}`)
  })
  return errors
}

async function openIn(page: Page, path: string, mode: string) {
  await page.addInitScript((stored) => { localStorage.setItem('tc-theme', stored) }, mode)
  const response = await page.goto(path)
  expect(response?.status()).toBe(200)
}

const card = (page: Page, slug: string) => page.locator(`[data-component="${slug}"]`)
const examples = (page: Page) => page.locator('section[aria-labelledby="examples"]')

for (const slug of SLUGS) {
  for (const { locale, dir } of LOCALES) {
    for (const mode of MODES) {
      test(`${slug} renders in ${locale} in ${mode}, hydrates, and passes axe`, async ({ page }) => {
        const errors = collectErrors(page)
        await openIn(page, `/${locale}/docs/components/${slug}`, mode)
        const html = page.locator('html')
        await expect(html).toHaveAttribute('lang', locale)
        await expect(html).toHaveAttribute('dir', dir)
        await expect(html).toHaveAttribute('data-theme', mode)
        await expect(page.locator('h1')).toHaveCount(1)
        await card(page, slug).scrollIntoViewIfNeeded()
        await page.waitForLoadState('networkidle')
        const results = await new AxeBuilder({ page }).analyze()
        expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([])
        expect(errors).toEqual([])
      })
    }
  }
}

test('no Data page scrolls sideways at 390 px', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  for (const slug of SLUGS) {
    for (const { locale } of LOCALES) {
      await page.goto(`/${locale}/docs/components/${slug}`)
      const wider = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
      expect(wider, `${locale}/${slug}`).toBe(false)
    }
  }
})

test('every Data code block shows the rewritten imports, never a path into the library', async ({ page }) => {
  for (const slug of SLUGS) {
    await page.goto(`/en/docs/components/${slug}`)
    const text = (await page.locator('pre').allTextContents()).join('\n')
    expect(text).toContain(`from 'topclassui/${slug}'`)
    expect(text).not.toMatch(/from '(\.\.?\/|#)/)
  }
})

test('every Data page counts its states', async ({ page }) => {
  const counts = { table: '6 states', 'tree-view': '4 states', timeline: '6 states', stepper: '4 states' } as const
  for (const slug of SLUGS) {
    await page.goto(`/en/docs/components/${slug}`)
    await expect(card(page, slug).getByText(counts[slug], { exact: true })).toBeVisible()
  }
})

test('Table: the playground drives the stage and the code', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto('/en/docs/components/table')
  const table = card(page, 'table')
  await table.getByRole('checkbox', { name: 'striped' }).click()
  await expect(table.locator('[data-striped]').first()).toBeVisible()
  await table.getByRole('checkbox', { name: 'stickyFirstColumn' }).click()
  await expect(table.locator('[data-sticky-first-column]').first()).toBeVisible()
  await table.getByRole('checkbox', { name: 'captionVisible' }).click()
  await expect(table.locator('caption', { hasText: 'Team members' })).toBeVisible()
  const code = table.locator('pre').first()
  for (const prop of ['stickyFirstColumn', 'captionVisible', 'striped']) await expect(code).toContainText(`  ${prop}\n`)
  expect(errors).toEqual([])
})

test('TreeView: the client stage mounts near the viewport and takes the props', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto('/en/docs/components/tree-view')
  const treeCard = card(page, 'tree-view')
  const tree = treeCard.getByRole('tree', { name: 'Files' })
  await expect(tree).toBeVisible()
  await expect(tree).not.toHaveAttribute('aria-busy', 'true')
  await treeCard.getByRole('combobox', { name: 'status' }).click()
  await page.getByRole('option', { name: 'loading-more', exact: true }).click()
  await expect(tree).toHaveAttribute('aria-busy', 'true')
  await expect(treeCard.locator('pre').first()).toContainText('<TreeView status="loading-more" aria-label="Files"')
  expect(errors).toEqual([])
})

test('TreeView: the keyboard moves through the stage, and in Arabic ArrowLeft opens a branch', async ({ page }) => {
  await page.goto('/ar/docs/components/tree-view')
  const tree = card(page, 'tree-view').getByRole('tree', { name: 'Files' })
  await tree.focus()
  const components = tree.getByRole('treeitem', { name: 'components' })
  await expect(components).toHaveAttribute('aria-expanded', 'false')
  for (let i = 0; i < 4; i++) await page.keyboard.press('ArrowDown')
  await expect(tree).toHaveAttribute('aria-activedescendant', (await components.getAttribute('id')) ?? '')
  await page.keyboard.press('ArrowLeft')
  await expect(components).toHaveAttribute('aria-expanded', 'true')
})

test('Stepper: the playground drives the size, in Arabic', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto('/ar/docs/components/stepper')
  const stepper = card(page, 'stepper')
  await expect(stepper.locator('[data-size="md"]').first()).toBeVisible()
  await stepper.getByRole('combobox', { name: 'size' }).click()
  await page.getByRole('option', { name: 'lg', exact: true }).click()
  await expect(stepper.locator('[data-size="lg"]').first()).toBeVisible()
  await expect(stepper.locator('pre').first()).toContainText('<Stepper size="lg" items={STEPS}')
  expect(errors).toEqual([])
})

test('Timeline: no schema, so the card shows its basic demo and no Try it', async ({ page }) => {
  await page.goto('/en/docs/components/timeline')
  const timeline = card(page, 'timeline')
  await expect(timeline.getByRole('heading', { name: 'Try it' })).toHaveCount(0)
  await expect(timeline.locator('ol, ul').first()).toBeVisible()
})

test('a live example hydrates: a tree in the examples opens on a click', async ({ page }) => {
  await page.goto('/en/docs/components/tree-view')
  const tree = examples(page).getByRole('tree').first()
  const branch = tree.locator('[role="treeitem"][aria-expanded="false"]').first()
  await branch.scrollIntoViewIfNeeded()
  await branch.click()
  await expect(tree.locator('[role="treeitem"][aria-expanded="true"]').first()).toBeVisible()
})

test('the ten-thousand-node example stays windowed', async ({ page }) => {
  await page.goto('/en/docs/components/tree-view')
  await page.waitForLoadState('networkidle')
  const rows = await examples(page).getByRole('treeitem').count()
  expect(rows).toBeLessThan(400)
})
