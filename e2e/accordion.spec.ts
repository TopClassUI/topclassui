import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Locator, type Page } from '@playwright/test'

import { DIRECTIONS, MODES } from '../scripts/lib/harness.js'
import { type LiveOptions, expectNoSidewaysScroll, liveErrors, liveUrl, openLive } from './live.js'
import { DEMOS } from './pages.js'
import { FORCED_CANVAS, type Rgb, inkOn, paintedIn, pixelsOf } from './pixels.js'

// What happy-dom cannot lay out and a static page cannot open: what a closed panel is to the eye, to Tab, to a
// screen reader and to the browser's own search; whether a ring is whole inside a box that clips; what moves when
// a panel opens; and whether hostile content stays inside a small screen. e2e/overlay.ts is not on this branch.

/** The triggers of every demo, by their text, in document order. Written out, so a renamed demo fails here. */
const TITLES: Record<string, readonly string[]> = {
  'accordion--basic': ['What is a server component?', 'Does it work in Arabic?', 'How big is the bundle?'],
  'accordion--disabled': ['Profile', 'Billing', 'Members'],
  'accordion--first-open': ['How do I install a component?', 'Does it work in Arabic?', 'How big is the bundle?'],
  'accordion--long-content': ['a'.repeat(300), 'Invoices3 new', 'Orders that wait for a payment', 'Shipping', 'Inside the country', 'Abroad'],
  'accordion--many-items': Array.from({ length: 60 }, (_, index) => `Question ${String(index + 1)}`),
  'accordion--multiple': ['Plan', 'Seats', 'Invoices'],
  'accordion--rtl': ['ما هو مكوّن الخادم؟', 'هل يعمل بالعربية؟', 'ما حجم الحزمة؟'],
}

/** A small phone, a phone, a desktop and a phone on its side. */
const SCREENS = [
  { width: 320, height: 480 }, { width: 390, height: 844 }, { width: 1280, height: 800 }, { width: 844, height: 390 },
] as const

const triggers = (page: Page, scope = '#demo') => page.locator(`${scope} button[aria-expanded]`)
/** The panel of a trigger: the element after its heading. Its region is the one child it has. */
const panelOf = (trigger: Locator) => trigger.locator('xpath=../following-sibling::*[1]')
const regionOf = (trigger: Locator) => panelOf(trigger).locator('xpath=./*[@role="region"]')
const expanded = (page: Page, scope = '#demo') => triggers(page, scope).evaluateAll((all) => all.map((one) => one.getAttribute('aria-expanded')))

/**
 * Resolves once nothing in the page moves: every transition that ends has ended, and no panel is between open
 * and closed. Base UI starts a close one frame after the press, so "no animation is running" alone is too early.
 */
async function atRest(page: Page): Promise<void> {
  await page.locator('body').evaluate(async (body) => {
    const running = () => body.getAnimations({ subtree: true }).filter((animation) => {
      const end = animation.effect?.getComputedTiming().endTime
      return animation.playState === 'running' && typeof end === 'number' && Number.isFinite(end)
    })
    // A panel that is shown and still says closed, starting or ending is on its way somewhere.
    const between = () => body.querySelector('[id^="base-ui-"]:not([hidden]):is([data-closed], [data-starting-style], [data-ending-style])') !== null
    for (let pending = running(); pending.length > 0 || between(); pending = running()) {
      await Promise.allSettled(pending.map((animation) => animation.finished))
      await new Promise((resolve) => { requestAnimationFrame(resolve) })
    }
  })
}

interface Box { left: number, top: number, right: number, bottom: number, width: number, height: number }

const boxOf = (target: Locator) => target.evaluate((element): Box => {
  const { left, top, right, bottom, width, height } = element.getBoundingClientRect()
  return { left, top, right, bottom, width, height }
})

interface Shown { hidden: string | null, height: number, opacity: string, skipped: string }

/** What a panel is to the eye: its hidden attribute, its height, its opacity and whether the browser skips what it holds. */
const shownOf = (panel: Locator) => panel.evaluate((element): Shown => {
  const style = getComputedStyle(element)
  return { hidden: element.getAttribute('hidden'), height: element.getBoundingClientRect().height, opacity: style.opacity, skipped: style.contentVisibility }
})

const CLOSED: Shown = { hidden: 'until-found', height: 0, opacity: '0', skipped: 'hidden' }

/** An open panel at rest: shown whole, and as tall as its text, which is one 20 px line, 4 px above and 16 below, or more. */
async function expectOpen(panel: Locator): Promise<void> {
  const { height, ...rest } = await shownOf(panel)
  expect(rest).toEqual({ hidden: null, opacity: '1', skipped: 'visible' })
  expect(height).toBeGreaterThanOrEqual(40)
}

interface AxNode { role: string, name: string, expanded?: boolean, level?: number, disabled?: boolean }

/** Chromium's own accessibility tree under the demo: the headings, the buttons and the regions, in reading order. */
async function axTree(page: Page, roles = ['heading', 'button', 'region']): Promise<AxNode[]> {
  const session = await page.context().newCDPSession(page)
  await session.send('Accessibility.enable')
  const { nodes } = await session.send('Accessibility.getFullAXTree')
  await session.detach()
  const byId = new Map(nodes.map((node) => [node.nodeId, node]))
  const out: AxNode[] = []
  const walk = (id: string, inMain: boolean): void => {
    const node = byId.get(id)
    if (!node) return
    const role = String(node.role?.value ?? '')
    const here = inMain || role === 'main'
    if (here && !node.ignored && roles.includes(role)) {
      const found: AxNode = { role, name: String(node.name?.value ?? '') }
      for (const property of node.properties ?? []) {
        if (property.name === 'expanded') found.expanded = Boolean(property.value.value)
        if (property.name === 'level') found.level = Number(property.value.value)
        if (property.name === 'disabled') found.disabled = Boolean(property.value.value)
      }
      out.push(found)
    }
    for (const child of node.childIds ?? []) walk(child, here)
  }
  const root = nodes[0]
  if (root) walk(root.nodeId, false)
  return out
}

/** axe on the demo alone: the heading of the harness page sits in no landmark, which is the docs app's business. */
async function axe(page: Page, scope = '#demo'): Promise<{ violations: string[], passes: string[] }> {
  const results = await new AxeBuilder({ page }).include(scope).analyze()
  return {
    violations: results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`),
    passes: results.passes.map((pass) => pass.id),
  }
}

/** Loads the fixture into a page whose own demo holds no heading and nothing to tab to. */
async function openFixture(page: Page, options: LiveOptions = {}): Promise<void> {
  await openLive(page, 'separator--horizontal', options)
  await page.addScriptTag({ type: 'module', url: '/e2e/fixtures/accordion.tsx' })
  await expect(page.locator('#accordion-fixture')).toHaveAttribute('data-ready', '')
}

/**
 * The hostile demo with its table item open. It starts closed: a region that scrolls is a tab stop only once
 * the page has hydrated, and the static page, which runs no script, would show axe a scroller no key reaches.
 */
async function openHostile(page: Page, options: LiveOptions = {}): Promise<Locator> {
  await openLive(page, 'accordion--long-content', options)
  const table = triggers(page).nth(2)
  await table.click()
  await atRest(page)
  return table
}

test('the table names every accordion demo', () => {
  const found = DEMOS.filter((demo) => demo.startsWith('accordion--')).sort()
  expect(found).toEqual([
    'accordion--basic', 'accordion--disabled', 'accordion--first-open', 'accordion--long-content', 'accordion--many-items',
    'accordion--multiple', 'accordion--rtl',
  ])
  expect(Object.keys(TITLES).sort()).toEqual(found)
})

test.describe('every demo', () => {
  for (const [demo, titles] of Object.entries(TITLES)) {
    test(`${demo}: its triggers read as written, each a button inside a heading`, async ({ page }) => {
      await openLive(page, demo)
      expect(await triggers(page).evaluateAll((all) => all.map((one) => one.textContent))).toEqual(titles)
      expect(await triggers(page).evaluateAll((all) => all.every((one) => /^H[2-6]$/.test(one.parentElement?.tagName ?? '')))).toBe(true)
      expect(await liveErrors(page)).toEqual([])
    })
  }
})

// PLAN 19, Phase 6, in the browser: what hidden="until-found" is for.
test.describe('a closed panel', () => {
  test('is in the page with its text, 0 px tall, skipped by the browser and not visible', async ({ page }) => {
    await openLive(page, 'accordion--basic')
    for (const trigger of await triggers(page).all()) {
      expect(await shownOf(panelOf(trigger))).toEqual(CLOSED)
      await expect(regionOf(trigger)).toBeHidden()
    }
    expect(await regionOf(triggers(page).nth(2)).evaluate((region) => region.textContent))
      .toBe('About one kilobyte in the browser. The answers cost nothing: they are plain HTML.')
    // The box is three triggers and two lines tall, and nothing more: 3 x 48, 2 x 1 and its own border.
    expect((await boxOf(page.locator('#demo [data-orientation]').first())).height).toBe(148)
  })

  test('an open one is shown at its own height, and closes back to 0 px', async ({ page }) => {
    await openLive(page, 'accordion--first-open')
    const first = triggers(page).first()
    await expectOpen(panelOf(first))
    await expect(regionOf(first)).toBeVisible()
    await first.click()
    await atRest(page)
    expect(await shownOf(panelOf(first))).toEqual(CLOSED)
  })

  test('is not reachable by Tab: a link inside it is skipped, and is a stop again once the panel opens', async ({ page }) => {
    await openLive(page, 'accordion--long-content')
    const first = triggers(page).first()
    const link = page.locator('#demo a')
    await first.focus()
    await page.keyboard.press('Tab')
    await expect(link, 'open: the link follows its trigger').toBeFocused()

    await first.click()
    await atRest(page)
    await expect(first).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(triggers(page).nth(1), 'closed: Tab goes straight to the next trigger').toBeFocused()
    await expect(link).toBeHidden()

    await page.keyboard.press('Shift+Tab')
    await page.keyboard.press('Enter')
    await atRest(page)
    await page.keyboard.press('Tab')
    await expect(link).toBeFocused()
  })

  test('is nothing to a screen reader: the tree holds a region for the open panel only', async ({ page }) => {
    await openLive(page, 'accordion--first-open')
    expect(await axTree(page)).toEqual([
      { role: 'heading', name: 'How do I install a component?', level: 2 },
      { role: 'button', name: 'How do I install a component?', expanded: true },
      { role: 'region', name: 'How do I install a component?' },
      { role: 'heading', name: 'Does it work in Arabic?', level: 2 },
      { role: 'button', name: 'Does it work in Arabic?', expanded: false },
      { role: 'heading', name: 'How big is the bundle?', level: 2 },
      { role: 'button', name: 'How big is the bundle?', expanded: false },
    ])

    await triggers(page).nth(2).click()
    await atRest(page)
    const after = await axTree(page)
    expect(after.filter((node) => node.role === 'region')).toEqual([{ role: 'region', name: 'How big is the bundle?' }])
    expect(after.filter((node) => node.role === 'button').map((node) => node.expanded)).toEqual([false, false, true])
  })

  test('sixty closed panels are sixty collapsed buttons and not one landmark', async ({ page }) => {
    await openLive(page, 'accordion--many-items')
    const tree = await axTree(page)
    expect(tree.filter((node) => node.role === 'button')).toHaveLength(60)
    expect(tree.filter((node) => node.role === 'button' && node.expanded === false)).toHaveLength(60)
    expect(tree.filter((node) => node.role === 'region')).toEqual([])
  })

  test('a disabled trigger is announced as disabled, and its neighbours are not', async ({ page }) => {
    await openLive(page, 'accordion--disabled')
    expect((await axTree(page, ['button'])).map((node) => node.disabled ?? false)).toEqual([false, true, false])
  })
})

// The find-in-page box is browser UI, which no test can type into. The HTML Standard runs the same reveal for a
// fragment and for a text fragment, and Chromium fires beforematch for both: those two are driven here, for real.
test.describe('the browser opens a closed panel by itself', () => {
  const listen = (page: Page) => page.evaluate(() => {
    const seen: string[] = []
    Object.assign(window, { seenMatches: seen })
    document.addEventListener('beforematch', (event) => { seen.push((event.target as Element).getAttribute('hidden') ?? 'not hidden') }, true)
  })
  const heard = (page: Page) => page.evaluate(() => (window as unknown as { seenMatches: string[] }).seenMatches)

  test('a link to an id inside it: the browser fires beforematch and shows it, and Base UI follows', async ({ page }) => {
    await openLive(page, 'accordion--first-open')
    await listen(page)
    const third = triggers(page).nth(2)
    await regionOf(third).locator('p').evaluate((paragraph) => { paragraph.id = 'bundle-answer' })

    await page.evaluate(() => { location.hash = '#bundle-answer' })
    await expect(third).toHaveAttribute('aria-expanded', 'true')
    await atRest(page)
    // Fired by the browser, on the panel, while it was still hidden until found.
    expect(await heard(page)).toEqual(['until-found'])
    await expectOpen(panelOf(third))
    await expect(regionOf(third)).toBeVisible()
    await expect(third).toHaveAttribute('data-panel-open', '')
    await expect(third.locator('span').last()).toHaveCSS('rotate', '180deg')
    // One at a time: the item that was open closed, as after a press.
    expect(await expanded(page)).toEqual(['false', 'false', 'true'])
    expect(await shownOf(panelOf(triggers(page).first()))).toEqual(CLOSED)
    expect(await liveErrors(page)).toEqual([])
  })

  test('the state is not a step behind: one press closes the panel the browser opened, and one more opens it', async ({ page }) => {
    await openLive(page, 'accordion--basic')
    const third = triggers(page).nth(2)
    await regionOf(third).locator('p').evaluate((paragraph) => { paragraph.id = 'bundle-answer' })
    await page.evaluate(() => { location.hash = '#bundle-answer' })
    await expect(third).toHaveAttribute('aria-expanded', 'true')
    await atRest(page)

    await third.click()
    await atRest(page)
    expect(await expanded(page)).toEqual(['false', 'false', 'false'])
    expect(await shownOf(panelOf(third))).toEqual(CLOSED)

    await third.click()
    await atRest(page)
    await expectOpen(panelOf(third))
  })

  test('a text fragment in the address: the browser searches the page, finds the closed text and opens its panel', async ({ page }) => {
    const response = await page.goto(`${liveUrl('accordion--first-open')}#:~:text=kilobyte`)
    expect(response?.ok()).toBe(true)
    const third = triggers(page).nth(2)
    // The search runs again after hydration, when the panel has become hidden until found.
    await expect(third).toHaveAttribute('aria-expanded', 'true', { timeout: 15_000 })
    await atRest(page)
    expect(await expanded(page)).toEqual(['false', 'false', 'true'])
    await expect(regionOf(third)).toBeVisible()
    await expect(page.locator('html')).toHaveAttribute('data-harness', 'hydrated')
  })

  test('with multiple, the panel it opens joins the open ones', async ({ page }) => {
    await openLive(page, 'accordion--multiple')
    const third = triggers(page).nth(2)
    await regionOf(third).locator('p').evaluate((paragraph) => { paragraph.id = 'last-invoice' })
    await page.evaluate(() => { location.hash = '#last-invoice' })
    await expect(third).toHaveAttribute('aria-expanded', 'true')
    expect(await expanded(page)).toEqual(['true', 'true', 'true'])
  })
})

test.describe('the keyboard', () => {
  const focused = (page: Page) => page.evaluate(() => document.activeElement?.textContent ?? '(nothing)')

  for (const direction of DIRECTIONS) {
    test(`${direction}: Tab and Shift+Tab move from trigger to trigger, and Enter and Space toggle the one that has the focus`, async ({ page }) => {
      await openLive(page, 'accordion--basic', { direction })
      await page.keyboard.press('Tab')
      expect(await focused(page)).toBe('What is a server component?')
      await page.keyboard.press('Tab')
      expect(await focused(page)).toBe('Does it work in Arabic?')

      await page.keyboard.press('Enter')
      expect(await expanded(page)).toEqual(['false', 'true', 'false'])
      // The focus stays on the trigger, so the same key closes it again.
      expect(await focused(page)).toBe('Does it work in Arabic?')
      await page.keyboard.press('Space')
      expect(await expanded(page)).toEqual(['false', 'false', 'false'])
      await page.keyboard.press('Space')
      expect(await expanded(page)).toEqual(['false', 'true', 'false'])

      await page.keyboard.press('Shift+Tab')
      expect(await focused(page)).toBe('What is a server component?')
      await page.keyboard.press('Enter')
      await atRest(page)
      expect(await expanded(page)).toEqual(['true', 'false', 'false'])
    })

    test(`${direction}: no arrow key, Home or End moves the focus, as the Authoring Practices now have it`, async ({ page }) => {
      await openLive(page, 'accordion--basic', { direction })
      await page.keyboard.press('Tab')
      for (const key of ['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'End', 'Home']) {
        await page.keyboard.press(key)
        expect(await focused(page), key).toBe('What is a server component?')
      }
      expect(await expanded(page)).toEqual(['false', 'false', 'false'])
    })
  }

  test('a disabled trigger is a tab stop that neither key opens, and a click on it does nothing', async ({ page }) => {
    await openLive(page, 'accordion--disabled')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    expect(await focused(page)).toBe('Billing')
    await page.keyboard.press('Enter')
    await page.keyboard.press('Space')
    expect(await expanded(page)).toEqual(['false', 'false', 'false'])
    await page.keyboard.press('Tab')
    expect(await focused(page)).toBe('Members')

    // A real pointer, at the middle of the trigger: it takes no press at all.
    const box = await boxOf(triggers(page).nth(1))
    await page.mouse.click(box.left + box.width / 2, box.top + box.height / 2)
    expect(await expanded(page)).toEqual(['false', 'false', 'false'])
    await expect(triggers(page).nth(1)).toHaveCSS('opacity', '0.5')
  })

  test('Tab goes through an accordion in the order of the page, and stops on a region only where it scrolls', async ({ page }) => {
    await openHostile(page)
    await triggers(page).first().focus()
    const order: string[] = []
    for (let stop = 0; stop < 8; stop++) {
      if (stop > 0) await page.keyboard.press('Tab')
      order.push(await page.evaluate(() => {
        const element = document.activeElement
        if (!element || element === document.body) return 'the page'
        return `${element.tagName.toLowerCase()} ${element.textContent.slice(0, 14)}`
      }))
    }
    expect(order).toEqual([
      'button aaaaaaaaaaaaaa', 'a See every orde', 'button Invoices3 new', 'button Orders that wa', 'div OrderCustomerP',
      'button Shipping', 'button Inside the cou', 'button Abroad',
    ])
  })
})

interface Ring { top: number, bottom: number, start: number, end: number, corners: [number, number, number, number] }

/**
 * How much of an element's box is painted in a ring colour. The two straight edges are counted 26 px clear
 * of each corner, the two sides over their whole height, and each corner along its own diagonal, 20 px in:
 * a square ring clipped by a round corner leaves that diagonal empty.
 */
async function ringOf(page: Page, target: Locator, colourOf: Locator = target): Promise<Ring> {
  await atRest(page)
  const colour = await colourOf.evaluate((element): Rgb => {
    const probe = document.createElement('canvas')
    probe.width = 1
    probe.height = 1
    const pen = probe.getContext('2d')
    if (!pen) throw new Error('no canvas')
    pen.fillStyle = getComputedStyle(element).outlineColor
    pen.fillRect(0, 0, 1, 1)
    const [r = 0, g = 0, b = 0] = pen.getImageData(0, 0, 1, 1).data
    return [r, g, b]
  })
  // A screenshot holds the viewport only, so what is measured has to be inside it.
  await target.scrollIntoViewIfNeeded()
  const box = await boxOf(target)
  const clip = { x: Math.round(box.left), y: Math.round(box.top), width: Math.round(box.width), height: Math.round(box.height) }
  const pixels = await pixelsOf(page, clip)
  const isRing = (x: number, y: number) => {
    const pixel = pixels[y * clip.width + x] ?? [0, 0, 0]
    return pixel.every((channel, index) => Math.abs(channel - (colour[index] ?? 0)) <= 24)
  }
  const count = (x0: number, y0: number, x1: number, y1: number) => {
    let found = 0
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) if (isRing(x, y)) found += 1
    return found
  }
  const diagonal = (x: number, y: number, dx: number, dy: number) => {
    let found = 0
    for (let step = 0; step < 20; step++) if (isRing(x + dx * step, y + dy * step)) found += 1
    return found
  }
  const { width, height } = clip
  return {
    top: count(26, 0, width - 26, 2),
    bottom: count(26, height - 2, width - 26, height),
    start: count(0, 0, 2, height),
    end: count(width - 2, 0, width, height),
    corners: [diagonal(0, 0, 1, 1), diagonal(width - 1, 0, -1, 1), diagonal(0, height - 1, 1, -1), diagonal(width - 1, height - 1, -1, -1)],
  }
}

/** A whole ring on a trigger 418 px wide and 48 px tall: 2 px along 366 px of each edge, and a mark in every corner. */
function expectWholeRing(ring: Ring, label: string): void {
  expect(ring.top, `${label}: ring pixels along the top edge`).toBeGreaterThanOrEqual(720)
  expect(ring.bottom, `${label}: ring pixels along the bottom edge`).toBeGreaterThanOrEqual(720)
  expect(ring.start, `${label}: ring pixels down the left side`).toBeGreaterThanOrEqual(40)
  expect(ring.end, `${label}: ring pixels down the right side`).toBeGreaterThanOrEqual(40)
  ring.corners.forEach((found, corner) => {
    expect(found, `${label}: ring pixels on the diagonal of corner ${String(corner)}`).toBeGreaterThanOrEqual(1)
  })
}

// The box clips with a radius of 12 px, 24 in Ocean: a square ring on its first and last trigger lost its corners.
test.describe('the focus ring is whole on the first, a middle and the last trigger', () => {
  for (const mode of MODES) {
    for (const direction of DIRECTIONS) {
      test(`${mode} ${direction}: four edges and four corners on each, and none on a trigger that has no focus`, async ({ page }) => {
        await openLive(page, 'accordion--basic', { mode, direction })
        for (const [index, name] of ['the first', 'the middle', 'the last'].entries()) {
          await page.keyboard.press('Tab')
          const trigger = triggers(page).nth(index)
          await expect(trigger).toBeFocused()
          expect(await trigger.evaluate((element) => element.matches(':focus-visible'))).toBe(true)
          expectWholeRing(await ringOf(page, trigger), `${name} trigger`)
          // The ring is inside the box: 2 px wide, 2 px in.
          await expect(trigger).toHaveCSS('outline-offset', '-2px')
          const other = triggers(page).nth((index + 1) % 3)
          expect((await ringOf(page, other, trigger)).top, 'a trigger without the focus').toBe(0)
        }
      })
    }
  }

  test('the last trigger gives its round corners up while its panel is open, and the region takes them', async ({ page }) => {
    await openLive(page, 'accordion--basic')
    const last = triggers(page).nth(2)
    await expect(last).toHaveCSS('border-bottom-left-radius', '12px')
    await last.click()
    await atRest(page)
    await expect(last).toHaveCSS('border-bottom-left-radius', '0px')
    await expect(regionOf(last)).toHaveCSS('border-bottom-left-radius', '12px')
    await expect(triggers(page).first()).toHaveCSS('border-top-right-radius', '12px')
    await expect(triggers(page).nth(1)).toHaveCSS('border-top-right-radius', '0px')
  })

  test('a control on the first line of a panel keeps the top of its ring: the region leaves it 4 px', async ({ page }) => {
    await openLive(page, 'accordion--long-content')
    await triggers(page).first().focus()
    await page.keyboard.press('Tab')
    const link = page.locator('#demo a')
    await expect(link).toBeFocused()
    await atRest(page)
    const box = await boxOf(link)
    // The ring is 2 px wide, 2 px outside the link: the strip above the link holds as much of it as the strip below.
    const strip = { x: Math.round(box.left) - 4, width: Math.round(box.width) + 8, height: 4 }
    const above = await pixelsOf(page, { ...strip, y: Math.round(box.top) - 4 })
    const below = await pixelsOf(page, { ...strip, y: Math.round(box.bottom) })
    const surface: Rgb = [255, 255, 255]
    expect(inkOn(above, surface), 'ring pixels above the link').toBeGreaterThanOrEqual(150)
    expect(inkOn(below, surface), 'ring pixels below the link').toBeGreaterThanOrEqual(150)
  })

  test('the region of a wide table takes the focus with a ring inside its own box', async ({ page }) => {
    const table = await openHostile(page)
    const region = regionOf(table)
    await table.focus()
    await page.keyboard.press('Tab')
    await expect(region).toBeFocused()
    const ring = await ringOf(page, region)
    expect(ring.top).toBeGreaterThanOrEqual(720)
    expect(ring.bottom).toBeGreaterThanOrEqual(720)
    expect(ring.start).toBeGreaterThanOrEqual(100)
    expect(ring.end).toBeGreaterThanOrEqual(100)
  })
})

test.describe('the caret', () => {
  const caretOf = (trigger: Locator) => trigger.locator('xpath=./span[last()]')
  const titleOf = (trigger: Locator) => trigger.locator('xpath=./span[1]')

  for (const direction of DIRECTIONS) {
    test(`${direction}: it sits at the inline end, 16 px in, with the title at the other side`, async ({ page }) => {
      await openLive(page, 'accordion--basic', { direction })
      const trigger = triggers(page).first()
      const [box, title, caret] = await Promise.all([boxOf(trigger), boxOf(titleOf(trigger)), boxOf(caretOf(trigger))])
      expect({ width: caret.width, height: caret.height }).toEqual({ width: 14, height: 14 })
      if (direction === 'ltr') {
        expect(box.right - caret.right).toBe(16)
        expect(title.left - box.left).toBe(16)
        expect(caret.left - title.right).toBe(12)
      } else {
        expect(caret.left - box.left).toBe(16)
        expect(box.right - title.right).toBe(16)
        expect(title.left - caret.right).toBe(12)
      }
      await expect(trigger).toHaveCSS('text-align', 'start')
    })

    test(`${direction}: it points down while its panel is closed and up while it is open`, async ({ page }) => {
      await openLive(page, 'accordion--first-open', { direction })
      await expect(caretOf(triggers(page).first())).toHaveCSS('rotate', '180deg')
      await expect(caretOf(triggers(page).nth(1))).toHaveCSS('rotate', 'none')
      await triggers(page).nth(1).click()
      await atRest(page)
      await expect(caretOf(triggers(page).nth(1))).toHaveCSS('rotate', '180deg')
      await expect(caretOf(triggers(page).first())).toHaveCSS('rotate', 'none')
    })
  }

  test('an open item is told apart by more than the turn of its caret: its panel is on the page, and it says expanded', async ({ page }) => {
    await openLive(page, 'accordion--first-open')
    await expect(triggers(page).first()).toHaveAttribute('aria-expanded', 'true')
    await expect(regionOf(triggers(page).first())).toBeVisible()
    await expect(triggers(page).nth(1)).toHaveAttribute('aria-expanded', 'false')
    await expect(regionOf(triggers(page).nth(1))).toBeHidden()
  })
})

const clipOf = (box: Box) => ({ x: Math.round(box.left), y: Math.round(box.top), width: Math.round(box.width), height: Math.round(box.height) })

/** The colour an element is drawn in, as the browser used it: under forced colours that is a system colour. */
const usedColour = (target: Locator) => target.evaluate((element): Rgb => {
  const [r = 0, g = 0, b = 0] = (getComputedStyle(element).color.match(/\d+/g) ?? []).map(Number)
  return [r, g, b]
})

for (const scheme of ['light', 'dark'] as const) {
  // The page keeps its light theme under both palettes: a colour set on the svg itself stayed dark grey on black.
  test.describe(`forced colours, ${scheme} palette`, () => {
    test.use({ forcedColors: 'active', colorScheme: scheme })
    const canvas = FORCED_CANVAS[scheme]

    test('the box and every line between two items are drawn, though every fill is gone', async ({ page }) => {
      await openLive(page, 'accordion--disabled')
      expect(await page.evaluate(() => matchMedia('(forced-colors: active)').matches)).toBe(true)
      const root = await boxOf(page.locator('#demo [data-orientation]').first())
      const [left, top, bottom] = [Math.round(root.left), Math.round(root.top), Math.round(root.bottom)]
      // Both sides of every line are Canvas, so the line is the only thing that tells two items apart.
      const inside = await pixelsOf(page, { x: left + 8, y: top + 60, width: 1, height: 1 })
      expect(inside[0]).toEqual(canvas)
      // A column 1 px wide down the box, 100 px in: the top line, the two between the items and the bottom one.
      const column = await pixelsOf(page, { x: left + 100, y: top, width: 1, height: bottom - top })
      const lines = column.flatMap((pixel, y) => (inkOn([pixel], canvas) === 1 ? [y] : []))
      expect(lines).toEqual([0, 49, 98, 147])
    })

    test('each caret is drawn in the text colour of its trigger, and the disabled one in the grey of the system', async ({ page }) => {
      await openLive(page, 'accordion--disabled')
      const same: boolean[] = []
      for (const trigger of await triggers(page).all()) {
        const caret = trigger.locator('xpath=./span[last()]')
        const [own, parent] = [await usedColour(caret.locator('svg')), await usedColour(trigger)]
        same.push(own.join() === parent.join())
        // A thin stroke: 18 of its pixels stand out at 3:1 on the canvas, 11 of the grey one on white. With the colour
        // on the svg none did where the theme and the palette disagreed: the dark grey of the light theme on black.
        const pixels = await pixelsOf(page, clipOf(await boxOf(caret)))
        expect(inkOn(pixels, canvas), 'pixels of the caret at 3:1 on the canvas').toBeGreaterThanOrEqual(10)
      }
      expect(same).toEqual([true, true, true])
      expect((await usedColour(triggers(page).nth(1))).join()).not.toBe((await usedColour(triggers(page).first())).join())
    })

    test('a disabled trigger is told from its neighbours: the grey of the system at full strength, not half of the text colour', async ({ page }) => {
      await openLive(page, 'accordion--disabled')
      const [first, disabled] = [triggers(page).first(), triggers(page).nth(1)]
      const [text, grey] = [await usedColour(first), await usedColour(disabled)]
      expect(grey.join()).not.toBe(text.join())
      await expect(disabled).toHaveCSS('opacity', '1')
      // Painted as computed: the letters of the title hold pixels of exactly that grey, and none of the text colour.
      const title = await pixelsOf(page, clipOf(await boxOf(disabled.locator('xpath=./span[1]'))))
      expect(paintedIn(title, grey)).toBeGreaterThanOrEqual(8)
      expect(paintedIn(title, text)).toBe(0)
      expect(inkOn(title, canvas), 'pixels of the disabled title at 3:1 on the canvas').toBeGreaterThanOrEqual(60)
    })

    test('the focus ring is whole on the first, the middle and the last trigger, and no trigger has one at rest', async ({ page }) => {
      await openLive(page, 'accordion--basic')
      for (const [index, name] of ['the first', 'the middle', 'the last'].entries()) {
        await page.keyboard.press('Tab')
        const trigger = triggers(page).nth(index)
        await expect(trigger).toBeFocused()
        expectWholeRing(await ringOf(page, trigger), `${name} trigger`)
        const other = triggers(page).nth((index + 1) % 3)
        await expect(other).toHaveCSS('outline-style', 'none')
        expect((await ringOf(page, other, trigger)).top, 'a trigger without the focus').toBe(0)
      }
    })

    test('an open item shows its panel and its caret turned, as in any mode', async ({ page }) => {
      await openLive(page, 'accordion--first-open')
      const first = triggers(page).first()
      await expect(first.locator('xpath=./span[last()]')).toHaveCSS('rotate', '180deg')
      const text = await pixelsOf(page, clipOf(await boxOf(regionOf(first).locator('p'))))
      expect(inkOn(text, canvas), 'pixels of the open answer at 3:1 on the canvas').toBeGreaterThanOrEqual(300)
    })
  })
}

interface Frame { opacity: number, height: number, shown: boolean, ending: boolean, box: number }

/** Each value once per run of it: 1, 2, 2, 1 reads 1, 2, 1. */
const runsOf = (values: readonly number[]) => values.filter((value, index) => index === 0 || value !== values[index - 1])

/**
 * Presses one trigger and reads another panel on every frame until the page is at rest: its opacity, its
 * height, whether it is shown, and the height of the whole box. The page runs four times slower while it
 * is watched (--tc-motion: 4), so a busy machine still sees a fade as more than two frames.
 */
function watch(page: Page, press: number, panel: number): Promise<Frame[]> {
  return page.evaluate(async ([pressed, watched]) => {
    document.documentElement.style.setProperty('--tc-motion', '4')
    const all = [...document.querySelectorAll('#demo button[aria-expanded]')]
    const [button, target] = [all[pressed], all[watched]?.parentElement?.nextElementSibling]
    const box = target?.parentElement?.parentElement
    if (!(button instanceof HTMLElement) || !target || !box) throw new Error('no such trigger')
    const read = (): Frame => ({
      opacity: Number(getComputedStyle(target).opacity),
      height: target.getBoundingClientRect().height,
      shown: !target.hasAttribute('hidden'),
      ending: target.hasAttribute('data-ending-style'),
      box: box.getBoundingClientRect().height,
    })
    const moving = () => document.querySelector('[id^="base-ui-"]:not([hidden]):is([data-closed], [data-starting-style], [data-ending-style])') !== null
      || document.body.getAnimations({ subtree: true }).some((animation) => animation.playState === 'running')
    const frames = [read()]
    button.click()
    do {
      await new Promise((resolve) => { requestAnimationFrame(resolve) })
      frames.push(read())
    } while (moving())
    return frames
  }, [press, panel] as const)
}

// PLAN 5.8 and choice 18: a fade and no height. What a person sees, frame by frame.
test.describe('motion', () => {
  test('the panel fades over 150 ms and the caret turns over 150 ms, and nothing animates a height', async ({ page }) => {
    await openLive(page, 'accordion--first-open')
    const first = triggers(page).first()
    const read = (target: Locator) => target.evaluate((element) => {
      const style = getComputedStyle(element)
      return `${style.transitionProperty} ${style.transitionDuration}`
    })
    expect(await read(panelOf(first))).toBe('opacity 0.15s')
    expect(await read(first.locator('xpath=./span[last()]'))).toBe('rotate 0.15s')
    expect(await read(regionOf(first))).toBe('all 0s')
  })

  test('opening: the panel takes its whole height on the first frame and then only its opacity moves, up to 1', async ({ page }) => {
    await openLive(page, 'accordion--basic')
    const frames = (await watch(page, 1, 1)).slice(1)
    const shown = frames.filter((frame) => frame.shown)
    expect(shown.length).toBeGreaterThanOrEqual(4)
    // No height animation: the panel is one height from its first frame, and so is the box, three triggers taller than it.
    expect(runsOf(shown.map((frame) => frame.height))).toHaveLength(1)
    expect(shown[0]?.height).toBeGreaterThanOrEqual(40)
    expect(runsOf(shown.map((frame) => frame.box - frame.height))).toEqual([148])
    const opacities = shown.map((frame) => frame.opacity)
    expect(opacities[0]).toBeLessThan(0.2)
    expect(opacities.at(-1)).toBe(1)
    // It only ever gets more opaque: a frame that went back would be a flash.
    expect(opacities.every((opacity, index) => index === 0 || opacity >= (opacities[index - 1] ?? 0))).toBe(true)
    expect(opacities.filter((opacity) => opacity > 0.05 && opacity < 0.95).length, 'frames in the middle of the fade').toBeGreaterThanOrEqual(2)
  })

  test('closing: the panel fades out at its whole height, and only then gives its room back, in one step', async ({ page }) => {
    await openLive(page, 'accordion--first-open')
    const frames = await watch(page, 0, 0)
    const shown = frames.filter((frame) => frame.shown)
    const hidden = frames.slice(shown.length)
    expect(runsOf(shown.map((frame) => frame.height))).toHaveLength(1)
    expect(shown[0]?.height).toBeGreaterThanOrEqual(40)
    const opacities = shown.map((frame) => frame.opacity)
    expect(opacities[0]).toBe(1)
    // hidden="until-found" does not cut the fade short: the last frame the panel is shown on, it is all but gone.
    expect(opacities.at(-1)).toBeLessThan(0.1)
    expect(opacities.every((opacity, index) => index === 0 || opacity <= (opacities[index - 1] ?? 1))).toBe(true)
    expect(shown.filter((frame) => frame.ending && frame.opacity > 0.05 && frame.opacity < 0.95).length, 'frames in the middle of the fade').toBeGreaterThanOrEqual(2)
    // Then it is hidden for good, and the box is three triggers tall again.
    expect(hidden.length).toBeGreaterThanOrEqual(1)
    expect(hidden.every((frame) => !frame.shown && frame.height === 0 && frame.box === 148)).toBe(true)
  })

  test('one at a time: the box is taller while the old panel fades out beside the new one, then settles', async ({ page }) => {
    await openLive(page, 'accordion--first-open')
    const frames = await watch(page, 2, 0)
    // Three heights and no more: before the press, during the two fades with both panels laid out, and at rest.
    const [before = 0, during = 0, after = 0, ...more] = runsOf(frames.map((frame) => frame.box))
    expect(more).toEqual([])
    expect(before - 148, 'the height of the panel that was open').toBeGreaterThanOrEqual(40)
    expect(during - before, 'the height the new panel adds while the old one fades').toBeGreaterThanOrEqual(40)
    expect(after - 148, 'the height of the panel that is open now').toBeGreaterThanOrEqual(40)
    expect(await expanded(page)).toEqual(['false', 'false', 'true'])
    expect(await shownOf(panelOf(triggers(page).first()))).toEqual(CLOSED)
  })

  test('a press in the middle of a fade ends where the presses say, with no opacity left behind', async ({ page }) => {
    await openLive(page, 'accordion--basic')
    const second = triggers(page).nth(1)
    await second.click()
    await second.click()
    await atRest(page)
    expect(await shownOf(panelOf(second))).toEqual(CLOSED)
    await second.click()
    await second.click()
    await second.click()
    await atRest(page)
    await expectOpen(panelOf(second))
    expect(await liveErrors(page)).toEqual([])
  })

  test.describe('reduced', () => {
    test.use({ reducedMotion: 'reduce' })

    test('with prefers-reduced-motion a panel opens and closes in no time, and the caret does not turn but jump', async ({ page }) => {
      await openLive(page, 'accordion--basic')
      const second = triggers(page).nth(1)
      await expect(panelOf(second)).toHaveCSS('transition-duration', '0s')
      await expect(second.locator('xpath=./span[last()]')).toHaveCSS('transition-duration', '0s')
      await second.click()
      await expect(second).toHaveAttribute('aria-expanded', 'true')
      await atRest(page)
      await expectOpen(panelOf(second))
      await second.click()
      await atRest(page)
      expect(await shownOf(panelOf(second))).toEqual(CLOSED)
      // And again: a panel that never left its ending style would not come back.
      await second.click()
      await atRest(page)
      await expectOpen(panelOf(second))
    })
  })
})

test.describe('how many can be open', () => {
  test('one at a time, the default: a second press on the open trigger closes it, so none is open', async ({ page }) => {
    await openLive(page, 'accordion--first-open')
    expect(await expanded(page)).toEqual(['true', 'false', 'false'])
    await triggers(page).first().click()
    await atRest(page)
    expect(await expanded(page)).toEqual(['false', 'false', 'false'])
    await triggers(page).nth(1).click()
    await triggers(page).nth(2).click()
    await atRest(page)
    expect(await expanded(page)).toEqual(['false', 'false', 'true'])
  })

  test('multiple: a third item opens beside the two that are, and each closes alone', async ({ page }) => {
    await openLive(page, 'accordion--multiple')
    expect(await expanded(page)).toEqual(['true', 'true', 'false'])
    await triggers(page).nth(2).click()
    await atRest(page)
    expect(await expanded(page)).toEqual(['true', 'true', 'true'])
    await triggers(page).first().click()
    await atRest(page)
    expect(await expanded(page)).toEqual(['false', 'true', 'true'])
  })

  test('an accordion inside a panel opens and closes on its own, and leaves the one around it open', async ({ page }) => {
    await openLive(page, 'accordion--long-content')
    const inner = triggers(page).nth(4)
    await inner.click()
    await atRest(page)
    expect(await expanded(page)).toEqual(['true', 'true', 'false', 'true', 'true', 'false'])
    await triggers(page).nth(5).click()
    await atRest(page)
    expect(await expanded(page)).toEqual(['true', 'true', 'false', 'true', 'false', 'true'])
    expect(await inner.evaluate((element) => element.parentElement?.tagName)).toBe('H3')
    // The inner box is a box of its own: its first trigger takes the radius, whatever the outer item is.
    await expect(inner).toHaveCSS('border-top-left-radius', '12px')
    await expect(triggers(page).nth(1)).toHaveCSS('border-top-left-radius', '0px')
  })
})

/**
 * Sixty items on a phone, the answer to question 3 some 640 px long and open, and the scroller moved so question 4
 * starts `at` px below its top: with 100, the end of that answer is still on screen; with -10, all of it is above.
 */
async function readTo(page: Page, at: number, scroller: 'page' | 'box'): Promise<void> {
  await page.setViewportSize({ width: 390, height: 844 })
  await openLive(page, 'accordion--many-items')
  if (scroller === 'box') await page.locator('#demo').evaluate((demo) => { Object.assign(demo.style, { height: '600px', overflowY: 'auto' }) })
  const third = triggers(page).nth(2)
  await regionOf(third).evaluate((region) => {
    for (let line = 1; line <= 30; line++) region.append(Object.assign(document.createElement('p'), { textContent: `Line ${String(line)} of a long answer.` }))
  })
  await third.click()
  await atRest(page)
  await triggers(page).nth(3).evaluate((fourth, [to, inBox]) => {
    const box = inBox ? document.querySelector('#demo') : document.scrollingElement
    if (!box) throw new Error('no scroller')
    box.scrollBy(0, fourth.getBoundingClientRect().top - (inBox ? box.getBoundingClientRect().top : 0) - to)
  }, [at, scroller === 'box'] as const)
  expect(await panelOf(third).evaluate((panel) => panel.getBoundingClientRect().height)).toBeGreaterThan(600)
}

// One at a time, the answer above closes when its fade ends: Chromium's scroll anchoring holds the page only when it is off screen.
test.describe('a press keeps its trigger where it was while the answer above closes', () => {
  const CASES = [
    { name: 'a click, the end of the answer above still on screen', at: 100, scroller: 'page', key: false },
    { name: 'Enter, the end of the answer above still on screen', at: 100, scroller: 'page', key: true },
    { name: 'a click, the answer above all off screen, where the browser anchors too', at: -10, scroller: 'page', key: false },
    { name: 'a click, in a box that scrolls and not the page', at: 100, scroller: 'box', key: false },
  ] as const
  for (const { name, at, scroller, key } of CASES) {
    test(name, async ({ page }) => {
      await readTo(page, at, scroller)
      const seventh = triggers(page).nth(6)
      const before = await boxOf(seventh)
      if (key) {
        await seventh.focus()
        await page.keyboard.press('Enter')
      } else {
        await seventh.click()
      }
      await atRest(page)
      expect((await expanded(page)).slice(0, 7)).toEqual(['false', 'false', 'false', 'false', 'false', 'false', 'true'])
      await expect(seventh).toBeFocused()
      const after = await boxOf(seventh)
      expect(Math.abs(after.top - before.top), `question 7 at ${String(before.top)} before and ${String(after.top)} after`).toBeLessThanOrEqual(1)
    })
  }
})

/**
 * Everything wrong with how the accordions under a scope are laid out, in words: a part that crosses the left or
 * right edge of its own box, an item or a panel that lies over the one before it, a title that lies over its
 * caret or is wider than its room, and a box that crosses the padding of the page.
 */
const faultsOf = (page: Page, scope = '#demo') => page.evaluate((within) => {
  const faults: string[] = []
  const boxes = new Set<Element>()
  for (const button of document.querySelectorAll(`${within} button[aria-expanded]`)) {
    const box = button.parentElement?.parentElement?.parentElement
    if (box) boxes.add(box)
  }
  const main = document.querySelector('#demo')
  const page = main?.getBoundingClientRect()
  for (const box of boxes) {
    const frame = box.getBoundingClientRect()
    // The demo is padded 32 px on every side; an accordion inside a panel is held by that panel instead.
    if (main && page && main.contains(box) && !box.parentElement?.closest('[role="region"]') && (frame.left < page.left + 31.5 || frame.right > page.right - 31.5)) {
      faults.push('a box crosses the padding of the page')
    }
    let floor = frame.top
    for (const item of box.children) {
      const [heading, panel] = item.children
      const button = heading?.firstElementChild
      const [title, caret] = button ? [...button.children] : []
      if (!heading || !panel || !button || !title || !caret) { faults.push('an item is not a heading and a panel'); continue }
      const name = `"${button.textContent.slice(0, 16)}"`
      if (item.getBoundingClientRect().top < floor - 0.5) faults.push(`${name} starts above the end of the item before it`)
      floor = item.getBoundingClientRect().bottom
      for (const [part, element] of Object.entries({ item, heading, button, title, caret, panel })) {
        const rect = element.getBoundingClientRect()
        if (rect.width > 0 && (rect.left < frame.left - 0.5 || rect.right > frame.right + 0.5)) faults.push(`the ${part} of ${name} crosses its box`)
      }
      if (title.scrollWidth > title.clientWidth + 1) faults.push(`the title of ${name} is wider than its room`)
      const [text, mark] = [title.getBoundingClientRect(), caret.getBoundingClientRect()]
      if (text.right > mark.left + 0.5 && mark.right > text.left + 0.5) faults.push(`the title of ${name} lies over its caret`)
      if (panel.getBoundingClientRect().top < heading.getBoundingClientRect().bottom - 0.5) faults.push(`the panel of ${name} lies over its trigger`)
    }
  }
  return faults
}, scope)

test.describe('on every screen, in both directions', () => {
  // Seven pages a test, each opened twice over: sixty items take a while on a busy machine.
  test.describe.configure({ timeout: 90_000 })

  for (const screen of SCREENS) {
    for (const direction of DIRECTIONS) {
      test(`${String(screen.width)} x ${String(screen.height)} ${direction}: no demo scrolls the page sideways, and nothing leaves its box or lies over a neighbour`, async ({ page }) => {
        await page.setViewportSize(screen)
        for (const demo of Object.keys(TITLES)) {
          await openLive(page, demo, { direction })
          await expectNoSidewaysScroll(page)
          expect(await faultsOf(page), `${demo} as it loads`).toEqual([])
          // And with its last item toggled: opened where it was closed, closed where it was open. The table too.
          await triggers(page).last().click()
          if (demo === 'accordion--long-content') await triggers(page).nth(2).click()
          await atRest(page)
          await expectNoSidewaysScroll(page)
          expect(await faultsOf(page), `${demo} with its last item toggled`).toEqual([])
          expect(await liveErrors(page), demo).toEqual([])
        }
      })
    }
  }

  test('the scan reports a part pushed out of its box, a title wider than its room and a box wider than the page', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 480 })
    await openLive(page, 'accordion--basic')
    await triggers(page).first().evaluate((button) => {
      const title = button.firstElementChild as HTMLElement
      title.style.whiteSpace = 'nowrap'
      title.textContent = 'a title that no longer wraps and is far wider than the room it was given'
    })
    await triggers(page).nth(1).evaluate((button) => { button.style.marginInlineStart = '-40px' })
    expect(await faultsOf(page)).toEqual([
      'the title of "a title that no " is wider than its room',
      'the button of "Does it work in " crosses its box',
      'the title of "Does it work in " crosses its box',
    ])
    await page.locator('#demo [data-orientation]').first().evaluate((box: HTMLElement) => { box.style.width = '400px' })
    expect(await faultsOf(page)).toContain('a box crosses the padding of the page')
  })
})

test.describe('hostile content', () => {
  for (const direction of DIRECTIONS) {
    test(`${direction}, 320 px: a title of one 300-letter word wraps beside its caret, whole, and the caret keeps its 14 px`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 480 })
      await openLive(page, 'accordion--long-content', { direction })
      const trigger = triggers(page).first()
      const title = trigger.locator('xpath=./span[1]')
      const read = await title.evaluate((element) => {
        const style = getComputedStyle(element)
        return { wrap: style.overflowWrap, cut: style.textOverflow, clipped: style.overflowX, lines: Math.round(element.getBoundingClientRect().height / 20), fits: element.scrollWidth <= element.clientWidth, letters: element.textContent.length }
      })
      expect({ ...read, lines: read.lines >= 8 }).toEqual({ wrap: 'anywhere', cut: 'clip', clipped: 'visible', lines: true, fits: true, letters: 300 })
      const caret = await boxOf(trigger.locator('xpath=./span[last()]'))
      expect({ width: caret.width, height: caret.height }).toEqual({ width: 14, height: 14 })
      // The same word, in the panel: it breaks inside the region, which therefore does not scroll.
      const region = regionOf(trigger)
      expect(await region.evaluate((element) => element.scrollWidth - element.clientWidth)).toBe(0)
      await expect(region).not.toHaveAttribute('tabindex')
    })

    test(`${direction}, 320 px: a table wider than the box scrolls inside its panel by wheel and by key, and neither the box nor the page moves`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 480 })
      const trigger = await openHostile(page, { direction })
      const region = regionOf(trigger)
      const offsets = () => region.evaluate((element) => ({
        region: Math.abs(Math.round(element.scrollLeft)),
        box: element.closest('[data-orientation]:not([data-index])')?.scrollLeft ?? -1,
        page: Math.round(window.scrollX),
      }))
      expect(await region.evaluate((element) => element.scrollWidth - element.clientWidth), 'px of table past the region').toBeGreaterThanOrEqual(300)
      await expect(region).toHaveAttribute('tabindex', '0')
      expect(await offsets()).toEqual({ region: 0, box: 0, page: 0 })

      await region.scrollIntoViewIfNeeded()
      const box = await boxOf(region)
      await page.mouse.move(box.left + box.width / 2, box.top + box.height / 2)
      // Toward the inline end: a positive delta in English, a negative one in Arabic.
      await page.mouse.wheel(direction === 'ltr' ? 120 : -120, 0)
      await expect.poll(offsets).toEqual({ region: 120, box: 0, page: 0 })

      await trigger.focus()
      await page.keyboard.press('Tab')
      await expect(region).toBeFocused()
      const toward = direction === 'ltr' ? 'ArrowRight' : 'ArrowLeft'
      await page.keyboard.press(toward)
      await expect.poll(async () => (await offsets()).region).toBeGreaterThan(120)
      // The key held down: forty presses reach the far end, and the last column is inside the region.
      for (let press = 0; press < 40; press++) await page.keyboard.press(toward)
      const frame = await boxOf(region)
      await expect.poll(async () => (await boxOf(region.locator('th').last())).left).toBeGreaterThanOrEqual(frame.left)
      await expect.poll(async () => (await boxOf(region.locator('th').last())).right).toBeLessThanOrEqual(frame.right)
      expect(await region.evaluate((element) => Math.abs(element.scrollLeft) + element.clientWidth >= element.scrollWidth - 1)).toBe(true)
      expect((await offsets()).page).toBe(0)
    })
  }

  test('sixty items: each trigger is 48 px tall, the page scrolls to the last by wheel, and Tab reaches it from the one before', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 480 })
    await openLive(page, 'accordion--many-items')
    expect(await triggers(page).evaluateAll((all) => [...new Set(all.map((one) => one.getBoundingClientRect().height))])).toEqual([48])
    const last = triggers(page).nth(59)
    await expect(last).not.toBeInViewport()
    await page.mouse.move(160, 240)
    await page.mouse.wheel(0, 5000)
    await expect(last).toBeInViewport()
    await last.click()
    await atRest(page)
    await expect(regionOf(last)).toBeVisible()
    await expect(regionOf(last)).toHaveText('The answer to question 60.')

    await page.evaluate(() => { window.scrollTo(0, 0) })
    await triggers(page).nth(58).focus()
    await page.keyboard.press('Tab')
    await expect(last).toBeFocused()
    await expect(last).toBeInViewport()
  })
})

// Loaded as a module into a page with no heading of its own: see e2e/fixtures/accordion.tsx.
test.describe('inside a real layout', () => {
  const LAYOUTS = ['in-grid', 'in-flex', 'in-fit', 'in-cell']

  for (const screen of [{ width: 320, height: 480 }, { width: 1280, height: 800 }]) {
    for (const direction of DIRECTIONS) {
      test(`${String(screen.width)} px ${direction}: in a grid track, a flex column, a parent that fits its content and a table cell, the box stays in its parent`, async ({ page }) => {
        await page.setViewportSize(screen)
        await openFixture(page, { direction })
        await expectNoSidewaysScroll(page)
        for (const id of LAYOUTS) {
          const parent = await boxOf(page.locator(`#${id}`))
          const box = await boxOf(page.locator(`#${id} [data-orientation]`).first())
          expect(box.left, `${id}: the box starts before its parent`).toBeGreaterThanOrEqual(parent.left - 0.5)
          expect(box.right, `${id}: the box ends after its parent`).toBeLessThanOrEqual(parent.right + 0.5)
          expect(await faultsOf(page, `#${id}`), id).toEqual([])
        }
        expect(await liveErrors(page)).toEqual([])
      })
    }
  }

  test('320 px: the table is some 600 px wider than each box, and scrolls in its region, a tab stop', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 480 })
    await openFixture(page)
    for (const id of LAYOUTS) {
      const region = page.locator(`#${id} [role="region"]`).first()
      expect(await region.evaluate((element) => element.scrollWidth - element.clientWidth), id).toBeGreaterThanOrEqual(400)
      await expect(region, id).toHaveAttribute('tabindex', '0')
    }
  })

  test('1280 px: a parent that fits its content is as wide as the table needs, so nothing scrolls and nothing is a tab stop', async ({ page }) => {
    await openFixture(page)
    const region = page.locator('#in-fit [role="region"]').first()
    expect(await region.evaluate((element) => element.scrollWidth - element.clientWidth)).toBe(0)
    await expect(region).not.toHaveAttribute('tabindex')
    expect((await boxOf(page.locator('#in-fit'))).width).toBeLessThan(1000)
  })
})

test('the box clips at its round corners: a fill a caller gives an item ends there', async ({ page }) => {
  await openFixture(page)
  // The case is far down the fixture, and a screenshot holds the viewport only.
  await page.locator('#filled').scrollIntoViewIfNeeded()
  const box = await boxOf(page.locator('#filled [data-orientation]').first())
  const [left, top] = [Math.round(box.left), Math.round(box.top)]
  const [outside] = await pixelsOf(page, { x: left - 4, y: top - 4, width: 1, height: 1 })
  // One pixel in from the corner of the box is still outside its 12 px curve; twelve in is inside it.
  const [corner] = await pixelsOf(page, { x: left + 1, y: top + 1, width: 1, height: 1 })
  const [inside] = await pixelsOf(page, { x: left + 12, y: top + 12, width: 1, height: 1 })
  expect(corner).toEqual(outside)
  expect(inside).not.toEqual(outside)
})

test.describe('what a caller must not write, and what happens when they do', () => {
  test('no headingLevel under an h1: the item is an h3, and axe reports the skipped level, once', async ({ page }) => {
    await openFixture(page)
    await expect(page.locator('#default-level h3')).toHaveCount(1)
    expect((await axe(page, '#default-level')).violations).toEqual(['heading-order: h3'])
  })

  test('a link in the title: axe reports a control inside a control, and a press on the link also toggles the panel', async ({ page }) => {
    await openFixture(page)
    expect((await axe(page, '#link-title')).violations.map((found) => found.split(':')[0])).toEqual(['nested-interactive'])
    await page.locator('#title-link').click()
    await expect(page).toHaveURL(/#link-title$/)
    await expect(triggers(page, '#link-title')).toHaveAttribute('aria-expanded', 'true')
  })

  test('an empty title: the trigger is a button with no name, which axe reports', async ({ page }) => {
    await openFixture(page)
    expect((await axe(page, '#empty-title')).violations.map((found) => found.split(':')[0])).toEqual(['button-name', 'empty-heading'])
    // No line of text: it is the 14 px of its caret and the 14 px above and below, still over the 24 px floor.
    expect((await boxOf(triggers(page, '#empty-title'))).height).toBe(42)
    // Its value is the empty string, which names an item as well as any other: a press opens it.
    await triggers(page, '#empty-title').click()
    await expect(triggers(page, '#empty-title')).toHaveAttribute('aria-expanded', 'true')
  })

  test('hiddenUntilFound={false}: a closed panel is not in the page at all, and comes when its item opens', async ({ page }) => {
    await openFixture(page)
    const closed = triggers(page, '#not-kept').nth(1)
    await expect(page.locator('#not-kept [role="region"]')).toHaveCount(1)
    await expect(page.getByText('Not in the page until it opens.')).toHaveCount(0)
    await closed.click()
    await atRest(page)
    await expect(page.getByText('Not in the page until it opens.')).toBeVisible()
    await expect(page.locator('#not-kept [role="region"]')).toHaveCount(1)
    expect((await axe(page, '#not-kept')).violations).toEqual([])
  })
})

const twoFrames = (page: Page) => page.evaluate(() => new Promise<void>((resolve) => {
  requestAnimationFrame(() => { requestAnimationFrame(() => { resolve() }) })
}))

/** A finger dragged from one point to another, as raw touch events: Playwright has no swipe. Needs hasTouch. */
async function touchDrag(page: Page, from: { x: number, y: number }, to: { x: number, y: number }): Promise<void> {
  const session = await page.context().newCDPSession(page)
  const steps = 12
  await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [from] })
  for (let step = 1; step <= steps; step++) {
    const point = { x: from.x + ((to.x - from.x) * step) / steps, y: from.y + ((to.y - from.y) * step) / steps }
    await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [point] })
    await twoFrames(page)
  }
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await session.detach()
}

test.describe('under a coarse pointer', () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } })

  for (const demo of Object.keys(TITLES)) {
    test(`${demo}: every trigger and every link is at least 44 px, closed and with its last item toggled`, async ({ page }) => {
      await openLive(page, demo)
      const measure = async () => {
        const targets = await page.locator('#demo button, #demo a').all()
        expect(targets.length).toBeGreaterThanOrEqual(3)
        for (const target of targets) {
          if (!(await target.isVisible())) continue
          const box = await boxOf(target)
          const name = (await target.textContent()) ?? ''
          expect(box.width, `${name} width`).toBeGreaterThanOrEqual(44)
          expect(box.height, `${name} height`).toBeGreaterThanOrEqual(44)
        }
      }
      await measure()
      await triggers(page).last().tap()
      await atRest(page)
      await measure()
    })
  }

  test('a tap opens an item and a second tap closes it', async ({ page }) => {
    await openLive(page, 'accordion--basic')
    const second = triggers(page).nth(1)
    await second.tap()
    await atRest(page)
    expect(await expanded(page)).toEqual(['false', 'true', 'false'])
    await second.tap()
    await atRest(page)
    expect(await expanded(page)).toEqual(['false', 'false', 'false'])
  })

  test('a trigger with no title at all is 44 px tall: the floor holds it, where a mouse sees the 42 px of its caret and padding', async ({ page }) => {
    await openFixture(page)
    expect((await boxOf(triggers(page, '#empty-title'))).height).toBe(44)
  })

  test('a finger drags the wide table sideways inside its panel, and the page up to the items below', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 480 })
    const region = regionOf(await openHostile(page))
    await region.scrollIntoViewIfNeeded()
    const box = await boxOf(region)
    const middle = { x: box.left + box.width / 2, y: box.top + box.height / 2 }
    await touchDrag(page, { x: middle.x + 80, y: middle.y }, { x: middle.x - 80, y: middle.y })
    await expect.poll(() => region.evaluate((element) => Math.round(element.scrollLeft))).toBeGreaterThanOrEqual(100)
    expect(await page.evaluate(() => Math.round(window.scrollX))).toBe(0)

    // From the top of the page, a finger on the first panel drags the page up by most of the 200 px it travels.
    await page.evaluate(() => { window.scrollTo(0, 0) })
    await touchDrag(page, { x: 160, y: 400 }, { x: 160, y: 200 })
    await expect.poll(() => page.evaluate(() => Math.round(window.scrollY))).toBeGreaterThanOrEqual(100)
  })
})

test.describe('axe', () => {
  // Twice a page, and one page holds sixty items.
  test.describe.configure({ timeout: 60_000 })

  for (const demo of Object.keys(TITLES)) {
    for (const mode of MODES) {
      for (const direction of DIRECTIONS) {
        test(`${demo} ${mode} ${direction}: no violation, as it loads and with its last item toggled`, async ({ page }) => {
          await openLive(page, demo, { mode, direction })
          const loaded = await axe(page)
          expect(loaded.violations).toEqual([])
          // Not an empty run: axe did read the headings and the triggers.
          expect(loaded.passes).toEqual(expect.arrayContaining(['heading-order', 'button-name', 'aria-allowed-attr']))

          await triggers(page).last().click()
          await atRest(page)
          expect((await axe(page)).violations).toEqual([])
        })
      }
    }
  }
})

test.describe('axe on a 320 x 480 phone', () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 320, height: 480 } })

  for (const demo of Object.keys(TITLES)) {
    test(`${demo}: no violation`, async ({ page }) => {
      await openLive(page, demo)
      expect((await axe(page)).violations).toEqual([])
    })
  }

  // The table scrolls there: a scroller with no control in it, which axe refuses unless the keyboard can reach it.
  test('accordion--long-content: its table region scrolls, is a tab stop, and axe has checked exactly that', async ({ page }) => {
    const region = regionOf(await openHostile(page))
    await expect(region).toHaveAttribute('tabindex', '0')
    const found = await axe(page)
    expect(found.violations).toEqual([])
    expect(found.passes).toContain('scrollable-region-focusable')
  })
})

test.describe('larger text', () => {
  for (const screen of [{ width: 1280, height: 800 }, { width: 390, height: 844 }]) {
    test(`${String(screen.width)} px, text at 200% (root 32 px): every trigger grows with its title, and nothing leaves its box`, async ({ page }) => {
      await page.setViewportSize(screen)
      for (const demo of ['accordion--basic', 'accordion--long-content', 'accordion--rtl']) {
        await openLive(page, demo)
        await page.addStyleTag({ content: 'html { font-size: 32px }' })
        await expectNoSidewaysScroll(page)
        expect(await faultsOf(page), demo).toEqual([])
        // One line of 28 px text is 40 px tall, in 28 px of padding above and below: twice the 48 px, or more lines.
        const heights = await triggers(page).evaluateAll((all) => all.map((one) => one.getBoundingClientRect().height))
        expect(Math.min(...heights), demo).toBeGreaterThanOrEqual(96)
        if (screen.width === 1280 && demo === 'accordion--basic') expect(heights).toEqual([96, 96, 96])
        const caret = await boxOf(triggers(page).first().locator('xpath=./span[last()]'))
        expect({ width: caret.width, height: caret.height }).toEqual({ width: 28, height: 28 })
      }
    })
  }

  test('WCAG 1.4.12: with the line height, the letter, word and paragraph spacing of the criterion, no title is cut', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 480 })
    for (const demo of ['accordion--basic', 'accordion--long-content', 'accordion--rtl']) {
      await openLive(page, demo)
      await page.addStyleTag({ content: '* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important } p { margin-bottom: 2em !important }' })
      await expectNoSidewaysScroll(page)
      expect(await faultsOf(page), demo).toEqual([])
      const cut = await triggers(page).evaluateAll((all) => all.filter((one) => {
        const title = one.firstElementChild
        return !title || title.scrollHeight > title.clientHeight + 1 || title.getBoundingClientRect().bottom > one.getBoundingClientRect().bottom
      }).length)
      expect(cut, demo).toBe(0)
    }
  })
})

test.describe('the three modes', () => {
  for (const mode of MODES) {
    test(`${mode}: a trigger is filled while the pointer is on it, and only then`, async ({ page }) => {
      await openLive(page, 'accordion--basic', { mode })
      const second = triggers(page).nth(1)
      await expect(second).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
      await second.hover()
      await atRest(page)
      await expect(second).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
      await expect(triggers(page).first()).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
      await page.mouse.move(2, 2)
      await atRest(page)
      await expect(second).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
    })
  }
})
