import { expect, test } from '@playwright/test'

import { axeViolations, card, collectErrors, openIn } from './pages'

const SLUGS = ['field', 'form', 'meter'] as const
const LOCALES = [{ locale: 'en', dir: 'ltr' }, { locale: 'ar', dir: 'rtl' }] as const
const MODES = ['light', 'dark', 'ocean'] as const

for (const slug of SLUGS) {
  for (const { locale, dir } of LOCALES) {
    for (const mode of MODES) {
      test(`${slug} renders in ${locale} in ${mode}, hydrates, and passes axe`, async ({ page }) => {
        const errors = collectErrors(page)
        await openIn(page, `/${locale}/docs/components/${slug}`, mode)
        const html = page.locator('html')
        await expect(html).toHaveAttribute('dir', dir)
        await expect(html).toHaveAttribute('data-theme', mode)
        await expect(page.locator('h1')).toHaveCount(1)
        await card(page, slug).scrollIntoViewIfNeeded()
        await page.waitForLoadState('networkidle')
        expect(await axeViolations(page)).toEqual([])
        expect(errors).toEqual([])
      })
    }
  }
}

test('Field, Form and Meter have no Try it: the stage shows the basic demo, and the code is its source', async ({ page }) => {
  for (const slug of SLUGS) {
    await page.goto(`/en/docs/components/${slug}`)
    const preview = card(page, slug)
    await expect(preview.getByRole('heading', { name: 'Try it' })).toHaveCount(0)
    await expect(preview.locator('pre').first()).toContainText(`from 'topclassui/${slug}'`)
  }
  await expect(card(page, 'meter').getByRole('meter', { name: 'Battery' })).toHaveAttribute('aria-valuenow', '60')
})

test('Form: the subscribe form submits with no script, with GET to this page, and the browser asks for the email first', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  const page = await context.newPage()
  await page.goto('/en/docs/components/form')
  const form = card(page, 'form').locator('form').first()
  await expect(form).not.toHaveAttribute('action')
  await expect(form).not.toHaveAttribute('method')
  const email = form.getByRole('textbox', { name: 'Email' })
  await expect(email).toHaveAttribute('required', '')
  await email.fill('omar@example.com')
  const [response] = await Promise.all([page.waitForResponse((answer) => answer.request().isNavigationRequest()), form.getByRole('button', { name: 'Subscribe' }).click()])
  expect([response.url(), response.request().method(), response.status()])
    .toEqual(['http://localhost:4611/en/docs/components/form?email=omar%40example.com', 'GET', 200])
  await context.close()
})

test('Field, Form and Meter link to each other and are linked from the controls', async ({ page }) => {
  await page.goto('/en/docs/components/field')
  const related = page.locator('section[aria-labelledby="related"]')
  await expect(related.getByRole('link', { name: 'Form', exact: true })).toHaveAttribute('href', '/en/docs/components/form')
  await page.goto('/en/docs/components/input')
  await expect(page.locator('section[aria-labelledby="related"]').getByRole('link', { name: 'Field', exact: true })).toHaveAttribute('href', '/en/docs/components/field')
  await page.goto('/ar/docs/components/progress')
  await expect(page.locator('section[aria-labelledby="related"]').getByRole('link', { name: 'المقياس', exact: true })).toHaveAttribute('href', '/ar/docs/components/meter')
})

test('no Field, Form or Meter page scrolls sideways at 390 px', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  for (const slug of SLUGS) {
    for (const { locale } of LOCALES) {
      await page.goto(`/${locale}/docs/components/${slug}`)
      const wider = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
      expect(wider, `${locale}/${slug}`).toBe(false)
    }
  }
})
