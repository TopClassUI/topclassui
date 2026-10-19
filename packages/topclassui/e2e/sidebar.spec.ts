import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Locator, type Page } from '@playwright/test'

import { DIRECTIONS, MODES, type Direction } from '../scripts/lib/harness.js'
import { type LiveOptions, expectNoSidewaysScroll, liveErrors, liveUrl, openLive } from './live.js'
import { boxOf, wheelAt, withScrollbar } from './overlay.js'
import { DEMOS, urlFor } from './pages.js'
import { type Clip, type Rgb, contrast, pixelsOf, rgbOf } from './pixels.js'

// What happy-dom cannot lay out: two widths, a list that scrolls inside the rail, a ring a scrolling box could
// cut, the keys in a real browser, what forced colours leave of a fill, and a page that must not grow.

/** Every demo: whether its first rail starts expanded, and how many links it holds. Written out, so a renamed demo fails here. */
const SIDEBARS: Record<string, { open: boolean, links: number }> = {
  'sidebar--basic': { open: true, links: 4 },
  'sidebar--collapsed': { open: false, links: 4 },
  'sidebar--controlled': { open: true, links: 2 },
  'sidebar--groups': { open: true, links: 6 },
  'sidebar--in-a-layout': { open: true, links: 4 },
  'sidebar--long-list': { open: true, links: 60 },
  'sidebar--playground': { open: true, links: 3 },
  'sidebar--rtl': { open: true, links: 4 },
  // Two rails, the expanded one first: what a test reads of the first rail is that one.
  'sidebar--states': { open: true, links: 6 },
}

/** The three screens Unit 3 measures at, and a phone on its side. */
const SCREENS = [{ width: 320, height: 480 }, { width: 390, height: 844 }, { width: 1280, height: 800 }, { width: 844, height: 390 }] as const

/** The names the labels give the rail and its toggle, by the language of the page. */
const NAMES = {
  ltr: { rail: 'Sidebar', collapse: 'Collapse the sidebar', expand: 'Expand the sidebar' },
  rtl: { rail: 'الشريط الجانبي', collapse: 'طي الشريط الجانبي', expand: 'توسيع الشريط الجانبي' },
} as const satisfies Record<Direction, Record<string, string>>

/** A rail in the layouts and with the content no demo should show, loaded into a live page. */
const FIXTURE = '/e2e/fixtures/sidebar.tsx'

async function openFixture(page: Page, options: LiveOptions = {}): Promise<void> {
  await openLive(page, 'sidebar--basic', options)
  await page.addScriptTag({ type: 'module', url: FIXTURE })
  await expect(page.locator('#sidebar-fixture')).toHaveAttribute('data-ready', '')
}

const railOf = (page: Page, scope = '#demo') => page.locator(`${scope} nav`).first()
const triggerOf = (rail: Locator) => rail.locator('button[aria-expanded]')
const headerOf = (rail: Locator) => rail.locator('> div').first()
const bodyOf = (rail: Locator) => rail.locator('> .overflow-y-auto')
const linksOf = (rail: Locator) => rail.locator('a')
const widthOf = async (target: Locator) => (await boxOf(target)).width

const twoFrames = (page: Page) => page.evaluate(() => new Promise<void>((resolve) => {
  requestAnimationFrame(() => { requestAnimationFrame(() => { resolve() }) })
}))

/** Nothing moves any more: every transition that ends has ended. Never a fixed wait. */
const atRest = (page: Page) => page.evaluate(async () => {
  const running = () => document.getAnimations().filter((animation) => {
    const end = animation.effect?.getComputedTiming().endTime
    return animation.playState === 'running' && typeof end === 'number' && Number.isFinite(end)
  })
  for (let pending = running(); pending.length > 0; pending = running()) {
    await Promise.allSettled(pending.map((animation) => animation.finished))
  }
})

const scrollOf = (body: Locator) => body.evaluate((element) => ({
  top: Math.round(element.scrollTop), room: element.scrollHeight - element.clientHeight, sideways: element.scrollWidth - element.clientWidth,
}))

/** How the page itself can scroll: neither way, when a rail holds its own list. */
const pageRoom = (page: Page) => page.evaluate(() => ({
  down: document.documentElement.scrollHeight - document.documentElement.clientHeight,
  sideways: document.documentElement.scrollWidth - document.body.clientWidth,
}))

/** The focused element as a reader hears it: its aria-label, or else its text. */
const focusedName = (page: Page) => page.evaluate(() => {
  const element = document.activeElement
  return element?.getAttribute('aria-label') ?? element?.textContent ?? '(nothing)'
})

/** The room between the focused row and each edge of the box that clips it. A ring reaches 4 px. */
const roomOf = (body: Locator) => body.evaluate((element) => {
  const row = document.activeElement?.getBoundingClientRect()
  if (!row) throw new Error('nothing is focused')
  const frame = element.getBoundingClientRect()
  const round = (value: number) => Math.round(value * 10) / 10
  return {
    top: round(row.top - (frame.top + element.clientTop)), bottom: round(frame.top + element.clientTop + element.clientHeight - row.bottom),
    left: round(row.left - (frame.left + element.clientLeft)), right: round(frame.left + element.clientLeft + element.clientWidth - row.right),
  }
})

interface Ring { left: number, right: number, top: number, bottom: number, outside: number }

/**
 * The ring of the focused element, read as the pixels that change when it loses the focus, on the line through
 * the middle of each side from 6 px outside the box to 2 px inside it. A pixel a clipping box cut did not change.
 */
async function ringOf(page: Page): Promise<Ring> {
  await atRest(page)
  const PAD = 6
  const { box, view } = await page.evaluate(() => {
    const { left, top, right, bottom } = (document.activeElement ?? document.body).getBoundingClientRect()
    return { box: { left, top, right, bottom }, view: { width: document.documentElement.clientWidth, height: document.documentElement.clientHeight } }
  })
  const [x, y] = [Math.max(0, Math.floor(box.left) - PAD), Math.max(0, Math.floor(box.top) - PAD)]
  const clip: Clip = { x, y, width: Math.min(view.width, Math.ceil(box.right) + PAD) - x, height: Math.min(view.height, Math.ceil(box.bottom) + PAD) - y }
  const lit = await pixelsOf(page, clip)
  await page.evaluate(() => { (document.activeElement as HTMLElement | null)?.blur() })
  await atRest(page)
  const plain = await pixelsOf(page, clip)

  const changed = (column: number, row: number): boolean => {
    if (column < 0 || row < 0 || column >= clip.width || row >= clip.height) return false
    const [a, b] = [lit[row * clip.width + column] ?? [0, 0, 0], plain[row * clip.width + column] ?? [0, 0, 0]]
    return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]) > 40
  }
  const [L, R, T, B] = [Math.floor(box.left) - x, Math.ceil(box.right) - x, Math.floor(box.top) - y, Math.ceil(box.bottom) - y]
  const [midRow, midColumn] = [Math.round((T + B) / 2), Math.round((L + R) / 2)]
  const run = (length: number) => Array.from({ length }, (_, index) => index)
  const count = (points: [number, number][]) => points.filter(([column, row]) => changed(column, row)).length
  return {
    left: count(run(PAD + 2).map((step) => [L - PAD + step, midRow])),
    right: count(run(PAD + 2).map((step) => [R - 2 + step, midRow])),
    top: count(run(PAD + 2).map((step) => [midColumn, T - PAD + step])),
    bottom: count(run(PAD + 2).map((step) => [midColumn, B - 2 + step])),
    outside: count([
      ...run(PAD).flatMap((step): [number, number][] => [[L - PAD + step, midRow], [R + step, midRow]]),
      ...run(PAD).flatMap((step): [number, number][] => [[midColumn, T - PAD + step], [midColumn, B + step]]),
    ]),
  }
}

/** A whole ring: 2 px on each side, all of it outside the box. */
const WHOLE: Ring = { left: 2, right: 2, top: 2, bottom: 2, outside: 8 }

const pixelAt = async (page: Page, x: number, y: number): Promise<Rgb> => (await pixelsOf(page, { x: Math.round(x), y: Math.round(y), width: 1, height: 1 }))[0] ?? [0, 0, 0]

const clipOf = (box: { left: number, top: number, width: number, height: number }): Clip =>
  ({ x: Math.floor(box.left), y: Math.floor(box.top), width: Math.ceil(box.width), height: Math.ceil(box.height) })

/** The pixel of a box furthest from its backdrop: the core of a glyph or of an icon's stroke. */
async function inkOf(page: Page, target: Locator, backdrop: Rgb): Promise<Rgb> {
  const all = await pixelsOf(page, clipOf(await boxOf(target)))
  return all.reduce((best, pixel) => (contrast(pixel, backdrop) > contrast(best, backdrop) ? pixel : best), backdrop)
}

/**
 * What is wrong with the layout of a rail, in words. A part that an ancestor clips is that ancestor's to hold,
 * so only what nothing clips can cross the rail; a box that scrolls must not scroll sideways; rows never overlap.
 */
const faultsOf = (rail: Locator) => rail.evaluate((nav) => {
  const faults: string[] = []
  const frame = nav.getBoundingClientRect()
  const name = (element: Element) => `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ''} "${element.textContent.slice(0, 16)}"`
  const clipped = (element: Element) => {
    for (let parent = element.parentElement; parent && parent !== nav; parent = parent.parentElement) {
      if (getComputedStyle(parent).overflowX !== 'visible') return true
    }
    return false
  }
  for (const element of nav.querySelectorAll('*')) {
    if (element.closest('svg') && element.tagName !== 'svg') continue
    const box = element.getBoundingClientRect()
    // sr-only: one pixel, clipped away. It takes no room and paints nothing.
    if (box.width <= 1 && box.height <= 1) continue
    if (!clipped(element) && (box.left < frame.left - 0.5 || box.right > frame.right + 0.5)) faults.push(`${name(element)} crosses the rail`)
    const style = getComputedStyle(element)
    if (['auto', 'scroll'].includes(style.overflowX) && element.scrollWidth > element.clientWidth) faults.push(`${name(element)} scrolls sideways`)
  }
  const rows = [...nav.querySelectorAll('a')]
  rows.forEach((row, index) => {
    const before = rows[index - 1]
    if (before && row.getBoundingClientRect().top < before.getBoundingClientRect().bottom - 0.5) faults.push(`${name(row)} lies over ${name(before)}`)
  })
  const [toggle, title] = [nav.querySelector('button[aria-expanded]'), nav.querySelector('button[aria-expanded] + span')]
  if (toggle && title && title.getBoundingClientRect().width > 1) {
    const [a, b] = [toggle.getBoundingClientRect(), title.getBoundingClientRect()]
    if (a.right > b.left + 0.5 && b.right > a.left + 0.5) faults.push('the title lies over the toggle')
  }
  if (frame.left < -0.5 || frame.right > document.body.clientWidth + 0.5) faults.push('the rail crosses the page')
  return faults
})

/** A finger dragged up or down, as raw touch events: Playwright has no swipe. Returns once nothing scrolls any more. */
async function drag(page: Page, body: Locator, x: number, fromY: number, toY: number): Promise<void> {
  const session = await page.context().newCDPSession(page)
  await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y: fromY }] })
  for (let step = 1; step <= 12; step++) {
    await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: fromY + ((toY - fromY) * step) / 12 }] })
    await twoFrames(page)
  }
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await session.detach()
  // The fling after the finger lifts: the position is read only once it has stopped.
  await expect.poll(async () => {
    const before = (await scrollOf(body)).top
    await twoFrames(page)
    return (await scrollOf(body)).top === before
  }).toBe(true)
}

/** The palette's own system colours, asked of the browser and not written here. */
const systemColours = (page: Page) => page.evaluate(() => {
  const read = (colour: string) => {
    const probe = document.createElement('i')
    probe.style.color = colour
    document.body.append(probe)
    const value = getComputedStyle(probe).color
    probe.remove()
    return value
  }
  return { canvas: read('Canvas'), text: read('CanvasText'), highlight: read('Highlight'), highlightText: read('HighlightText') }
})

/** axe on one part of the page: landmarks and document structure belong to the docs app, not to a component. */
async function axe(page: Page, scope = '#demo'): Promise<{ violations: string[], passes: string[] }> {
  const results = await new AxeBuilder({ page }).include(scope).analyze()
  return {
    violations: results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`),
    passes: results.passes.map((pass) => pass.id),
  }
}

test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

test('the table names every sidebar demo', () => {
  expect(Object.keys(SIDEBARS).sort()).toEqual(DEMOS.filter((demo) => demo.startsWith('sidebar--')).sort())
  expect(Object.keys(SIDEBARS)).toHaveLength(9)
})

// PLAN 19, Phase 6: accepted on the HTML the server sends, before any script has run.
test.describe('the server HTML', () => {
  /** What a crawler receives: the response itself, never the page a browser built from it. */
  const served = async (page: Page, demo: string) => {
    const response = await page.request.get(liveUrl(demo))
    expect(response.ok()).toBe(true)
    const html = await response.text()
    return html.slice(html.indexOf('<main id="demo"'), html.indexOf('</main>'))
  }

  test('says which state each rail is in, on the nav and on its toggle, in every demo', async ({ page }) => {
    for (const [demo, { open, links }] of Object.entries(SIDEBARS)) {
      const html = await served(page, demo)
      const [nav = '', toggle = ''] = [html.match(/<nav [^>]*>/)?.[0], html.match(/<button [^>]*aria-expanded[^>]*>/)?.[0]]
      expect(nav.includes(' data-open=""'), `${demo}: data-open`).toBe(open)
      expect(nav.includes(' data-closed=""'), `${demo}: data-closed`).toBe(!open)
      expect(toggle, demo).toContain(` aria-expanded="${String(open)}"`)
      expect(toggle, demo).toContain(' type="button"')
      expect(html.match(/<a [^>]*href="#[^"]+"/g) ?? [], demo).toHaveLength(links)
    }
  })

  test('names the rail and its toggle in English, and in Arabic inside the Arabic demo', async ({ page }) => {
    const english = await served(page, 'sidebar--basic')
    expect(english).toContain('<nav aria-label="Sidebar"')
    expect(english).toContain('<button aria-label="Collapse the sidebar"')
    expect(await served(page, 'sidebar--collapsed')).toContain('<button aria-label="Expand the sidebar"')
    const arabic = await served(page, 'sidebar--rtl')
    expect(arabic).toContain(`<nav aria-label="${NAMES.rtl.rail}"`)
    expect(arabic).toContain(`<button aria-label="${NAMES.rtl.collapse}"`)
  })

  test('with no script at all the rails are 220 and 52 px wide, every link is named, and one is the current page', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false })
    const page = await context.newPage()
    for (const [demo, width] of [['sidebar--basic', 220], ['sidebar--collapsed', 52]] as const) {
      await page.goto(liveUrl(demo))
      const rail = railOf(page)
      expect(await widthOf(rail), demo).toBe(width)
      for (const name of ['Home', 'Projects', 'Team', 'Settings']) await expect(page.getByRole('link', { name, exact: true })).toBeVisible()
      await expect(page.locator('#demo a[aria-current="page"]')).toHaveText('Home')
      await expect(page.getByRole('navigation', { name: 'Sidebar' })).toBeVisible()
      // The Tab key reaches the toggle and then the first link: nothing waits for a script to be a stop.
      await page.keyboard.press('Tab')
      await expect(triggerOf(rail)).toBeFocused()
      await page.keyboard.press('Tab')
      await expect(page.getByRole('link', { name: 'Home', exact: true })).toBeFocused()
    }
    await context.close()
  })

  // axe never returns in a context with scripts turned off, so this reads the static pages: the same markup, and no script on them.
  test('on a page with no script axe finds nothing in either state, and every target is 24 px at least', async ({ page }) => {
    for (const [demo, { open }] of Object.entries(SIDEBARS)) {
      await page.goto(urlFor(demo, 'light', 'ltr'))
      expect(await page.locator('script').count(), demo).toBe(0)
      expect(await widthOf(railOf(page)), demo).toBe(open ? 220 : 52)
      const found = await axe(page)
      expect(found.violations, demo).toEqual([])
      expect(found.passes, demo).toEqual(expect.arrayContaining(['aria-allowed-attr', 'link-name', 'button-name', 'listitem', 'landmark-unique']))
      const small = await page.locator('#demo button, #demo a').evaluateAll((all) => all.map((element) => element.getBoundingClientRect()).filter((box) => box.width < 24 || box.height < 24).length)
      expect(small, demo).toBe(0)
    }
  })

  test('with no script and a finger every target is 44 px, in the expanded rail and in the collapsed one', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } })
    const page = await context.newPage()
    for (const [demo, width] of [['sidebar--basic', 220], ['sidebar--collapsed', 61]] as const) {
      await page.goto(liveUrl(demo))
      expect(await widthOf(railOf(page)), demo).toBe(width)
      const sizes = await page.locator('#demo button, #demo a').evaluateAll((all) => all.map((element) => {
        const { width: w, height: h } = element.getBoundingClientRect()
        return Math.min(w, h)
      }))
      expect(sizes, demo).toEqual([44, 44, 44, 44, 44])
    }
    await context.close()
  })

  for (const [demo, width, other] of [['sidebar--collapsed', 52, 220], ['sidebar--basic', 220, 52]] as const) {
    test(`${demo}: ${String(width)} px while its script is held back and ${String(width)} px once it has hydrated, with no width in between`, async ({ page }) => {
      let release = (): void => undefined
      const held = new Promise<void>((resolve) => { release = resolve })
      await page.route('**/scripts/lib/live-client.tsx*', async (route) => { await held; await route.continue() })
      await page.goto(liveUrl(demo), { waitUntil: 'commit' })
      const rail = railOf(page)
      await expect(rail).toBeVisible()
      expect(await page.evaluate(() => document.documentElement.dataset['harness'])).toBe('pending')
      expect(await widthOf(rail)).toBe(width)

      // Every width the rail takes from here on, the first frame after hydration included.
      await rail.evaluate((element) => {
        const seen: number[] = []
        Object.assign(window, { seenWidths: seen })
        new ResizeObserver(() => { seen.push(element.getBoundingClientRect().width) }).observe(element)
      })
      release()
      await expect.poll(() => page.evaluate(() => document.documentElement.dataset['harness'])).toBe('hydrated')
      await twoFrames(page)
      expect(await page.evaluate(() => [...new Set((window as unknown as { seenWidths: number[] }).seenWidths)])).toEqual([width])

      // And it is live now: the same observer sees the press.
      await triggerOf(rail).click()
      expect(await widthOf(rail)).toBe(other)
      await twoFrames(page)
      expect(await page.evaluate(() => [...new Set((window as unknown as { seenWidths: number[] }).seenWidths)])).toEqual([width, other])
    })
  }
})

test.describe('the toggle', () => {
  for (const direction of DIRECTIONS) {
    test(`${direction}: a press takes the rail from 220 to 52 px and back, and the toggle says so each time`, async ({ page }) => {
      await openLive(page, 'sidebar--basic', { direction })
      const rail = railOf(page)
      const trigger = triggerOf(rail)
      const names = NAMES[direction]
      await expect(page.getByRole('navigation', { name: names.rail })).toBeVisible()
      const state = async () => ({
        width: await widthOf(rail), expanded: await trigger.getAttribute('aria-expanded'), name: await trigger.getAttribute('aria-label'),
        open: await rail.getAttribute('data-open'), closed: await rail.getAttribute('data-closed'),
      })
      expect(await state()).toEqual({ width: 220, expanded: 'true', name: names.collapse, open: '', closed: null })
      await trigger.click()
      expect(await state()).toEqual({ width: 52, expanded: 'false', name: names.expand, open: null, closed: '' })
      await trigger.click()
      expect(await state()).toEqual({ width: 220, expanded: 'true', name: names.collapse, open: '', closed: null })
    })
  }

  test('collapsed, the title and every label are one clipped pixel, and the icons sit in the middle of the rail under the toggle', async ({ page }) => {
    await openLive(page, 'sidebar--collapsed')
    const rail = railOf(page)
    const frame = await boxOf(rail)
    // 52 px less the line on the inline end: the middle of what is left.
    const middle = frame.left + (52 - 1) / 2
    const toggle = await boxOf(triggerOf(rail))
    expect((toggle.left + toggle.right) / 2).toBe(middle)
    for (const link of await linksOf(rail).all()) {
      const [row, icon, label] = [await boxOf(link), await boxOf(link.locator('svg')), await boxOf(link.locator('> span').last())]
      expect([row.width, row.height]).toEqual([35, 32])
      expect((icon.left + icon.right) / 2).toBe(middle)
      expect([label.width, label.height]).toEqual([1, 1])
    }
    const title = await boxOf(headerOf(rail).locator('span'))
    expect([title.width, title.height]).toEqual([1, 1])
  })

  test('onOpenChange is called once a press, with the state the press asks for', async ({ page }) => {
    await openFixture(page)
    const rail = page.locator('#heard')
    const log = page.locator('#heard-log')
    await expect(log).toHaveText('')
    await triggerOf(rail).click()
    await expect(log).toHaveText('false')
    expect(await widthOf(rail)).toBe(52)
    await triggerOf(rail).click()
    await expect(log).toHaveText('false,true')
    await triggerOf(rail).focus()
    await page.keyboard.press('Enter')
    await expect(log).toHaveText('false,true,false')
    await page.keyboard.press('Space')
    await expect(log).toHaveText('false,true,false,true')
    expect(await widthOf(rail)).toBe(220)
  })

  test('a rail whose caller holds open and never changes it does not move: each press only asks', async ({ page }) => {
    await openFixture(page)
    const rail = page.locator('#fixed')
    const trigger = triggerOf(rail)
    for (const asked of ['false', 'false,false', 'false,false,false']) {
      await trigger.click()
      await expect(page.locator('#fixed-log')).toHaveText(asked)
      expect(await widthOf(rail)).toBe(220)
      await expect(trigger).toHaveAttribute('aria-expanded', 'true')
      await expect(trigger).toHaveAttribute('aria-label', 'Collapse the sidebar')
      await expect(rail).toHaveAttribute('data-open', '')
    }
  })

  test('a rail whose caller holds open and follows the request moves as an uncontrolled one does', async ({ page }) => {
    await openFixture(page)
    const rail = page.locator('#followed')
    await triggerOf(rail).click()
    await expect(page.locator('#followed-log')).toHaveText('false')
    expect(await widthOf(rail)).toBe(52)
    await triggerOf(rail).click()
    await expect(page.locator('#followed-log')).toHaveText('false,true')
    expect(await widthOf(rail)).toBe(220)
  })

  test('the controlled demo: a button of the page collapses the rail without the rail asking, and its own toggle asks once', async ({ page }) => {
    await openLive(page, 'sidebar--controlled')
    const rail = railOf(page)
    const count = page.locator('#demo p')
    await expect(count).toHaveText('The rail asked to change 0 times.')
    await page.getByRole('button', { name: 'Hide the labels' }).click()
    expect(await widthOf(rail)).toBe(52)
    await expect(triggerOf(rail)).toHaveAttribute('aria-expanded', 'false')
    await expect(count).toHaveText('The rail asked to change 0 times.')
    await triggerOf(rail).click()
    expect(await widthOf(rail)).toBe(220)
    await expect(count).toHaveText('The rail asked to change 1 times.')
    await expect(page.getByRole('button', { name: 'Hide the labels' })).toBeVisible()
  })

  test('the focus stays on the toggle through a press, though the toggle moves to the middle of the collapsed rail', async ({ page }) => {
    await openLive(page, 'sidebar--basic')
    const trigger = triggerOf(railOf(page))
    await trigger.focus()
    const before = await boxOf(trigger)
    await page.keyboard.press('Enter')
    await expect(trigger).toBeFocused()
    expect((await boxOf(trigger)).left).toBe(before.left + 5.5)
    await page.keyboard.press('Enter')
    await expect(trigger).toBeFocused()
    expect(await boxOf(trigger)).toEqual(before)
  })
})

for (const direction of DIRECTIONS) {
  test.describe(`the keyboard, ${direction}`, () => {
    const ORDER = ['Home', 'Projects', 'Team', 'Notifications', 'Settings', 'Sign out']

    test('Tab goes from the toggle to each link in the order of the page, and Shift+Tab back', async ({ page }) => {
      await openLive(page, 'sidebar--groups', { direction })
      await triggerOf(railOf(page)).focus()
      const visited: string[] = []
      for (let step = 0; step < 6; step++) { await page.keyboard.press('Tab'); visited.push(await focusedName(page)) }
      expect(visited).toEqual(ORDER)
      const back: string[] = []
      for (let step = 0; step < 6; step++) { await page.keyboard.press('Shift+Tab'); back.push(await focusedName(page)) }
      expect(back).toEqual(['Settings', 'Notifications', 'Team', 'Projects', 'Home', NAMES[direction].collapse])
    })

    test('Enter and Space on the toggle collapse and expand the rail', async ({ page }) => {
      await openLive(page, 'sidebar--groups', { direction })
      const rail = railOf(page)
      await triggerOf(rail).focus()
      await page.keyboard.press('Enter')
      expect(await widthOf(rail)).toBe(52)
      await expect(triggerOf(rail)).toHaveAttribute('aria-expanded', 'false')
      await page.keyboard.press('Space')
      expect(await widthOf(rail)).toBe(220)
      await expect(triggerOf(rail)).toHaveAttribute('aria-expanded', 'true')
    })

    test('collapsed, every link is still a stop in the same order, and each is still found by its name', async ({ page }) => {
      await openLive(page, 'sidebar--groups', { direction })
      const rail = railOf(page)
      await triggerOf(rail).focus()
      await page.keyboard.press('Enter')
      await expect(triggerOf(rail)).toHaveAttribute('aria-label', NAMES[direction].expand)
      for (const name of ORDER) {
        await page.keyboard.press('Tab')
        // By role and name, which is what a screen reader walks: the label is hidden, not removed.
        await expect(page.getByRole('link', { name, exact: true })).toBeFocused()
        await expect(page.locator('#demo a:focus')).toHaveCSS('outline-style', 'solid')
      }
      // Enter on a link follows it, collapsed or not.
      await page.keyboard.press('Enter')
      await expect(page).toHaveURL(/#sign-out$/)
    })
  })
}

test.describe('what a screen reader is given', () => {
  test('expanded: a navigation named Sidebar, an expanded button, the title, and a list of four named links', async ({ page }) => {
    await openLive(page, 'sidebar--basic')
    await expect(railOf(page)).toMatchAriaSnapshot(`
      - navigation "Sidebar":
        - button "Collapse the sidebar" [expanded]
        - text: Workspace
        - list:
          - listitem:
            - link "Home"
          - listitem:
            - link "Projects"
          - listitem:
            - link "Team"
          - listitem:
            - link "Settings"
    `)
    await expect(page.getByRole('link', { name: 'Home', exact: true })).toHaveAttribute('aria-current', 'page')
    await expect(page.locator('#demo [aria-current]')).toHaveCount(1)
  })

  test('collapsed: the same tree, with a button that is not expanded: no name was lost with its text', async ({ page }) => {
    await openLive(page, 'sidebar--collapsed')
    await expect(railOf(page)).toMatchAriaSnapshot(`
      - navigation "Sidebar":
        - button "Expand the sidebar"
        - text: Workspace
        - list:
          - listitem:
            - link "Home"
          - listitem:
            - link "Projects"
          - listitem:
            - link "Team"
          - listitem:
            - link "Settings"
    `)
    await expect(page.getByRole('button', { name: 'Expand the sidebar', expanded: false })).toBeVisible()
    // What a sighted mouse user is given: the icon alone. No title attribute, no tooltip: that is a later connector.
    for (const link of await linksOf(railOf(page)).all()) expect(await link.getAttribute('title')).toBeNull()
    await expect(page.getByRole('tooltip')).toHaveCount(0)
  })

  test('two groups are two lists, each named by its label, expanded and collapsed', async ({ page }) => {
    await openLive(page, 'sidebar--groups')
    const rail = railOf(page)
    for (const state of ['expanded', 'collapsed']) {
      await expect(page.getByRole('list', { name: 'Workspace' }).getByRole('link'), state).toHaveCount(3)
      await expect(page.getByRole('list', { name: 'Account' }).getByRole('link'), state).toHaveCount(3)
      await expect(page.getByRole('list', { name: 'Account' }).getByRole('link', { name: 'Sign out' }), state).toBeVisible()
      await triggerOf(rail).click()
    }
    // Collapsed in between: the label of a group was one clipped pixel then.
    await triggerOf(rail).click()
    const label = await boxOf(rail.locator('p').first())
    expect([label.width, label.height]).toEqual([1, 1])
  })
})

test.describe('sixty links', () => {
  // Sixty Tab presses forward and sixty back, each measured: slow on a busy machine.
  test.describe.configure({ timeout: 120_000 })

  for (const screen of SCREENS) {
    for (const direction of DIRECTIONS) {
      const at = `${String(screen.width)} x ${String(screen.height)} ${direction}`

      test(`${at}: the list scrolls inside the body, the header stays put, and the page scrolls neither way`, async ({ page }) => {
        await page.setViewportSize(screen)
        await openLive(page, 'sidebar--long-list', { direction })
        const rail = railOf(page)
        const body = bodyOf(rail)
        for (const state of ['expanded', 'collapsed']) {
          expect((await scrollOf(body)).room, `${state}: px the body scrolls`).toBeGreaterThan(1200)
          expect((await scrollOf(body)).sideways, `${state}: px the body scrolls sideways`).toBe(0)
          expect(await pageRoom(page), state).toEqual({ down: 0, sideways: 0 })
          expect(await faultsOf(rail), state).toEqual([])
          const [frame, header] = [await boxOf(rail), await boxOf(headerOf(rail))]
          expect(frame.height).toBe(screen.height - 64)
          const box = await boxOf(body)
          await wheelAt(page, box.left + box.width / 2, box.top + 100, 600)
          await expect.poll(async () => (await scrollOf(body)).top, { message: `${state}: the wheel` }).toBe(600)
          expect(await boxOf(headerOf(rail)), state).toEqual(header)
          expect(await boxOf(rail), state).toEqual(frame)
          await body.evaluate((element) => { element.scrollTop = 0 })
          await triggerOf(rail).click()
        }
      })

      test(`${at}: the wheel brings the last link whole into view, and a wheel past the end does not move the page`, async ({ page }) => {
        await page.setViewportSize(screen)
        // Three screens tall, so the page could scroll if the body let the wheel through.
        await openLive(page, 'sidebar--long-list', { direction, tall: true })
        const body = bodyOf(railOf(page))
        const last = linksOf(railOf(page)).last()
        await expect(last).not.toBeInViewport()
        const box = await boxOf(body)
        for (let turn = 0; turn < 4; turn++) await wheelAt(page, box.left + box.width / 2, box.top + 100, 1000)
        const { top, room } = await scrollOf(body)
        expect(top).toBe(room)
        await expect(last).toBeInViewport({ ratio: 1 })
        const [row, frame] = [await boxOf(last), await boxOf(body)]
        expect(frame.bottom - row.bottom, 'px between the last row and the edge that clips it').toBe(4)
        await wheelAt(page, box.left + box.width / 2, box.top + 100, 1000)
        expect(await page.evaluate(() => window.scrollY)).toBe(0)
        // The same wheel does move the page beside the rail, or the line above proved nothing.
        await wheelAt(page, direction === 'rtl' ? 20 : screen.width - 40, 200, 300)
        await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(300)
      })

      test(`${at}: Tab reaches all sixty, each one whole inside the body with the 4 px its ring needs, forward and back`, async ({ page }) => {
        await page.setViewportSize(screen)
        await openLive(page, 'sidebar--long-list', { direction })
        const rail = railOf(page)
        const body = bodyOf(rail)
        await triggerOf(rail).focus()
        const cut: string[] = []
        const visit = async (key: string, name: string) => {
          await page.keyboard.press(key)
          expect(await focusedName(page)).toBe(name)
          const room = await roomOf(body)
          if (Math.min(room.top, room.bottom, room.left, room.right) < 4) cut.push(`${name} after ${key}: ${JSON.stringify(room)}`)
        }
        for (let index = 1; index <= 60; index++) await visit('Tab', `Page ${String(index)}`)
        expect((await scrollOf(body)).top, 'px the body scrolled to show the last').toBeGreaterThan(1200)
        for (let index = 59; index >= 1; index--) await visit('Shift+Tab', `Page ${String(index)}`)
        expect(cut).toEqual([])
        expect(await page.evaluate(() => [window.scrollX, window.scrollY])).toEqual([0, 0])
      })
    }
  }

  for (const direction of DIRECTIONS) {
    for (const state of ['expanded', 'collapsed'] as const) {
      test(`${direction}, ${state}: the ring of the first and of the last link is whole, though the body clips what leaves it`, async ({ page }) => {
        await openLive(page, 'sidebar--long-list', { direction })
        const rail = railOf(page)
        await triggerOf(rail).focus()
        if (state === 'collapsed') await page.keyboard.press('Enter')
        await page.keyboard.press('Tab')
        await expect(linksOf(rail).first()).toBeFocused()
        await expect(linksOf(rail).first()).toHaveCSS('outline-offset', '2px')
        const first = await roomOf(bodyOf(rail))
        // Expanded, the label of the group is above the first link: 24 px of label and a 2 px gap more.
        expect([first.top, first.left, first.right], 'px above and beside the first link').toEqual([state === 'collapsed' ? 4 : 30, 4, 4])
        expect(await ringOf(page), 'the first link').toEqual(WHOLE)

        await linksOf(rail).nth(58).focus()
        await page.keyboard.press('Tab')
        await expect(linksOf(rail).last()).toBeFocused()
        expect((await roomOf(bodyOf(rail))).bottom).toBe(4)
        expect(await ringOf(page), 'the last link').toEqual(WHOLE)
      })
    }
  }

  test('the ring of the toggle is whole too, expanded and collapsed', async ({ page }) => {
    await openLive(page, 'sidebar--long-list')
    const trigger = triggerOf(railOf(page))
    await page.keyboard.press('Tab')
    await expect(trigger).toBeFocused()
    expect(await ringOf(page), 'expanded').toEqual(WHOLE)
    await trigger.focus()
    await page.keyboard.press('Enter')
    await expect(trigger).toBeFocused()
    expect(await ringOf(page), 'collapsed').toEqual(WHOLE)
  })

  for (const direction of DIRECTIONS) {
    test(`${direction}: a first link with no label above it is flush under the header, and its ring is whole there too`, async ({ page }) => {
      await openLive(page, 'sidebar--basic', { direction })
      const rail = railOf(page)
      await triggerOf(rail).focus()
      await page.keyboard.press('Tab')
      await expect(linksOf(rail).first()).toBeFocused()
      const room = await roomOf(bodyOf(rail))
      expect([room.top, room.left, room.right], 'px above and beside the first link').toEqual([4, 4, 4])
      // The body starts where the header ends: the 4 px it keeps for the ring are the gap between the two.
      expect((await boxOf(bodyOf(rail))).top).toBe((await boxOf(headerOf(rail))).bottom)
      expect(await ringOf(page)).toEqual(WHOLE)
    })
  }

  test.describe('under a finger', () => {
    for (const screen of [{ width: 320, height: 480 }, { width: 390, height: 844 }]) {
      test.describe(`${String(screen.width)} x ${String(screen.height)}`, () => {
        test.use({ hasTouch: true, isMobile: true, viewport: screen })

        for (const direction of DIRECTIONS) {
          test(`${direction}: a drag up the list scrolls the body to its last link, and the page stays put`, async ({ page }) => {
            await openLive(page, 'sidebar--long-list', { direction, tall: true })
            const rail = railOf(page)
            const body = bodyOf(rail)
            const last = linksOf(rail).last()
            const box = await boxOf(body)
            const x = box.left + box.width / 2
            await expect(last).not.toBeInViewport()
            await expect(async () => {
              await drag(page, body, x, box.bottom - 30, box.top + 30)
              const { top, room } = await scrollOf(body)
              expect(top).toBe(room)
            }).toPass()
            await expect(last).toBeInViewport({ ratio: 1 })
            // One more, past the end: the body keeps it, the page behind does not move.
            await drag(page, body, x, box.bottom - 30, box.top + 30)
            expect(await page.evaluate(() => [window.scrollX, window.scrollY])).toEqual([0, 0])
            await last.tap()
            await expect(page).toHaveURL(/#page-60$/)
          })
        }
      })
    }
  })

  test.describe('with a classic scrollbar', () => {
    for (const direction of DIRECTIONS) {
      withScrollbar(`${direction}: expanded, the thin bar takes 10 px of the body; collapsed, no bar is drawn, the icons stay under the toggle and the wheel still scrolls`, async ({ barPage: page }) => {
        await openLive(page, 'sidebar--long-list', { direction })
        const rail = railOf(page)
        const body = bodyOf(rail)
        const bar = () => body.evaluate((element) => element.getBoundingClientRect().width - element.clientWidth)
        expect(await bar()).toBe(10)
        expect(await widthOf(linksOf(rail).first())).toBe(193)

        await triggerOf(rail).click()
        expect(await bar()).toBe(0)
        const [row, icon, toggle] = [await boxOf(linksOf(rail).first()), await boxOf(linksOf(rail).first().locator('svg')), await boxOf(triggerOf(rail))]
        expect(row.width).toBe(35)
        expect((icon.left + icon.right) / 2).toBe((toggle.left + toggle.right) / 2)
        await wheelAt(page, row.left + 20, row.top + 100, 500)
        await expect.poll(async () => (await scrollOf(body)).top).toBe(500)
        expect(await liveErrors(page)).toEqual([])
      })
    }
  })
})

test.describe('inside a real layout', () => {
  for (const screen of SCREENS) {
    for (const direction of DIRECTIONS) {
      test(`${String(screen.width)} x ${String(screen.height)} ${direction}: beside a column the rail keeps its 220 and 52 px, the column takes the rest, and the page does not scroll`, async ({ page }) => {
        await page.setViewportSize(screen)
        await openLive(page, 'sidebar--in-a-layout', { direction })
        const rail = railOf(page)
        const column = page.locator('#demo nav + div')
        const shell = await boxOf(page.locator('#demo nav').locator('xpath=..'))
        for (const width of [220, 52]) {
          expect(await widthOf(rail)).toBe(width)
          // The column has 16 px of padding on each side, which is the least it can be.
          expect(await widthOf(column), `the column beside a ${String(width)} px rail`).toBe(Math.max(32, shell.width - width))
          expect(await pageRoom(page)).toEqual({ down: 0, sideways: 0 })
          expect(await faultsOf(rail)).toEqual([])
          const [a, b] = [await boxOf(rail), await boxOf(column)]
          expect(direction === 'rtl' ? a.left - b.right : b.left - a.right, 'px between the rail and the column').toBe(0)
          await triggerOf(rail).click()
        }
      })
    }
  }

  test('320 px: the table of the column scrolls inside its own box beside either rail, and never widens the column', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 480 })
    await openLive(page, 'sidebar--in-a-layout')
    const scroller = page.locator('#demo table').locator('xpath=..')
    const column = page.locator('#demo nav + div')
    // Beside the open rail the column is its own padding and the box its two 1 px lines: nothing of the table shows.
    for (const [state, width, box] of [['expanded', 32, 2], ['collapsed', 189, 157]] as const) {
      const sizes = await scroller.evaluate((element) => ({ room: element.scrollWidth - element.clientWidth, width: element.getBoundingClientRect().width }))
      expect(await widthOf(column), state).toBe(width)
      expect(sizes.width, state).toBe(box)
      expect(sizes.room, `${state}: px the table scrolls inside its box`).toBeGreaterThan(400)
      await triggerOf(railOf(page)).click()
    }
  })

  for (const screen of [{ width: 320, height: 480 }, { width: 1280, height: 800 }]) {
    for (const direction of DIRECTIONS) {
      test(`${String(screen.width)} px ${direction}: in a flex row, a grid track, a parent that fits its content and a table cell the rail is 220 px, and 52 collapsed`, async ({ page }) => {
        await page.setViewportSize(screen)
        await openFixture(page, { direction })
        await expectNoSidewaysScroll(page)
        for (const layout of ['flex', 'grid', 'fit', 'cell']) {
          const rail = page.locator(`#${layout}-rail`)
          expect(await widthOf(rail), layout).toBe(220)
          expect((await boxOf(rail)).height, layout).toBe(320)
          expect(await faultsOf(rail), layout).toEqual([])
        }
        // A column that is flex: 1 and nothing else: the table inside it scrolls, and the rail is not squeezed.
        const section = await boxOf(page.locator('#in-flex'))
        expect(await widthOf(page.locator('#flex-column'))).toBe(section.width - 220)
        expect(await widthOf(page.locator('#grid-column'))).toBe(section.width - 220)
        // A parent that fits its content is exactly as wide as the rail, in either state.
        expect(await widthOf(page.locator('#in-fit'))).toBe(220)
        for (const layout of ['flex', 'grid', 'fit', 'cell']) {
          await triggerOf(page.locator(`#${layout}-rail`)).click()
          expect(await widthOf(page.locator(`#${layout}-rail`)), `${layout}, collapsed`).toBe(52)
        }
        expect(await widthOf(page.locator('#in-fit'))).toBe(52)
        expect(await widthOf(page.locator('#flex-column'))).toBe(section.width - 52)
        await expectNoSidewaysScroll(page)
      })
    }
  }
})

test.describe('content no demo should show', () => {
  for (const screen of [{ width: 320, height: 480 }, { width: 1280, height: 800 }]) {
    for (const direction of DIRECTIONS) {
      test(`${String(screen.width)} px ${direction}: a 300-letter title, group label and link, an element for a label and an icon 400 px wide stay inside the rail`, async ({ page }) => {
        await page.setViewportSize(screen)
        await openFixture(page, { direction })
        const rail = page.locator('#hostile-rail')
        for (const state of ['expanded', 'collapsed']) {
          expect(await faultsOf(rail), state).toEqual([])
          expect((await scrollOf(bodyOf(rail))).sideways, state).toBe(0)
          await expectNoSidewaysScroll(page)
          await triggerOf(rail).click()
        }
      })
    }
  }

  test('a label of 300 characters is cut at 100 and ends in an ellipsis; one made of elements keeps its text and is clipped', async ({ page }) => {
    await openFixture(page)
    const word = page.locator('#word')
    expect((await word.textContent())?.length).toBe(100)
    const label = word.locator('> span').last()
    await expect(label).toHaveCSS('text-overflow', 'ellipsis')
    expect(await widthOf(label)).toBe(165)
    expect(await label.evaluate((element) => element.scrollWidth - element.clientWidth), 'px of the word the label cuts').toBeGreaterThan(500)

    const element = page.locator('#element')
    expect((await element.textContent())?.length).toBe(309)
    expect(await widthOf(element.locator('> span').last())).toBe(165)
    // Its beginning is what shows: the bold word starts where a plain label would.
    expect((await boxOf(element.locator('strong'))).left).toBe((await boxOf(label)).left)

    // The title and the label of the group are cut at 100 too, and end in an ellipsis in their own box.
    const title = headerOf(page.locator('#hostile-rail')).locator('span')
    expect((await title.textContent())?.length).toBe(100)
    await expect(title).toHaveCSS('text-overflow', 'ellipsis')
    expect(await widthOf(title)).toBe(171)
    const group = page.locator('#hostile-rail p').first()
    expect((await group.textContent())?.length).toBe(100)
    await expect(group).toHaveCSS('text-overflow', 'ellipsis')
    expect(await widthOf(group)).toBe(203)
  })

  test('a link with no label is still a 32 px row named by its aria-label, and one whose render element holds the text keeps its icon', async ({ page }) => {
    await openFixture(page)
    const empty = page.locator('#empty')
    expect([await widthOf(empty), (await boxOf(empty)).height]).toEqual([203, 32])
    await expect(page.getByRole('link', { name: 'Empty', exact: true })).toHaveAttribute('href', '#empty')
    // No empty span is left behind for a label that is not there.
    expect(await empty.locator('> span').count()).toBe(1)

    const own = page.locator('#own-children')
    await expect(page.getByRole('link', { name: 'Own children', exact: true })).toHaveAttribute('href', '#own-children')
    expect(await own.locator('svg').count()).toBe(1)
    await triggerOf(page.locator('#hostile-rail')).click()
    const label = await boxOf(own.locator('> span').last())
    expect([label.width, label.height], 'its label hides with the others').toEqual([1, 1])
  })

  // Not built: a letter or a tooltip for a link with no icon. The README says an icon is needed where a rail can collapse.
  test('a link with no icon is an empty 35 x 32 px row in a collapsed rail: still a stop, still named, with a ring', async ({ page }) => {
    await openFixture(page)
    const rail = page.locator('#hostile-rail')
    const bare = page.locator('#bare-row')
    await triggerOf(rail).click()
    const row = await boxOf(bare)
    expect([row.width, row.height]).toEqual([35, 32])
    const [surface, inside] = [await pixelAt(page, row.left + 2, row.top + 20), await pixelsOf(page, clipOf(row))]
    expect(inside.filter((pixel) => contrast(pixel, surface) >= 3).length, 'pixels of anything drawn in the row').toBe(0)
    await expect(page.getByRole('link', { name: 'No icon', exact: true })).toBeVisible()
    await page.locator('#wide-icon').focus()
    await page.keyboard.press('Shift+Tab')
    await expect(bare).toBeFocused()
    expect(await ringOf(page)).toEqual(WHOLE)
  })

  test('ten groups in a collapsed rail: the page is no taller for their hidden labels, which the body holds', async ({ page }) => {
    await openFixture(page)
    const rail = page.locator('#groups-rail')
    await expect(rail).toHaveAttribute('data-closed', '')
    const height = () => page.evaluate(() => document.documentElement.scrollHeight)
    const before = await height()
    // The comparison can fail: let the labels out of the body, and each is laid out against the page.
    await bodyOf(rail).evaluate((element) => { element.style.position = 'static' })
    expect(await height()).toBeGreaterThan(before + 500)
    await bodyOf(rail).evaluate((element) => { element.style.position = '' })
    expect(await height()).toBe(before)
    await expect(bodyOf(rail)).toHaveCSS('position', 'relative')
    // And the same for the label of each link: its own row holds it.
    await expect(linksOf(rail).first()).toHaveCSS('position', 'relative')
    await expect(rail.getByRole('list', { name: 'Group 10' }).getByRole('link')).toHaveCount(6)
  })

  test('a collapsed rail with no body, in a box of the page that scrolls: the rail itself holds its hidden labels', async ({ page }) => {
    await openFixture(page)
    const rail = page.locator('#loose-rail')
    await expect(rail).toHaveAttribute('data-closed', '')
    expect(await rail.locator('> .overflow-y-auto').count(), 'this rail has no SidebarBody').toBe(0)
    const height = () => page.evaluate(() => document.documentElement.scrollHeight)
    const before = await height()
    // The comparison can fail: let the labels out of the rail, and each is laid out against the page.
    await rail.evaluate((nav) => { nav.style.position = 'static' })
    expect(await height()).toBeGreaterThan(before + 500)
    await rail.evaluate((nav) => { nav.style.position = '' })
    expect(await height()).toBe(before)
    await expect(rail).toHaveCSS('position', 'relative')
    await expect(rail.getByRole('list', { name: 'Group 10' }).getByRole('link')).toHaveCount(6)
  })

  // The row keeps its 8 px of padding, which leaves 19: what is centred and does not fit spills evenly, so it stays in the middle.
  test('collapsed, an icon of 24 px is still in the middle of its 35 px row, 5.5 px from either edge', async ({ page }) => {
    await openFixture(page)
    await triggerOf(page.locator('#hostile-rail')).click()
    const [row, icon] = [await boxOf(page.locator('#big-icon')), await boxOf(page.locator('#big-icon svg'))]
    expect([row.width, icon.width]).toEqual([35, 24])
    expect((icon.left + icon.right) / 2).toBe((row.left + row.right) / 2)
    expect([icon.left - row.left, row.right - icon.right]).toEqual([5.5, 5.5])
  })

  test('a rail with no header and no icons is a plain list of links under the name its caller gave it', async ({ page }) => {
    await openFixture(page)
    const rail = page.locator('#plain-rail')
    await expect(page.getByRole('navigation', { name: 'Documentation' })).toBeVisible()
    expect(await rail.locator('button').count()).toBe(0)
    expect(await widthOf(rail)).toBe(220)
    await expect(page.getByRole('list', { name: 'Getting started' }).getByRole('link')).toHaveText(['Install', 'Theming'])
  })

  test('the scan reports a row pushed out of the rail, a body made to scroll sideways and rows that overlap', async ({ page }) => {
    await openLive(page, 'sidebar--basic')
    const rail = railOf(page)
    expect(await faultsOf(rail)).toEqual([])
    await triggerOf(rail).evaluate((button) => { button.style.marginInlineStart = '-40px' })
    expect(await faultsOf(rail)).toEqual(['button "" crosses the rail', 'svg "" crosses the rail'])
    await linksOf(rail).nth(1).evaluate((row) => { row.style.minWidth = '400px' })
    await linksOf(rail).nth(2).evaluate((row) => { row.style.marginTop = '-20px' })
    expect(await faultsOf(rail)).toEqual([
      'button "" crosses the rail', 'svg "" crosses the rail', 'div "HomeProjectsTeam" scrolls sideways', 'a "Team" lies over a "Projects"',
    ])
  })
})

/** Runs in the page: a label's direction, whether its first character is painted inside its box, and at which side. */
const startOf = (label: Locator) => label.evaluate((element) => {
  const box = element.getBoundingClientRect()
  const text = element.firstChild
  if (!text) throw new Error('the label holds no text')
  const range = document.createRange()
  range.setStart(text, 0)
  range.setEnd(text, 1)
  const first = range.getBoundingClientRect()
  return {
    direction: getComputedStyle(element).direction,
    firstShown: first.left >= box.left - 0.5 && first.right <= box.right + 0.5,
    firstAt: box.right - first.right < first.left - box.left ? 'right' : 'left',
  }
})

test.describe('a label in the other script, or in two', () => {
  for (const direction of DIRECTIONS) {
    test(`${direction} page: an English title, group label and link keep their start; a label in two scripts reads in the page direction`, async ({ page }) => {
      await openFixture(page, { direction })
      const rail = page.locator('#cut-rail')
      const english = { direction: 'ltr', firstShown: true, firstAt: 'left' }
      expect(await startOf(headerOf(rail).locator('span')), 'the title').toEqual(english)
      expect(await startOf(rail.locator('p').first()), 'the group label').toEqual(english)
      expect(await startOf(page.locator('#cut-sentence > span').last()), 'the link').toEqual(english)
      // "Wi-Fi متصل ...": in an Arabic page Wi-Fi is on the right, read first; dir="auto" would put it on the left.
      expect(await startOf(page.locator('#cut-mixed > span').last()), 'the label in two scripts')
        .toEqual({ direction, firstShown: true, firstAt: direction === 'rtl' ? 'right' : 'left' })
    })

    test(`${direction} page: a short English group label sits at the start of the rail, where its rows begin`, async ({ page }) => {
      await openFixture(page, { direction })
      const group = page.locator('#cut-short')
      const [label, list] = [await boxOf(group.locator('p')), await boxOf(group.locator('ul'))]
      expect(label.width).toBeLessThan(list.width / 2)
      expect(direction === 'rtl' ? list.right - label.right : label.left - list.left).toBe(0)
    })
  }

  test('a label whose 100th unit is half an emoji is cut before the emoji, and its name holds no half of one', async ({ page }) => {
    await openFixture(page)
    const name = await page.locator('#cut-emoji').textContent()
    expect(name).toBe('a'.repeat(99))
    await expect(page.getByRole('link', { name: 'a'.repeat(99), exact: true })).toHaveAttribute('href', '#cut-emoji')
  })
})

test.describe('direction', () => {
  /** Where the 1 px line of a rail is painted, and where its toggle, its first icon and its first label start. */
  const layoutOf = async (page: Page, rail: Locator) => {
    await rail.scrollIntoViewIfNeeded()
    const frame = await boxOf(rail)
    const middle = frame.top + frame.height - 20
    const [atLeft, inside, atRight] = [await pixelAt(page, frame.left, middle), await pixelAt(page, frame.left + 5, middle), await pixelAt(page, frame.right - 1, middle)]
    const [toggle, icon, label] = [await boxOf(triggerOf(rail)), await boxOf(linksOf(rail).first().locator('svg')), await boxOf(linksOf(rail).first().locator('> span').last())]
    return {
      line: atLeft.join() === inside.join() ? (atRight.join() === inside.join() ? 'none' : 'right') : 'left',
      toggle: { fromLeft: toggle.left - frame.left, fromRight: frame.right - toggle.right },
      icon: { fromLeft: icon.left - frame.left, fromRight: frame.right - icon.right },
      labelSide: label.left > icon.right ? 'right of the icon' : 'left of the icon',
    }
  }

  /** Which half of the toggle's icon holds more ink: the narrow column of the drawn sidebar is on its inline start. */
  const heavierHalf = async (page: Page, rail: Locator) => {
    const icon = await boxOf(triggerOf(rail).locator('svg'))
    const backdrop = await pixelAt(page, icon.left - 3, icon.top + 8)
    const ink = async (x: number) => (await pixelsOf(page, { x: Math.round(x), y: Math.round(icon.top), width: 8, height: 16 })).filter((pixel) => contrast(pixel, backdrop) >= 2).length
    const [left, right] = [await ink(icon.left), await ink(icon.left + 8)]
    return left > right ? 'left' : 'right'
  }

  test('ltr: the line is on the right of the rail, the toggle 8 px from its left, and each icon before its label', async ({ page }) => {
    await openLive(page, 'sidebar--basic')
    const rail = railOf(page)
    expect(await layoutOf(page, rail)).toEqual({
      line: 'right', toggle: { fromLeft: 8, fromRight: 188 }, icon: { fromLeft: 16, fromRight: 190 }, labelSide: 'right of the icon',
    })
    await expect(rail).toHaveCSS('border-right-width', '1px')
    await expect(rail).toHaveCSS('border-left-width', '0px')
    await expect(triggerOf(rail).locator('svg')).toHaveCSS('scale', '1')
    expect(await heavierHalf(page, rail)).toBe('left')
    expect((await boxOf(rail)).left).toBe(32)
  })

  test('rtl: the line is on the left of the rail, the toggle 8 px from its right with its icon mirrored, and each icon after its label', async ({ page }) => {
    await openLive(page, 'sidebar--basic', { direction: 'rtl' })
    const rail = railOf(page)
    expect(await layoutOf(page, rail)).toEqual({
      line: 'left', toggle: { fromLeft: 188, fromRight: 8 }, icon: { fromLeft: 190, fromRight: 16 }, labelSide: 'left of the icon',
    })
    await expect(rail).toHaveCSS('border-left-width', '1px')
    await expect(rail).toHaveCSS('border-right-width', '0px')
    await expect(triggerOf(rail).locator('svg')).toHaveCSS('scale', '-1 1')
    expect(await heavierHalf(page, rail)).toBe('right')
    // The rail starts where the page does in Arabic: at the right.
    expect((await boxOf(rail)).right).toBe(1238)
  })

  for (const direction of DIRECTIONS) {
    test(`an RTL island on the ${direction} page is laid out right to left and named in Arabic, collapsed too`, async ({ page }) => {
      await openLive(page, 'sidebar--rtl', { direction })
      const rail = railOf(page)
      await expect(page.getByRole('navigation', { name: NAMES.rtl.rail })).toBeVisible()
      await expect(triggerOf(rail)).toHaveAttribute('aria-label', NAMES.rtl.collapse)
      const layout = await layoutOf(page, rail)
      // One row lower than the basic demo: this one has a group label. The sides are what matter.
      expect({ line: layout.line, toggle: layout.toggle, labelSide: layout.labelSide }).toEqual({
        line: 'left', toggle: { fromLeft: 188, fromRight: 8 }, labelSide: 'left of the icon',
      })
      expect(await heavierHalf(page, rail)).toBe('right')
      expect((await boxOf(rail)).right).toBe(1238)
      await triggerOf(rail).click()
      await expect(triggerOf(rail)).toHaveAttribute('aria-label', NAMES.rtl.expand)
      expect(await widthOf(rail)).toBe(52)
      expect((await layoutOf(page, rail)).line).toBe('left')
      expect((await boxOf(rail)).right).toBe(1238)
    })
  }

  test('with no provider on a right-to-left page the rail is still laid out right to left, by CSS alone, and named in English', async ({ page }) => {
    await openFixture(page, { direction: 'rtl' })
    const rail = page.locator('#bare-rail')
    await expect(rail).toHaveAttribute('aria-label', 'Sidebar')
    await expect(triggerOf(rail)).toHaveAttribute('aria-label', 'Collapse the sidebar')
    const layout = await layoutOf(page, rail)
    expect([layout.line, layout.toggle.fromRight, layout.labelSide]).toEqual(['left', 8, 'left of the icon'])
    await expect(triggerOf(rail).locator('svg')).toHaveCSS('scale', '-1 1')
  })
})

for (const mode of MODES) {
  test.describe(`what is drawn, ${mode}`, () => {
    // No motion, so a colour is the settled one and not a frame of its transition.
    test.use({ reducedMotion: 'reduce' })

    for (const state of ['expanded', 'collapsed'] as const) {
      test(`${state}: the current row is told by a fill and by a heavier label; no other row has either`, async ({ page }) => {
        await openLive(page, 'sidebar--basic', { mode })
        const rail = railOf(page)
        if (state === 'collapsed') await triggerOf(rail).click()
        await page.mouse.move(700, 700)
        const [current, other] = [linksOf(rail).nth(0), linksOf(rail).nth(1)]
        const [lit, plain, frame] = [await boxOf(current), await boxOf(other), await boxOf(rail)]
        const surface = await pixelAt(page, frame.left + 3, frame.bottom - 6)
        const fill = await pixelAt(page, lit.right - 4, lit.top + 20)
        expect(fill.join(), 'the current row is filled').not.toBe(surface.join())
        expect((await pixelAt(page, plain.right - 4, plain.top + 20)).join(), 'another row is not').toBe(surface.join())
        // A fill of this weight is a colour and no more: it could not carry the state alone.
        expect(contrast(fill, surface), 'the fill against the rail').toBeLessThan(1.5)

        // No bar, as Figma 138:2539 draws it: the start of the current row is its fill like the rest of it.
        expect((await pixelAt(page, lit.left + 5, lit.top + 16)).join(), 'no bar at the start of the current row').toBe(fill.join())

        // The icon of the current row takes the colour of its label; the others are muted. Both reach 3:1.
        expect(contrast(await inkOf(page, current.locator('svg'), fill), fill), 'the icon of the current row').toBeGreaterThanOrEqual(3)
        expect(contrast(await inkOf(page, other.locator('svg'), surface), surface), 'the icon of another row').toBeGreaterThanOrEqual(3)
        await expect(current).toHaveCSS('font-weight', '600')
        await expect(other).toHaveCSS('font-weight', '400')
      })
    }

    test('the label of the current row is drawn heavier, at 4.5:1 on its fill; the others at 4.5:1 on the rail', async ({ page }) => {
      await openLive(page, 'sidebar--basic', { mode })
      const rail = railOf(page)
      await page.mouse.move(700, 700)
      const [current, other] = [linksOf(rail).nth(0), linksOf(rail).nth(1)]
      const [lit, frame] = [await boxOf(current), await boxOf(rail)]
      const [surface, fill] = [await pixelAt(page, frame.left + 3, frame.bottom - 6), await pixelAt(page, lit.right - 4, lit.top + 20)]
      expect(contrast(await inkOf(page, current.locator('> span').last(), fill), fill)).toBeGreaterThanOrEqual(4.5)
      expect(contrast(await inkOf(page, other.locator('> span').last(), surface), surface)).toBeGreaterThanOrEqual(4.5)
      expect(contrast(await inkOf(page, triggerOf(rail), surface), surface), 'the icon of the toggle').toBeGreaterThanOrEqual(3)
      // Drawn, not only computed: one phrase is wider at the weight of the current row than at the weight of another.
      const widths = await other.evaluate((row) => [400, 600].map((weight) => {
        const probe = document.createElement('span')
        probe.textContent = 'Projects and settings'
        probe.style.cssText = `position:absolute;white-space:nowrap;font:inherit;font-weight:${String(weight)}`
        row.append(probe)
        const { width } = probe.getBoundingClientRect()
        probe.remove()
        return width
      }))
      expect((widths[1] ?? 0) - (widths[0] ?? 0), `px wider at 600 than at 400: ${widths.join(' against ')}`).toBeGreaterThan(2)
    })

    test('a row answers the pointer with a fill, the current one does not change, and the muted icon keeps 3:1 on that fill', async ({ page }) => {
      await openLive(page, 'sidebar--basic', { mode })
      const rail = railOf(page)
      await page.mouse.move(700, 700)
      const [current, other] = [linksOf(rail).nth(0), linksOf(rail).nth(1)]
      const [lit, plain, frame] = [await boxOf(current), await boxOf(other), await boxOf(rail)]
      const surface = await pixelAt(page, frame.left + 3, frame.bottom - 6)
      const fill = await pixelAt(page, lit.right - 4, lit.top + 20)

      await page.mouse.move(plain.left + 150, plain.top + 20)
      const hover = await pixelAt(page, plain.right - 4, plain.top + 20)
      expect(hover.join(), 'the row under the pointer is filled').not.toBe(surface.join())
      expect(hover.join(), 'in the neutral tint, not the tint of the current row').not.toBe(fill.join())
      expect(contrast(await inkOf(page, other.locator('svg'), hover), hover), 'the muted icon on the hover fill').toBeGreaterThanOrEqual(3)
      expect(contrast(await inkOf(page, other.locator('> span').last(), hover), hover), 'the label on the hover fill').toBeGreaterThanOrEqual(4.5)

      await page.mouse.move(lit.left + 150, lit.top + 20)
      expect((await pixelAt(page, lit.right - 4, lit.top + 20)).join(), 'the current row under the pointer').toBe(fill.join())
      expect((await pixelAt(page, plain.right - 4, plain.top + 20)).join(), 'the row the pointer left').toBe(surface.join())
    })

    test('the ring of a focused row and of the toggle reaches 3:1 against the rail', async ({ page }) => {
      await openLive(page, 'sidebar--basic', { mode })
      const rail = railOf(page)
      const frame = await boxOf(rail)
      const surface = await pixelAt(page, frame.left + 3, frame.bottom - 6)
      await page.keyboard.press('Tab')
      await expect(triggerOf(rail)).toBeFocused()
      const toggle = await boxOf(triggerOf(rail))
      expect(contrast(await pixelAt(page, toggle.left - 3, toggle.top + 12), surface), 'the ring of the toggle').toBeGreaterThanOrEqual(3)
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')
      const row = await boxOf(linksOf(rail).nth(1))
      expect(contrast(await pixelAt(page, row.left + 100, row.top - 3), surface), 'the ring of a row').toBeGreaterThanOrEqual(3)
    })
  })
}

for (const scheme of ['light', 'dark'] as const) {
  test.describe(`forced colours, ${scheme} palette`, () => {
    test.use({ forcedColors: 'active', colorScheme: scheme, reducedMotion: 'reduce' })

    for (const state of ['expanded', 'collapsed'] as const) {
      test(`${state}: the rail keeps its line, and the current row is filled with the highlight where no other row is`, async ({ page }) => {
        await openLive(page, 'sidebar--basic')
        expect(await page.evaluate(() => matchMedia('(forced-colors: active)').matches)).toBe(true)
        const system = await systemColours(page)
        const [canvas, highlight, highlightText, text] = [system.canvas, system.highlight, system.highlightText, system.text].map((colour) => rgbOf(colour).join())
        const rail = railOf(page)
        if (state === 'collapsed') await triggerOf(rail).click()
        await page.mouse.move(700, 700)
        const frame = await boxOf(rail)
        // Every fill is gone: the rail is the canvas, and its line is what is left of its edge.
        expect((await pixelAt(page, frame.left + 3, frame.bottom - 6)).join()).toBe(canvas)
        expect((await pixelAt(page, frame.right - 1, frame.bottom - 20)).join(), 'the line on the inline end').toBe(text)
        expect((await pixelAt(page, frame.right, frame.bottom - 20)).join(), 'the page beside it').toBe(canvas)

        const [current, other] = [linksOf(rail).nth(0), linksOf(rail).nth(1)]
        const [lit, plain] = [await boxOf(current), await boxOf(other)]
        await expect(current).toHaveCSS('background-color', system.highlight)
        await expect(current).toHaveCSS('color', system.highlightText)
        expect((await pixelAt(page, lit.right - 4, lit.top + 20)).join(), 'the current row, painted').toBe(highlight)
        expect((await pixelAt(page, plain.right - 4, plain.top + 20)).join(), 'another row, painted').toBe(canvas)
        // The bar is the colour of the text of the highlight, on the highlight.
        expect((await pixelAt(page, lit.left + 5, lit.top + 20)).join(), 'the bar').toBe(highlightText)
        expect(contrast(await inkOf(page, current.locator('svg'), rgbOf(system.highlight)), rgbOf(system.highlight)), 'the icon on the highlight').toBeGreaterThanOrEqual(4.5)
        expect(contrast(await inkOf(page, other.locator('svg'), rgbOf(system.canvas)), rgbOf(system.canvas)), 'the icon of another row').toBeGreaterThanOrEqual(4.5)
        expect(contrast(await inkOf(page, triggerOf(rail), rgbOf(system.canvas)), rgbOf(system.canvas)), 'the icon of the toggle').toBeGreaterThanOrEqual(4.5)
      })
    }

    test('the label of the current row is painted on the highlight with no backplate, and stays so under the pointer and while pressed', async ({ page }) => {
      await openLive(page, 'sidebar--basic')
      const system = await systemColours(page)
      const highlight = rgbOf(system.highlight)
      const current = linksOf(railOf(page)).first()
      const lit = await boxOf(current)
      const label = await pixelsOf(page, clipOf(await boxOf(current.locator('> span').last())))
      expect(label.filter((pixel) => pixel.join() === highlight.join()).length, 'px of highlight around the label').toBeGreaterThan(200)
      expect(label.filter((pixel) => contrast(pixel, highlight) >= 4.5).length, 'px of label at 4.5:1 on the highlight').toBeGreaterThan(40)

      await page.mouse.move(lit.left + 150, lit.top + 20)
      await expect(current).toHaveCSS('background-color', system.highlight)
      expect((await pixelAt(page, lit.right - 4, lit.top + 20)).join(), 'under the pointer').toBe(highlight.join())
      await page.mouse.down()
      await expect(current).toHaveCSS('background-color', system.highlight)
      await page.mouse.move(700, 700)
      await page.mouse.up()
    })

    test('the ring of a focused row, of the current row and of the toggle is whole', async ({ page }) => {
      await openLive(page, 'sidebar--basic')
      const rail = railOf(page)
      await page.keyboard.press('Tab')
      await expect(triggerOf(rail)).toBeFocused()
      expect(await ringOf(page), 'the toggle').toEqual(WHOLE)
      await triggerOf(rail).focus()
      await page.keyboard.press('Tab')
      await expect(linksOf(rail).first()).toBeFocused()
      // The current row paints its own colours here, its ring too: the text colour of the canvas it is drawn on.
      await expect(linksOf(rail).first()).toHaveCSS('outline-color', (await systemColours(page)).text)
      expect(await ringOf(page), 'the current row').toEqual(WHOLE)
      await linksOf(rail).first().focus()
      await page.keyboard.press('Tab')
      expect(await ringOf(page), 'another row').toEqual(WHOLE)
    })
  })
}

test.describe('under a coarse pointer', () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } })

  for (const demo of Object.keys(SIDEBARS)) {
    test(`${demo}: the toggle and every link are at least 44 px both ways, expanded and collapsed, and a collapsed rail is 61 px wide`, async ({ page }) => {
      await openLive(page, demo)
      expect(await page.evaluate(() => matchMedia('(pointer: coarse)').matches)).toBe(true)
      const rail = railOf(page)
      const small = () => rail.locator('button, a').evaluateAll((all) => all.map((element) => {
        const { width, height } = element.getBoundingClientRect()
        return { name: element.getAttribute('aria-label') ?? element.textContent, width, height }
      }).filter((size) => size.width < 44 || size.height < 44))
      for (let press = 0; press < 2; press++) {
        const open = (await rail.getAttribute('data-open')) === ''
        expect(await small(), open ? 'expanded' : 'collapsed').toEqual([])
        // 44 px of target, 8 px of padding on each side and the 1 px line: the rail is never narrower than what it holds.
        expect(await widthOf(rail)).toBe(open ? 220 : 61)
        expect((await scrollOf(bodyOf(rail))).sideways, 'px the body scrolls sideways').toBe(0)
        await expectNoSidewaysScroll(page)
        await triggerOf(rail).tap()
      }
    })
  }

  test('collapsed, a 44 px row fits the rail exactly, with the icon in its middle under the toggle', async ({ page }) => {
    await openLive(page, 'sidebar--collapsed')
    const rail = railOf(page)
    const [frame, toggle, row, icon] = [await boxOf(rail), await boxOf(triggerOf(rail)), await boxOf(linksOf(rail).first()), await boxOf(linksOf(rail).first().locator('svg'))]
    expect([row.width, row.height, toggle.width, toggle.height]).toEqual([44, 44, 44, 44])
    expect([row.left - frame.left, frame.right - row.right]).toEqual([8, 9])
    expect((icon.left + icon.right) / 2).toBe((toggle.left + toggle.right) / 2)
  })

  test('a tap on the toggle collapses the rail, and a tap on a collapsed link follows it', async ({ page }) => {
    await openLive(page, 'sidebar--basic')
    const rail = railOf(page)
    await triggerOf(rail).tap()
    expect(await widthOf(rail)).toBe(61)
    await linksOf(rail).nth(2).tap()
    await expect(page).toHaveURL(/#team$/)
  })
})

test.describe('text that is made larger or spaced out', () => {
  test('1280 px with the root at 32 px: the rail is 440 px and 104 collapsed, a row 64 px tall, and every label is whole', async ({ page }) => {
    await openLive(page, 'sidebar--groups')
    await page.addStyleTag({ content: 'html { font-size: 32px !important }' })
    const rail = railOf(page)
    expect(await widthOf(rail)).toBe(440)
    const rows = await linksOf(rail).evaluateAll((all) => all.map((row) => {
      const label = row.querySelector(':scope > span:last-child') as HTMLElement
      return { height: row.getBoundingClientRect().height, font: getComputedStyle(row).fontSize, cut: label.scrollWidth > label.clientWidth }
    }))
    expect(new Set(rows.map((row) => `${String(row.height)} ${row.font} ${String(row.cut)}`))).toEqual(new Set(['64 28px false']))
    expect(await faultsOf(rail)).toEqual([])
    await expectNoSidewaysScroll(page)
    await triggerOf(rail).click()
    expect(await widthOf(rail)).toBe(104)
    expect(await faultsOf(rail)).toEqual([])
  })

  for (const direction of DIRECTIONS) {
    test(`320 px ${direction} with the root at 32 px: the rail is as wide as its parent and no wider, its labels end in an ellipsis, and the page does not scroll sideways`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 480 })
      await openLive(page, 'sidebar--long-list', { direction })
      await page.addStyleTag({ content: 'html { font-size: 32px !important }' })
      const rail = railOf(page)
      const parent = await boxOf(rail.locator('xpath=..'))
      // 440 px of rail in 177 px of page: it gives way, where the page would have scrolled sideways.
      expect(parent.width).toBe(177)
      expect(await widthOf(rail)).toBe(177)
      expect(await pageRoom(page)).toEqual({ down: 0, sideways: 0 })
      expect(await faultsOf(rail)).toEqual([])
      const label = linksOf(rail).first().locator('> span').last()
      await expect(label).toHaveCSS('text-overflow', 'ellipsis')
      expect(await label.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(true)
      await triggerOf(rail).click()
      expect(await widthOf(rail)).toBe(104)
      expect(await pageRoom(page)).toEqual({ down: 0, sideways: 0 })
      expect(await faultsOf(rail)).toEqual([])
    })

    test(`320 px ${direction} with the spacing of WCAG 1.4.12: no label leaves its row and nothing scrolls sideways`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 480 })
      await openLive(page, 'sidebar--groups', { direction })
      await page.addStyleTag({ content: '* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important }' })
      const rail = railOf(page)
      await expectNoSidewaysScroll(page)
      expect(await faultsOf(rail)).toEqual([])
      const spills = await rail.locator('a, p, button + span').evaluateAll((all) => all.map((element) => {
        const range = document.createRange()
        range.selectNodeContents(element)
        const [box, ink] = [element.getBoundingClientRect(), range.getBoundingClientRect()]
        return Math.max(0, box.top - ink.top, ink.bottom - box.bottom)
      }))
      expect(spills).toHaveLength(9)
      expect(spills.filter((spill) => spill > 0.5)).toEqual([])
    })
  }

  // The rail gives way to its parent at a 32 px root; a column beside it must give way too, by going under it.
  for (const { width, page: room, rail: railWidth } of [{ width: 320, page: 305, rail: 177 }, { width: 390, page: 375, rail: 247 }]) {
    for (const direction of DIRECTIONS) {
      test(`${String(width)} px ${direction} with the root at 32 px: the controlled demo's button goes under the rail, whole on the page, expanded and collapsed`, async ({ page }) => {
        await page.setViewportSize({ width, height: 480 })
        await openLive(page, 'sidebar--controlled', { direction })
        await page.addStyleTag({ content: 'html { font-size: 32px !important }' })
        const rail = railOf(page)
        expect(await page.evaluate(() => document.body.clientWidth)).toBe(room)
        for (const [name, expected] of [['Hide the labels', railWidth], ['Show the labels', 104]] as const) {
          const button = page.getByRole('button', { name })
          expect(await widthOf(rail)).toBe(expected)
          const [frame, box] = [await boxOf(rail), await boxOf(button)]
          expect(box.top, `"${name}" starts under the rail`).toBeGreaterThanOrEqual(frame.bottom)
          expect([box.left >= 0, box.right <= room], `"${name}" is whole between the edges of the page`).toEqual([true, true])
          await expectNoSidewaysScroll(page)
          await button.click()
        }
      })

      test(`${String(width)} px ${direction} with the root at 32 px: in a layout the column stays beside the rail, whole on the page, and the page does not scroll sideways`, async ({ page }) => {
        await page.setViewportSize({ width, height: 480 })
        await openLive(page, 'sidebar--in-a-layout', { direction })
        await page.addStyleTag({ content: 'html { font-size: 32px !important }' })
        const column = await boxOf(page.locator('#demo nav + div'))
        expect([column.left >= 0, column.right <= room], 'the column is whole between the edges of the page').toEqual([true, true])
        await expectNoSidewaysScroll(page)
        expect(await faultsOf(railOf(page))).toEqual([])
      })
    }
  }
})

// A mouse keeps the page's scrollbar gutter, 15 px that isMobile has not: 320 px is the reflow width of WCAG 1.4.10.
test.describe('a mouse at 320 x 480, with the scrollbar gutter', () => {
  test.use({ viewport: { width: 320, height: 480 } })

  for (const demo of Object.keys(SIDEBARS)) {
    for (const direction of DIRECTIONS) {
      test(`${demo} ${direction}: the page does not scroll sideways, expanded or collapsed`, async ({ page }) => {
        await openLive(page, demo, { direction })
        const rail = railOf(page)
        expect(await page.evaluate(() => document.body.clientWidth), 'px of page beside the gutter').toBe(305)
        for (let press = 0; press < 2; press++) {
          await expectNoSidewaysScroll(page)
          expect(await faultsOf(rail)).toEqual([])
          await triggerOf(rail).click()
        }
      })
    }
  }
})

test.describe('motion', () => {
  /** Presses the toggle and reads the width of the rail on each of the next twelve frames. */
  const framesAfterPress = (rail: Locator) => rail.evaluate(async (nav) => {
    nav.querySelector('button')?.click()
    const seen: number[] = []
    for (let frame = 0; frame < 12; frame++) {
      await new Promise((resolve) => { requestAnimationFrame(resolve) })
      seen.push(nav.getBoundingClientRect().width)
    }
    return { widths: [...new Set(seen)], animations: nav.getAnimations().length }
  })

  test('no width animation exists: the rail is 52 px on the first frame after a press, and nothing animates on it', async ({ page }) => {
    await openLive(page, 'sidebar--basic')
    const rail = railOf(page)
    await expect(rail).toHaveCSS('transition-duration', '0s')
    expect(await framesAfterPress(rail)).toEqual({ widths: [52], animations: 0 })
    expect(await framesAfterPress(rail)).toEqual({ widths: [220], animations: 0 })
  })

  test('a row changes colour over 150 ms, and its width is not among what it animates', async ({ page }) => {
    await openLive(page, 'sidebar--basic')
    const row = linksOf(railOf(page)).nth(1)
    await expect(row).toHaveCSS('transition-duration', '0.15s')
    await expect(row).toHaveCSS('transition-property', 'color, background-color, border-color, outline-color, opacity, translate')
  })

  test.describe('reduced', () => {
    test.use({ reducedMotion: 'reduce' })

    test('with prefers-reduced-motion a row changes at once, and the toggle works as before', async ({ page }) => {
      await openLive(page, 'sidebar--basic')
      const rail = railOf(page)
      await expect(linksOf(rail).nth(1)).toHaveCSS('transition-duration', '0s')
      expect(await framesAfterPress(rail)).toEqual({ widths: [52], animations: 0 })
    })
  })
})

test.describe('axe on the hydrated rail', () => {
  for (const demo of Object.keys(SIDEBARS)) {
    for (const mode of MODES) {
      for (const direction of DIRECTIONS) {
        test(`${demo} ${mode} ${direction}: no violation, as it loads and with its toggle pressed`, async ({ page }) => {
          await openLive(page, demo, { mode, direction })
          await atRest(page)
          const first = await axe(page)
          expect(first.violations).toEqual([])
          // Not an empty run: axe did read the links, the list items, the landmark and the name of the toggle. It decides
          // nothing about contrast here: it cannot parse oklch(... none). Contrast is read from the pixels above.
          expect(first.passes).toEqual(expect.arrayContaining(['link-name', 'button-name', 'listitem', 'aria-allowed-attr', 'landmark-unique']))
          await triggerOf(railOf(page)).click()
          await atRest(page)
          expect((await axe(page)).violations).toEqual([])
        })
      }
    }
  }

  test('sixty links: axe has checked that the body that scrolls can be reached, and it can: by its links', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 480 })
    await openLive(page, 'sidebar--long-list')
    const found = await axe(page)
    expect(found.violations).toEqual([])
    expect(found.passes).toContain('scrollable-region-focusable')
    await expect(bodyOf(railOf(page))).not.toHaveAttribute('tabindex')
  })

  test('the content no demo should show: no violation either, expanded or collapsed', async ({ page }) => {
    await openFixture(page)
    expect((await axe(page, '#hostile')).violations).toEqual([])
    expect((await axe(page, '#no-header')).violations).toEqual([])
    await triggerOf(page.locator('#hostile-rail')).click()
    expect((await axe(page, '#hostile')).violations).toEqual([])
    expect((await axe(page, '#many-groups')).violations).toEqual([])
  })
})

test.describe('axe on a 320 x 480 phone', () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 320, height: 480 } })

  for (const demo of Object.keys(SIDEBARS)) {
    test(`${demo}: no violation, and the page does not scroll sideways`, async ({ page }) => {
      await openLive(page, demo)
      await atRest(page)
      expect((await axe(page)).violations).toEqual([])
      await expectNoSidewaysScroll(page)
      expect(await faultsOf(railOf(page))).toEqual([])
    })
  }
})
