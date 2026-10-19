import { type Page, expect, test } from '@playwright/test'

// No default browser scrollbar anywhere on the site: the page and every element that can scroll compute
// scrollbar-width thin, on every sitemap page at two widths and in the open search palette. none draws no bar.

/** Every rendered element whose overflow on either axis is auto or scroll and whose bar is neither thin nor none, and the page's own. */
const unthemed = (page: Page) => page.evaluate((): string[] => {
  const name = (element: Element) => {
    const label = element.getAttribute('aria-label') ?? element.getAttribute('role')
    const classes = typeof element.className === 'string' ? element.className.split(/\s+/).slice(0, 4).join('.') : ''
    return `${element.tagName.toLowerCase()}${label ? `[${label}]` : ''}${classes ? `.${classes}` : ''}`
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

const WIDTHS = [{ width: 1440, height: 900 }, { width: 390, height: 844 }] as const

for (const viewport of WIDTHS) {
  test(`every sitemap page at ${String(viewport.width)} px: every scroll container draws the thin bar`, async ({ page, request }) => {
    test.setTimeout(600_000)
    await page.setViewportSize(viewport)
    const sitemap = await (await request.get('/sitemap.xml')).text()
    const paths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1] ?? '').pathname)
    expect(paths.length).toBeGreaterThan(100)
    const failures: string[] = []
    for (const path of paths) {
      await page.goto(path)
      for (const element of await unthemed(page)) failures.push(`${path}: ${element}`)
    }
    expect(failures).toEqual([])
  })
}

for (const path of ['/en/docs/components', '/ar/docs/components']) {
  test(`${path}: the open search palette and the page behind it draw the thin bar`, async ({ page }) => {
    await page.goto(path)
    await page.waitForLoadState('networkidle')
    await page.locator('[data-search-button]').click()
    await expect(page.getByRole('dialog').getByRole('option').first()).toBeVisible()
    expect(await unthemed(page)).toEqual([])
  })
}

// The measure, shown a broken page: a measure that passes these proves nothing.
test('the measure names a scroll container without the shared bar, and a page that lost its own', async ({ page }) => {
  await page.goto('/en')
  await page.evaluate(() => {
    const box = document.createElement('div')
    box.setAttribute('aria-label', 'plain')
    box.style.cssText = 'overflow-x: auto; inline-size: 40px'
    document.body.append(box)
  })
  await page.addStyleTag({ content: 'html { scrollbar-width: auto !important }' })
  expect(await unthemed(page)).toEqual(['the page: auto', 'div[plain]: auto'])
})
