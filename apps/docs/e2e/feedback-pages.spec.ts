import { type Page, expect, test } from '@playwright/test'

// The Feedback section (35e): each playground drives its stage and its code; the render, hydration and axe loops are component-pages.spec.

function collectErrors(page: Page): string[] {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error' && !message.location().url.endsWith('/favicon.ico')) errors.push(`${message.text()} ${message.location().url}`)
  })
  return errors
}

const card = (page: Page, slug: string) => page.locator(`[data-component="${slug}"]`)

async function choose(page: Page, slug: string, prop: string, option: string) {
  const trigger = card(page, slug).getByRole('combobox', { name: prop })
  // The keyboard path: a pointer press while the popup is still opening is dropped by the select's own guard.
  await trigger.focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('option', { name: option, exact: true })).toBeVisible()
  await page.keyboard.type(option)
  await expect(page.getByRole('option', { name: option, exact: true })).toHaveAttribute('data-highlighted', '')
  await page.keyboard.press('Enter')
  await expect(trigger).toHaveText(option)
  await expect(page.locator('[data-base-ui-inert]')).toHaveCount(0)
}

test('Alert: the playground drives the variant and the tone', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto('/en/docs/components/alert')
  const alert = card(page, 'alert')
  const stage = alert.locator('[data-variant][data-tone]', { hasText: 'Your changes are saved' })
  await choose(page, 'alert', 'variant', 'outline')
  await expect(stage).toHaveAttribute('data-variant', 'outline')
  await choose(page, 'alert', 'tone', 'danger')
  await expect(stage).toHaveAttribute('data-tone', 'danger')
  await expect(alert.locator('pre').first()).toContainText('<Alert variant="outline" tone="danger"')
  expect(errors).toEqual([])
})

test('Banner: the playground drives the tone and the x, in Arabic', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto('/ar/docs/components/banner')
  const banner = card(page, 'banner')
  // The playground demo starts dismissible, as the frame draws it, so Try it starts with the box checked.
  const stage = banner.getByRole('region', { name: 'Release announcement' }).first()
  await expect(banner.getByRole('checkbox', { name: 'dismissible' })).toBeChecked()
  await choose(page, 'banner', 'tone', 'warning')
  await expect(stage).toHaveAttribute('data-tone', 'warning')
  await expect(stage.getByRole('button', { name: 'إغلاق' })).toBeVisible()
  await banner.getByRole('checkbox', { name: 'dismissible' }).click()
  await expect(stage.getByRole('button', { name: 'إغلاق' })).toHaveCount(0)
  await expect(banner.locator('pre').first()).toContainText('tone="warning"')
  await expect(banner.locator('pre').first()).toContainText('dismissible={false}')
  expect(errors).toEqual([])
})

test('Progress: the playground drives the value, the tone, the size and indeterminate', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto('/en/docs/components/progress')
  const progress = card(page, 'progress')
  const stage = progress.getByRole('progressbar', { name: 'Upload' })
  const slider = progress.getByRole('slider')
  await slider.focus()
  for (let press = 0; press < 5; press++) await page.keyboard.press('ArrowRight')
  await expect(stage).toHaveAttribute('aria-valuenow', '5')
  await choose(page, 'progress', 'tone', 'success')
  await expect(stage).toHaveAttribute('data-tone', 'success')
  await choose(page, 'progress', 'size', 'lg')
  await expect(stage).toHaveAttribute('data-size', 'lg')
  await progress.getByRole('checkbox', { name: 'indeterminate' }).click()
  await expect(stage).toHaveAttribute('data-indeterminate', '')
  await expect(stage).not.toHaveAttribute('aria-valuenow')
  await expect(progress.locator('pre').first()).toContainText('indeterminate')
  expect(errors).toEqual([])
})

test('Spinner: the playground drives the size and the tone', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto('/en/docs/components/spinner')
  const spinner = card(page, 'spinner')
  await choose(page, 'spinner', 'size', 'xl')
  await choose(page, 'spinner', 'tone', 'danger')
  await expect(spinner.locator('[data-size="xl"][data-tone="danger"]').first()).toBeVisible()
  await expect(spinner.locator('pre').first()).toContainText('<Spinner size="xl" tone="danger"')
  expect(errors).toEqual([])
})

test('Toast: the playground sets the options of the toast the press adds', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto('/en/docs/components/toast')
  const toast = card(page, 'toast')
  await choose(page, 'toast', 'tone', 'danger')
  await choose(page, 'toast', 'priority', 'high')
  await toast.getByRole('textbox', { name: 'duration' }).fill('0')
  await toast.getByRole('textbox', { name: 'duration' }).blur()
  await toast.getByRole('button', { name: 'Show a toast' }).click()
  // The stage holds a toast of its own at rest, so the one the press added is the last.
  const shown = page.getByRole('alertdialog', { name: 'Project created' }).last()
  await expect(shown).toBeVisible()
  await expect(shown).toHaveAttribute('data-type', 'danger')
  // toast is a function, not a tag, so the code is the stage's source rather than a usage the values are written into.
  await expect(toast.locator('pre').first()).toContainText('toast.add({ ...props')
  await page.waitForTimeout(5500)
  await expect(shown, 'duration 0 stays until it is closed').toBeVisible()
  await shown.getByRole('button', { name: 'Dismiss this notification' }).click()
  await expect(shown).toHaveCount(0)
  expect(errors).toEqual([])
})

test('a live example hydrates: a toast from the examples shows and closes', async ({ page }) => {
  await page.goto('/ar/docs/components/toast')
  const examples = page.locator('section[aria-labelledby="examples"]')
  await examples.getByRole('button').first().scrollIntoViewIfNeeded()
  await examples.getByRole('button').first().click()
  const shown = page.locator('[data-type][aria-modal]')
  await expect(shown).toHaveCount(1)
  await shown.getByRole('button', { name: 'إغلاق هذا الإشعار' }).click()
  await expect(shown).toHaveCount(0)
})

test('EmptyState has no Try it controls and still shows its stage and code', async ({ page }) => {
  await page.goto('/en/docs/components/empty-state')
  const empty = card(page, 'empty-state')
  await expect(empty.getByRole('checkbox')).toHaveCount(0)
  await expect(empty.getByRole('combobox')).toHaveCount(0)
  await expect(empty.locator('pre').first()).toContainText("from 'topclassui/empty-state'")
})
