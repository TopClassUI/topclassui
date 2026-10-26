// pnpm check:static: run after next build. Fails on any route Next would render on request (docs-site rule 4, S13 step 4),
// on a live page, a component page, a page's Open Graph image, /llms.txt, /llms-full.txt, an icon, a search file or a sitemap date that was not written,
// and on a same-origin href in the built HTML that is no route, redirect or file of the site.
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join, relative, resolve, sep } from 'node:path'

import { LIVE_PAGES, LOCALES, hrefOf } from '../content/pages.js'
import { pagedComponents } from '../lib/components.js'
import { ogImagePathOf } from '../lib/metadata.js'
import { SITE_URL } from '../lib/site.js'
import { brokenLinks } from './lib/internal-links.js'
import type { ComponentsFile } from './lib/shape.js'
import { dynamicRoutes, missingRoutes, undatedUrls } from './lib/static-routes.js'

const APP = resolve(import.meta.dirname, '..')
const NEXT = join(APP, '.next')
const read = (file: string) => JSON.parse(readFileSync(join(NEXT, file), 'utf8')) as never
const manifests = { appRoutes: read('app-path-routes-manifest.json'), prerender: read('prerender-manifest.json') }
const file = JSON.parse(readFileSync(join(APP, '.generated', 'components.json'), 'utf8')) as ComponentsFile

const slugs = file.components.filter((entry) => entry.page && entry.content !== null).map((entry) => entry.slug)
const components = LOCALES.flatMap((locale) => [`/${locale}/docs/components`, ...slugs.map((slug) => `/${locale}/docs/components/${slug}`)])
const required = [
  ...LIVE_PAGES.flatMap((page) => LOCALES.map((locale) => hrefOf(page, locale))),
  ...components,
  '/sitemap.xml', '/robots.txt', '/manifest.webmanifest', '/llms.txt', '/llms-full.txt', '/icon-192.png', '/icon-512.png',
]
const routes = Object.keys((manifests.prerender as { routes: Record<string, unknown> }).routes)
// The exact path each page's og:image names (lib/metadata.ts), so a card the metadata points at but the build never drew fails here.
const images = LOCALES.flatMap((locale) => [...LIVE_PAGES, ...pagedComponents()].map((subject) => ogImagePathOf(subject, locale)))
const withoutImage = images.filter((image) => !routes.includes(image))
const sitemapXml = readFileSync(join(NEXT, 'server', 'app', 'sitemap.xml.body'), 'utf8')
const undated = undatedUrls(sitemapXml, LIVE_PAGES.flatMap((page) => LOCALES.map((locale) => `${SITE_URL}${hrefOf(page, locale)}`)))
// The walk over every prerendered page: a demo's example link to /shop is a 404 on topclassui.com, so it is "#" or a fragment instead.
const filesUnder = (dir: string): string[] => existsSync(dir) ? readdirSync(dir, { recursive: true, withFileTypes: true }).filter((entry) => entry.isFile()).map((entry) => `/${relative(dir, join(entry.parentPath, entry.name)).split(sep).join('/')}`) : []
const served = new Set([...routes, ...filesUnder(join(APP, 'public')), ...filesUnder(join(NEXT, 'static')).map((path) => `/_next/static${path}`)])
const redirects = (read('routes-manifest.json') as { redirects: { regex: string }[] }).redirects.map((redirect) => new RegExp(redirect.regex))
const htmlOf = (route: string) => join(NEXT, 'server', 'app', `${route === '/' ? '/index' : route}.html`)
const pages = routes.filter((route) => existsSync(htmlOf(route))).map((route) => ({ path: route, html: readFileSync(htmlOf(route), 'utf8') }))
const broken = brokenLinks(pages, SITE_URL, (path) => served.has(path) || redirects.some((redirect) => redirect.test(path)))
const searchFiles = LOCALES.map((locale) => `public/search/${locale}.json`).filter((path) => !existsSync(join(APP, path)))

const dynamic = dynamicRoutes(manifests)
const missing = missingRoutes(manifests, [...new Set(required)])
for (const route of dynamic) console.error(`error ${route} is dynamic: it would render on request`)
for (const route of missing) console.error(`error ${route} was not prerendered`)
for (const image of withoutImage) console.error(`error ${image} was not prerendered, and a page's og:image names it`)
for (const url of undated) console.error(`error ${url} has no lastmod in the sitemap`)
for (const path of searchFiles) console.error(`error ${path} was not written`)
for (const link of broken) console.error(`error ${link.href} on ${link.page} is not a route, a redirect or a file of the site`)
if (broken.length > 0) console.error(`${String(broken.length)} same-origin links resolve to nothing`)
if (dynamic.length + missing.length + withoutImage.length + undated.length + searchFiles.length + broken.length > 0) process.exit(1)
console.log(`check:static: ${String(Object.keys(manifests.appRoutes).length)} routes, all static or SSG; ${String(new Set(required).size)} required paths, ${String(images.length)} Open Graph images, ${String(LOCALES.length)} search files and ${String(LIVE_PAGES.length * LOCALES.length)} live pages dated in the sitemap; every same-origin href of ${String(pages.length)} pages resolves`)
