// Helpers for a spec on the live harness (`pnpm harness:serve`), where a demo is hydrated and can open.
// openLive loads a page, waits for hydration and throws on anything it reported; pinTo moves the demo to an edge.
// viewportBox, expectInsideViewport and expectNoSidewaysScroll measure; liveErrors lists what the page reported since.
import { realpathSync } from 'node:fs'

import { expect, type Locator, type Page } from '@playwright/test'

import type { Direction, Mode } from '../scripts/lib/harness.js'
import type { HarnessTrap } from '../scripts/lib/live-client.js'
import { type Edge, type RouteOptions, PORT_ENV, liveOrigin, routeFor } from '../scripts/lib/live-harness.js'

export interface LiveOptions extends RouteOptions { mode?: Mode; direction?: Direction }

/** The address of a demo on the live harness: the static page's name, on the server. */
export function liveUrl(demo: string, { mode = 'light', direction = 'ltr', ...route }: LiveOptions = {}): string {
  return `${liveOrigin()}${routeFor(demo, mode, direction, route)}`
}

// Spelt as the server spells its own root, so the two compare equal on Windows too.
const CHECKOUT = realpathSync.native(process.cwd())
const HYDRATION_TIMEOUT = 20_000

/** What the browser itself logged: a failed request never passes through the page's console.error. */
const logged = new WeakMap<Page, string[]>()

/** Listens once per page, and starts the list again each time the page is opened. */
function watch(page: Page): void {
  const known = logged.get(page)
  if (known) { known.length = 0; return }
  const seen: string[] = []
  logged.set(page, seen)
  page.on('console', (message) => { if (message.type() === 'error') seen.push(`console: ${message.text()}`) })
  page.on('pageerror', (error) => { seen.push(`uncaught: ${error.message}`) })
}

const trap = (page: Page) => page.evaluate((): Pick<HarnessTrap, 'root' | 'errors'> | null => {
  const found = window.__harness
  return found ? { root: found.root, errors: [...found.errors] } : null
})

/** Everything the page has reported since openLive: console errors, uncaught errors, failed scripts, hydration repairs. */
export async function liveErrors(page: Page): Promise<string[]> {
  const inPage = (await trap(page))?.errors ?? []
  // The page's own trap already holds what went through console.error, so the browser's copy is left out.
  const onlyBrowser = (logged.get(page) ?? []).filter((line) => {
    const text = line.slice(line.indexOf(': ') + 2)
    return !inPage.some((known) => known.includes(text))
  })
  return [...inPage, ...onlyBrowser]
}

/** Opens a live page and returns once React has hydrated it. A page that reported anything fails here. */
export async function openLive(page: Page, demo: string, options: LiveOptions = {}): Promise<void> {
  watch(page)
  const url = liveUrl(demo, options)
  const response = await page.goto(url)
  if (!response?.ok()) {
    throw new Error(`live harness: ${url} answered ${String(response?.status())}: ${await page.locator('body').innerText()}`)
  }

  const served = (await trap(page))?.root
  if (served !== CHECKOUT) {
    throw new Error(
      `live harness: ${liveOrigin()} serves ${String(served)}, not this checkout (${CHECKOUT}). `
      + `Another worktree holds the port: stop its server, or set ${PORT_ENV} to a free port for this run.`,
    )
  }

  await page
    .waitForFunction(() => document.documentElement.dataset['harness'] !== 'pending', null, { timeout: HYDRATION_TIMEOUT })
    .catch(() => null)
  const flag = await page.evaluate(() => document.documentElement.dataset['harness'] ?? 'unmarked')

  const errors = await liveErrors(page)
  if (flag !== 'hydrated' || errors.length > 0) {
    throw new Error(`live harness: ${demo} is ${flag} at ${url}\n${errors.join('\n') || 'nothing was reported'}`)
  }
}

/** Moves the demo of an open page flush against an edge, or back into the page with null. No reload. */
export async function pinTo(page: Page, edge: Edge | null): Promise<void> {
  await page.evaluate((to) => {
    if (to === null) delete document.body.dataset['edge']
    else document.body.dataset['edge'] = to
  }, edge)
}

export interface ViewportBox {
  left: number
  top: number
  right: number
  bottom: number
  /** The layout viewport: the root's client box, which leaves a classic scrollbar out. */
  viewport: { width: number, height: number }
  inside: boolean
}

/** Where a box lies and whether all of it is inside the viewport. A box that is not rendered throws: zeros would pass. */
export function viewportBox(target: Locator): Promise<ViewportBox> {
  return target.evaluate((element) => {
    if (element.getClientRects().length === 0) throw new Error('viewportBox: the box is not rendered')
    const { left, top, right, bottom } = element.getBoundingClientRect()
    const viewport = { width: document.documentElement.clientWidth, height: document.documentElement.clientHeight }
    return {
      left, top, right, bottom, viewport,
      inside: left >= 0 && top >= 0 && right <= viewport.width && bottom <= viewport.height,
    }
  })
}

/** Edge by edge, so a failure says which one was crossed. `margin` asks for that much clear space as well. */
export async function expectInsideViewport(target: Locator, label = 'the box', margin = 0): Promise<void> {
  const box = await viewportBox(target)
  expect(box.left, `${label} crosses the left edge`).toBeGreaterThanOrEqual(margin)
  expect(box.top, `${label} crosses the top edge`).toBeGreaterThanOrEqual(margin)
  expect(box.right, `${label} crosses the right edge`).toBeLessThanOrEqual(box.viewport.width - margin)
  expect(box.bottom, `${label} crosses the bottom edge`).toBeLessThanOrEqual(box.viewport.height - margin)
}

/** Against the body: the page keeps a scrollbar gutter, which the root's clientWidth still counts when no bar is drawn. */
export async function expectNoSidewaysScroll(page: Page): Promise<void> {
  const { scrollWidth, pageWidth, lostAtStart } = await page.evaluate(() => {
    const rtl = getComputedStyle(document.documentElement).direction === 'rtl'
    const width = document.documentElement.clientWidth
    const hidden = (style: CSSStyleDeclaration) => style.clipPath !== 'none' || style.getPropertyValue('clip') !== 'auto'
    // Past the inline start a page never scrolls, so scrollWidth cannot see it: each box is read instead.
    const lost = [...document.body.querySelectorAll('*')].filter((element) => {
      const box = element.getBoundingClientRect()
      if (box.width === 0 || box.height === 0 || !(rtl ? box.right > width + 0.5 : box.left < -0.5)) return false
      if (hidden(getComputedStyle(element))) return false
      for (let at = element.parentElement; at && at !== document.body; at = at.parentElement) {
        const style = getComputedStyle(at)
        if (style.overflowX !== 'visible' || hidden(style)) return false
      }
      return true
    })
    return {
      scrollWidth: document.documentElement.scrollWidth,
      pageWidth: document.body.clientWidth,
      lostAtStart: lost.map((element) => {
        const { left, right } = element.getBoundingClientRect()
        return `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ''} ${String(Math.round(left))}..${String(Math.round(right))}`
      }),
    }
  })
  expect(scrollWidth, 'the page scrolls sideways').toBeLessThanOrEqual(pageWidth)
  expect(lostAtStart, 'boxes lost past the inline start, where no scroll reaches').toEqual([])
}
