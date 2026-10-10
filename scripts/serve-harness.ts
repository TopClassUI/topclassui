// pnpm harness:serve - the live harness: each demo rendered here, then hydrated in the browser.
import { createHash } from 'node:crypto'
import { realpathSync } from 'node:fs'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

import type { ComponentType } from 'react'
// Node's own copy: loaded through Vite, react-dom/server fails with 'require is not defined'.
import { renderToString } from 'react-dom/server'
// R-0-1: Vitest 5.0.3 re-exports Vite's createServer here, and Vite itself cannot be imported by name under pnpm.
import { createViteServer } from 'vitest/node'

import { DIRECTIONS, LANG, MODES, compileCss, findDemos } from './lib/harness.js'
import {
  LIVE_HOST, PORT_ENV, SHELL_CANDIDATES, liveOrigin, livePageHtml, livePort, parseRoute, routeFor,
} from './lib/live-harness.js'
import { liveTree } from './lib/live-tree.js'
import { clientPackages, sourceCandidates } from './lib/source-candidates.js'

// The real path, so the page and the test that opens it spell the checkout the same way.
const ROOT = realpathSync.native(process.cwd())
const PORT = livePort()

const demos = new Map(findDemos(ROOT).map((demo) => [demo.name, demo.file]))
if (demos.size === 0) throw new Error('harness: no demos found, so there is nothing to serve')

// From the source, not the markup: a closed popup renders nothing, and its classes must be there when it opens.
const css = await compileCss(ROOT, [...sourceCandidates(ROOT), ...SHELL_CANDIDATES])

const loaded = new Map<string, Promise<ComponentType>>()

function loadDemo(file: string): Promise<ComponentType> {
  // A file URL, or Node rejects a Windows path: 'Received protocol c:'.
  const found = loaded.get(file) ?? import(pathToFileURL(file).href).then((module: { default: ComponentType }) => module.default)
  loaded.set(file, found)
  return found
}

interface Reply { status: number; html: string }

const plain = (status: number, message: string): Reply =>
  ({ status, html: `<!doctype html><meta charset="utf-8"><title>harness</title><pre>harness: ${message.replace(/</g, '&lt;')}</pre>` })

function index(): Reply {
  const links = [...demos.keys()].map((demo) => {
    const pages = MODES.flatMap((mode) => DIRECTIONS.map((direction) =>
      `<a href="${routeFor(demo, mode, direction)}">${mode} ${direction}</a>`))
    return `<li>${demo}: ${pages.join(' ')}</li>`
  })
  return { status: 200, html: `<!doctype html><meta charset="utf-8"><title>harness</title><ul>${links.join('\n')}</ul>` }
}

async function reply(url: string): Promise<Reply | null> {
  if (url === '/') return index()
  const route = parseRoute(url)
  if (route === null) return null
  if ('error' in route) return plain(404, route.error)
  const file = demos.get(route.demo)
  if (file === undefined) return plain(404, `there is no demo named "${route.demo}"; ${liveOrigin(PORT)}/ lists them`)

  const body = renderToString(liveTree(await loadDemo(file), route.direction, LANG[route.direction]))
  return { status: 200, html: livePageHtml(route, body, css, ROOT) }
}

function handle(request: IncomingMessage, response: ServerResponse, next: (error?: unknown) => void): void {
  reply(request.url ?? '/').then((found) => {
    if (found === null) { next(); return }
    response.writeHead(found.status, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' })
    response.end(found.html)
  }, (error: unknown) => {
    const { html } = plain(500, error instanceof Error ? (error.stack ?? error.message) : String(error))
    response.writeHead(500, { 'content-type': 'text/html; charset=utf-8' })
    response.end(html)
  })
}

const entries = [join(ROOT, 'scripts', 'lib', 'live-client.tsx'), ...demos.values()]

const server = await createViteServer({
  configFile: false,
  root: ROOT,
  mode: 'development',
  appType: 'custom',
  logLevel: 'warn',
  clearScreen: false,
  // node_modules is one folder shared by every worktree, so each checkout keeps its own bundle of packages.
  cacheDir: join(ROOT, 'node_modules', '.vite', `harness-${createHash('sha256').update(ROOT).digest('hex').slice(0, 8)}`),
  // No socket, no watcher: a page is a snapshot of the source at start, the same on both sides of hydration.
  server: { host: LIVE_HOST, port: PORT, strictPort: true, ws: false, hmr: false, watch: null },
  // Named up front and never discovered: a package found mid-run would rebuild the bundle under an open page.
  optimizeDeps: { noDiscovery: true, include: clientPackages(ROOT, entries) },
  plugins: [{ name: 'topclass-live-harness', configureServer(vite) { vite.middlewares.use(handle) } }],
})

try {
  await server.listen()
} catch (error) {
  console.error(`harness: could not listen on ${liveOrigin(PORT)}: ${error instanceof Error ? error.message : String(error)}`)
  console.error(`harness: another live harness, perhaps of another worktree, may hold the port. Stop it, or set ${PORT_ENV} to a free port for this server and for the tests.`)
  await server.close()
  process.exit(1)
}

console.log(`harness: ${demos.size} demos live at ${liveOrigin(PORT)}/ from ${ROOT}`)

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, () => { void server.close().finally(() => process.exit(0)) })
}
