import { expect, test, type Locator, type Page } from '@playwright/test'

import { DIRECTIONS, MODES } from '../scripts/lib/harness.js'
import { liveErrors, openLive } from './live.js'
import { OPENED, atRest } from './overlay.js'
import { DEMOS, urlFor } from './pages.js'

// No default browser scrollbar anywhere: the page and every element that can scroll compute scrollbar-width thin,
// on every static page and in every overlay opened live. scrollbar.spec has the colours and the bar as painted.
// none draws no bar at all: the closed Sidebar rail hides its own, which is no default bar either.

/** Every rendered element whose overflow on either axis is auto or scroll and whose bar is neither thin nor none, and the page's own. */
const unthemed = (page: Page) => page.evaluate((): string[] => {
  const name = (element: Element) => {
    const id = element.id ? `#${element.id}` : ''
    const role = element.getAttribute('role')
    const classes = typeof element.className === 'string' ? element.className.split(/\s+/).slice(0, 4).join('.') : ''
    return `${element.tagName.toLowerCase()}${id}${role ? `[role=${role}]` : ''}${classes ? `.${classes}` : ''}`
  }
  const found: string[] = []
  const root = getComputedStyle(document.documentElement).scrollbarWidth
  if (root !== 'thin') found.push(`the page: ${root}`)
  for (const element of document.querySelectorAll('body, body *')) {
    if (!element.checkVisibility()) continue
    const style = getComputedStyle(element)
    const scrolls = [style.overflowX, style.overflowY].some((value) => value === 'auto' || value === 'scroll')
    if (scrolls && !['thin', 'none'].includes(style.scrollbarWidth)) found.push(`${name(element)}: ${style.scrollbarWidth}`)
  }
  return found
})

for (const mode of MODES) {
  for (const direction of DIRECTIONS) {
    test(`${mode} ${direction}: every scroll container of every demo draws the thin bar`, async ({ page }) => {
      test.setTimeout(240_000)
      const failures: string[] = []
      for (const demo of DEMOS) {
        await page.goto(urlFor(demo, mode, direction))
        for (const element of await unthemed(page)) failures.push(`${demo}: ${element}`)
      }
      expect(failures).toEqual([])
    })
  }
}

/** The overlays that open a scroll container of their own, and the control that opens each. */
const OVERLAYS: { demo: string, trigger: (page: Page) => Locator }[] = [
  { demo: 'dialog--long-body', trigger: (page) => page.getByRole('button', { name: 'Read the terms' }) },
  { demo: 'drawer--long-body', trigger: (page) => page.getByRole('button', { name: 'Activity' }) },
  { demo: 'command--thousand', trigger: (page) => page.getByRole('button', { name: 'A thousand commands' }) },
  { demo: 'popover--long-content', trigger: (page) => page.getByRole('button', { name: 'Change log' }) },
  { demo: 'dropdown--sixty-items', trigger: (page) => page.getByRole('button', { name: 'Time zone' }) },
  { demo: 'select--sixty-items', trigger: (page) => page.getByRole('combobox', { name: 'Sixty options' }) },
  { demo: 'combobox--ten-thousand', trigger: (page) => page.getByRole('combobox', { name: 'Ten thousand options' }) },
  { demo: 'date-picker--basic', trigger: (page) => page.getByRole('button', { name: /Check-in/ }) },
]

test.describe('open overlays, live', () => {
  test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

  for (const { demo, trigger } of OVERLAYS) {
    for (const direction of DIRECTIONS) {
      test(`${demo}, ${direction}: the open overlay and the page behind it draw the thin bar`, async ({ page }) => {
        await openLive(page, demo, { direction, tall: true })
        await trigger(page).click()
        const opened = page.locator(`[data-base-ui-portal] ${OPENED}`).last()
        await expect(opened, 'the overlay opened').toBeVisible()
        await atRest(opened)
        expect(await unthemed(page)).toEqual([])
      })
    }
  }

  test('toast--many: the viewport that holds the stack draws the thin bar', async ({ page }) => {
    await openLive(page, 'toast--many')
    await page.getByRole('button', { name: 'Twenty messages' }).click()
    await expect.poll(() => page.evaluate(() => [...document.querySelectorAll('[data-base-ui-portal] *')]
      .filter((element) => getComputedStyle(element).overflowY === 'auto').length), 'the viewport is a scroll container').toBeGreaterThan(0)
    expect(await unthemed(page)).toEqual([])
  })
})

// The measure, shown a broken page: a measure that passes these proves nothing.
test.describe('the measure rejects a broken sample', () => {
  test('a scroll container without the shared bar is named', async ({ page }) => {
    await page.goto(urlFor('separator--horizontal', 'light', 'ltr'))
    await page.evaluate(() => {
      const box = document.createElement('div')
      box.id = 'plain'
      box.style.cssText = 'overflow-y: auto; block-size: 40px'
      document.body.append(box)
    })
    expect(await unthemed(page)).toEqual(['div#plain: auto'])
  })

  test('a page that loses its own thin bar is named', async ({ page }) => {
    await page.goto(urlFor('separator--horizontal', 'dark', 'rtl'))
    await page.addStyleTag({ content: 'html { scrollbar-width: auto !important }' })
    expect(await unthemed(page)).toEqual(['the page: auto'])
  })
})
