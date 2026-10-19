import { readFileSync } from 'node:fs'

import { expect, test } from '@playwright/test'

interface Entry { slug: string; page: boolean; content: unknown }
const { components } = JSON.parse(readFileSync(new URL('../.generated/components.json', import.meta.url), 'utf8')) as { components: Entry[] }
const SLUGS = components.filter((entry) => entry.page && entry.content !== null).map((entry) => entry.slug)
const LOCALES = ['en', 'ar'] as const
// The registry's live pages other than Home, the catalog among them.
const GUIDE_PATHS = ['/docs/installation', '/docs/cli', '/docs/css', '/docs/provider', '/docs/first-component', '/docs/colors', '/docs/icons', '/docs/theming', '/docs/rtl', '/docs/server-first', '/docs/accessibility', '/docs/components', '/changelog']

test('49 component pages and the catalog, in both locales: 100 pages', () => {
  expect(SLUGS).toHaveLength(49)
})

test('every page of both locales names its own Open Graph image, and the image is a 1200x630 PNG', async ({ page, request }) => {
  test.setTimeout(300_000)
  const missing: string[] = []
  for (const locale of LOCALES) {
    for (const path of [`/${locale}/docs/components`, ...SLUGS.map((slug) => `/${locale}/docs/components/${slug}`)]) {
      await page.goto(path)
      const image = await page.locator('meta[property="og:image"]').getAttribute('content')
      const width = await page.locator('meta[property="og:image:width"]').getAttribute('content')
      const height = await page.locator('meta[property="og:image:height"]').getAttribute('content')
      const url = image === null ? null : new URL(image)
      if (url === null || !url.pathname.startsWith(`${path}/opengraph-image`) || width !== '1200' || height !== '630') {
        missing.push(`${path}: ${String(image)}`)
        continue
      }
      const response = await request.get(url.pathname)
      if (response.status() !== 200 || response.headers()['content-type'] !== 'image/png') missing.push(`${path}: ${String(response.status())}`)
    }
  }
  expect(missing).toEqual([])
})

test('llms.txt is plain text and links every live page in both locales', async ({ request }) => {
  const response = await request.get('/llms.txt')
  expect(response.status()).toBe(200)
  expect(response.headers()['content-type']).toContain('text/plain')
  const text = await response.text()
  expect(text.startsWith('# TopClass UI\n')).toBe(true)
  const links = [...text.matchAll(/^- \[[^\]]+\]\(https:\/\/topclassui\.com([^)]+)\): .{50,}$/gm)].map((match) => match[1])
  expect(links).toHaveLength(124)
  for (const locale of LOCALES) {
    for (const path of GUIDE_PATHS) expect(links).toContain(`/${locale}${path}`)
    for (const slug of SLUGS) expect(links).toContain(`/${locale}/docs/components/${slug}`)
  }
})

test('the search files are served, one per locale, each listing every component page', async ({ request }) => {
  for (const locale of LOCALES) {
    const response = await request.get(`/search/${locale}.json`)
    expect(response.status()).toBe(200)
    const entries = (await response.json()) as { group: string; href: string }[]
    expect(entries.filter((entry) => entry.group === 'components')).toHaveLength(49)
  }
})
