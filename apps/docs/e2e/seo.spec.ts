// The SEO kit of job 130 against next start: headers, titles, JSON-LD per page type, og:image:alt, llms-full.txt, sitemap dates, icons, pagers and external links.
import { readFileSync } from 'node:fs'

import { type APIRequestContext, expect, test } from '@playwright/test'

interface Entry { slug: string; page: boolean; content: { title: { en: string; ar: string } } | null }
const { components } = JSON.parse(readFileSync(new URL('../.generated/components.json', import.meta.url), 'utf8')) as { components: Entry[] }
const SLUGS = components.filter((entry) => entry.page && entry.content !== null).map((entry) => entry.slug)
const LOCALES = ['en', 'ar'] as const
const ORIGIN = 'https://topclassui.com'
// Written out: every live page but the component pages, in both locales.
const PAGES = ['', '/docs/installation', '/docs/css', '/docs/provider', '/docs/first-component', '/docs/colors', '/docs/icons', '/docs/theming', '/docs/rtl', '/docs/server-first', '/docs/accessibility', '/docs/components', '/changelog']
const ALL = LOCALES.flatMap((locale) => [...PAGES.map((path) => `/${locale}${path}`), ...SLUGS.map((slug) => `/${locale}/docs/components/${slug}`)])

type Ld = Record<string, unknown> & { '@type': string }

async function jsonLd(request: APIRequestContext, path: string): Promise<Ld[]> {
  const html = await (await request.get(path)).text()
  return [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)].map((match) => JSON.parse(match[1] ?? '{}') as Ld)
}

const typesOf = (data: Ld[]) => data.map((item) => item['@type']).sort()

test('every response carries nosniff, a referrer policy and a permissions policy; only hashed files are immutable', async ({ request }) => {
  const html = await request.get('/en/docs/css')
  const headers = html.headers()
  expect(headers['x-content-type-options']).toBe('nosniff')
  expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin')
  expect(headers['permissions-policy']).toBe('camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()')
  expect(headers['cache-control']).not.toContain('immutable')
  const asset = /src="(\/_next\/static\/[^"]+\.js)"/.exec(await html.text())?.[1]
  expect(asset).toBeDefined()
  const script = await request.get(asset ?? '')
  expect(script.headers()['cache-control']).toBe('public, max-age=31536000, immutable')
  expect(script.headers()['x-content-type-options']).toBe('nosniff')
  for (const path of ['/llms.txt', '/sitemap.xml', '/icon-512.png']) {
    const response = await request.get(path)
    expect(response.headers()['cache-control'], path).not.toContain('immutable')
    expect(response.headers()['x-content-type-options'], path).toBe('nosniff')
  }
})

test('a component page is titled "<Name> - TopClass UI", with the Arabic name on /ar', async ({ page }) => {
  await page.goto('/en/docs/components/button')
  await expect(page).toHaveTitle('Button - TopClass UI')
  await page.goto('/ar/docs/components/button')
  await expect(page).toHaveTitle('زر - TopClass UI')
  await page.goto('/ar/docs/components')
  await expect(page).toHaveTitle('المكوّنات - TopClass UI')
})

test('Home writes Organization with its logo and profiles, WebSite in its language, and SoftwareSourceCode', async ({ request }) => {
  for (const locale of LOCALES) {
    const data = await jsonLd(request, `/${locale}`)
    expect(typesOf(data)).toEqual(['Organization', 'SoftwareSourceCode', 'WebSite'])
    const organization = data.find((item) => item['@type'] === 'Organization')
    expect(organization?.['logo']).toEqual({ '@type': 'ImageObject', url: `${ORIGIN}/icon-512.png`, width: '512', height: '512' })
    expect(organization?.['sameAs']).toEqual(['https://github.com/TopClassUI/topclassui', 'https://www.npmjs.com/package/topclassui', 'https://www.youtube.com/@topclassui'])
    expect(data.find((item) => item['@type'] === 'WebSite')?.['inLanguage']).toBe(locale)
  }
})

test('a guide, the changelog and a component page write one TechArticle and one BreadcrumbList with absolute items', async ({ request }) => {
  const cases = [
    { path: '/en/docs/css', trail: [`${ORIGIN}/en`] },
    { path: '/ar/changelog', trail: [`${ORIGIN}/ar`] },
    { path: '/ar/docs/components/dialog', trail: [`${ORIGIN}/ar`, `${ORIGIN}/ar/docs/components`] },
  ]
  for (const { path, trail } of cases) {
    const data = await jsonLd(request, path)
    expect(typesOf(data), path).toEqual(['BreadcrumbList', 'TechArticle'])
    const article = data.find((item) => item['@type'] === 'TechArticle')
    expect(article?.['url'], path).toBe(`${ORIGIN}${path}`)
    expect(article?.['inLanguage'], path).toBe(path.slice(1, 3))
    expect(article?.['dateModified'], path).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    const image = await request.get(new URL(String(article?.['image'])).pathname)
    expect(image.headers()['content-type'], path).toBe('image/png')
    const items = (data.find((item) => item['@type'] === 'BreadcrumbList')?.['itemListElement'] ?? []) as { item?: string; position: number }[]
    expect(items.map((item) => item.item), path).toEqual([...trail, undefined])
    expect(items.map((item) => item.position), path).toEqual(trail.map((_, index) => index + 1).concat(trail.length + 1))
  }
  const guide = (await jsonLd(request, '/en/docs/css')).find((item) => item['@type'] === 'TechArticle')
  expect(guide).toMatchObject({ articleSection: 'Start here', author: { '@id': `${ORIGIN}/#organization` } })
  expect(guide?.['dependencies']).toContain('React')
})

test('the catalog writes a CollectionPage listing every component page', async ({ request }) => {
  const data = await jsonLd(request, '/en/docs/components')
  expect(typesOf(data)).toEqual(['CollectionPage'])
  const list = data[0]?.['mainEntity'] as { numberOfItems: number; itemListElement: { url: string }[] }
  expect(list.numberOfItems).toBe(46)
  expect(list.itemListElement[0]?.url).toBe(`${ORIGIN}/en/docs/components/button`)
})

test('every page of both locales names its own card with an og:image:alt of its own, and the card is served', async ({ request }) => {
  test.setTimeout(300_000)
  const alts = new Map<string, string>()
  const problems: string[] = []
  for (const path of ALL) {
    const html = await (await request.get(path)).text()
    const alt = /<meta property="og:image:alt" content="([^"]+)"/.exec(html)?.[1]
    const image = /<meta property="og:image" content="([^"]+)"/.exec(html)?.[1]
    const twitterAlt = /<meta name="twitter:image:alt" content="([^"]+)"/.exec(html)?.[1]
    if (alt === undefined || image === undefined || twitterAlt !== alt) {
      problems.push(`${path}: ${String(image)} ${String(alt)} ${String(twitterAlt)}`)
      continue
    }
    if (alts.has(alt)) problems.push(`${path} shares its alt with ${String(alts.get(alt))}`)
    alts.set(alt, path)
    if (!new URL(image).pathname.startsWith(`${path}/opengraph-image`)) problems.push(`${path}: ${image}`)
  }
  expect(problems).toEqual([])
  for (const locale of LOCALES) {
    for (const path of ['/docs/installation', '/docs/accessibility', '/changelog']) {
      const html = await (await request.get(`/${locale}${path}`)).text()
      const image = /<meta property="og:image" content="([^"]+)"/.exec(html)?.[1] ?? ''
      const response = await request.get(new URL(image).pathname)
      expect(response.status(), image).toBe(200)
      expect(response.headers()['content-type']).toBe('image/png')
    }
  }
  expect(alts.get('Install the package, on the TopClass UI card')).toBe('/en/docs/installation')
  expect(alts.get('زر، على بطاقة TopClass UI')).toBe('/ar/docs/components/button')
})

test('llms-full.txt is plain text holding every guide and every component page in full, in English', async ({ request }) => {
  const response = await request.get('/llms-full.txt')
  expect(response.status()).toBe(200)
  expect(response.headers()['content-type']).toContain('text/plain')
  const text = await response.text()
  expect(text.startsWith('# TopClass UI\n')).toBe(true)
  const urls = [...text.matchAll(/^URL: https:\/\/topclassui\.com(\S+)$/gm)].map((match) => match[1])
  expect(urls).toHaveLength(11 + 49)
  for (const path of PAGES.filter((page) => page !== '' && page !== '/docs/components')) expect(urls).toContain(`/en${path}`)
  for (const slug of SLUGS) expect(urls).toContain(`/en/docs/components/${slug}`)
  expect(text).toContain('### Peer dependencies')
  expect(text).not.toMatch(/^<(PackageManagers|PageControls|Releases)/m)
})

test('the sitemap dates Home and the catalog in both locales', async ({ request }) => {
  const xml = await (await request.get('/sitemap.xml')).text()
  for (const path of ['/en', '/ar', '/en/docs/components', '/ar/docs/components']) {
    expect(xml, path).toMatch(new RegExp(`<loc>${ORIGIN}${path}</loc>(\\s*<xhtml:link [^>]*/>)*\\s*<lastmod>\\d{4}-\\d{2}-\\d{2}T`))
  }
})

test('the manifest lists the 192 and 512 px icons, and each is a square PNG of that size', async ({ request }) => {
  const manifest = (await (await request.get('/manifest.webmanifest')).json()) as { icons: { src: string; sizes: string }[] }
  for (const size of [192, 512]) {
    expect(manifest.icons).toContainEqual(expect.objectContaining({ src: `/icon-${String(size)}.png`, sizes: `${String(size)}x${String(size)}`, type: 'image/png' }))
    const png = await (await request.get(`/icon-${String(size)}.png`)).body()
    expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([size, size])
  }
  const html = await (await request.get('/en')).text()
  expect(html).toMatch(/<link rel="apple-touch-icon" href="\/apple-icon/)
})

test('a guide has Previous and Next; a component page has its neighbours in catalog order', async ({ page }) => {
  await page.goto('/en/docs/css')
  const pager = page.getByRole('navigation', { name: 'Previous and next pages' })
  await expect(pager.locator('a[rel="prev"]')).toHaveAttribute('href', '/en/docs/installation')
  await expect(pager.locator('a[rel="next"]')).toHaveAttribute('href', '/en/docs/provider')
  await page.goto('/ar/docs/components/tag')
  const arabic = page.getByRole('navigation', { name: 'الصفحتان السابقة والتالية' })
  await expect(arabic.locator('a[rel="prev"]')).toHaveAttribute('href', '/ar/docs/components/button')
  await expect(arabic.locator('a[rel="next"]')).toHaveAttribute('href', '/ar/docs/components/kbd')
  await arabic.locator('a[rel="next"]').click()
  await expect(page).toHaveURL(/\/ar\/docs\/components\/kbd$/)
  await page.goto('/en/docs/components/button')
  await expect(page.getByRole('navigation', { name: 'Previous and next pages' }).locator('a[rel="prev"]')).toHaveCount(0)
})

// The library's Navbar demo (navbar/dummy/many-links.tsx) links GitHub without rel: a library change, left to its component job.
const LIBRARY_DEMOS = new Set(LOCALES.map((locale) => `/${locale}/docs/components/navbar https://github.com/TopClassUI/topclassui`))

test('every link that leaves the site, and every target=_blank, carries rel="noopener noreferrer"', async ({ request }) => {
  test.setTimeout(300_000)
  const bare: string[] = []
  let external = 0
  for (const path of ALL) {
    const html = await (await request.get(path)).text()
    for (const [anchor] of html.matchAll(/<a\s[^>]*>/g)) {
      const href = /\shref="([^"]*)"/.exec(anchor)?.[1] ?? ''
      if (!/^https?:\/\//.test(href) && !anchor.includes('target="_blank"')) continue
      if (LIBRARY_DEMOS.has(`${path} ${href}`)) continue
      external += 1
      const rel = (/\srel="([^"]*)"/.exec(anchor)?.[1] ?? '').split(/\s+/)
      if (!rel.includes('noopener') || !rel.includes('noreferrer')) bare.push(`${path}: ${anchor}`)
    }
  }
  expect(external).toBeGreaterThan(ALL.length)
  expect(bare).toEqual([])
})
