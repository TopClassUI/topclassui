// The shared helper of every Unit 4 form control's spec: what a form would send now, read by the browser itself.
import type { Page } from '@playwright/test'

/** The entries of `new FormData(form)`, read in the page: on a static page that is the server HTML, before any script.
 * A file is reported by its name. `form` is a selector; the first form of the page by default. */
export function serverEntries(page: Page, form = 'form'): Promise<[string, string][]> {
  return page.locator(form).first().evaluate((node) => {
    if (!(node instanceof HTMLFormElement)) throw new Error(`serverEntries: ${node.tagName} is not a form`)
    return [...new FormData(node).entries()].map(([key, value]): [string, string] => [key, typeof value === 'string' ? value : value.name])
  })
}
