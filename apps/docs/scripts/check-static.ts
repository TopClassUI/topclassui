// pnpm check:static: run after next build. Fails on any route Next would render on request (docs-site rule 4, S13 step 4).
import { readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

import { LIVE_PAGES, LOCALES, hrefOf } from '../content/pages.js'
import { dynamicRoutes, missingRoutes } from './lib/static-routes.js'

const NEXT = join(resolve(import.meta.dirname, '..'), '.next')
const read = (file: string) => JSON.parse(readFileSync(join(NEXT, file), 'utf8')) as never
const manifests = { appRoutes: read('app-path-routes-manifest.json'), prerender: read('prerender-manifest.json') }

const required = [
  ...LIVE_PAGES.flatMap((page) => LOCALES.map((locale) => hrefOf(page, locale))),
  '/sitemap.xml', '/robots.txt', '/manifest.webmanifest',
]
const dynamic = dynamicRoutes(manifests)
const missing = missingRoutes(manifests, required)
for (const route of dynamic) console.error(`error ${route} is dynamic: it would render on request`)
for (const route of missing) console.error(`error ${route} was not prerendered`)
if (dynamic.length + missing.length > 0) process.exit(1)
console.log(`check:static: ${String(Object.keys(manifests.appRoutes).length)} routes, all static or SSG; ${String(required.length)} required paths prerendered`)
