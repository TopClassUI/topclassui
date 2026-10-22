import AxeBuilder from '@axe-core/playwright'
import { type Page, expect, test } from '@playwright/test'

type Result = Awaited<ReturnType<AxeBuilder['analyze']>>['violations'][number]

const SLUGS = ['navbar', 'sidebar', 'tabs', 'accordion', 'breadcrumb', 'pagination'] as const
const LOCALES = [{ locale: 'en', dir: 'ltr' }, { locale: 'ar', dir: 'rtl' }] as const
const MODES = ['light', 'dark', 'ocean'] as const

/** Every console error and uncaught exception: a hydration mismatch is one of them. */
function collectErrors(page: Page): string[] {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  // The site's icon is the shell's (S6 manifest.ts); until it lands the browser's own /favicon.ico request 404s.
  page.on('console', (message) => {
    if (message.type() === 'error' && !message.location().url.endsWith('/favicon.ico')) errors.push(`${message.text()} ${message.location().url}`)
  })
  return errors
}

async function openIn(page: Page, path: string, mode: string) {
  await page.addInitScript((stored) => { localStorage.setItem('tc-theme', stored) }, mode)
  const response = await page.goto(path)
  expect(response?.status()).toBe(200)
}

/** The targets of a violation's nodes and of the nodes each one names as related. */
const targetsOf = (violation: Result) => violation.nodes.flatMap((node) => [node, ...node.any.flatMap((check) => check.relatedNodes ?? [])])
  .map((node) => node.target.join(' '))

/** A landmark-unique made only of copies of this page's own nav, at most one of them outside the demos: a docs page shows a
 * component many times under its default name, which is the open question in the report, not a defect of one demo. */
async function isDemoCopies(page: Page, violation: Result): Promise<boolean> {
  if (violation.id !== 'landmark-unique') return false
  const placed = await page.evaluate((targets) => targets.map((target) => {
    const element = document.querySelector(target)
    return element === null ? null : { landmark: element.matches('nav, aside, [role="navigation"], [role="complementary"]'), inDemo: element.closest('[data-component], section[aria-labelledby="examples"]') !== null }
  }), targetsOf(violation))
  // A target an island re-rendered after axe read it is gone: it can no longer duplicate anything.
  const live = placed.filter((place) => place !== null)
  return live.length > 0 && live.every((place) => place.landmark) && live.filter((place) => !place.inDemo).length <= 1
}

const card = (page: Page, slug: string) => page.locator(`[data-component="${slug}"]`)
const examples = (page: Page) => page.locator('section[aria-labelledby="examples"]')

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
        const real = []
        for (const violation of results.violations) if (!(await isDemoCopies(page, violation))) real.push(violation)
        expect(real.map((v) => `${v.id}: ${targetsOf(v).join(', ')}`)).toEqual([])
        expect(errors).toEqual([])
      })
    }
  }
}

test('no Navigation page scrolls sideways at 390 px', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  for (const slug of SLUGS) {
    for (const { locale } of LOCALES) {
      await page.goto(`/${locale}/docs/components/${slug}`)
      const wider = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
      expect(wider, `${locale}/${slug}`).toBe(false)
    }
  }
})

test('every Navigation code block shows the rewritten imports, never a path into the library', async ({ page }) => {
  for (const slug of SLUGS) {
    await page.goto(`/en/docs/components/${slug}`)
    const text = (await page.locator('pre').allTextContents()).join('\n')
    expect(text).toContain(`from 'topclassui/${slug}'`)
    expect(text).not.toMatch(/from '(\.\.?\/|#)/)
  }
})

test('Breadcrumb has no Try it: its stage is the basic demo across the row', async ({ page }) => {
  await page.goto('/en/docs/components/breadcrumb')
  const breadcrumb = card(page, 'breadcrumb')
  await expect(breadcrumb.getByRole('heading', { name: 'Try it' })).toHaveCount(0)
  await expect(breadcrumb.getByRole('navigation').first()).toBeVisible()
})

test('Navbar: the playground drives sticky on the bar and current on its link, and the code', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto('/en/docs/components/navbar')
  const navbar = card(page, 'navbar')
  // The stage is the frame's bar: in the flow, Docs the page being read. The playground takes its place on the first change.
  const stage = navbar.locator('header', { has: page.getByRole('link', { name: 'TopClass', exact: true }) }).first()
  await expect(stage).not.toHaveCSS('position', 'sticky')
  await expect(stage.getByRole('link', { name: 'Docs' })).toHaveAttribute('aria-current', 'page')
  const bar = navbar.locator('header', { has: page.getByRole('link', { name: 'TopClass UI' }) }).first()
  await navbar.getByRole('checkbox', { name: 'sticky' }).click()
  await expect(bar).not.toHaveCSS('position', 'sticky')
  await navbar.getByRole('checkbox', { name: 'current' }).click()
  await expect(bar.getByRole('link', { name: 'Docs' })).toHaveAttribute('aria-current', 'page')
  const code = navbar.locator('pre').first()
  await expect(code).toContainText('<NavbarRoot sticky={false}>')
  await expect(code).toContainText('<NavbarLink href="/docs" current>Docs</NavbarLink>')
  expect(errors).toEqual([])
})

test('Sidebar: the playground closes the rail and takes the mark off Home, in Arabic', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto('/ar/docs/components/sidebar')
  const sidebar = card(page, 'sidebar')
  const rail = sidebar.locator('nav[data-open], nav[data-closed]').first()
  await expect(rail).toHaveAttribute('data-open', '')
  await sidebar.getByRole('checkbox', { name: 'defaultOpen' }).click()
  await expect(rail).toHaveAttribute('data-closed', '')
  // Home is the page being read from the start, as the frame's stage draws it; the switch takes the mark off.
  const home = sidebar.locator('a[href="#home"]').first()
  await expect(home).toHaveAttribute('aria-current', 'page')
  await sidebar.getByRole('checkbox', { name: 'current' }).click()
  await expect(home).not.toHaveAttribute('aria-current', 'page')
  const code = sidebar.locator('pre').first()
  await expect(code).toContainText('<SidebarRoot defaultOpen={false}>')
  await expect(code).toContainText('current={false}>Home</SidebarLink>')
  expect(errors).toEqual([])
})

test('Tabs: the playground drives the variant and size on the root and keepMounted on the panels', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto('/en/docs/components/tabs')
  const tabs = card(page, 'tabs')
  // The stage is the frame's: a line list and an enclosed one, with no panel. The playground takes its place on the first change.
  await expect(tabs.getByRole('tablist', { name: 'Line' }).first()).toBeVisible()
  await expect(tabs.getByRole('tablist', { name: 'Enclosed' }).first()).toBeVisible()
  const root = tabs.locator('[data-variant]', { has: page.getByRole('tablist', { name: 'Project' }) }).first()
  await tabs.getByRole('combobox', { name: 'variant' }).click()
  await page.getByRole('option', { name: 'enclosed', exact: true }).click()
  await expect(root).toHaveAttribute('data-variant', 'enclosed')
  await tabs.getByRole('combobox', { name: 'size' }).click()
  await page.getByRole('option', { name: 'lg', exact: true }).click()
  await expect(root).toHaveAttribute('data-size', 'lg')
  await expect(root.getByRole('tabpanel', { includeHidden: true })).toHaveCount(3)
  await tabs.getByRole('checkbox', { name: 'keepMounted' }).click()
  await expect(root.getByRole('tabpanel', { includeHidden: true })).toHaveCount(1)
  const code = tabs.locator('pre').first()
  await expect(code).toContainText('<TabsRoot variant="enclosed" size="lg" defaultValue="overview">')
  await expect(code).toContainText('<TabsPanel value="overview" keepMounted={false}>')
  expect(errors).toEqual([])
})

test('Accordion: the playground drives hiddenUntilFound on the root and the code', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto('/en/docs/components/accordion')
  const accordion = card(page, 'accordion')
  await accordion.getByRole('checkbox', { name: 'hiddenUntilFound' }).click()
  await expect(accordion.locator('pre').first()).toContainText("<AccordionRoot defaultValue={['server']} hiddenUntilFound={false} className=\"max-w-100\">")
  const trigger = accordion.getByRole('button', { name: 'Does it work in Arabic?' })
  await trigger.click()
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  expect(errors).toEqual([])
})

test('Pagination: the playground drives the size and the code', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto('/en/docs/components/pagination')
  const pagination = card(page, 'pagination')
  const nav = pagination.locator('nav[data-size]').first()
  // The stage opens at sm, as the frame draws it, and Try it starts there too.
  await expect(nav).toHaveAttribute('data-size', 'sm')
  await expect(pagination.getByRole('combobox', { name: 'size' })).toHaveText('sm')
  await pagination.getByRole('combobox', { name: 'size' }).click()
  await page.getByRole('option', { name: 'lg', exact: true }).click()
  await expect(nav).toHaveAttribute('data-size', 'lg')
  await expect(pagination.locator('pre').first()).toContainText('size="lg"')
  expect(errors).toEqual([])
})

test('a live example hydrates: a tab in the Tabs examples answers a click', async ({ page }) => {
  await page.goto('/en/docs/components/tabs')
  // Each example has its own Preview and Code tabs: the demo's list is the one without them.
  const tablist = examples(page).getByRole('tablist').filter({ hasNot: page.getByRole('tab', { name: 'Code' }) }).first()
  const second = tablist.getByRole('tab').nth(1)
  await second.click()
  await expect(second).toHaveAttribute('aria-selected', 'true')
})

test('a live example hydrates: an item in the Accordion examples opens', async ({ page }) => {
  await page.goto('/ar/docs/components/accordion')
  const trigger = examples(page).locator(':is(h2, h3, h4, h5, h6) > button[aria-expanded]').first()
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  await trigger.click()
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
})
