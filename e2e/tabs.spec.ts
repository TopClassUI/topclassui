import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Locator, type Page } from '@playwright/test'

import { DIRECTIONS, MODES, type Direction } from '../scripts/lib/harness.js'
import { type LiveOptions, expectNoSidewaysScroll, liveErrors, liveUrl, openLive } from './live.js'
import { DEMOS } from './pages.js'
import { type Clip, type Rgb, contrast, pixelsOf, rgbOf } from './pixels.js'

// What happy-dom cannot lay out: a list that scrolls inside itself, a ring a clipping box could cut, a bar
// that must sit on a line, the keys in a real browser, and what forced colours leave of a fill.

/** Every demo, and how many lists of tabs it holds. Written out, so a renamed demo fails here. */
const TABS: Record<string, number> = {
  'tabs--basic': 1,
  'tabs--controlled': 1,
  'tabs--disabled': 2,
  'tabs--enclosed': 1,
  'tabs--long-label': 2,
  'tabs--many': 2,
  'tabs--rtl': 1,
  'tabs--server-content': 1,
  'tabs--sizes': 12,
  'tabs--skeleton': 10,
}

/** The three screens Unit 3 measures at, and a phone on its side. */
const SCREENS = [{ width: 320, height: 480 }, { width: 390, height: 844 }, { width: 1280, height: 800 }, { width: 844, height: 390 }] as const

const LOOKS = ['line', 'enclosed'] as const

/** Tabs in the layouts and with the content no demo should show, loaded into a live page. */
const FIXTURE = '/e2e/fixtures/tabs.tsx'

async function openFixture(page: Page, options: LiveOptions = {}): Promise<void> {
  await openLive(page, 'tabs--basic', options)
  await page.addScriptTag({ type: 'module', url: FIXTURE })
  await expect(page.locator('#tabs-fixture')).toHaveAttribute('data-ready', '')
}

const listIn = (page: Page, root: string) => page.locator(`${root} [role="tablist"]`).first()
const tabsIn = (list: Locator) => list.locator('[role="tab"]')
const focusedText = (page: Page) => page.evaluate(() => document.activeElement?.textContent ?? null)
const selectedIn = (list: Locator) => list.locator('[aria-selected="true"]').evaluateAll((all) => all.map((tab) => tab.textContent))

/** The one panel shown in a root: Base UI keeps the panel it closes until its exit animation ends, a frame at least. */
async function shownPanel(page: Page, root: string): Promise<Locator> {
  const shown = page.locator(`${root} [role="tabpanel"]:visible`)
  await expect(shown).toHaveCount(1)
  return shown
}

/** Presses a key and waits until the focus rests on the tab with that text: Base UI moves it in a microtask. */
async function press(page: Page, key: string, lands: string): Promise<void> {
  await page.keyboard.press(key)
  await expect.poll(() => focusedText(page), { message: `${key} did not land on ${lands}` }).toBe(lands)
}

/** The keys that go to the next and to the previous tab, as the direction has them. */
const keysOf = (direction: Direction) => (direction === 'rtl'
  ? { next: 'ArrowLeft', previous: 'ArrowRight' } as const
  : { next: 'ArrowRight', previous: 'ArrowLeft' } as const)

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

interface Box { left: number, top: number, right: number, bottom: number, width: number, height: number }

const boxOf = (target: Locator) => target.evaluate((element): Box => {
  const { left, top, right, bottom, width, height } = element.getBoundingClientRect()
  return { left, top, right, bottom, width, height }
})

/** How much of the focused tab lies outside the box its list shows, on each side. Zero and zero is a whole tab. */
const cutOf = (list: Locator) => list.evaluate((element) => {
  const tab = document.activeElement?.getBoundingClientRect()
  if (!tab) throw new Error('nothing is focused')
  const left = element.getBoundingClientRect().left + element.clientLeft
  const round = (value: number) => Math.round(Math.max(0, value) * 10) / 10
  return { left: round(left - tab.left), right: round(tab.right - (left + element.clientWidth)) }
})

const scrollOf = (list: Locator) => list.evaluate((element) => ({
  at: Math.round(element.scrollLeft), room: element.scrollWidth - element.clientWidth,
}))

interface Ring {
  /** Ring pixels on the line through the middle of each side, from 6 px outside the box to 8 px inside it. */
  left: number, right: number, top: number, bottom: number
  /** How many of those lie outside the box. */
  outside: number
  /** Rows and columns that are ring for at least nine tenths of the box, above, below and beside its middle. */
  rows: { above: number, below: number }, columns: { before: number, after: number }
}

/**
 * The ring of the focused element, read as the pixels that change when it loses the focus. Whatever the ring
 * is drawn on and in whatever colour, a pixel a clipping box cut is a pixel that did not change. Leaves it blurred.
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

  const fullRows = run(clip.height).filter((row) => count(run(clip.width).map((column) => [column, row])) >= (R - L) * 0.9)
  const fullColumns = run(clip.width).filter((column) => count(run(clip.height).map((row) => [column, row])) >= (B - T) * 0.9)
  return {
    left: count(run(PAD + 8).map((step) => [L - PAD + step, midRow])),
    right: count(run(PAD + 8).map((step) => [R - 8 + step, midRow])),
    top: count(run(PAD + 8).map((step) => [midColumn, T - PAD + step])),
    bottom: count(run(PAD + 8).map((step) => [midColumn, B - 8 + step])),
    outside: count([
      ...run(PAD).flatMap((step): [number, number][] => [[L - PAD + step, midRow], [R + step, midRow]]),
      ...run(PAD).flatMap((step): [number, number][] => [[midColumn, T - PAD + step], [midColumn, B + step]]),
    ]),
    rows: { above: fullRows.filter((row) => row < midRow).length, below: fullRows.filter((row) => row > midRow).length },
    columns: { before: fullColumns.filter((column) => column < midColumn).length, after: fullColumns.filter((column) => column > midColumn).length },
  }
}

const pixelAt = async (page: Page, x: number, y: number): Promise<Rgb> => (await pixelsOf(page, { x: Math.round(x), y: Math.round(y), width: 1, height: 1 }))[0] ?? [0, 0, 0]

/** A column of pixels read downwards, as text, so a failure prints the colours. */
const columnAt = async (page: Page, x: number, top: number, height: number) =>
  (await pixelsOf(page, { x: Math.round(x), y: Math.round(top), width: 1, height })).map((pixel) => pixel.join(','))

test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

test('the table names every tabs demo', () => {
  expect(Object.keys(TABS).sort()).toEqual(DEMOS.filter((demo) => demo.startsWith('tabs--')).sort())
  expect(Object.keys(TABS)).toHaveLength(10)
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

  test('holds the text of the two panels that are not open, each in a panel marked hidden', async ({ page }) => {
    const html = await served(page, 'tabs--basic')
    const panels = html.match(/<div [^>]*role="tabpanel"[^>]*>[^<]*<\/div>/g) ?? []
    expect(panels).toHaveLength(3)
    expect(panels.map((panel) => panel.includes(' hidden=""'))).toEqual([false, true, true])
    expect(panels[1]).toContain('>Three people edited this project today.</div>')
    expect(panels[2]).toContain('>Only an owner can rename or delete this project.</div>')
  })

  test('holds what a Server Component put in each panel: a list in the hidden one, a form field in the open one', async ({ page }) => {
    const html = await served(page, 'tabs--server-content')
    const [hidden, shown] = [html.slice(html.indexOf(' hidden=""'), html.lastIndexOf('role="tabpanel"')), html.slice(html.lastIndexOf('role="tabpanel"'))]
    expect(hidden).toContain('<li>Yousef Nasser</li>')
    expect(shown).toContain('<label for="demo-invite"')
    expect(shown).toContain('name="email"')
  })

  // Base UI serves every tab at tabindex -1: ours keeps the one the page opens on in the tab order.
  test('keeps one tab of each list in the tab order, the selected one, in every demo', async ({ page }) => {
    for (const [demo, lists] of Object.entries(TABS)) {
      const tabs = (await served(page, demo)).match(/<button [^>]*role="tab"[^>]*>/g) ?? []
      const stops = tabs.filter((tab) => tab.includes(' tabindex="0"'))
      expect(stops.length, demo).toBe(lists)
      expect(stops.filter((tab) => !tab.includes(' aria-selected="true"')), demo).toEqual([])
    }
  })

  test('opens on the tab its defaultValue names: one tab selected and one panel shown, with no script', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false })
    const page = await context.newPage()
    await page.goto(liveUrl('tabs--basic'))
    await expect(page.locator('#demo [role="tab"][aria-selected="true"]')).toHaveText('Overview')
    await expect(page.locator('#demo [role="tabpanel"]:visible')).toHaveText('Revenue is up 12% against last quarter.')
    await expect(page.locator('#demo [role="tabpanel"]')).toHaveCount(3)
    // And the Tab key reaches that tab, then its panel: nothing else in the list is a stop.
    await page.keyboard.press('Tab')
    await expect(page.locator('#demo [role="tab"]').first()).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(page.locator('#demo [role="tabpanel"]').first()).toBeFocused()
    await context.close()
  })

  test('once hydrated there is still one tab stop a list, and it follows the arrow keys', async ({ page }) => {
    await openLive(page, 'tabs--basic')
    const stops = () => page.locator('#demo [role="tab"]').evaluateAll((tabs) => tabs.map((tab) => tab.getAttribute('tabindex')))
    expect(await stops()).toEqual(['0', '-1', '-1'])
    await page.locator('#demo [role="tab"]').first().focus()
    await press(page, 'ArrowRight', 'Activity')
    expect(await stops()).toEqual(['-1', '0', '-1'])
  })
})

test.describe('a panel that is not open', () => {
  test('is in the document, not visible, and out of reach of a screen reader: hidden and inert', async ({ page }) => {
    await openLive(page, 'tabs--basic')
    const panels = page.locator('#demo [role="tabpanel"]')
    await expect(panels).toHaveCount(3)
    await expect(panels.nth(0)).toBeVisible()
    for (const index of [1, 2]) {
      await expect(panels.nth(index)).toBeHidden()
      await expect(panels.nth(index)).toHaveCSS('display', 'none')
      await expect(panels.nth(index)).toHaveAttribute('hidden', '')
      await expect(panels.nth(index)).toHaveAttribute('inert', '')
      await expect(panels.nth(index)).toHaveAttribute('tabindex', '-1')
    }
    // By role, which is what a screen reader walks: one panel, named by its tab.
    await expect(page.getByRole('tabpanel')).toHaveCount(1)
    await expect(page.getByRole('tabpanel', { name: 'Overview' })).toHaveText('Revenue is up 12% against last quarter.')
    await expect(page.getByText('Three people edited this project today.')).toBeHidden()
  })

  test('keeps its controls out of the tab order until its tab is opened', async ({ page }) => {
    await openFixture(page)
    const visited: string[] = []
    await tabsIn(listIn(page, '#controls')).first().focus()
    for (let step = 0; step < 4; step++) {
      visited.push(await page.evaluate(() => {
        const element = document.activeElement
        return `${element?.getAttribute('role') ?? element?.tagName.toLowerCase() ?? ''} ${element?.textContent ?? ''}`
      }))
      await page.keyboard.press('Tab')
    }
    // The tab, its panel, the button in that panel, then the next list: never the button of the hidden panel.
    expect(visited).toEqual(['tab Stop', 'tabpanel Inside the stop', 'button Inside the stop', 'tab Shown'])
    await expect(page.getByRole('button', { name: 'Inside no stop' })).toHaveCount(0)
    await expect(page.locator('#controls button', { hasText: 'Inside no stop' })).toBeHidden()
  })

  test('keeps what it holds from a screen reader until its tab is opened: the list of the server-content demo', async ({ page }) => {
    await openLive(page, 'tabs--server-content')
    await expect(page.getByRole('textbox', { name: 'Email' })).toBeVisible()
    await expect(page.getByRole('listitem')).toHaveCount(0)
    await page.getByRole('tab', { name: 'Members' }).click()
    await expect(page.getByRole('listitem')).toHaveCount(4)
    await expect(page.getByRole('textbox')).toHaveCount(0)
    await page.keyboard.press('Tab')
    await expect(page.getByRole('tabpanel', { name: 'Members' })).toBeFocused()
  })

  test('a panel given keepMounted={false} is not in the document at all until its tab is opened', async ({ page }) => {
    await openFixture(page)
    await expect(page.locator('#unmounted [role="tabpanel"]')).toHaveCount(1)
    await page.locator('#unmounted [role="tab"]').nth(1).click()
    await expect(await shownPanel(page, '#unmounted')).toHaveText('Heavy panel')
  })
})

// The ARIA Authoring Practices pattern for tabs, every key, in both directions.
for (const direction of DIRECTIONS) {
  test.describe(`the keyboard, ${direction}`, () => {
    const { next, previous } = keysOf(direction)

    test(`${next} goes to the next tab and ${previous} back, and neither opens it: Enter and Space do`, async ({ page }) => {
      await openLive(page, 'tabs--many', { direction })
      const list = listIn(page, '#demo')
      await tabsIn(list).first().focus()
      await press(page, next, 'Activity')
      await press(page, next, 'Members')
      await press(page, previous, 'Activity')
      expect(await selectedIn(list)).toEqual(['Overview'])

      await page.keyboard.press('Enter')
      await expect.poll(() => selectedIn(list)).toEqual(['Activity'])
      await expect(page.getByRole('tabpanel', { name: 'Activity' }).first()).toHaveText('Everything under Activity.')
      await press(page, next, 'Members')
      await page.keyboard.press('Space')
      await expect.poll(() => selectedIn(list)).toEqual(['Members'])
    })

    test('Home goes to the first tab, End to the last, and the arrows go round at both ends', async ({ page }) => {
      await openLive(page, 'tabs--many', { direction })
      await tabsIn(listIn(page, '#demo')).nth(3).focus()
      await press(page, 'End', 'Changelog')
      await press(page, next, 'Overview')
      await press(page, previous, 'Changelog')
      await press(page, 'Home', 'Overview')
    })

    test('the next tab is the one drawn after this one: on the far side of it, the way the page reads', async ({ page }) => {
      await openLive(page, 'tabs--many', { direction })
      const list = listIn(page, '#demo')
      await tabsIn(list).first().focus()
      const before = await page.evaluate(() => document.activeElement?.getBoundingClientRect().left ?? 0)
      await press(page, next, 'Activity')
      const after = await page.evaluate(() => document.activeElement?.getBoundingClientRect().left ?? 0)
      expect(direction === 'rtl' ? after < before : after > before, `Activity at ${String(after)}, Overview at ${String(before)}`).toBe(true)
    })

    test('a disabled tab is a stop that says it is disabled, and Enter and Space on it open nothing', async ({ page }) => {
      await openLive(page, 'tabs--disabled', { direction })
      const list = listIn(page, '#demo')
      await tabsIn(list).first().focus()
      await press(page, next, 'Changelog')
      await expect(tabsIn(list).nth(1)).toHaveAttribute('aria-disabled', 'true')
      await page.keyboard.press('Enter')
      await page.keyboard.press('Space')
      await press(page, next, 'Props')
      expect(await selectedIn(list)).toEqual(['Overview'])
      await expect(page.getByRole('tabpanel').first()).toHaveText('Version 2.4 ships on Monday.')
    })

    test('with activateOnFocus an arrow opens the tab it lands on, and passes over a disabled one without opening it', async ({ page }) => {
      await openFixture(page, { direction })
      const list = listIn(page, '#auto')
      await tabsIn(list).first().focus()
      await press(page, next, 'Two')
      expect(await selectedIn(list)).toEqual(['One'])
      await press(page, next, 'Three')
      await expect.poll(() => selectedIn(list)).toEqual(['Three'])
      await expect(await shownPanel(page, '#auto')).toHaveText('Panel three')
    })

    test('with loopFocus off the arrows stop at the first and at the last tab', async ({ page }) => {
      await openFixture(page, { direction })
      await tabsIn(listIn(page, '#no-loop')).first().focus()
      await page.keyboard.press(previous)
      await press(page, next, 'Two')
      await page.keyboard.press(next)
      await page.keyboard.press(next)
      expect(await focusedText(page)).toBe('Two')
    })
  })
}

test.describe('direction comes from the provider', () => {
  test('an RTL island on a left-to-right page: ArrowLeft is the next tab, which is drawn to the left', async ({ page }) => {
    await openLive(page, 'tabs--rtl', { direction: 'ltr' })
    const tabs = tabsIn(listIn(page, '#demo'))
    await tabs.first().focus()
    await press(page, 'ArrowLeft', 'النشاط')
    await press(page, 'ArrowLeft', 'الإعدادات')
    await press(page, 'ArrowRight', 'النشاط')
    expect((await boxOf(tabs.nth(1))).left).toBeLessThan((await boxOf(tabs.nth(0))).left)
  })

  // R-13-1 asks the app for a provider. With none Base UI stays left to right, which the README says.
  test('with no provider on a right-to-left page the arrows stay left to right, against the way the tabs are drawn', async ({ page }) => {
    await openFixture(page, { direction: 'rtl' })
    const tabs = tabsIn(listIn(page, '#bare'))
    await tabs.first().focus()
    await press(page, 'ArrowRight', 'Two')
    expect((await boxOf(tabs.nth(1))).left).toBeLessThan((await boxOf(tabs.nth(0))).left)
  })
})

test.describe('the panel is a tab stop', () => {
  test('Tab goes from the active tab to its panel, then to the first control inside it', async ({ page }) => {
    await openFixture(page)
    await tabsIn(listIn(page, '#controls')).first().focus()
    await page.keyboard.press('Tab')
    await expect(page.locator('#controls [role="tabpanel"]:visible')).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(page.getByRole('button', { name: 'Inside the stop' })).toBeFocused()
    await page.keyboard.press('Shift+Tab')
    await page.keyboard.press('Shift+Tab')
    await expect(tabsIn(listIn(page, '#controls')).first()).toBeFocused()
  })

  test('with tabIndex={-1} on the panel, Tab goes from the tab straight to the control', async ({ page }) => {
    await openFixture(page)
    await tabsIn(listIn(page, '#controls')).nth(1).click()
    await expect(await shownPanel(page, '#controls')).toHaveAttribute('tabindex', '-1')
    await page.keyboard.press('Tab')
    await expect(page.getByRole('button', { name: 'Inside no stop' })).toBeFocused()
  })

  for (const look of LOOKS) {
    for (const direction of DIRECTIONS) {
      test(`${look} ${direction}: the ring of a focused panel is whole on all four sides, clear of the list above it`, async ({ page }) => {
        await openLive(page, look === 'line' ? 'tabs--basic' : 'tabs--enclosed', { direction })
        const panel = page.locator('#demo [role="tabpanel"]:visible')
        await tabsIn(listIn(page, '#demo')).first().focus()
        await page.keyboard.press('Tab')
        await expect(panel).toBeFocused()
        await expect(panel).toHaveCSS('outline-style', 'solid')
        await expect(panel).toHaveCSS('outline-offset', '2px')
        // 16 px under the list: the ring reaches 4.
        expect((await boxOf(panel)).top - (await boxOf(listIn(page, '#demo'))).bottom).toBe(16)

        const ring = await ringOf(page)
        expect(ring.rows, 'rows of ring above and below the panel').toEqual({ above: 2, below: 2 })
        expect(ring.columns, 'columns of ring before and after the panel').toEqual({ before: 2, after: 2 })
      })
    }
  }
})

test.describe('eight tabs on a 320 px screen', () => {
  test.use({ viewport: { width: 320, height: 480 } })

  for (const direction of DIRECTIONS) {
    for (const [index, look] of LOOKS.entries()) {
      test(`${look} ${direction}: the list scrolls inside itself and the page does not`, async ({ page }) => {
        await openLive(page, 'tabs--many', { direction })
        const list = page.locator('#demo [role="tablist"]').nth(index)
        await expectNoSidewaysScroll(page)
        expect((await scrollOf(list)).room, 'px the list scrolls sideways').toBeGreaterThan(400)
        const [frame, demo] = [await boxOf(list), await boxOf(page.locator('#demo'))]
        expect(frame.left).toBeGreaterThanOrEqual(demo.left)
        expect(frame.right).toBeLessThanOrEqual(demo.right)
        await expect(list).toHaveCSS('overflow-x', 'auto')
        await expect(list).toHaveCSS('overscroll-behavior-x', 'contain')
      })

      test(`${look} ${direction}: every tab the keyboard reaches is whole inside the list, forward and back`, async ({ page }) => {
        await openLive(page, 'tabs--many', { direction })
        const list = page.locator('#demo [role="tablist"]').nth(index)
        const { next, previous } = keysOf(direction)
        const names = ['Overview', 'Activity', 'Members', 'Billing', 'Integrations', 'Security', 'Notifications', 'Changelog']
        await tabsIn(list).first().focus()
        const cut: string[] = []
        const visit = async (key: string, name: string) => {
          await press(page, key, name)
          const { left, right } = await cutOf(list)
          if (left > 0 || right > 0) cut.push(`${name} after ${key}: ${String(left)} px at the left, ${String(right)} at the right`)
        }
        for (const name of names.slice(1)) await visit(next, name)
        for (const name of names.slice(0, -1).reverse()) await visit(previous, name)
        await visit('End', 'Changelog')
        await visit('Home', 'Overview')
        expect(cut).toEqual([])
        expect(await page.evaluate(() => window.scrollX), 'px the page moved sideways').toBe(0)
      })

      test(`${look} ${direction}: the ring of the tab at either end of the list is whole, inside the tab`, async ({ page }) => {
        await openLive(page, 'tabs--many', { direction })
        const list = page.locator('#demo [role="tablist"]').nth(index)
        const tabs = tabsIn(list)
        await tabs.first().focus()
        await press(page, 'End', 'Changelog')
        await expect(tabs.last()).toHaveCSS('outline-style', 'solid')
        await expect(tabs.last()).toHaveCSS('outline-offset', '-2px')
        expect((await scrollOf(list)).at, 'the list is scrolled to its end').not.toBe(0)
        const atEnd = await ringOf(page)
        expect([atEnd.left, atEnd.right, atEnd.top, atEnd.bottom].every((side) => side >= 2), `ring px on each side at the end: ${JSON.stringify(atEnd)}`).toBe(true)
        expect(atEnd.outside, 'ring px outside the tab').toBe(0)

        await tabs.last().focus()
        await press(page, 'Home', 'Overview')
        const atStart = await ringOf(page)
        expect([atStart.left, atStart.right, atStart.top, atStart.bottom].every((side) => side >= 2), `ring px on each side at the start: ${JSON.stringify(atStart)}`).toBe(true)
        expect(atStart.outside).toBe(0)
      })
    }

    test(`${direction}: a wheel turned sideways over the list scrolls the list to its end, and never the page`, async ({ page }) => {
      await openLive(page, 'tabs--many', { direction })
      const list = listIn(page, '#demo')
      const frame = await boxOf(list)
      const towardsEnd = direction === 'rtl' ? -4000 : 4000
      await page.mouse.move(frame.left + 80, frame.top + 20)
      await page.mouse.wheel(towardsEnd, 0)
      await expect.poll(async () => Math.abs((await scrollOf(list)).at)).toBeGreaterThan(600)
      await expect(tabsIn(list).last()).toBeInViewport({ ratio: 1 })
      await page.mouse.wheel(towardsEnd, 0)
      expect(await page.evaluate(() => window.scrollX)).toBe(0)
    })

    test(`${direction}: hydration leaves both lists where the server HTML drew them, and no tab moves`, async ({ browser, page }) => {
      const where = (into: Page) => into.locator('#demo [role="tablist"]').evaluateAll((lists) => lists.map((list) => {
        const first = list.querySelector('[role="tab"]')?.getBoundingClientRect()
        return `scrollLeft ${String(list.scrollLeft)}, first tab ${String(first?.left)}..${String(first?.right)}`
      }))
      const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 480 } })
      const served = await context.newPage()
      await served.goto(liveUrl('tabs--many', { direction }))
      const before = await where(served)
      await context.close()
      await openLive(page, 'tabs--many', { direction })
      await atRest(page)
      expect(before).toHaveLength(2)
      expect(await where(page)).toEqual(before)
    })
  }
})

test.describe('under a finger', () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 320, height: 480 } })

  /** A finger dragged sideways, as raw touch events: Playwright has no swipe. */
  async function drag(page: Page, y: number, fromX: number, toX: number): Promise<void> {
    const session = await page.context().newCDPSession(page)
    const frames = () => page.evaluate(() => new Promise<void>((resolve) => { requestAnimationFrame(() => { requestAnimationFrame(() => { resolve() }) }) }))
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: fromX, y }] })
    for (let step = 1; step <= 12; step++) {
      await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: fromX + ((toX - fromX) * step) / 12, y }] })
      await frames()
    }
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    await session.detach()
  }

  for (const direction of DIRECTIONS) {
    test(`${direction}: a drag along the list scrolls it until the last tab is whole in view, and the page stays put`, async ({ page }) => {
      await openLive(page, 'tabs--many', { direction })
      const list = listIn(page, '#demo')
      const frame = await boxOf(list)
      const [from, to] = direction === 'rtl' ? [40, 280] : [280, 40]
      await expect(tabsIn(list).last()).not.toBeInViewport()
      await expect(async () => {
        await drag(page, frame.top + 20, from, to)
        const { at, room } = await scrollOf(list)
        expect(Math.abs(at)).toBeGreaterThanOrEqual(room - 1)
      }).toPass()
      const [last, box] = [await boxOf(tabsIn(list).last()), await boxOf(list)]
      expect(last.left).toBeGreaterThanOrEqual(box.left - 0.5)
      expect(last.right).toBeLessThanOrEqual(box.right + 0.5)
      expect(await page.evaluate(() => [window.scrollX, window.scrollY])).toEqual([0, 0])
    })
  }

  for (const demo of Object.keys(TABS)) {
    test(`${demo}: every tab is at least 44 px wide and 44 px tall`, async ({ page }) => {
      await openLive(page, demo)
      expect(await page.evaluate(() => matchMedia('(pointer: coarse)').matches)).toBe(true)
      const sizes = await page.locator('#demo [role="tab"]').evaluateAll((tabs) => tabs.map((tab) => {
        const { width, height } = tab.getBoundingClientRect()
        return { name: tab.textContent, width, height }
      }))
      expect(sizes.length).toBeGreaterThanOrEqual(2)
      expect(sizes.filter((size) => size.width < 44 || size.height < 44)).toEqual([])
      await expectNoSidewaysScroll(page)
    })
  }

  test('an empty tab is still a 44 px target', async ({ page }) => {
    await openFixture(page)
    const empty = await boxOf(page.getByRole('tab', { name: 'Empty' }).first())
    expect([empty.width, empty.height]).toEqual([44, 44])
  })
})

test.describe('inside a real layout, and with content no demo should show', () => {
  for (const screen of SCREENS) {
    for (const direction of DIRECTIONS) {
      test(`${String(screen.width)} x ${String(screen.height)} ${direction}: no list widens its parent, and the page does not scroll sideways`, async ({ page }) => {
        await page.setViewportSize(screen)
        await openFixture(page, { direction })
        await expectNoSidewaysScroll(page)
        const found = await page.evaluate(() => {
          const width = document.body.clientWidth
          const crossing: string[] = []
          const wider: string[] = []
          for (const element of document.querySelectorAll('#tabs-fixture *, #bare, #bare *')) {
            const box = element.getBoundingClientRect()
            // A tab past the edge of its list is what the list clips: only what is outside every list can cross.
            const clipped = element.closest('[role="tablist"]') !== null && element.getAttribute('role') !== 'tablist'
            if (box.width > 0 && !clipped && (box.left < -0.5 || box.right > width + 0.5)) crossing.push(element.id || element.tagName.toLowerCase())
          }
          for (const root of document.querySelectorAll('#tabs-fixture [data-variant]')) {
            const [own, parent] = [root.getBoundingClientRect(), root.parentElement?.getBoundingClientRect()]
            if (parent && own.width > parent.width + 0.5) wider.push(root.id)
            const list = root.querySelector('[role="tablist"]')?.getBoundingClientRect()
            if (list && list.width > own.width + 0.5) wider.push(`the list of ${root.id}`)
          }
          return { crossing, wider }
        })
        expect(found).toEqual({ crossing: [], wider: [] })
      })
    }
  }

  test('320 px: in a grid track, a flex column, a w-fit parent and a table cell, eight tabs scroll inside their list', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 480 })
    await openFixture(page)
    for (const layout of ['grid', 'flex', 'fit', 'cell']) {
      for (const look of LOOKS) {
        const list = listIn(page, `#${layout}-${look}`)
        expect((await scrollOf(list)).room, `${layout} ${look}: px the list scrolls`).toBeGreaterThan(300)
        await tabsIn(list).first().focus()
        await press(page, 'End', 'Changelog')
        expect(await cutOf(list), `${layout} ${look}: the last tab, brought into view`).toEqual({ left: 0, right: 0 })
      }
    }
  })

  for (const direction of DIRECTIONS) {
    // The list starts 104 px into its offset parent here. Base UI measures a tab from its own offset parent.
    test(`${direction}: beside a column, every tab the keyboard reaches is still whole inside its list`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 480 })
      await openFixture(page, { direction })
      const { next, previous } = keysOf(direction)
      for (const look of LOOKS) {
        const list = listIn(page, `#flex-${look}`)
        const names = ['Activity', 'Members', 'Billing', 'Integrations', 'Security', 'Notifications', 'Changelog']
        await tabsIn(list).first().focus()
        const cut: string[] = []
        const visit = async (key: string, name: string) => {
          await press(page, key, name)
          const { left, right } = await cutOf(list)
          if (left > 0 || right > 0) cut.push(`${name} after ${key}: ${String(left)} left, ${String(right)} right`)
        }
        for (const name of names) await visit(next, name)
        for (const name of ['Notifications', 'Security', 'Integrations', 'Billing', 'Members', 'Activity', 'Overview']) await visit(previous, name)
        expect(cut, look).toEqual([])
      }
    })
  }

  test('at 1280 px the enclosed list is as wide as its tabs, and the line list as wide as its root', async ({ page }) => {
    await openFixture(page)
    const [enclosed, line, root] = [await boxOf(listIn(page, '#grid-enclosed')), await boxOf(listIn(page, '#grid-line')), await boxOf(page.locator('#grid-line'))]
    expect(line.width).toBe(root.width)
    expect(enclosed.width).toBeLessThan(root.width - 200)
    const last = await boxOf(tabsIn(listIn(page, '#grid-enclosed')).last())
    // The box ends its 4 px of padding after its last tab.
    expect(Math.round(enclosed.right - last.right)).toBe(4)
  })

  for (const look of LOOKS) {
    test(`${look}: a label of 300 characters is cut at 100, ends in an ellipsis and is no wider than its list`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 480 })
      await openFixture(page)
      const list = listIn(page, `#word-${look}`)
      const tab = tabsIn(list).first()
      const label = tab.locator('span')
      expect((await tab.textContent())?.length).toBe(100)
      expect((await boxOf(tab)).width).toBeLessThanOrEqual((await boxOf(list)).width)
      await expect(label).toHaveCSS('text-overflow', 'ellipsis')
      expect(await label.evaluate((element) => element.scrollWidth > element.clientWidth + 100), 'the label is cut by its box').toBe(true)
      // The tab after it is still reached: the list scrolls to it.
      await tab.focus()
      await press(page, 'ArrowRight', 'Next')
      expect(await cutOf(list)).toEqual({ left: 0, right: 0 })
      // And the same word in the panel breaks instead of running off the page.
      const panel = await boxOf(page.locator(`#word-${look} [role="tabpanel"]:visible`))
      expect(panel.height, 'px of panel: the word wrapped onto many lines').toBeGreaterThan(200)
    })

    test(`${look}: a tab that holds elements where text is expected clips them, and shows their beginning`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 480 })
      await openFixture(page)
      const tab = tabsIn(listIn(page, `#element-${look}`)).first()
      const [frame, bold] = [await boxOf(tab), await boxOf(tab.locator('strong'))]
      expect(frame.width).toBeLessThanOrEqual((await boxOf(listIn(page, `#element-${look}`))).width)
      await expect(tab).toHaveCSS('overflow', 'hidden')
      // Centred content that overflows would lose its first word past the start edge. It starts inside the padding.
      expect(bold.left).toBeGreaterThanOrEqual(frame.left)
      expect(bold.left - frame.left).toBeLessThan(40)
    })
  }

  test('an empty tab is a 24 px target at least, and a tab holding one space too', async ({ page }) => {
    await openFixture(page)
    for (const tab of await tabsIn(listIn(page, '#element-line')).all()) {
      const box = await boxOf(tab)
      expect(box.width).toBeGreaterThanOrEqual(24)
      expect(box.height).toBe(40)
    }
  })

  test('sixty tabs: End brings the sixtieth whole into view, and Home the first', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 480 })
    await openFixture(page)
    for (const look of LOOKS) {
      const list = listIn(page, `#sixty-${look}`)
      await expect(tabsIn(list)).toHaveCount(60)
      await tabsIn(list).first().focus()
      await press(page, 'End', 'Tab 60')
      expect(await cutOf(list), look).toEqual({ left: 0, right: 0 })
      await press(page, 'Home', 'Tab 1')
      expect(await cutOf(list), look).toEqual({ left: 0, right: 0 })
    }
  })

  test('tabs inside a panel take the look of their own root: xs line tabs inside lg enclosed ones', async ({ page }) => {
    await openFixture(page)
    const [outer, inner] = [tabsIn(listIn(page, '#outer')).first(), tabsIn(listIn(page, '#inner')).first()]
    expect((await boxOf(outer)).height).toBe(48)
    expect((await boxOf(inner)).height).toBe(28)
    await expect(inner).toHaveCSS('border-bottom-width', '2px')
    await expect(outer).toHaveCSS('border-bottom-width', '0px')
  })

  test('with no defaultValue the first tab opens once the page has hydrated', async ({ page }) => {
    await openFixture(page)
    await expect(page.locator('#no-default [role="tab"][aria-selected="true"]')).toHaveText('First')
    await expect(page.locator('#no-default [role="tabpanel"]:visible')).toHaveText('Panel of the first')
  })
})

for (const mode of MODES) {
  test.describe(`what is drawn, ${mode}`, () => {
    test('line: the bar of the active tab sits on the line of the list and covers it, and the line runs on beside it', async ({ page }) => {
      await openLive(page, 'tabs--basic', { mode })
      await atRest(page)
      const list = listIn(page, '#demo')
      const [frame, active, other] = [await boxOf(list), await boxOf(tabsIn(list).nth(0)), await boxOf(tabsIn(list).nth(1))]
      // No border on the list: a tab is as tall as its list, so its bar reaches the row the line is on.
      expect(frame.height).toBe(40)
      expect(active.bottom).toBe(frame.bottom)

      const backdrop = (await pixelAt(page, frame.left + 2, frame.bottom + 6)).join(',')
      const bar = (await pixelAt(page, active.left + active.width / 2, frame.bottom - 1)).join(',')
      const line = (await pixelAt(page, other.left + other.width / 2, frame.bottom - 1)).join(',')
      expect(new Set([backdrop, bar, line]).size, `page ${backdrop}, bar ${bar}, line ${line}: three colours`).toBe(3)
      // Read downwards through the last four rows of the list and the two under it.
      expect(await columnAt(page, active.left + active.width / 2, frame.bottom - 4, 6), 'under the active tab').toEqual([backdrop, backdrop, bar, bar, backdrop, backdrop])
      expect(await columnAt(page, other.left + other.width / 2, frame.bottom - 4, 6), 'under another tab').toEqual([backdrop, backdrop, backdrop, line, backdrop, backdrop])
      expect(await columnAt(page, frame.right - 20, frame.bottom - 4, 6), 'at the far end of the list').toEqual([backdrop, backdrop, backdrop, line, backdrop, backdrop])
      expect(contrast(rgbOf(`rgb(${bar})`), rgbOf(`rgb(${backdrop})`)), 'the bar against the page').toBeGreaterThanOrEqual(3)
    })

    test('line: the bar is as wide as its tab, so the active tab is told by a shape and not only by its colour', async ({ page }) => {
      await openLive(page, 'tabs--basic', { mode })
      await atRest(page)
      const list = listIn(page, '#demo')
      const [frame, active] = [await boxOf(list), await boxOf(tabsIn(list).nth(0))]
      const bar = (await pixelAt(page, active.left + active.width / 2, frame.bottom - 2)).join(',')
      const row = await pixelsOf(page, { x: Math.round(frame.left), y: Math.round(frame.bottom - 2), width: Math.round(frame.width), height: 1 })
      const painted = row.filter((pixel) => pixel.join(',') === bar).length
      expect(painted, 'px of bar in the row above the line').toBeGreaterThanOrEqual(Math.floor(active.width) - 1)
      expect(painted).toBeLessThanOrEqual(Math.ceil(active.width))
    })

    test('enclosed: the active tab is a raised box with a shadow inside the tinted list, and the others have no fill', async ({ page }) => {
      await openLive(page, 'tabs--enclosed', { mode })
      await atRest(page)
      const list = listIn(page, '#demo')
      const [active, other] = [tabsIn(list).nth(0), tabsIn(list).nth(1)]
      const fills = {
        list: await list.evaluate((element) => getComputedStyle(element).backgroundColor),
        active: await active.evaluate((element) => getComputedStyle(element).backgroundColor),
        other: await other.evaluate((element) => getComputedStyle(element).backgroundColor),
      }
      expect(fills.other).toBe('rgba(0, 0, 0, 0)')
      expect(fills.active).not.toBe(fills.list)
      await expect(active).not.toHaveCSS('box-shadow', 'none')
      await expect(other).toHaveCSS('box-shadow', 'none')
      // The list hugs its tabs: 4 px of padding round a 40 px row.
      expect((await boxOf(list)).height).toBe(48)
    })

    // WCAG 1.4.11: the raised fill is near the tint of the list, so the state needs an edge of its own.
    test('enclosed: the active tab has an edge of 3:1 against the list, and its label is heavier than the same label at rest', async ({ page }) => {
      await openLive(page, 'tabs--enclosed', { mode })
      await atRest(page)
      const list = listIn(page, '#demo')
      const [frame, active, other] = [await boxOf(list), await boxOf(tabsIn(list).nth(0)), await boxOf(tabsIn(list).nth(1))]
      const tint = await pixelAt(page, frame.left + 2, frame.top + frame.height / 2)
      const edges = {
        top: await pixelAt(page, active.left + active.width / 2, active.top),
        bottom: await pixelAt(page, active.left + active.width / 2, active.bottom - 1),
        start: await pixelAt(page, active.left, active.top + active.height / 2),
        end: await pixelAt(page, active.right - 1, active.top + active.height / 2),
      }
      for (const [side, pixel] of Object.entries(edges)) {
        expect(contrast(pixel, tint), `${side} edge ${pixel.join(',')} on the list ${tint.join(',')}`).toBeGreaterThanOrEqual(3)
      }
      const rest = await pixelAt(page, other.left + other.width / 2, other.top)
      expect(contrast(rest, tint), `a tab at rest has no edge: ${rest.join(',')}`).toBeLessThan(1.1)

      const label = (index: number) => tabsIn(list).nth(index).locator('span').evaluate((element) => element.getBoundingClientRect().width)
      const wide = await label(0)
      await tabsIn(list).nth(1).click()
      await atRest(page)
      expect(wide - await label(0), 'px the same label loses when its tab is no longer active').toBeGreaterThanOrEqual(1)
    })

    for (const look of LOOKS) {
      test(`${look}: the ring of a focused disabled tab keeps 3:1 against what is beside it, while its label is dimmed`, async ({ page }) => {
        await openLive(page, 'tabs--disabled', { mode })
        const list = page.locator('#demo [role="tablist"]').nth(look === 'line' ? 0 : 1)
        const disabled = tabsIn(list).nth(1)
        await tabsIn(list).first().focus()
        await press(page, 'ArrowRight', 'Changelog')
        await atRest(page)
        await expect(disabled).toHaveCSS('opacity', '1')
        await expect(disabled.locator('span')).toHaveCSS('opacity', '0.5')
        const box = await boxOf(disabled)
        const middle = box.top + box.height / 2
        const [ring, beside] = [await pixelAt(page, Math.floor(box.left) + 1, middle), await pixelAt(page, Math.floor(box.left) + 5, middle)]
        expect(contrast(ring, beside), `ring ${ring.join(',')} beside ${beside.join(',')}`).toBeGreaterThanOrEqual(3)
      })
    }
  })
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
  return { canvas: read('Canvas'), text: read('CanvasText'), highlight: read('Highlight'), highlightText: read('HighlightText'), gray: read('GrayText') }
})

for (const scheme of ['light', 'dark'] as const) {
  test.describe(`forced colours, ${scheme} palette`, () => {
    // No motion, so a colour is the settled one and not a frame of its transition.
    test.use({ forcedColors: 'active', colorScheme: scheme, reducedMotion: 'reduce' })

    test('line: only the active tab has a bar, in the highlight; the bar of every other tab is the page', async ({ page }) => {
      await openLive(page, 'tabs--disabled')
      expect(await page.evaluate(() => matchMedia('(forced-colors: active)').matches)).toBe(true)
      const system = await systemColours(page)
      const list = listIn(page, '#demo')
      const [active, disabled, other] = [tabsIn(list).nth(0), tabsIn(list).nth(1), tabsIn(list).nth(2)]
      await expect(active).toHaveCSS('border-bottom-color', system.highlight)
      await expect(other).toHaveCSS('border-bottom-color', system.canvas)
      await expect(disabled).toHaveCSS('border-bottom-color', system.canvas)

      // Painted, not only computed: the row of the bar, in the middle of each tab.
      const bars: string[] = []
      for (const tab of [active, disabled, other]) {
        const box = await boxOf(tab)
        bars.push((await pixelAt(page, box.left + box.width / 2, box.bottom - 1)).join(','))
      }
      expect(bars).toEqual([rgbOf(system.highlight).join(','), rgbOf(system.canvas).join(','), rgbOf(system.canvas).join(',')])
    })

    test('line: the list keeps its line, as a border, since forced colours erase the shadow that drew it', async ({ page }) => {
      await openLive(page, 'tabs--disabled')
      const list = listIn(page, '#demo')
      await expect(list).toHaveCSS('box-shadow', 'none')
      await expect(list).toHaveCSS('border-bottom-width', '1px')
      const frame = await boxOf(list)
      expect(frame.height).toBe(41)
      const system = await systemColours(page)
      expect((await pixelAt(page, frame.right - 20, frame.bottom - 1)).join(','), 'the last row of the list, away from any tab').not.toBe(rgbOf(system.canvas).join(','))
    })

    test('enclosed: the active tab is filled with the highlight and read in its text colour; no other tab is filled', async ({ page }) => {
      await openLive(page, 'tabs--disabled')
      const system = await systemColours(page)
      const list = page.locator('#demo [role="tablist"]').nth(1)
      const [active, other] = [tabsIn(list).nth(0), tabsIn(list).nth(2)]
      await expect(active).toHaveCSS('background-color', system.highlight)
      await expect(active).toHaveCSS('color', system.highlightText)
      // shadow-none leaves a list of shadows with no colour and no size: nothing of it is painted.
      expect((await active.evaluate((element) => getComputedStyle(element).boxShadow)).replaceAll('rgba(0, 0, 0, 0) 0px 0px 0px 0px', '').replace(/[, ]/g, '')).toBe('')
      await expect(other).toHaveCSS('color', system.text)

      const [fill, canvas] = [rgbOf(system.highlight).join(','), rgbOf(system.canvas).join(',')]
      const [lit, plain] = [await boxOf(active), await boxOf(other)]
      // Away from the glyphs and the rounded corners: 6 px in from the start edge, at mid height.
      expect((await pixelAt(page, lit.left + 6, lit.top + lit.height / 2)).join(',')).toBe(fill)
      expect((await pixelAt(page, plain.left + 6, plain.top + plain.height / 2)).join(',')).toBe(canvas)
      // The label is painted on the fill, with no backplate over it.
      const label = await pixelsOf(page, { x: Math.round(lit.left + 16), y: Math.round(lit.top + 12), width: Math.round(lit.width - 32), height: 16 })
      expect(label.filter((pixel) => pixel.join(',') === fill).length, 'px of fill around the label').toBeGreaterThan(200)
      expect(label.filter((pixel) => contrast(pixel, rgbOf(system.highlight)) >= 4.5).length, 'px of label at 4.5:1 on the fill').toBeGreaterThan(40)
    })

    test('enclosed: the list keeps an edge on every side, since forced colours erase its tint', async ({ page }) => {
      await openLive(page, 'tabs--disabled')
      const system = await systemColours(page)
      const list = page.locator('#demo [role="tablist"]').nth(1)
      await expect(list).toHaveCSS('outline-style', 'solid')
      await expect(list).toHaveCSS('outline-width', '1px')
      const frame = await boxOf(list)
      const canvas = rgbOf(system.canvas).join(',')
      const middle = { x: frame.left + frame.width / 2, y: frame.top + frame.height / 2 }
      const edges = {
        top: await pixelAt(page, middle.x, frame.top - 1), bottom: await pixelAt(page, middle.x, frame.bottom),
        left: await pixelAt(page, frame.left - 1, middle.y), right: await pixelAt(page, frame.right, middle.y),
      }
      for (const [side, pixel] of Object.entries(edges)) expect(pixel.join(','), `the ${side} edge`).not.toBe(canvas)
    })

    for (const [index, look] of LOOKS.entries()) {
      test(`${look}: a disabled tab is read in the system's grey at full opacity, where another tab is read in the text colour`, async ({ page }) => {
        await openLive(page, 'tabs--disabled')
        const system = await systemColours(page)
        const list = page.locator('#demo [role="tablist"]').nth(index)
        const [disabled, other] = [tabsIn(list).nth(1), tabsIn(list).nth(2)]
        expect(system.gray).not.toBe(system.text)
        await expect(disabled).toHaveCSS('color', system.gray)
        await expect(disabled.locator('span')).toHaveCSS('opacity', '1')
        await expect(other).toHaveCSS('color', system.text)
        const box = await boxOf(disabled.locator('span'))
        const glyphs = await pixelsOf(page, { x: Math.round(box.left), y: Math.round(box.top), width: Math.round(box.width), height: Math.round(box.height) })
        expect(glyphs.filter((pixel) => pixel.join(',') === rgbOf(system.gray).join(',')).length, 'px of the label in the grey').toBeGreaterThan(20)
      })
    }

    test('enclosed: the ring of the focused active tab is drawn in the text colour of the highlight, so it shows on the fill', async ({ page }) => {
      await openLive(page, 'tabs--disabled')
      const system = await systemColours(page)
      const list = page.locator('#demo [role="tablist"]').nth(1)
      const active = tabsIn(list).nth(0)
      await tabsIn(list).nth(2).focus()
      await press(page, 'Home', 'Overview')
      await expect(active).toHaveCSS('outline-color', system.highlightText)
      const box = await boxOf(active)
      const middle = box.top + box.height / 2
      const [ring, beside] = [await pixelAt(page, Math.floor(box.left) + 1, middle), await pixelAt(page, Math.floor(box.left) + 5, middle)]
      expect([ring.join(','), beside.join(',')]).toEqual([rgbOf(system.highlightText).join(','), rgbOf(system.highlight).join(',')])
    })

    test('line: the ring of a focused tab that is not active is whole, in a system colour', async ({ page }) => {
      await openLive(page, 'tabs--disabled')
      const list = listIn(page, '#demo')
      await tabsIn(list).first().focus()
      await press(page, 'End', 'Props')
      const ring = await ringOf(page)
      expect([ring.left, ring.right, ring.top, ring.bottom]).toEqual([2, 2, 2, 2])
    })
  })
}

test.describe('text that is made larger or spaced out', () => {
  test.use({ viewport: { width: 320, height: 480 } })

  for (const direction of DIRECTIONS) {
    test(`${direction}: with the root at 32 px every tab doubles in height and the page still does not scroll sideways`, async ({ page }) => {
      await openLive(page, 'tabs--many', { direction })
      await page.addStyleTag({ content: 'html { font-size: 32px !important }' })
      await expectNoSidewaysScroll(page)
      const tabs = await page.locator('#demo [role="tab"]').evaluateAll((all) => all.map((tab) => {
        const range = document.createRange()
        range.selectNodeContents(tab)
        const [box, ink] = [tab.getBoundingClientRect(), range.getBoundingClientRect()]
        return { height: box.height, font: getComputedStyle(tab).fontSize, spill: Math.max(0, box.top - ink.top, ink.bottom - box.bottom) }
      }))
      expect(new Set(tabs.map((tab) => `${String(tab.height)} ${tab.font}`))).toEqual(new Set(['80 28px']))
      expect(tabs.filter((tab) => tab.spill > 0.5)).toEqual([])
    })

    test(`${direction}: with the spacing of WCAG 1.4.12 no label leaves its tab and the page does not scroll sideways`, async ({ page }) => {
      await openLive(page, 'tabs--many', { direction })
      await page.addStyleTag({ content: '* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important }' })
      await expectNoSidewaysScroll(page)
      const spills = await page.locator('#demo [role="tab"]').evaluateAll((all) => all.map((tab) => {
        const range = document.createRange()
        range.selectNodeContents(tab)
        const [box, ink] = [tab.getBoundingClientRect(), range.getBoundingClientRect()]
        return Math.max(0, box.top - ink.top, ink.bottom - box.bottom, box.left - ink.left, ink.right - box.right)
      }))
      expect(spills.filter((spill) => spill > 0.5)).toEqual([])
    })
  }
})

test.describe('motion', () => {
  test('a tab changes colour over 150 ms', async ({ page }) => {
    await openLive(page, 'tabs--basic')
    await expect(page.locator('#demo [role="tab"]').first()).toHaveCSS('transition-duration', '0.15s')
  })

  test.describe('reduced', () => {
    test.use({ reducedMotion: 'reduce' })

    test('with prefers-reduced-motion it changes at once, and a click still opens its panel', async ({ page }) => {
      await openLive(page, 'tabs--basic')
      const tabs = page.locator('#demo [role="tab"]')
      await expect(tabs.first()).toHaveCSS('transition-duration', '0s')
      await tabs.nth(1).click()
      await expect(page.getByRole('tabpanel', { name: 'Activity' })).toHaveText('Three people edited this project today.')
    })
  })
})

/** axe on the demo alone: landmarks and document structure belong to the docs app, not to a component. */
async function axe(page: Page, scope = '#demo'): Promise<{ violations: string[], passes: string[] }> {
  const results = await new AxeBuilder({ page }).include(scope).analyze()
  return {
    violations: results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`),
    passes: results.passes.map((pass) => pass.id),
  }
}

test.describe('axe on the hydrated tabs', () => {
  for (const demo of Object.keys(TABS)) {
    for (const mode of MODES) {
      for (const direction of DIRECTIONS) {
        test(`${demo} ${mode} ${direction}: no violation, on the tab it opens on and on its last tab`, async ({ page }) => {
          await openLive(page, demo, { mode, direction })
          await atRest(page)
          const first = await axe(page)
          expect(first.violations).toEqual([])
          // Not an empty run: axe did read the tabs and what they need around them.
          expect(first.passes).toEqual(expect.arrayContaining(['aria-required-children', 'aria-required-parent', 'aria-valid-attr-value']))

          await page.locator('#demo [role="tab"]:not([aria-disabled="true"])').last().click()
          await atRest(page)
          expect((await axe(page)).violations).toEqual([])
        })
      }
    }
  }

  test('the content no demo should show: no violation either', async ({ page }) => {
    await openFixture(page)
    expect((await axe(page, '#tabs-fixture')).violations).toEqual([])
  })
})

test.describe('axe on a 320 x 480 phone', () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 320, height: 480 } })

  for (const demo of Object.keys(TABS)) {
    test(`${demo}: no violation`, async ({ page }) => {
      await openLive(page, demo)
      await atRest(page)
      expect((await axe(page)).violations).toEqual([])
    })
  }
})
