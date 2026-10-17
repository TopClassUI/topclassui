// pnpm check:static: run after next build. Fails on any route Next would render on request (docs-site rule 4, S13 step 4),
// and on a live page, a component page, an Open Graph image of the catalog or a component, /llms.txt or a search file that was not written.
import { existsSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

import { LIVE_PAGES, LOCALES, hrefOf } from '../content/pages.js'
import type { ComponentsFile } from './lib/shape.js'
import { dynamicRoutes, missingRoutes } from './lib/static-routes.js'

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
  '/sitemap.xml', '/robots.txt', '/manifest.webmanifest', '/llms.txt',
]
const routes = Object.keys((manifests.prerender as { routes: Record<string, unknown> }).routes)
const withoutImage = components.filter((page) => !routes.some((route) => route.startsWith(`${page}/opengraph-image`) && route.split('/').length === page.split('/').length + 1))
const searchFiles = LOCALES.map((locale) => `public/search/${locale}.json`).filter((path) => !existsSync(join(APP, path)))

const dynamic = dynamicRoutes(manifests)
const missing = missingRoutes(manifests, [...new Set(required)])
for (const route of dynamic) console.error(`error ${route} is dynamic: it would render on request`)
for (const route of missing) console.error(`error ${route} was not prerendered`)
for (const page of withoutImage) console.error(`error ${page} has no prerendered Open Graph image`)
for (const path of searchFiles) console.error(`error ${path} was not written`)
if (dynamic.length + missing.length + withoutImage.length + searchFiles.length > 0) process.exit(1)
console.log(`check:static: ${String(Object.keys(manifests.appRoutes).length)} routes, all static or SSG; ${String(new Set(required).size)} required paths, ${String(components.length)} Open Graph images and ${String(LOCALES.length)} search files prerendered`)
