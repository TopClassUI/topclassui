import AxeBuilder from '@axe-core/playwright'
import { type Page, expect, test } from '@playwright/test'

const SLUGS = ['badge', 'avatar', 'avatar-group', 'card', 'separator', 'skeleton', 'code-block'] as const
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
const stageOf = (page: Page, slug: string) => card(page, slug).locator('[style*="--tc-stage-height"]').first()

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

test('no Display page scrolls sideways at 390 px', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  for (const slug of SLUGS) {
    for (const { locale } of LOCALES) {
      await page.goto(`/${locale}/docs/components/${slug}`)
      const wider = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
      expect(wider, `${locale}/${slug}`).toBe(false)
    }
  }
})

test('every Display code block shows the rewritten imports, never a path into the library', async ({ page }) => {
  for (const slug of SLUGS) {
    await page.goto(`/en/docs/components/${slug}`)
    const text = (await page.locator('pre').allTextContents()).join('\n')
    expect(text).toContain(`from 'topclassui/${slug}'`)
    expect(text).not.toMatch(/from '(\.\.?\/|#)/)
  }
})

test('Badge: the playground drives the variant and the tone', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto('/en/docs/components/badge')
  const badge = card(page, 'badge')
  // At rest the stage is the frame's matrix of variants and tones; the first change swaps in the playground's badge.
  await expect(stageOf(page, 'badge').locator('[data-tone="info"][data-variant="outline"]')).toBeVisible()
  const stage = stageOf(page, 'badge').locator('[data-tone]', { hasText: 'Paid' })
  await badge.getByRole('combobox', { name: 'variant' }).click()
  await page.getByRole('option', { name: 'solid', exact: true }).click()
  await expect(stage).toHaveAttribute('data-variant', 'solid')
  await badge.getByRole('combobox', { name: 'tone' }).click()
  await page.getByRole('option', { name: 'danger', exact: true }).click()
  await expect(stage).toHaveAttribute('data-tone', 'danger')
  await expect(badge.locator('pre').first()).toContainText('<Badge variant="solid" tone="danger">Paid</Badge>')
  expect(errors).toEqual([])
})

test('Avatar: the playground drives the size, in Arabic', async ({ page }) => {
  await page.goto('/ar/docs/components/avatar')
  const avatar = card(page, 'avatar')
  await avatar.getByRole('combobox', { name: 'size' }).click()
  await page.getByRole('option', { name: 'xl', exact: true }).click()
  await expect(stageOf(page, 'avatar').locator('[data-size]').first()).toHaveAttribute('data-size', 'xl')
  await expect(avatar.locator('pre').first()).toContainText('size="xl"')
})

test('AvatarGroup: the max select changes how many avatars show', async ({ page }) => {
  await page.goto('/en/docs/components/avatar-group')
  const group = card(page, 'avatar-group')
  // At rest the stage is the frame's overflow of thirteen and THE CODE its max sample; Try it swaps in the playground's six.
  await expect(stageOf(page, 'avatar-group').getByRole('group', { name: 'Everyone on the project' }).getByRole('img', { name: '9 more' })).toBeVisible()
  await expect(group.locator('pre').first()).not.toContainText('props.')
  const stage = stageOf(page, 'avatar-group').getByRole('group', { name: 'Project team' })
  await group.getByRole('combobox', { name: 'max' }).click()
  await page.getByRole('option', { name: '2', exact: true }).click()
  await expect(stage.getByRole('img', { name: '4 more' })).toBeVisible()
  await expect(group.locator('pre').first()).toContainText('max={2}')
})

test('Separator: the playground turns the line vertical and semantic', async ({ page }) => {
  await page.goto('/en/docs/components/separator')
  const separator = card(page, 'separator')
  // The stage draws the frame's line and its labelled "or" divider, and both take Try it's props.
  const stage = stageOf(page, 'separator').locator('[data-orientation]').first()
  await expect(stage).toHaveAttribute('role', 'none')
  await expect(separator.locator('pre').first()).toContainText('Personal details')
  await separator.getByRole('combobox', { name: 'orientation' }).click()
  await page.getByRole('option', { name: 'vertical', exact: true }).click()
  await expect(stage).toHaveAttribute('data-orientation', 'vertical')
  await separator.getByRole('checkbox', { name: 'decorative' }).click()
  await expect(stage).toHaveAttribute('role', 'separator')
  await expect(separator.locator('pre').first()).toContainText('orientation="vertical"')
})

test('Skeleton: the playground drives the variant and the rows', async ({ page }) => {
  await page.goto('/en/docs/components/skeleton')
  const skeleton = card(page, 'skeleton')
  // The playground draws an avatar circle beside the text skeleton, so the rows are the text one's.
  const stage = stageOf(page, 'skeleton').locator('[data-variant="text"]')
  await expect(stage.locator('> span')).toHaveCount(3)
  await expect(skeleton.locator('pre').first()).not.toContainText('props.')
  await skeleton.getByRole('combobox', { name: 'rows' }).click()
  await page.getByRole('option', { name: '5', exact: true }).click()
  await expect(stage.locator('> span')).toHaveCount(5)
  await skeleton.getByRole('combobox', { name: 'variant' }).click()
  await page.getByRole('option', { name: 'circle', exact: true }).click()
  await expect(stageOf(page, 'skeleton').locator('[data-variant]').first()).toHaveAttribute('data-variant', 'circle')
})

test('CodeBlock: the client stage takes showCopy and wrap', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto('/en/docs/components/code-block')
  const block = card(page, 'code-block')
  const stage = stageOf(page, 'code-block')
  await expect(stage.getByRole('button', { name: /Copy/ })).toBeVisible()
  await expect(stage.locator('pre')).toHaveAttribute('tabindex', '0')
  await block.getByRole('checkbox', { name: 'wrap' }).click()
  await expect(stage.locator('pre')).not.toHaveAttribute('tabindex', '0')
  await block.getByRole('checkbox', { name: 'showCopy' }).click()
  await expect(stage.getByRole('button', { name: /Copy/ })).toHaveCount(0)
  expect(errors).toEqual([])
})

test('a live CodeBlock example hydrates: its copy button answers a click', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.goto('/en/docs/components/code-block')
  const copy = page.locator('section[aria-labelledby="examples"]').getByRole('button', { name: /Copy/ }).first()
  await copy.click()
  await expect(page.locator('section[aria-labelledby="examples"] [role="status"]').first()).not.toBeEmpty()
})

test('Card has no playground: its stage is the basic example', async ({ page }) => {
  await page.goto('/en/docs/components/card')
  const cardEntry = card(page, 'card')
  await expect(cardEntry.getByRole('checkbox')).toHaveCount(0)
  await expect(cardEntry.locator('pre').first()).toContainText("from 'topclassui/card'")
  await expect(cardEntry.locator('pre').first()).toContainText('Download PDF')
})
