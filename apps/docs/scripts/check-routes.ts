// pnpm check:routes: run after next build. The catalog, every component page, each page's Open Graph image in both locales,
// llms.txt and the search files are prerendered, and no route renders on request (S13 step 4). The shell's check:static takes it in.
import { existsSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

import type { ComponentsFile } from './lib/shape.js'
import { dynamicRoutes, missingRoutes } from './lib/static-routes.js'
import { LOCALES } from './lib/toc.js'

const APP = resolve(import.meta.dirname, '..')
const NEXT = join(APP, '.next')
const read = (file: string) => JSON.parse(readFileSync(join(NEXT, file), 'utf8')) as never
const manifests = { appRoutes: read('app-path-routes-manifest.json'), prerender: read('prerender-manifest.json') }
const file = JSON.parse(readFileSync(join(APP, '.generated', 'components.json'), 'utf8')) as ComponentsFile

const slugs = file.components.filter((entry) => entry.page && entry.content !== null).map((entry) => entry.slug)
const pages = LOCALES.flatMap((locale) => [`/${locale}/docs/components`, ...slugs.map((slug) => `/${locale}/docs/components/${slug}`)])
const routes = Object.keys((manifests.prerender as { routes: Record<string, unknown> }).routes)
const withoutImage = pages.filter((page) => !routes.some((route) => route.startsWith(`${page}/opengraph-image`) && route.split('/').length === page.split('/').length + 1))
const searchFiles = LOCALES.map((locale) => `public/search/${locale}.json`).filter((path) => !existsSync(join(APP, path)))

const dynamic = dynamicRoutes(manifests)
const missing = missingRoutes(manifests, [...pages, '/llms.txt'])
for (const route of dynamic) console.error(`error ${route} is dynamic: it would render on request`)
for (const route of missing) console.error(`error ${route} was not prerendered`)
for (const page of withoutImage) console.error(`error ${page} has no prerendered Open Graph image`)
for (const path of searchFiles) console.error(`error ${path} was not written`)
if (dynamic.length + missing.length + withoutImage.length + searchFiles.length > 0) process.exit(1)
console.log(`check:routes: ${String(Object.keys(manifests.appRoutes).length)} routes, all static or SSG; ${String(pages.length)} pages, ${String(pages.length)} Open Graph images, /llms.txt and ${String(LOCALES.length)} search files prerendered`)
