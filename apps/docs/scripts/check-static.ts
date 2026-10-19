// pnpm check:static: run after next build. Fails on any route Next would render on request (docs-site rule 4, S13 step 4),
// and on a live page, a component page, a page's Open Graph image, /llms.txt, /llms-full.txt, an icon, a search file or a sitemap date that was not written.
import { existsSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

import { LIVE_PAGES, LOCALES, hrefOf } from '../content/pages.js'
import { pagedComponents } from '../lib/components.js'
import { ogImagePathOf } from '../lib/metadata.js'
import { SITE_URL } from '../lib/site.js'
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
const searchFiles = LOCALES.map((locale) => `public/search/${locale}.json`).filter((path) => !existsSync(join(APP, path)))

const dynamic = dynamicRoutes(manifests)
const missing = missingRoutes(manifests, [...new Set(required)])
for (const route of dynamic) console.error(`error ${route} is dynamic: it would render on request`)
for (const route of missing) console.error(`error ${route} was not prerendered`)
for (const image of withoutImage) console.error(`error ${image} was not prerendered, and a page's og:image names it`)
for (const url of undated) console.error(`error ${url} has no lastmod in the sitemap`)
for (const path of searchFiles) console.error(`error ${path} was not written`)
if (dynamic.length + missing.length + withoutImage.length + undated.length + searchFiles.length > 0) process.exit(1)
console.log(`check:static: ${String(Object.keys(manifests.appRoutes).length)} routes, all static or SSG; ${String(new Set(required).size)} required paths, ${String(images.length)} Open Graph images, ${String(LOCALES.length)} search files and ${String(LIVE_PAGES.length * LOCALES.length)} live pages dated in the sitemap`)
