import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

import { card, collectErrors, openIn } from './pages'

const SLUGS = ['button', 'tag', 'kbd', 'segmented-control', 'alert', 'toast', 'banner', 'progress', 'spinner', 'empty-state'] as const
const LOCALES = [{ locale: 'en', dir: 'ltr' }, { locale: 'ar', dir: 'rtl' }] as const
const MODES = ['light', 'dark', 'ocean'] as const

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

test('no component page scrolls sideways at 390 px', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  for (const slug of SLUGS) {
    for (const { locale } of LOCALES) {
      await page.goto(`/${locale}/docs/components/${slug}`)
      const wider = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
      expect(wider, `${locale}/${slug}`).toBe(false)
    }
  }
})

test('every code block shows the rewritten imports, never a path into the library', async ({ page }) => {
  for (const slug of SLUGS) {
    await page.goto(`/en/docs/components/${slug}`)
    const text = (await page.locator('pre').allTextContents()).join('\n')
    expect(text).toContain(`from 'topclassui/${slug}'`)
    expect(text).not.toMatch(/from '(\.\.?\/|#)/)
  }
})

test('every example shows its stage and its source under it, with a Copy', async ({ page }) => {
  await page.goto('/en/docs/components/button')
  const example = page.locator('section[aria-labelledby="examples"] article').first()
  await expect(example.locator('pre')).toContainText("from 'topclassui/button'")
  await expect(example.getByRole('button', { name: /Copy the .* code for Button/ })).toBeVisible()
})

test('Button: the stage draws the five variants, then the playground drives it and the code', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto('/en/docs/components/button')
  const button = card(page, 'button')
  const stageBox = button.locator('[style*="--tc-stage-height"]').first()
  await expect(stageBox.getByRole('button')).toHaveCount(5)
  const stage = stageBox.locator('button', { hasText: 'Save' })
  await expect(stage).toHaveAttribute('data-variant', 'solid')
  await button.getByRole('combobox', { name: 'variant' }).click()
  await page.getByRole('option', { name: 'soft', exact: true }).click()
  await expect(stage).toHaveAttribute('data-variant', 'soft')
  await button.getByRole('checkbox', { name: 'loading' }).click()
  await expect(stage).toHaveAttribute('aria-busy', 'true')
  await expect(button.locator('pre').first()).toContainText('<Button variant="soft" loading>Save</Button>')
  expect(errors).toEqual([])
})

test('Tag: the playground drives the tone, in Arabic', async ({ page }) => {
  await page.goto('/ar/docs/components/tag')
  const tag = card(page, 'tag')
  // At rest the stage is the frame's row of tones and THE CODE its row of topics; the first change swaps in the playground's tag.
  const stageBox = tag.locator('[style*="--tc-stage-height"]').first()
  await expect(stageBox.locator('[data-tone]')).toHaveCount(6)
  await expect(tag.locator('pre').first()).toContainText('TOPICS.map')
  await tag.getByRole('combobox', { name: 'tone' }).click()
  await page.getByRole('option', { name: 'danger', exact: true }).click()
  await expect(stageBox.locator('[data-tone]')).toHaveCount(1)
  await expect(stageBox.locator('[data-tone]', { hasText: 'Design systems' })).toHaveAttribute('data-tone', 'danger')
  await expect(tag.locator('pre').first()).toContainText('tone="danger"')
})

test('SegmentedControl: the client stage mounts near the viewport and takes the props', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto('/en/docs/components/segmented-control')
  const segmented = card(page, 'segmented-control')
  // At rest the stage is the frame's colour mode track; the first Try it change swaps in the playground.
  await expect(segmented.getByRole('radiogroup', { name: 'Colour mode', exact: true })).toBeVisible()
  const track = segmented.getByRole('radiogroup', { name: 'View' })
  await segmented.getByRole('checkbox', { name: 'invalid' }).click()
  await expect(track).toHaveAttribute('aria-invalid', 'true')
  await track.getByRole('radio', { name: 'Table' }).click()
  await expect(track.getByRole('radio', { name: 'Table' })).toHaveAttribute('aria-checked', 'true')
  await expect(segmented.locator('pre').first()).toContainText('<SegmentedControlRoot invalid aria-label="View"')
  expect(errors).toEqual([])
})

test('a live example hydrates: a segmented control in the examples answers a click', async ({ page }) => {
  await page.goto('/en/docs/components/segmented-control')
  const radios = page.locator('section[aria-labelledby="examples"] [role="radiogroup"]').nth(2).getByRole('radio')
  await radios.nth(1).click()
  await expect(radios.nth(1)).toHaveAttribute('aria-checked', 'true')
})

test('Kbd: the keys of an English sentence keep its order on the Arabic page', async ({ page }) => {
  await page.goto('/ar/docs/components/kbd')
  const sentences = page.locator('section[aria-labelledby="examples"] p', { hasText: 'Press' })
  await expect(sentences).toHaveCount(4)
  for (const sentence of await sentences.all()) {
    const keys = sentence.locator('kbd kbd, kbd:not(:has(kbd))')
    const lefts = await keys.evaluateAll((els) => els.map((el) => el.getBoundingClientRect().left))
    const text = await sentence.textContent() ?? ''
    expect(lefts, text).toHaveLength(2)
    expect(lefts[0], text).toBeLessThan(lefts[1] ?? 0)
  }
})

test('the density knob writes --tc-density on the examples only', async ({ page }) => {
  await page.goto('/en/docs/components/button')
  await page.getByRole('radiogroup', { name: 'Density' }).getByRole('radio', { name: 'Compact' }).click()
  const scope = page.locator('section[aria-labelledby="examples"] [style*="--tc-density"]')
  await expect(scope).toHaveAttribute('style', /--tc-density:\s*0\.875/)
})

test('the card mode switch scopes data-theme to the card', async ({ page }) => {
  await openIn(page, '/en/docs/components/kbd', 'light')
  const kbd = card(page, 'kbd')
  await kbd.getByRole('radiogroup', { name: 'Colour mode for Kbd' }).getByRole('radio', { name: 'Dark' }).click()
  await expect(kbd.locator('[data-theme="dark"]').first()).toBeVisible()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
})
