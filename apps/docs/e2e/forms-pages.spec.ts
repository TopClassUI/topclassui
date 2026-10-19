import { type Locator, type Page, expect, test } from '@playwright/test'

import { axeViolations, card, collectErrors, openIn } from './pages'

const SLUGS = [
  'input', 'textarea', 'select', 'combobox', 'checkbox', 'radio-group', 'switch',
  'slider', 'number-field', 'otp-field', 'date-picker', 'file-upload', 'rating',
] as const
const LOCALES = [{ locale: 'en', dir: 'ltr' }, { locale: 'ar', dir: 'rtl' }] as const
const MODES = ['light', 'dark', 'ocean'] as const

const stageOf = (scope: Locator) => scope.locator('[style*="--tc-stage-height"]')
const examplesOf = (page: Page) => page.locator('section[aria-labelledby="examples"]')

/** Scrolls the card into view so a client stage and the Try it controls mount. */
async function openCard(page: Page, slug: string) {
  const scope = card(page, slug)
  await scope.scrollIntoViewIfNeeded()
  await expect(scope.getByRole('checkbox', { name: 'invalid', exact: true }).or(scope.getByRole('checkbox', { name: 'readOnly', exact: true }))).toBeVisible()
  return scope
}

/** Picks a Try it option; a click that lands while the popup is still settling is tried again from a closed popup. */
async function pick(page: Page, scope: Locator, prop: string, option: string) {
  const trigger = scope.getByRole('combobox', { name: prop, exact: true })
  await expect(async () => {
    if (await page.getByRole('listbox').count() > 0) await page.keyboard.press('Escape')
    await trigger.click()
    await page.getByRole('option', { name: option, exact: true }).click({ timeout: 2000 })
    await expect(trigger).toHaveText(option, { timeout: 1000 })
  }).toPass({ timeout: 15_000 })
}

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
        await examplesOf(page).scrollIntoViewIfNeeded()
        await page.waitForLoadState('networkidle')
        expect(await axeViolations(page)).toEqual([])
        expect(errors).toEqual([])
      })
    }
  }
}

test('every live example on a Forms page is hydrated by React', async ({ page }) => {
  test.setTimeout(120_000)
  for (const slug of SLUGS) {
    const errors = collectErrors(page)
    await page.goto(`/en/docs/components/${slug}`)
    await page.waitForLoadState('networkidle')
    const controls = examplesOf(page).locator('input, textarea, button, [role="slider"], [role="combobox"]')
    expect(await controls.count(), slug).toBeGreaterThan(0)
    // An example takes over when it nears the viewport (lazy-island.tsx), so each is brought on screen first.
    await examplesOf(page).evaluate(async (section) => {
      const end = section.getBoundingClientRect().bottom + window.scrollY
      for (let y = section.getBoundingClientRect().top + window.scrollY; y < end; y += window.innerHeight) {
        window.scrollTo({ top: y, behavior: 'instant' })
        await new Promise((resolve) => setTimeout(resolve, 150))
      }
    })
    await page.waitForLoadState('networkidle')
    await expect.poll(() => controls.evaluateAll((nodes) => nodes.filter((node) => !Object.keys(node).some((key) => key.startsWith('__reactFiber'))).length), { message: slug }).toBe(0)
    expect(errors, slug).toEqual([])
  }
})

test('no Forms page scrolls sideways at 390 px', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  for (const slug of SLUGS) {
    for (const { locale } of LOCALES) {
      await page.goto(`/${locale}/docs/components/${slug}`)
      const wider = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
      expect(wider, `${locale}/${slug}`).toBe(false)
    }
  }
})

test('every Forms code block shows the rewritten imports, never a path into the library', async ({ page }) => {
  for (const slug of SLUGS) {
    await page.goto(`/en/docs/components/${slug}`)
    const text = (await page.locator('pre').allTextContents()).join('\n')
    expect(text, slug).toContain(`from 'topclassui/${slug}'`)
    expect(text, slug).not.toMatch(/from '(\.\.?\/|#)/)
  }
})

for (const slug of SLUGS.filter((name) => name !== 'rating')) {
  const sized = slug !== 'file-upload'
  test(`${slug}: the playground drives ${sized ? 'the size and ' : ''}the invalid prop, on the stage and in the code`, async ({ page }) => {
    const errors = collectErrors(page)
    await page.goto(`/en/docs/components/${slug}`)
    const scope = await openCard(page, slug)
    const stage = stageOf(scope)
    if (sized) {
      await pick(page, scope, 'size', 'lg')
      await expect(stage.locator('[data-size="lg"]').first()).toBeAttached()
    }
    await expect(stage.locator('[aria-invalid="true"]')).toHaveCount(0)
    await scope.getByRole('checkbox', { name: 'invalid', exact: true }).click()
    await expect(stage.locator('[aria-invalid="true"]').first()).toBeAttached()
    await expect(scope.locator('pre').first()).toContainText(sized ? 'size="lg" invalid' : ' invalid')
    expect(errors).toEqual([])
  })
}

test('rating: the playground turns the read-only stars into radios and back on the stage', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto('/en/docs/components/rating')
  const scope = await openCard(page, 'rating')
  const stage = stageOf(scope)
  await expect(stage.getByRole('radio')).toHaveCount(0)
  await scope.getByRole('checkbox', { name: 'readOnly', exact: true }).click()
  await expect(stage.getByRole('radio')).toHaveCount(5)
  await stage.getByRole('radio').nth(4).check({ force: true })
  await expect(stage.getByRole('radio').nth(4)).toBeChecked()
  await pick(page, scope, 'size', 'xl')
  await expect(stage.locator('[data-size="xl"]').first()).toBeAttached()
  await scope.getByRole('checkbox', { name: 'readOnly', exact: true }).click()
  await expect(stage.getByRole('radio')).toHaveCount(0)
  expect(errors).toEqual([])
})

test('switch: the stage answers a click on the Arabic page', async ({ page }) => {
  await page.goto('/ar/docs/components/switch')
  const scope = await openCard(page, 'switch')
  const control = stageOf(scope).getByRole('switch')
  await expect(control).toHaveAttribute('aria-checked', 'true')
  await control.click()
  await expect(control).toHaveAttribute('aria-checked', 'false')
})

test('every Forms stage at its defaults fits the height its content file reserves, so nothing shifts when it mounts', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  for (const slug of SLUGS) {
    await page.goto(`/en/docs/components/${slug}`)
    const stage = stageOf(await openCard(page, slug))
    await expect(stage.locator('.animate-pulse')).toHaveCount(0)
    const [content, reserved] = await stage.evaluate((element) => {
      const { paddingBlockStart, paddingBlockEnd, minHeight } = getComputedStyle(element)
      const tallest = Math.max(...Array.from(element.children, (child) => child.getBoundingClientRect().height))
      return [tallest + parseFloat(paddingBlockStart) + parseFloat(paddingBlockEnd), parseFloat(minHeight)]
    })
    expect(content, slug).toBeLessThanOrEqual(reserved)
  }
})
