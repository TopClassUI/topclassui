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

/** A landmark-unique made only of navs, at most one of them outside the demos: a component shown many times under its default
 * name, beside the page's own copy as the component page's breadcrumb is (open for Omar). Accordion panels inside the demos
 * count too: the stage, the examples and the states strip each draw the same question (open for Omar). */
const demoNavs = (page: Page, targets: string[]) => page.evaluate((all) => {
  const placed = all.map((target) => document.querySelector(target))
  const inDemo = (element: Element | null) => element !== null && element.closest('[data-component], section[aria-labelledby="examples"]') !== null
  const panels = placed.every((element) => inDemo(element) && element?.getAttribute('role') === 'region'
    && document.getElementById(element.getAttribute('aria-labelledby') ?? '')?.hasAttribute('aria-expanded') === true)
  return panels || (placed.every((element) => element?.tagName === 'NAV') && placed.filter((element) => !inDemo(element)).length <= 1)
}, targets)

/** axe's violations on the page, less contrast inside a disabled control: WCAG 1.4.3 exempts an inactive component.
 * Base UI's focus guards are left out, as the library's e2e leaves them: each hands focus on and never holds it.
 * With `demoCopies`, also less landmark-unique between copies of a demo's own nav, as the Navigation pages allow. */
export async function axeViolations(page: Page, { demoCopies = false } = {}): Promise<string[]> {
  const results = await new AxeBuilder({ page }).exclude('[data-base-ui-focus-guard]').analyze()
  const found: string[] = []
  for (const violation of results.violations) {
    for (const node of violation.nodes) {
      const selector = node.target.join(' ')
      const inactive = violation.id === 'color-contrast'
        && await page.locator(selector).first().evaluate((element) => element.closest('[data-disabled]') !== null)
      const related = node.any.flatMap((check) => check.relatedNodes ?? []).map((other) => other.target.join(' '))
      const copy = demoCopies && violation.id === 'landmark-unique' && await demoNavs(page, [selector, ...related])
      if (!inactive && !copy) found.push(`${violation.id}: ${selector}`)
    }
  }
  return found
}
