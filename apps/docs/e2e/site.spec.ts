import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

import { TARGETS } from '../../../packages/topclassui/scripts/lib/targets.js'

const MODES = ['light', 'dark', 'ocean'] as const
const GUIDES = ['installation', 'css', 'provider', 'first-component'] as const
const PAGES = ['/en', '/ar', ...GUIDES.flatMap((slug) => [`/en/docs/${slug}`, `/ar/docs/${slug}`])] as const

async function openIn(page: Page, path: string, mode: (typeof MODES)[number]) {
  await page.addInitScript((value) => { localStorage.setItem('tc-theme', value) }, mode)
  await page.goto(path)
  await expect(page.locator('html')).toHaveAttribute('data-theme', mode)
}

for (const path of PAGES) {
  for (const mode of MODES) {
    test(`${path} in ${mode}: axe finds no WCAG 2.2 AA violation`, async ({ page }) => {
      await openIn(page, path, mode)
      const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']).analyze()
      expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([])
    })
  }

  test(`${path}: one h1, landmarks named, a skip link to main`, async ({ page }) => {
    await page.goto(path)
    await expect(page.locator('h1')).toHaveCount(1)
    await expect(page.locator('header')).toHaveCount(1)
    await expect(page.locator('main#main')).toHaveCount(1)
    await expect(page.locator('footer')).toHaveCount(1)
    await page.keyboard.press('Tab')
    const skip = page.locator(':focus')
    await expect(skip).toHaveAttribute('href', '#main')
    const size = await skip.boundingBox()
    expect(Math.min(size?.width ?? 0, size?.height ?? 0)).toBeGreaterThanOrEqual(24)
  })

  test(`${path}: every visible interactive box clears 24 CSS px`, async ({ page }) => {
    await page.goto(path)
    for (const box of await page.locator(TARGETS).all()) {
      const size = await box.boundingBox()
      // The skip link is visually hidden (1 px) until it takes the focus; it is measured focused below.
      if (!(await box.isVisible()) || (size?.width ?? 0) <= 1) continue
      const label = (await box.getAttribute('aria-label')) ?? (await box.textContent())?.trim() ?? ''
      expect(size?.width ?? 0, `${label} width`).toBeGreaterThanOrEqual(24)
      expect(size?.height ?? 0, `${label} height`).toBeGreaterThanOrEqual(24)
    }
  })

  test(`${path}: under a coarse pointer every visible target clears 44 CSS px`, async ({ browser }) => {
    const context = await browser.newContext({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } })
    const page = await context.newPage()
    await page.goto(path)
    for (const box of await page.locator(TARGETS).all()) {
      const size = await box.boundingBox()
      if (!(await box.isVisible()) || (size?.width ?? 0) <= 1) continue
      // A link inside a sentence is exempt from SC 2.5.8; a pre is a scroll region, not a target.
      if (await box.evaluate((el) => el.closest('p, pre') !== null)) continue
      const label = (await box.getAttribute('aria-label')) ?? (await box.textContent())?.trim() ?? ''
      expect(Math.min(size?.width ?? 0, size?.height ?? 0), label).toBeGreaterThanOrEqual(44)
    }
    await context.close()
  })

  test(`${path}: no horizontal scroll at 390 px`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(path)
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(overflow).toBeLessThanOrEqual(0)
  })

  test(`${path}: Tab paints a focus ring on the first twenty stops`, async ({ page }) => {
    await page.goto(path)
    for (let stop = 0; stop < 20; stop++) {
      await page.keyboard.press('Tab')
      const ring = await page.evaluate(() => {
        const el = document.activeElement
        if (el === null || el === document.body) return null
        const style = getComputedStyle(el)
        return { name: el.outerHTML.slice(0, 80), style: style.outlineStyle, width: Number.parseFloat(style.outlineWidth) }
      })
      if (ring === null) break
      expect(ring.style, ring.name).not.toBe('none')
      expect(ring.width, ring.name).toBeGreaterThan(0)
    }
  })

  test(`${path}: canonical and hreflang are present and reciprocal; the JSON-LD parses`, async ({ page, request }) => {
    await page.goto(path)
    const own = await page.locator('link[rel="alternate"][hreflang]').evaluateAll((all): Record<string, string | null> =>
      Object.fromEntries(all.map((el) => [el.getAttribute('hreflang') ?? '', el.getAttribute('href')])))
    expect(Object.keys(own).sort()).toEqual(['ar', 'en', 'x-default'])
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href')
    expect(canonical).toBe(`https://topclassui.com${path}`)
    const other = path.startsWith('/en') ? own['ar'] : own['en']
    const response = await request.get(new URL(other ?? '', 'https://topclassui.com').pathname)
    expect(response.status()).toBe(200)
    const html = await response.text()
    expect(html).toContain(`hrefLang="${path.slice(1, 3)}" href="https://topclassui.com${path}"`)
    for (const script of await page.locator('script[type="application/ld+json"]').allTextContents()) {
      expect(() => JSON.parse(script) as unknown).not.toThrow()
    }
  })
}

// Written out: the following live page's title in each language, none after the last.
const NEXT = {
  installation: { en: 'CSS entry', ar: 'مدخل CSS', href: 'css' },
  css: { en: 'Provider', ar: 'المزوّد', href: 'provider' },
  provider: { en: 'Your first component', ar: 'مكوّنك الأول', href: 'first-component' },
  'first-component': null,
} as const

// Written out: how many `##` sections each page has, so a heading lost from the MDX fails here.
const SECTIONS = { installation: 5, css: 7, provider: 6, 'first-component': 6 } as const

for (const slug of GUIDES) {
  for (const locale of ['en', 'ar'] as const) {
    const path = `/${locale}/docs/${slug}`

    test(`${path}: the Next card goes to the following page, or is absent after the last`, async ({ page }) => {
      await page.goto(path)
      const next = NEXT[slug]
      const card = page.locator('main article > a[href]').last()
      if (next === null) {
        await expect(page.locator(`main a[href^="/${locale}/docs/"]`).filter({ hasText: locale === 'en' ? 'Next' : 'التالي' })).toHaveCount(0)
        return
      }
      await expect(card).toHaveAttribute('href', `/${locale}/docs/${next.href}`)
      await expect(card).toContainText(next[locale])
      await card.click()
      await expect(page).toHaveURL(new RegExp(`/${locale}/docs/${next.href}$`))
    })

    test(`${path}: On this page lists every section, and each entry lands on its heading`, async ({ page }) => {
      await page.goto(path)
      const toc = page.getByRole('navigation', { name: locale === 'en' ? 'On this page' : 'في هذه الصفحة' })
      const links = toc.getByRole('link')
      await expect(links).toHaveCount(SECTIONS[slug])
      await expect(page.locator('main h2')).toHaveCount(SECTIONS[slug])
      for (const link of await links.all()) {
        const href = (await link.getAttribute('href')) ?? ''
        const heading = page.locator(`main h2[id="${decodeURIComponent(href.slice(1))}"]`)
        await expect(heading, href).toHaveCount(1)
        await expect(heading).toContainText((await link.textContent()) ?? '')
      }
      await links.last().click()
      await expect(page.locator(`main h2[id="${decodeURIComponent(((await links.last().getAttribute('href')) ?? '').slice(1))}"]`)).toBeInViewport()
    })
  }
}

test('the language switch keeps the page', async ({ page }) => {
  await page.goto('/en/docs/provider')
  await page.getByRole('link', { name: 'العربية' }).click()
  await expect(page).toHaveURL(/\/ar\/docs\/provider$/)
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
  await expect(page.getByRole('link', { name: 'العربية' })).toHaveAttribute('aria-current', 'page')
})

test('the mode switch persists across a reload, set before first paint', async ({ page }) => {
  await page.goto('/en')
  await page.getByRole('radio', { name: 'Ocean' }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'ocean')
  const response = await page.reload()
  expect(await response?.text()).toContain('data-theme="dark"')
  // The server sends dark; the inline script has already switched it when the first paint happens.
  const firstPaint = await page.evaluate(() => document.documentElement.dataset['theme'])
  expect(firstPaint).toBe('ocean')
  await expect(page.getByRole('radio', { name: 'Ocean' })).toHaveAttribute('aria-checked', 'true')
})

test('an anchor clears the sticky navbar', async ({ page }) => {
  await page.goto('/en/docs/provider#in-a-single-page-app')
  await page.waitForFunction(() => getComputedStyle(document.documentElement).getPropertyValue('--tc-sticky-top') !== '0px')
  await page.evaluate(() => { document.getElementById('in-a-single-page-app')?.scrollIntoView() })
  const bar = await page.locator('header').first().boundingBox()
  const heading = await page.locator('#in-a-single-page-app').boundingBox()
  expect(heading?.y ?? 0).toBeGreaterThanOrEqual((bar?.y ?? 0) + (bar?.height ?? 0) - 1)
})

test('the last link before the footer is fully visible when focused', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.setViewportSize({ width: 1280, height: 600 })
  await page.goto('/en/docs/first-component')
  const links = page.locator('main a[href]')
  const last = links.last()
  await last.focus()
  const box = await last.boundingBox()
  const bar = await page.locator('header').first().boundingBox()
  expect(box?.y ?? 0).toBeGreaterThanOrEqual((bar?.y ?? 0) + (bar?.height ?? 0) - 1)
  expect((box?.y ?? 0) + (box?.height ?? 0)).toBeLessThanOrEqual(600)
})

test('under 64rem the menu opens the sidebar groups in a drawer, and a link closes it', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/en')
  await page.getByRole('button', { name: 'Menu' }).click()
  const drawer = page.getByRole('dialog', { name: 'Documentation' })
  await expect(drawer).toBeVisible()
  await drawer.getByRole('link', { name: 'Install the package' }).click()
  await expect(page).toHaveURL(/\/en\/docs\/installation$/)
  await expect(drawer).toBeHidden()
})

test('the sidebar marks the page being read', async ({ page }) => {
  for (const [slug, title] of [['installation', 'Install the package'], ['css', 'CSS entry'], ['provider', 'Provider'], ['first-component', 'Your first component']] as const) {
    await page.goto(`/en/docs/${slug}`)
    await expect(page.getByRole('navigation', { name: 'Site' }).getByRole('link', { name: title, exact: true })).toHaveAttribute('aria-current', 'page')
  }
})

for (const path of ['/fr/x', '/random', '/en/docs/nope']) {
  test(`${path} answers 404 with the not-found page, out of the index`, async ({ page }) => {
    const response = await page.goto(path)
    expect(response?.status()).toBe(404)
    await expect(page.locator('h1')).toHaveText('This page does not exist')
    await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute('content', /noindex/)
  })
}

for (const [from, to] of [['/', '/en'], ['/en/docs', '/en/docs/installation'], ['/ar/docs', '/ar/docs/installation']] as const) {
  test(`${from} redirects to ${to}`, async ({ request }) => {
    const response = await request.get(from, { maxRedirects: 0 })
    expect(response.status()).toBe(308)
    expect(response.headers()['location']).toBe(to)
  })
}

test('the not-found page passes axe', async ({ page }) => {
  await page.goto('/random')
  const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()
  expect(violations.map((v) => v.id)).toEqual([])
})
