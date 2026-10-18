// What a consumer app must show once built from the tarball: the components, with the library's styles computed on them.
import { type Page, expect, test } from '@playwright/test'

import { NAME_ENV } from '../lib/consumer-smoke.js'

const app = process.env[NAME_ENV] ?? 'consumer'

/** A token's computed value, read off a probe element, so both sides of a comparison are the browser's own spelling. */
function computed(page: Page, property: string, declarations: Record<string, string>): Promise<string> {
  return page.evaluate(([property, declarations]) => {
    const probe = document.createElement('div')
    for (const [name, value] of Object.entries(declarations)) probe.style.setProperty(name, value)
    document.body.append(probe)
    const value = getComputedStyle(probe).getPropertyValue(property)
    probe.remove()
    return value
  }, [property, declarations] as const)
}

test.describe(app, () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('the page is Arabic and right-to-left, from the layout', async ({ page }) => {
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar')
  })

  test('the Button is filled with --tc-primary-solid and rounded by --tc-radius', async ({ page }) => {
    const save = page.getByTestId('save')
    await expect(save).toBeVisible()
    const fill = await computed(page, 'background-color', { 'background-color': 'var(--tc-primary-solid)' })
    expect(fill).not.toBe('rgba(0, 0, 0, 0)')
    await expect(save).toHaveCSS('background-color', fill)
    const radius = await computed(page, 'border-radius', { 'border-radius': 'var(--tc-radius)' })
    expect(radius).not.toBe('0px')
    await expect(save).toHaveCSS('border-radius', radius)
  })

  test('the Badge is tinted with the success tone', async ({ page }) => {
    const badge = page.getByTestId('badge')
    await expect(badge).toHaveText('Beta')
    const tint = await computed(page, 'background-color', { 'background-color': 'var(--tc-success-soft)' })
    await expect(badge).toHaveCSS('background-color', tint)
  })

  test('the icon in the Button is the check path from topclassui/icons', async ({ page }) => {
    const d = await page.getByTestId('save').locator('svg path').first().getAttribute('d')
    expect(d?.startsWith('M229.66,77.66')).toBe(true)
  })

  test('keyboard focus draws the ring of --tc-ring-width', async ({ page }) => {
    await page.keyboard.press('Tab')
    const save = page.getByTestId('save')
    await expect(save).toBeFocused()
    const width = await computed(page, 'outline-width', { 'outline-style': 'solid', 'outline-width': 'var(--tc-ring-width)' })
    expect(width).not.toBe('0px')
    await expect(save).toHaveCSS('outline-style', 'solid')
    await expect(save).toHaveCSS('outline-width', width)
  })

  test('the Dialog opens on its trigger, sits on --tc-surface-raised and closes on Escape', async ({ page }) => {
    await page.getByTestId('open').click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog).toContainText('Publish changes')
    const surface = await computed(page, 'background-color', { 'background-color': 'var(--tc-surface-raised)' })
    await expect(dialog).toHaveCSS('background-color', surface)
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
  })
})
