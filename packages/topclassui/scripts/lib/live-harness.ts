// The live half of the harness: the page the static one writes, served and hydrated, so a
// browser test can open what `renderToStaticMarkup` leaves shut. Only the pure parts are here.
// Relative: Playwright loads this file too, and does not map a #shared .js import to its source.
import { TOAST_PLACEMENTS, type ToastPlacement } from '../../src/shared/contracts/toast.js'
import {
  DIRECTIONS, LANG, MODES, PAGE_CANDIDATES, pageHtml, pageName, type Direction, type Mode,
} from './harness.js'

/** Fixed, so a spec can name a URL; nothing else in the repository listens anywhere. */
export const LIVE_PORT = 4517
/** Two worktrees cannot share a port: the second one sets this for its server and its tests. */
export const PORT_ENV = 'TC_HARNESS_PORT'
/** The address, never `localhost`: Windows may resolve that to ::1 while the server listens on IPv4. */
export const LIVE_HOST = '127.0.0.1'

export function livePort(env: Record<string, string | undefined> = process.env): number {
  const raw = env[PORT_ENV]
  if (raw === undefined || raw === '') return LIVE_PORT
  const port = Number(raw)
  if (!Number.isInteger(port) || port < 1024 || port > 65535) {
    throw new Error(`harness: ${PORT_ENV}="${raw}" is not a port between 1024 and 65535`)
  }
  return port
}

export const liveOrigin = (port: number = livePort()) => `http://${LIVE_HOST}:${port}`

/** The four sides a demo can be pinned to. `start` and `end` follow the page's direction. */
export const EDGES = ['top', 'bottom', 'start', 'end'] as const
export type Edge = (typeof EDGES)[number]

/** `toast` is the placement the page's provider gives its toasts; left out, the provider's default applies. */
export interface RouteOptions { edge?: Edge | undefined; tall?: boolean | undefined; toast?: ToastPlacement | undefined }
export interface Route { demo: string; mode: Mode; direction: Direction; edge: Edge | null; tall: boolean; toast?: ToastPlacement | undefined }

/** The static page's own file name, plus the three parameters only a live page understands. */
export function routeFor(demo: string, mode: Mode, direction: Direction, options: RouteOptions = {}): string {
  const query = [
    options.edge ? `edge=${options.edge}` : '', options.tall ? 'tall=1' : '', options.toast ? `toast=${options.toast}` : '',
  ].filter(Boolean)
  return `/${pageName(demo, mode, direction)}${query.length > 0 ? `?${query.join('&')}` : ''}`
}

/** What a demo's own link or form writes into its page's URL (Pagination's ?page=, a GET form's fields): the page is the same, so it is ignored. */
export const DEMO_QUERY: readonly string[] = ['page', 'name', 'email', 'message', 'q']

const oneOf = <T extends string>(list: readonly T[], value: string | undefined): value is T =>
  (list as readonly string[]).includes(value ?? '')

/**
 * A page route, null for a URL that is no page at all (Vite's own modules), or the reason
 * a page URL is wrong. A misspelt parameter is refused, never ignored: a spec that asked
 * for `?egde=top` would otherwise pass against a demo nothing pinned.
 */
export function parseRoute(url: string): Route | { error: string } | null {
  const { pathname, searchParams } = new URL(url, 'http://harness')
  if (!pathname.endsWith('.html')) return null

  const parts = pathname.slice(1, -'.html'.length).split('--')
  const [folder, file, mode, direction] = parts
  if (parts.length !== 4 || !folder || !file) {
    return { error: `"${pathname}" is not <folder>--<demo>--<mode>--<direction>.html` }
  }
  if (!oneOf(MODES, mode)) return { error: `the mode "${mode ?? ''}" is not one of ${MODES.join(', ')}` }
  if (!oneOf(DIRECTIONS, direction)) {
    return { error: `the direction "${direction ?? ''}" is not one of ${DIRECTIONS.join(', ')}` }
  }

  // toast is taken too, for the toast spec's placements; the message keeps the words e2e/live.spec.ts reads verbatim.
  for (const key of searchParams.keys()) {
    if (DEMO_QUERY.includes(key)) continue
    if (key !== 'edge' && key !== 'tall' && key !== 'toast') return { error: `"${key}" is not a parameter; a page takes edge and tall` }
  }
  const edge = searchParams.get('edge')
  if (edge !== null && !oneOf(EDGES, edge)) return { error: `the edge "${edge}" is not one of ${EDGES.join(', ')}` }
  const tall = searchParams.get('tall')
  if (tall !== null && tall !== '1') return { error: `tall takes 1 and nothing else, not "${tall}"` }

  const toast = searchParams.get('toast')
  if (toast !== null && !oneOf(TOAST_PLACEMENTS, toast)) {
    return { error: `the toast placement "${toast}" is not one of ${TOAST_PLACEMENTS.join(', ')}` }
  }

  return { demo: `${folder}--${file}`, mode, direction, edge, tall: tall === '1', ...(toast === null ? {} : { toast }) }
}

/** The module a browser imports for a demo: its source file, which Vite compiles on request. */
export function demoModule(demo: string): string {
  const [folder = '', file = ''] = demo.split('--')
  return `/src/components/${folder}/dummy/${file}.tsx`
}

/** The module that hydrates, served by Vite like any source file. */
export const CLIENT_ENTRY = '/scripts/lib/live-client.tsx'

/**
 * Unlayered, so it wins over the page's own `p-8` without a specificity race. A pinned
 * demo is one flex item flush against one side of a box exactly as large as the viewport.
 */
export const SHELL_CSS = [
  'body[data-edge] > #demo { display: flex; min-height: 100dvh; padding: 0; }',
  'body[data-edge="top"] > #demo { align-items: flex-start; justify-content: center; }',
  'body[data-edge="bottom"] > #demo { align-items: flex-end; justify-content: center; }',
  'body[data-edge="start"] > #demo { align-items: center; justify-content: flex-start; }',
  'body[data-edge="end"] > #demo { align-items: center; justify-content: flex-end; }',
  'body[data-tall]::after { content: ""; display: block; height: 200dvh; }',
].join('\n')

/** The red box a person sees when a page failed; a test reads the same list from `__harness`. */
export const ERROR_BOX = 'fixed inset-x-0 bottom-0 z-(--tc-z-toast) max-h-[50dvh] overflow-auto bg-danger-solid p-4 text-sm whitespace-pre-wrap text-danger-on-solid'

/** Everything the shell names that no source file under src/ does. */
export const SHELL_CANDIDATES = [...PAGE_CANDIDATES, ...ERROR_BOX.split(' ')]

/** Inside a script element a `<` must not open a tag, whatever a path holds: written as its JSON escape. */
const LESS_THAN = '\\u00' + '3c'
const inScript = (value: unknown) => JSON.stringify(value).replace(/</g, LESS_THAN)

/**
 * Runs before any module loads, so a failed import is caught too. `data-harness` on the
 * root is the flag: pending, then hydrated, or failed the moment anything is reported.
 */
export function trapScript(root: string): string {
  return `(() => {
  const html = document.documentElement
  const errors = []
  const text = (value) => {
    if (value instanceof Error) return value.stack || value.message
    if (typeof value === 'string') return value
    try { return JSON.stringify(value) } catch { return String(value) }
  }
  const show = () => {
    const box = document.getElementById('harness-errors')
    if (box && errors.length > 0) { box.hidden = false; box.textContent = errors.join('\\n\\n') }
  }
  const fail = (kind, detail) => {
    errors.push(kind + ': ' + text(detail))
    html.dataset.harness = 'failed'
    show()
  }
  html.dataset.harness = 'pending'
  window.__harness = {
    root: ${inScript(root)},
    errors,
    fail,
    done() { if (html.dataset.harness === 'pending') html.dataset.harness = 'hydrated' },
  }
  const log = console.error
  console.error = (...args) => { fail('console.error', args.map(text).join(' ')); log.apply(console, args) }
  addEventListener('error', (event) => {
    if (event.target === window) fail('uncaught', event.error || event.message)
    else if (event.target instanceof HTMLScriptElement) fail('load', 'a script or one of its imports did not load')
  }, true)
  addEventListener('unhandledrejection', (event) => { fail('unhandled rejection', event.reason) })
  addEventListener('DOMContentLoaded', show)
})()`
}

/** The inline module: the same tree the server rendered, handed to `hydrateRoot`. */
export function hydrateScript(route: Pick<Route, 'demo' | 'direction' | 'toast'>): string {
  const toast = route.toast === undefined ? '' : `, ${inScript(route.toast)}`
  return [
    `import { hydrateDemo } from ${inScript(CLIENT_ENTRY)}`,
    `import Demo from ${inScript(demoModule(route.demo))}`,
    `hydrateDemo(Demo, ${inScript(route.direction)}, ${inScript(LANG[route.direction])}${toast})`,
  ].join('\n')
}

/** An empty icon, or a real browser asks for /favicon.ico and logs the 404 as an error. */
const NO_ICON = '<link rel="icon" href="data:,">'

/** The static page with three additions: the trap, the two parameters, and the hydration script. */
export function livePageHtml(route: Route, body: string, css: string, root: string): string {
  return pageHtml({ ...route, body }, css, {
    head: `${NO_ICON}\n<style>${SHELL_CSS}</style>\n<script>${trapScript(root)}</script>\n`,
    bodyAttributes: `${route.edge ? ` data-edge="${route.edge}"` : ''}${route.tall ? ' data-tall' : ''}`,
    tail: `<pre id="harness-errors" class="${ERROR_BOX}" hidden></pre>\n<script type="module">\n${hydrateScript(route)}\n</script>\n`,
  })
}
