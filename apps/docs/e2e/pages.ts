// What every component page spec shares: the error collector, a page opened in a stored mode, and a card by slug.
import AxeBuilder from '@axe-core/playwright'
import { type Page, expect } from '@playwright/test'

/** Every console error and uncaught exception: a hydration mismatch is one of them. */
export function collectErrors(page: Page): string[] {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  // The site's icon is the shell's (S6 manifest.ts); until it lands the browser's own /favicon.ico request 404s.
  page.on('console', (message) => {
    if (message.type() === 'error' && !message.location().url.endsWith('/favicon.ico')) errors.push(`${message.text()} ${message.location().url}`)
  })
  return errors
}

export async function openIn(page: Page, path: string, mode: string) {
  await page.addInitScript((stored) => { localStorage.setItem('tc-theme', stored) }, mode)
  const response = await page.goto(path)
  expect(response?.status()).toBe(200)
}

export const card = (page: Page, slug: string) => page.locator(`[data-component="${slug}"]`)

/** A landmark-unique node that is a nav inside a card or an example: a component shown many times under its default name (open for Omar). */
const demoNav = (page: Page, selector: string) => page.locator(selector).first()
  .evaluate((element) => element.tagName === 'NAV' && element.closest('[data-component], section[aria-labelledby="examples"]') !== null)

/** axe's violations on the page, less contrast inside a disabled control: WCAG 1.4.3 exempts an inactive component.
 * With `demoCopies`, also less landmark-unique between copies of a demo's own nav, as the Navigation pages allow. */
export async function axeViolations(page: Page, { demoCopies = false } = {}): Promise<string[]> {
  const results = await new AxeBuilder({ page }).analyze()
  const found: string[] = []
  for (const violation of results.violations) {
    for (const node of violation.nodes) {
      const selector = node.target.join(' ')
      const inactive = violation.id === 'color-contrast'
        && await page.locator(selector).first().evaluate((element) => element.closest('[data-disabled]') !== null)
      const copy = demoCopies && violation.id === 'landmark-unique' && await demoNav(page, selector)
      if (!inactive && !copy) found.push(`${violation.id}: ${selector}`)
    }
  }
  return found
}
