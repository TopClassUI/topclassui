import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Locator, type Page } from '@playwright/test'

import { DIRECTIONS, MODES } from '../scripts/lib/harness.js'
import { type LiveOptions, expectInsideViewport, expectNoSidewaysScroll, liveErrors, openLive } from './live.js'
import {
  type Box, type OpenOptions, atRest, boxOf, expectClosed, expectNothingSideways, inkOf, openOverlay,
  pageLock, pressInside, scrollPageTo, touchDrag, wheelAt, withScrollbar,
} from './overlay.js'
import { DEMOS } from './pages.js'
import { FORCED_CANVAS, inkOn, pixelsOf } from './pixels.js'

// What happy-dom cannot lay out and the static page cannot open: which edge a sheet stands on, what a finger does
// to it, where focus goes, what holds the page behind still, and whether everything stays inside a small screen.

/** The first trigger of every demo and the title its sheet shows. Written out, so a renamed demo fails here. */
const DRAWERS: Record<string, { trigger: string, title: string }> = {
  'drawer--bottom': { trigger: 'Country', title: 'Choose a country' },
  'drawer--end': { trigger: 'Filters', title: 'Filters' },
  'drawer--long-body': { trigger: 'Activity', title: 'Activity' },
  'drawer--long-content': {
    trigger: 'Move to the archive',
    title: 'Move the quarterly report, its eleven attachments and every comment thread to the shared archive of the finance team',
  },
  'drawer--non-modal': { trigger: 'Outline', title: 'Outline' },
  'drawer--playground': { trigger: 'Filters', title: 'Filters' },
  'drawer--rtl': { trigger: 'القائمة', title: 'تصفّح' },
  'drawer--sizes': { trigger: 'xs', title: 'Size xs' },
  'drawer--start': { trigger: 'Menu', title: 'Browse' },
  'drawer--states': { trigger: 'Open', title: 'Opened' },
  'drawer--top': { trigger: 'What is new', title: 'Version 2.4' },
  'drawer--trap-focus': { trigger: 'Inspect', title: 'Inspector' },
  'drawer--with-form': { trigger: 'Invite', title: 'Invite a teammate' },
}

/** The four screens Unit 3 measures at: a small phone, a phone, a desktop and a phone on its side. */
const SCREENS = [
  { width: 320, height: 480 }, { width: 390, height: 844 }, { width: 1280, height: 800 }, { width: 844, height: 390 },
] as const

/** A phone under a finger: a coarse pointer, touch events, and no scrollbar gutter. */
const PHONE = { hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } } as const

/** The x. In English and in Arabic, since the island demo names it from its own provider. */
const CLOSE = { en: 'Close this panel', ar: 'إغلاق هذه اللوحة' } as const

/** A trigger by its whole label. Not by role: the page behind an open sheet is hidden from roles. */
const triggerOf = (page: Page, name: string, within = '#demo') =>
  page.locator(`${within} button`).filter({ has: page.getByText(name, { exact: true }) })

/** Opens a demo page and its first sheet, and returns the settled popup. */
async function open(page: Page, demo: string, options: LiveOptions & OpenOptions = {}): Promise<Locator> {
  const known = DRAWERS[demo]
  if (!known) throw new Error(`no row for ${demo}`)
  await openLive(page, demo, options)
  const popup = await openOverlay(page, triggerOf(page, known.trigger), options)
  await expect(popup.locator('h2')).toHaveText(known.title)
  return popup
}

/** The sheets of e2e/fixtures/drawer-shapes.tsx, added to a page that holds no sheet of its own. */
async function shapes(page: Page, options: LiveOptions = {}): Promise<void> {
  await openLive(page, 'separator--horizontal', options)
  await page.addScriptTag({ type: 'module', url: '/e2e/fixtures/drawer-shapes.tsx' })
  await expect(page.locator('#shapes')).toBeVisible()
}

const xOf = (popup: Locator) => popup.locator(`button[aria-label="${CLOSE.en}"], button[aria-label="${CLOSE.ar}"]`)
const bodyOf = (popup: Locator) => popup.locator('[data-drawer-content]')
const scrollY = (page: Page) => page.evaluate(() => Math.round(window.scrollY))

interface Parts { popup: Box, header: Box, body: Box, footer: Box | null, scrollTop: number, scrollable: number }

/** The bars of a sheet: the header holds the title, the body is Base UI's content, and a footer may follow it. */
const partsOf = (popup: Locator) => popup.evaluate((element): Parts => {
  const header = element.querySelector('h2')?.parentElement
  const body = element.querySelector('[data-drawer-content]')
  if (!header || !body) throw new Error('the sheet has no header and no body')
  const after = body.nextElementSibling
  const box = (target: Element): Box => {
    const { left, top, right, bottom, width, height } = target.getBoundingClientRect()
    return { left, top, right, bottom, width, height }
  }
  return {
    popup: box(element), header: box(header), body: box(body), footer: after?.tagName === 'DIV' ? box(after) : null,
    scrollTop: body.scrollTop, scrollable: body.scrollHeight - body.clientHeight,
  }
})

/**
 * Where a sheet stands on the screen and where its x stands on the sheet, in whole pixels from each edge. The screen
 * is the body's width: html keeps a gutter for the scrollbar, 10 px that no fixed box, scrim or sheet, is laid out in.
 */
const seatOf = (popup: Locator) => popup.evaluate((element) => {
  const frame = element.getBoundingClientRect()
  const x = (element.querySelector(':scope > button:last-child') ?? element).getBoundingClientRect()
  const screen = { width: document.body.clientWidth, height: window.innerHeight }
  return {
    left: Math.round(frame.left), right: Math.round(screen.width - frame.right),
    top: Math.round(frame.top), bottom: Math.round(screen.height - frame.bottom),
    xFromLeft: Math.round(x.left - frame.left), xFromRight: Math.round(frame.right - x.right),
  }
})

interface Point { x: number, y: number }

const twoFrames = (page: Page) => page.evaluate(() => new Promise<void>((resolve) => {
  requestAnimationFrame(() => { requestAnimationFrame(() => { resolve() }) })
}))

/**
 * A finger put down and dragged from one point to another, as raw touch events, and left on the glass: the
 * function it returns lifts it. Slow on purpose, twelve steps of two frames: a flick closes a sheet by its speed alone.
 */
async function finger(page: Page, from: Point, to: Point): Promise<() => Promise<void>> {
  const session = await page.context().newCDPSession(page)
  const steps = 12
  await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [from] })
  for (let step = 1; step <= steps; step++) {
    const at = { x: from.x + ((to.x - from.x) * step) / steps, y: from.y + ((to.y - from.y) * step) / steps }
    await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [at] })
    await twoFrames(page)
  }
  return async () => {
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    await session.detach()
  }
}

/** The same drag, with the finger lifted at its end. */
async function swipe(page: Page, from: Point, to: Point): Promise<void> {
  await (await finger(page, from, to))()
}

/** The four swipes Base UI knows, as a step of one pixel on the screen. */
const STEP = { right: { x: 1, y: 0 }, left: { x: -1, y: 0 }, down: { x: 0, y: 1 }, up: { x: 0, y: -1 } } as const
type Physical = keyof typeof STEP

/**
 * Where a finger goes down on a sheet that leaves by `physical`, and how far it must go to close it: Base UI lets a
 * sheet go once it is past half of its own size. The point is on no control: the header row, or the padding under the
 * actions of a top sheet, and far enough from the edge the finger heads for to stay on the screen.
 */
async function strokeOf(popup: Locator, physical: Physical): Promise<{ from: Point, past: Point, back: Point, short: Point }> {
  const frame = await boxOf(popup)
  const from = {
    right: { x: frame.left + 100, y: frame.top + 27 },
    left: { x: frame.right - 100, y: frame.top + 27 },
    down: { x: frame.left + 100, y: frame.top + 40 },
    up: { x: frame.left + frame.width / 2, y: frame.bottom - 8 },
  }[physical]
  const size = physical === 'left' || physical === 'right' ? frame.width : frame.height
  const to = (distance: number) => ({ x: from.x + STEP[physical].x * distance, y: from.y + STEP[physical].y * distance })
  return { from, past: to(size * 0.65), back: to(-80), short: to(60) }
}

test('the table names every drawer demo', () => {
  expect(Object.keys(DRAWERS).sort()).toEqual(DEMOS.filter((demo) => demo.startsWith('drawer--')).sort())
  expect(Object.keys(DRAWERS)).toHaveLength(13)
})

test.describe('the states strip', () => {
  /** The cell a state is drawn in, by the title that captions it. */
  const cellOf = (page: Page, title: string) => page.locator(`#demo [title="${title}"]`)

  for (const direction of DIRECTIONS) {
    test(`${direction}: the side and the bottom sheet are pictures at their edge of their own cell, whole inside it, and the page holds no open sheet`, async ({ page }) => {
      await openLive(page, 'drawer--states', { direction })
      expect(await cellOf(page, 'closed').locator('xpath=..').locator(':scope > *').evaluateAll((cells) => cells.map((cell) => cell.getAttribute('title'))))
        .toEqual(['closed', 'side sheet', 'bottom sheet', 'dragging', 'focus trapped'])
      await expect(page.locator('[role="dialog"]')).toHaveCount(0)
      for (const title of ['side sheet', 'bottom sheet', 'dragging', 'focus trapped']) {
        const cell = cellOf(page, title)
        const sheet = cell.locator('[aria-hidden="true"][inert]')
        await expect(sheet).toHaveText('sheet')
        const [inner, outer] = [await boxOf(sheet), await boxOf(cell)]
        expect(inner.top >= outer.top && inner.bottom <= outer.bottom && inner.left >= outer.left && inner.right <= outer.right, `${title} leaves its cell`).toBe(true)
        // The edge it stands on: the inline end, which is the left in Arabic, or the bottom.
        const edge = title === 'bottom sheet' ? outer.bottom - inner.bottom : direction === 'rtl' ? inner.left - outer.left : outer.right - inner.right
        expect(Math.abs(edge), `${title} is off its edge`).toBeLessThanOrEqual(1)
      }
      expect((await axe(page)).violations).toEqual([])
    })
  }
})

// A Drawer slides and never fades: a wait on its opacity would return on the first frame of the slide.
test.describe('the helper that opens every overlay holds for a sheet that slides', () => {
  /** What moves on the sheet and beside it, read in the same tick openOverlay returned in. */
  const motion = (popup: Locator) => popup.evaluate((element) => {
    const style = getComputedStyle(element)
    const layer = element.closest('[data-base-ui-portal]') ?? element
    return {
      opacity: style.opacity, transform: style.transform, width: element.getBoundingClientRect().width,
      left: element.getBoundingClientRect().left, duration: style.transitionDuration,
      running: layer.getAnimations({ subtree: true }).filter((animation) => animation.playState === 'running').length,
    }
  })

  // 1270 px of screen beside the gutter, less the 320 px of the sheet: its left edge rests at 950.
  test('returns a sheet at rest: at its edge, with no slide left running, after 300 ms of one', async ({ page }) => {
    const popup = await open(page, 'drawer--end')
    expect(await motion(popup)).toEqual({ opacity: '1', transform: 'matrix(1, 0, 0, 1, 0, 0)', width: 320, left: 950, duration: '0.3s', running: 0 })
  })

  test('returns at once where nothing moves, under reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    const popup = await open(page, 'drawer--end')
    expect(await motion(popup)).toEqual({ opacity: '1', transform: 'matrix(1, 0, 0, 1, 0, 0)', width: 320, left: 950, duration: '0s', running: 0 })
  })
})

test.describe('placement is logical', () => {
  /** The sheet is 320 px of a screen 1265 px wide, and its x is 12 px in from its inline end, past the line of a start sheet. */
  const AT_THE_RIGHT = { left: 950, right: 0, top: 0, bottom: 0 }
  const AT_THE_LEFT = { left: 0, right: 950, top: 0, bottom: 0 }

  test('ltr: end stands at the right, full height, with its x at the right', async ({ page }) => {
    expect(await seatOf(await open(page, 'drawer--end'))).toEqual({ ...AT_THE_RIGHT, xFromLeft: 284, xFromRight: 12 })
  })

  test('rtl: end stands at the left, with its x at the left', async ({ page }) => {
    expect(await seatOf(await open(page, 'drawer--end', { direction: 'rtl' }))).toEqual({ ...AT_THE_LEFT, xFromLeft: 12, xFromRight: 284 })
  })

  test('ltr: start stands at the left, with its x at the right', async ({ page }) => {
    expect(await seatOf(await open(page, 'drawer--start'))).toEqual({ ...AT_THE_LEFT, xFromLeft: 283, xFromRight: 13 })
  })

  test('rtl: start stands at the right, with its x at the left', async ({ page }) => {
    expect(await seatOf(await open(page, 'drawer--start', { direction: 'rtl' }))).toEqual({ ...AT_THE_RIGHT, xFromLeft: 13, xFromRight: 283 })
  })

  // The demo mounts its own RTL provider, so on an LTR page its portal sits in a <body> of the other direction.
  for (const direction of DIRECTIONS) {
    test(`the RTL island on the ${direction} page: start stands at the right and end at the left, each with its x at the left`, async ({ page }) => {
      await openLive(page, 'drawer--rtl', { direction })
      const start = await openOverlay(page, triggerOf(page, 'القائمة'))
      expect(await seatOf(start)).toEqual({ ...AT_THE_RIGHT, xFromLeft: 13, xFromRight: 283 })
      await expect(start).toHaveAttribute('data-swipe-direction', 'right')
      await page.keyboard.press('Escape')
      await expectClosed(page)

      const end = await openOverlay(page, triggerOf(page, 'التصفية'))
      expect(await seatOf(end)).toEqual({ ...AT_THE_LEFT, xFromLeft: 12, xFromRight: 284 })
      await expect(end).toHaveAttribute('data-swipe-direction', 'left')
      // Named by the island's own labels, not the page's.
      await expect(xOf(end)).toHaveAttribute('aria-label', CLOSE.ar)
    })
  }

  test('the island is laid out and read as its provider says: the viewport carries rtl and ar on an English page', async ({ page }) => {
    await openLive(page, 'drawer--rtl')
    const popup = await openOverlay(page, triggerOf(page, 'التصفية'))
    const read = await popup.evaluate((element) => ({
      body: getComputedStyle(document.body).direction,
      viewport: getComputedStyle(element.parentElement ?? element).direction,
      popup: getComputedStyle(element).direction,
      page: document.documentElement.lang,
      lang: element.parentElement?.getAttribute('lang') ?? null,
      arabic: element.matches(':lang(ar)'),
    }))
    expect(read).toEqual({ body: 'ltr', viewport: 'rtl', popup: 'rtl', page: 'en', lang: 'ar', arabic: true })
    // The title starts at the right, 16 px in, and the two actions end at the left.
    const [frame, title] = [await boxOf(popup), await inkOf(popup.locator('h2'))]
    expect(Math.round(frame.right - title.right)).toBe(17)
    const [first, second] = await Promise.all((await popup.locator('button:not([aria-label])').all()).map((button) => boxOf(button)))
    expect((first?.left ?? 0) > (second?.right ?? 0), 'the first action is right of the second').toBe(true)
  })

  test('top and bottom span the screen: a top sheet hangs from the top edge and a bottom sheet stands on the bottom one', async ({ page }) => {
    const top = await seatOf(await open(page, 'drawer--top'))
    expect(top).toMatchObject({ left: 0, right: 0, top: 0, xFromRight: 12 })
    const bottom = await seatOf(await open(page, 'drawer--bottom'))
    expect(bottom).toMatchObject({ left: 0, right: 0, bottom: 0, xFromRight: 12 })
  })

  /** What a sheet must inherit from each page when no provider tells it, written out. */
  const INHERITED = {
    ltr: { direction: 'ltr', english: true, seat: { ...AT_THE_RIGHT, xFromLeft: 284, xFromRight: 12 } },
    rtl: { direction: 'rtl', english: false, seat: { ...AT_THE_LEFT, xFromLeft: 12, xFromRight: 284 } },
  } as const

  // R-13-1 asks for the provider and the harness always mounts one, so this sheet comes from a fixture module.
  for (const direction of DIRECTIONS) {
    test(`with no provider at all, on the ${direction} page: nothing is stamped on the viewport, and the sheet is laid out as its page is`, async ({ page }) => {
      await openLive(page, 'separator--horizontal', { direction })
      await page.addScriptTag({ type: 'module', url: '/e2e/fixtures/drawer-no-provider.tsx' })
      const popup = await openOverlay(page, page.locator('#no-provider button'))
      const read = await popup.evaluate((element) => ({
        dir: element.parentElement?.getAttribute('dir') ?? null,
        lang: element.parentElement?.getAttribute('lang') ?? null,
        direction: getComputedStyle(element).direction,
        english: element.matches(':lang(en)'),
      }))
      const { seat, ...inherited } = INHERITED[direction]
      expect(read).toEqual({ dir: null, lang: null, ...inherited })
      expect(await seatOf(popup)).toEqual(seat)
      await expect(xOf(popup)).toHaveAttribute('aria-label', CLOSE.en)
      // The cost of no provider: the swipe is worked out from it, never from the DOM, so it stays the left-to-right one.
      await expect(popup).toHaveAttribute('data-swipe-direction', 'right')
      expect(await liveErrors(page)).toEqual([])
    })
  }
})

test.describe('a swipe, under a finger', () => {
  test.use(PHONE)

  /** The swipe that closes each sheet on each page, written out: physical, as Base UI takes it. */
  const SWIPES = {
    ltr: { 'drawer--end': 'right', 'drawer--start': 'left', 'drawer--top': 'up', 'drawer--bottom': 'down' },
    rtl: { 'drawer--end': 'left', 'drawer--start': 'right', 'drawer--top': 'up', 'drawer--bottom': 'down' },
  } as const

  for (const direction of DIRECTIONS) {
    for (const [demo, physical] of Object.entries(SWIPES[direction])) {
      test(`${direction} ${demo}: a swipe ${physical}, toward its own edge and past half of it, closes it and hands focus back`, async ({ page }) => {
        const popup = await open(page, demo, { direction, by: 'tap' })
        await expect(popup).toHaveAttribute('data-swipe-direction', physical)
        const stroke = await strokeOf(popup, physical)
        await swipe(page, stroke.from, stroke.past)
        await expectClosed(page)
        await expect(triggerOf(page, DRAWERS[demo]?.trigger ?? '')).toBeFocused()
        expect(await liveErrors(page)).toEqual([])
      })

      test(`${direction} ${demo}: a swipe the other way leaves it open, and so does a short one ${physical}: it comes back to its box`, async ({ page }) => {
        const popup = await open(page, demo, { direction, by: 'tap' })
        const [before, stroke] = [await boxOf(popup), await strokeOf(popup, physical)]
        await swipe(page, stroke.from, stroke.back)
        await atRest(popup)
        await expect(popup).toHaveAttribute('data-open', '')
        expect(await boxOf(popup), 'after a swipe away from its edge').toEqual(before)

        await swipe(page, stroke.from, stroke.short)
        await atRest(popup)
        await expect(popup).toHaveAttribute('data-open', '')
        expect(await boxOf(popup), 'after 60 px toward its edge').toEqual(before)
      })
    }
  }

  for (const [label, physical] of [['القائمة', 'right'], ['التصفية', 'left']] as const) {
    test(`the RTL island on the LTR page: the sheet of ${label} closes by a swipe ${physical}`, async ({ page }) => {
      await openLive(page, 'drawer--rtl')
      const popup = await openOverlay(page, triggerOf(page, label), { by: 'tap' })
      const stroke = await strokeOf(popup, physical)
      await swipe(page, stroke.from, stroke.past)
      await expectClosed(page)
      await expect(triggerOf(page, label)).toBeFocused()
    })
  }

  /** Listens to the touch moves the page really receives: Chromium holds back the first few of a drag. */
  const recordMoves = (page: Page) => page.evaluate(() => {
    const seen: number[] = []
    Object.assign(window, { fingerAt: seen })
    document.addEventListener('touchmove', (event) => { seen.push(event.touches[0]?.clientX ?? 0) }, { capture: true })
  })
  const travelled = (page: Page) => page.evaluate(() => {
    const seen = (window as unknown as { fingerAt: number[] }).fingerAt
    return Math.round((seen.at(-1) ?? 0) - (seen[0] ?? 0))
  })

  // Base UI moves the sheet by an inline transform and by two variables. On the translate property the two added up.
  test('while a finger holds it the sheet goes as far as the finger and no further: not twice as far', async ({ page }) => {
    const popup = await open(page, 'drawer--end', { by: 'tap' })
    await recordMoves(page)
    const [before, stroke] = [await boxOf(popup), await strokeOf(popup, 'right')]
    const lift = await finger(page, stroke.from, stroke.short)
    const moved = Math.round((await boxOf(popup)).left - before.left)
    const finger60 = await travelled(page)
    await lift()
    // 60 px of drag, of which the page is told all but the first 20: the sheet moved those 40.
    expect(finger60).toBe(40)
    expect(moved).toBe(40)
    await atRest(popup)
    expect(await boxOf(popup)).toEqual(before)
  })

  /** Every left edge the sheet is painted at from now on, one a frame, until it leaves the document. */
  const recordPath = (popup: Locator) => popup.evaluate((element) => {
    const seen: number[] = []
    Object.assign(window, { sheetAt: seen })
    const frame = () => {
      if (!element.isConnected) return
      seen.push(Math.round(element.getBoundingClientRect().left))
      requestAnimationFrame(frame)
    }
    requestAnimationFrame(frame)
  })

  // The transition must be live at the moment Base UI starts the way out, or the sheet jumps to the edge in one frame.
  test('let go past half way, the sheet slides the rest of the way out: it is painted between the finger and the edge', async ({ page }) => {
    const popup = await open(page, 'drawer--end', { by: 'tap' })
    const stroke = await strokeOf(popup, 'right')
    const lift = await finger(page, stroke.from, stroke.past)
    const held = Math.round((await boxOf(popup)).left)
    await recordPath(popup)
    await lift()
    await expectClosed(page)
    const path = await page.evaluate(() => (window as unknown as { sheetAt: number[] }).sheetAt)
    const between = [...new Set(path)].filter((left) => left > held && left < 390)
    expect(held).toBeLessThan(280)
    expect(between.length, `painted at ${path.join(', ')}`).toBeGreaterThanOrEqual(3)
    expect(path, 'it never comes back toward the screen').toEqual([...path].sort((a, b) => a - b))
  })

  test('let go short of half way, it slides back the same way: no jump', async ({ page }) => {
    const popup = await open(page, 'drawer--end', { by: 'tap' })
    const [before, stroke] = [await boxOf(popup), await strokeOf(popup, 'right')]
    const lift = await finger(page, stroke.from, stroke.short)
    const held = Math.round((await boxOf(popup)).left)
    await recordPath(popup)
    await lift()
    await atRest(popup)
    const path = await page.evaluate(() => (window as unknown as { sheetAt: number[] }).sheetAt)
    const between = [...new Set(path)].filter((left) => left < held && left > before.left)
    expect(between.length, `painted at ${path.join(', ')}`).toBeGreaterThanOrEqual(3)
  })
})

test.describe('a finger on the body of a sheet', () => {
  test.use(PHONE)

  test('bottom sheet: a drag inside the list scrolls the list; the sheet stays, and at its end the page behind does not move', async ({ page }) => {
    await openLive(page, 'drawer--bottom', { tall: true })
    // The control: the same drag scrolls the page while nothing is open.
    await touchDrag(page, 195, 600, 560)
    const before = await scrollY(page)
    expect(before).toBeGreaterThan(10)

    const popup = await openOverlay(page, triggerOf(page, 'Country'), { by: 'tap' })
    const [frame, { body }] = [await boxOf(popup), await partsOf(popup)]
    await touchDrag(page, 200, body.top + 400, body.top + 100)
    expect((await partsOf(popup)).scrollTop, 'px the list scrolled').toBeGreaterThan(200)
    expect(await boxOf(popup), 'the sheet did not follow the finger').toEqual(frame)
    expect(await scrollY(page)).toBe(before)

    for (let drag = 0; drag < 6; drag++) await touchDrag(page, 200, body.bottom - 20, body.top + 20)
    const end = await partsOf(popup)
    expect(end.scrollable).toBeGreaterThan(300)
    expect(end.scrollTop, 'the list is at its end').toBe(end.scrollable)
    await touchDrag(page, 200, body.bottom - 20, body.top + 20)
    expect(await scrollY(page), 'after a drag past the end of the list').toBe(before)
    await expect(popup).toHaveAttribute('data-open', '')

    // Scrolled, a drag down scrolls the list back: it is not a swipe, however long.
    await touchDrag(page, 200, body.top + 60, body.top + 460)
    expect((await partsOf(popup)).scrollTop, 'the list scrolled back').toBeLessThan(end.scrollable - 200)
    await expect(popup).toHaveAttribute('data-open', '')
    expect(await boxOf(popup)).toEqual(frame)
  })

  // What Base UI 1.8.0 does, which is what a sheet on a phone does: at the top of the list, a pull down moves the sheet.
  test('bottom sheet: with the list at its top, a drag down from the list pulls the sheet: 60 px and it comes back, past half and it closes', async ({ page }) => {
    const popup = await open(page, 'drawer--bottom', { by: 'tap' })
    const [frame, { body, scrollTop }] = [await boxOf(popup), await partsOf(popup)]
    expect(scrollTop).toBe(0)
    const from = { x: 200, y: body.top + 100 }

    const lift = await finger(page, from, { x: 200, y: from.y + 60 })
    expect((await boxOf(popup)).top, 'the sheet follows the finger down').toBeGreaterThan(frame.top + 20)
    expect((await partsOf(popup)).scrollTop).toBe(0)
    await lift()
    await atRest(popup)
    expect(await boxOf(popup)).toEqual(frame)

    // 760 px of sheet: 500 px is past half of it.
    await swipe(page, from, { x: 200, y: from.y + 500 })
    await expectClosed(page)
    await expect(triggerOf(page, 'Country')).toBeFocused()
  })

  test('side sheet: a drag up and down its long body scrolls the body, and a swipe across it toward the edge still closes the sheet', async ({ page }) => {
    const popup = await open(page, 'drawer--long-body', { by: 'tap' })
    const [frame, { body }] = [await boxOf(popup), await partsOf(popup)]
    await touchDrag(page, body.left + 80, body.top + 400, body.top + 100)
    expect((await partsOf(popup)).scrollTop, 'px the body scrolled').toBeGreaterThan(200)
    expect(await boxOf(popup)).toEqual(frame)

    await swipe(page, { x: body.left + 60, y: body.top + 300 }, { x: body.left + 280, y: body.top + 300 })
    await expectClosed(page)
  })

  // Under a modal sheet Base UI holds the page still. Under one that is not, only overscroll-behavior on the body does.
  test('not modal, past the end of its body: a drag leaves the page where it was, though the page is free to scroll', async ({ page }) => {
    await openLive(page, 'drawer--non-modal', { tall: true })
    await touchDrag(page, 60, 600, 560)
    const before = await scrollY(page)
    expect(before).toBeGreaterThan(10)

    const popup = await openOverlay(page, triggerOf(page, 'Outline'), { by: 'tap' })
    expect((await pageLock(page)).overflow, 'the page is not locked').toBe('visible')
    await bodyOf(popup).evaluate((body) => {
      const more = document.createElement('div')
      more.style.height = '1500px'
      body.append(more)
    })
    const { body } = await partsOf(popup)
    for (let drag = 0; drag < 5; drag++) await touchDrag(page, body.left + 80, body.bottom - 20, body.top + 20)
    const end = await partsOf(popup)
    expect(end.scrollable).toBeGreaterThan(500)
    expect(end.scrollTop, 'the body is at its end').toBe(end.scrollable)
    await touchDrag(page, body.left + 80, body.bottom - 20, body.top + 20)
    await touchDrag(page, body.left + 80, body.bottom - 20, body.top + 20)
    expect(await scrollY(page), 'after two drags past the end of the body').toBe(before)
    await expect(popup).toHaveAttribute('data-open', '')
  })
})

// Emulation reports no safe area, so each test sets the token by hand, as env() would on a phone with a notch.
test.describe('a bottom sheet on a phone', () => {
  for (const [width, height, tallest] of [[320, 480, 432], [390, 844, 759.6], [844, 390, 351]] as const) {
    test.describe(`${String(width)} x ${String(height)}`, () => {
      test.use({ hasTouch: true, isMobile: true, viewport: { width, height } })

      test(`is inside the screen and ${String(tallest)} px tall, nine tenths of it; its list scrolls, and its x is in reach`, async ({ page }) => {
        const popup = await open(page, 'drawer--bottom', { by: 'tap' })
        await expectInsideViewport(popup, 'the sheet')
        await expectNoSidewaysScroll(page)
        await expectNothingSideways(popup)
        const parts = await partsOf(popup)
        expect(Math.round(parts.popup.height * 10) / 10).toBe(tallest)
        expect(parts.popup.width).toBe(width)
        expect(Math.round(parts.popup.bottom)).toBe(height)
        expect(parts.scrollable, 'px the list scrolls').toBeGreaterThan(300)
        expect(Math.round(parts.body.bottom), 'the list ends where the sheet ends').toBe(height)

        // The x: 44 px, wholly on the screen, on top of whatever is under it, and it closes the sheet.
        const x = await boxOf(xOf(popup))
        expect([x.width, x.height]).toEqual([44, 44])
        await expectInsideViewport(xOf(popup), 'the x')
        expect(await xOf(popup).evaluate((el) => {
          const box = el.getBoundingClientRect()
          return el.contains(document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2))
        }), 'a tap on the middle of the x lands on it').toBe(true)
        await xOf(popup).tap()
        await expectClosed(page)
      })

      test('with a home indicator of 34 px, the sheet pads its foot by 34 px and its list ends above the indicator', async ({ page }) => {
        const popup = await open(page, 'drawer--bottom', { by: 'tap' })
        await expect(popup).toHaveCSS('padding-bottom', '0px')
        await page.evaluate(() => { document.documentElement.style.setProperty('--tc-safe-bottom', '34px') })
        await expect(popup).toHaveCSS('padding-bottom', '34px')
        const parts = await partsOf(popup)
        expect(Math.round(parts.popup.bottom), 'the surface still reaches the edge of the screen').toBe(height)
        expect(Math.round(parts.body.bottom), 'the list ends above the indicator').toBe(height - 34)
        expect(Math.round(parts.popup.height * 10) / 10, 'and the sheet is no taller for it').toBe(tallest)
        // Its last row can be scrolled clear of the indicator.
        const last = popup.locator('button').filter({ hasText: 'Italy' })
        await last.scrollIntoViewIfNeeded()
        expect((await boxOf(last)).bottom).toBeLessThanOrEqual(height - 34)
      })
    })
  }

  test.describe('the safe areas of the other three sheets', () => {
    test.use(PHONE)

    /**
     * A notch on every side, each of its own size: 47 px at the top, 21 at the foot, 44 at the inline start and 30 at
     * the end. tokens.css names the two inline insets again on every element that carries dir, and the viewport of a
     * sheet does, so those two are set there.
     */
    const notch = (popup: Locator) => popup.evaluate((element) => {
      document.documentElement.style.setProperty('--tc-safe-top', '47px')
      document.documentElement.style.setProperty('--tc-safe-bottom', '21px')
      element.parentElement?.style.setProperty('--tc-safe-start', '44px')
      element.parentElement?.style.setProperty('--tc-safe-end', '30px')
    })
    const padding = (popup: Locator) => popup.evaluate((element) => {
      const style = getComputedStyle(element)
      return `${style.paddingTop} ${style.paddingRight} ${style.paddingBottom} ${style.paddingLeft}`
    })

    // Each sheet pads only the screen edges it touches, and its x adds the same insets to its own 12 px.
    for (const [demo, direction, pads, x] of [
      ['drawer--end', 'ltr', '47px 30px 21px 0px', { top: 59, fromRight: 42 }],
      ['drawer--end', 'rtl', '47px 0px 21px 30px', { top: 59, fromLeft: 42 }],
      ['drawer--start', 'ltr', '47px 0px 21px 44px', { top: 59, fromRight: 13 }],
      ['drawer--start', 'rtl', '47px 44px 21px 0px', { top: 59, fromLeft: 13 }],
      ['drawer--top', 'ltr', '47px 30px 0px 44px', { top: 59, fromRight: 42 }],
      ['drawer--top', 'rtl', '47px 44px 0px 30px', { top: 59, fromLeft: 42 }],
      ['drawer--bottom', 'ltr', '0px 30px 21px 44px', { top: 13, fromRight: 42 }],
      ['drawer--bottom', 'rtl', '0px 44px 21px 30px', { top: 13, fromLeft: 42 }],
    ] as const) {
      test(`${demo} ${direction}: padded ${pads}, and its x is drawn clear of the notch`, async ({ page }) => {
        const popup = await open(page, demo, { direction, by: 'tap' })
        await notch(popup)
        expect(await padding(popup)).toBe(pads)
        const [frame, box] = [await boxOf(popup), await boxOf(xOf(popup))]
        expect(Math.round(box.top - frame.top), 'px from the top of the sheet to the x').toBe(x.top)
        if ('fromRight' in x) expect(Math.round(frame.right - box.right)).toBe(x.fromRight)
        else expect(Math.round(box.left - frame.left)).toBe(x.fromLeft)
        // And the title starts below the notch, clear of the x.
        const title = await inkOf(popup.locator('h2'))
        if (demo !== 'drawer--bottom') expect(title.top).toBeGreaterThanOrEqual(frame.top + 47)
        await expectNoSidewaysScroll(page)
      })
    }
  })
})

/** A software keyboard, as a phone reports one: the visual viewport loses its lower part and says so. */
const keyboardUp = (page: Page, visible: number) => page.evaluate((height) => {
  const viewport = window.visualViewport
  if (!viewport) throw new Error('no visual viewport')
  Object.defineProperty(viewport, 'height', { configurable: true, get: () => height })
  viewport.dispatchEvent(new Event('resize'))
}, visible)

/** Twenty more copies of the first field of a body, #f0 to #f19, so the body scrolls. */
const twentyMoreFields = (popup: Locator) => bodyOf(popup).evaluate((body) => {
  const field = body.querySelector('input')
  if (!field) throw new Error('the body holds no field')
  for (let index = 0; index < 20; index++) {
    const copy = field.cloneNode(true) as HTMLInputElement
    copy.id = `f${String(index)}`
    copy.name = copy.id
    body.append(copy)
  }
})

// Base UI's keyboard provider, around the portal of every sheet: its viewport is what hands it the touches.
test.describe('a field in a bottom sheet, and the keyboard of a phone', () => {
  test.use(PHONE)

  test('a tap on a field is taken by the provider, which focuses it without letting the page scroll: the click is its own', async ({ page }) => {
    const popup = await open(page, 'drawer--with-form', { by: 'tap' })
    const field = popup.locator('input[name="email"]')
    await field.evaluate((input) => {
      input.addEventListener('click', (event) => { input.dataset['trusted'] = String(event.isTrusted) })
    })
    await field.tap()
    await expect(field).toBeFocused()
    await expect(field).toHaveAttribute('data-trusted', 'false')
    expect(await liveErrors(page)).toEqual([])
  })

  test('two fields: with a keyboard over the lower 344 px, the sheet grows until the field with the focus is above it', async ({ page }) => {
    const popup = await open(page, 'drawer--with-form', { by: 'tap' })
    const field = popup.locator('input[name="email"]')
    await field.tap()
    expect((await boxOf(field)).top, 'the field starts out under where the keyboard will be').toBeGreaterThan(500)
    await keyboardUp(page, 500)
    await expect.poll(async () => (await boxOf(field)).bottom, { message: 'the foot of the field' }).toBeLessThan(500)
    await expectInsideViewport(popup, 'the sheet')
  })

  test('twenty-two fields: the body scrolls the field with the focus up from under the keyboard', async ({ page }) => {
    const popup = await open(page, 'drawer--with-form', { by: 'tap' })
    await twentyMoreFields(popup)
    const field = popup.locator('#f15')
    await field.scrollIntoViewIfNeeded()
    await field.tap()
    await keyboardUp(page, 400)
    await expect.poll(async () => (await boxOf(field)).bottom, { message: 'the foot of the field' }).toBeLessThan(400)
    expect((await partsOf(popup)).scrollTop, 'px the body scrolled to bring it there').toBeGreaterThan(300)
  })
})

// "A side sheet on desktop and a bottom sheet on a phone": an app moves an open sheet across its breakpoint.
test.describe('a sheet whose placement changes while it is open', () => {
  type Placement = 'start' | 'end' | 'top' | 'bottom'

  /** e2e/fixtures/drawer-placement.tsx, its sheet placed, then opened. */
  async function placed(page: Page, placement: Placement, options: LiveOptions & OpenOptions = {}): Promise<Locator> {
    await openLive(page, 'separator--horizontal', options)
    await page.addScriptTag({ type: 'module', url: '/e2e/fixtures/drawer-placement.tsx' })
    await expect(page.locator('#placement-drawer')).toBeVisible()
    await place(page, placement)
    return openOverlay(page, triggerOf(page, 'Note', '#placement-drawer'), options)
  }

  const place = (page: Page, placement: Placement) => page.evaluate((detail) => {
    window.dispatchEvent(new CustomEvent('placement', { detail }))
  }, placement)

  for (const direction of DIRECTIONS) {
    test(`${direction}: bottom, end, start, top and bottom again: the same sheet, with the text typed in it and the focus`, async ({ page }) => {
      const popup = await placed(page, 'bottom', { direction })
      const field = popup.locator('#note')
      await field.click()
      await page.keyboard.type('half a sentence')
      await popup.evaluate((element) => { element.dataset['kept'] = 'yes' })

      for (const placement of ['end', 'start', 'top', 'bottom'] as const) {
        await place(page, placement)
        await expect(popup).toHaveAttribute('data-placement', placement)
        await expect(popup, `the sheet, moved to ${placement}`).toHaveAttribute('data-kept', 'yes')
        await expect(field).toHaveValue('half a sentence')
        await expect(field).toBeFocused()
      }
      expect(await liveErrors(page)).toEqual([])
    })
  }

  test.describe('on a phone', () => {
    test.use(PHONE)

    test('a side sheet takes the keyboard provider too: a tap on its field is the provider own, and the body scrolls it from under the keyboard', async ({ page }) => {
      const popup = await placed(page, 'end', { by: 'tap' })
      await twentyMoreFields(popup)
      const field = popup.locator('#f15')
      await field.evaluate((input) => {
        input.addEventListener('click', (event) => { input.dataset['trusted'] = String(event.isTrusted) })
      })
      await field.scrollIntoViewIfNeeded()
      await field.tap()
      await expect(field).toBeFocused()
      await expect(field).toHaveAttribute('data-trusted', 'false')
      await keyboardUp(page, 400)
      await expect.poll(async () => (await boxOf(field)).bottom, { message: 'the foot of the field' }).toBeLessThan(400)
      expect(await liveErrors(page)).toEqual([])
    })
  })
})

test.describe('focus', () => {
  test('opened from the keyboard, focus moves to the first control with its ring, and Escape hands it back', async ({ page }) => {
    const popup = await open(page, 'drawer--end', { by: 'keyboard' })
    const reset = popup.locator('button').filter({ hasText: 'Reset' })
    await expect(reset).toBeFocused()
    await expect(reset).toHaveCSS('outline-style', 'solid')
    await expect(popup).not.toBeFocused()

    await page.keyboard.press('Escape')
    await expectClosed(page)
    await expect(triggerOf(page, 'Filters')).toBeFocused()
    expect(await liveErrors(page)).toEqual([])
  })

  // A caller's initialFocus, a touch, or a sheet that itself scrolls puts the first focus on the sheet.
  test('focused itself, the sheet shows its ring inside its box', async ({ page }) => {
    const popup = await open(page, 'drawer--end', { by: 'keyboard' })
    await popup.focus()
    await expect(popup).toBeFocused()
    await expect(popup).toHaveCSS('outline-style', 'solid')
    await expect(popup).toHaveCSS('outline-width', '2px')
    await expect(popup).toHaveCSS('outline-offset', '-2px')

    await page.keyboard.press('Escape')
    await expectClosed(page)
    await expect(triggerOf(page, 'Filters')).toBeFocused()
    expect(await liveErrors(page)).toEqual([])
  })

  // The x is last in the markup, so the content comes first; and the trap holds: Tab never reaches the page behind.
  test('Tab goes to the content first and to the x last, and round again; Shift+Tab goes back the same way', async ({ page }) => {
    const popup = await open(page, 'drawer--end', { by: 'keyboard' })
    const seen: string[] = []
    for (const key of ['Tab', 'Tab', 'Tab', 'Tab', 'Shift+Tab', 'Shift+Tab', 'Shift+Tab'] as const) {
      seen.push(await pressInside(page, popup, key))
    }
    expect(seen).toEqual(['Apply', 'Close this panel', 'Reset', 'Apply', 'Reset', 'Close this panel', 'Apply'])
    await expect(popup.locator('button').filter({ hasText: 'Apply' })).toHaveCSS('outline-style', 'solid')
  })

  test('the x shows its ring, closes the sheet, and focus returns to the trigger', async ({ page }) => {
    const popup = await open(page, 'drawer--end', { by: 'keyboard' })
    await page.keyboard.press('Shift+Tab')
    await expect(xOf(popup)).toBeFocused()
    await expect(xOf(popup)).toHaveCSS('outline-style', 'solid')
    await expect(xOf(popup)).toHaveCSS('outline-offset', '2px')
    await page.keyboard.press('Enter')
    await expectClosed(page)
    await expect(triggerOf(page, 'Filters')).toBeFocused()
  })

  test('a click on the x closes it too, and so does a press on the scrim: focus returns each time', async ({ page }) => {
    const popup = await open(page, 'drawer--end')
    await xOf(popup).click()
    await expectClosed(page)
    await expect(triggerOf(page, 'Filters')).toBeFocused()

    await openOverlay(page, triggerOf(page, 'Filters'))
    await page.mouse.click(20, 600)
    await expectClosed(page)
    await expect(triggerOf(page, 'Filters')).toBeFocused()
  })

  for (const mode of MODES) {
    test(`${mode}: the ring of the sheet is drawn inside it, on its own surface: its other three edges are the edges of the screen`, async ({ page }) => {
      const popup = await open(page, 'drawer--end', { mode, by: 'keyboard' })
      await popup.focus()
      await expect(popup).toBeFocused()
      // Along its inner edge, below the header: the two pixels past its 1 px line are ring against the surface, at 3:1.
      const frame = await boxOf(popup)
      const [left, top] = [Math.floor(frame.left), Math.floor(frame.top)]
      const surface = await pixelsOf(page, { x: left + 40, y: top + 300, width: 1, height: 1 })
      const band = await pixelsOf(page, { x: left + 1, y: top + 100, width: 1, height: 400 })
      expect(inkOn(band, surface[0] ?? [0, 0, 0]), 'pixels of ring at 3:1 on the surface, along the inner edge').toBe(400)
      const ring = (band[0] ?? [0, 0, 0]).join(',')
      const outside = await pixelsOf(page, { x: left - 4, y: top + 100, width: 3, height: 400 })
      expect(outside.filter((pixel) => pixel.join(',') === ring), 'pixels of ring on the scrim beside the sheet').toEqual([])
    })
  }
})

// The sheet's trigger sits in the dialog and is itself open: a guard that read the role of every dialog found it there
// and cancelled the sheet's own close, so the key closed nothing. Each root now looks inside its own popup only.
test.describe('a sheet inside a dialog', () => {
  const titles = (page: Page) => page.locator('[role="dialog"][data-open] h2').allTextContents()
  const tooltip = (page: Page) => page.locator('[role="tooltip"][data-open]')
  const escape = async (page: Page, left: string[]) => {
    await page.keyboard.press('Escape')
    await expect.poll(() => titles(page)).toEqual(left)
  }

  /** e2e/fixtures/drawer-nested.tsx with its dialog open and, inside it, its sheet: both from the keyboard. */
  async function nested(page: Page): Promise<Locator> {
    await openLive(page, 'separator--horizontal')
    await page.addScriptTag({ type: 'module', url: '/e2e/fixtures/drawer-nested.tsx' })
    await openOverlay(page, triggerOf(page, 'Settings', '#nested-drawer'), { by: 'keyboard' })
    const sheet = await openOverlay(page, triggerOf(page, 'Share', 'body'), { by: 'keyboard' })
    expect(await titles(page)).toEqual(['Project settings', 'Share this project'])
    return sheet
  }

  test('focus back on its trigger: the first Escape closes the sheet and leaves the dialog open, the second the dialog', async ({ page }) => {
    await nested(page)
    await page.keyboard.press('Shift+Tab')
    await expect(triggerOf(page, 'Share', 'body')).toBeFocused()

    await escape(page, ['Project settings'])
    await escape(page, [])
  })

  test('with a mouse: the sheet is drawn above the dialog, its x takes the press and closes the sheet alone', async ({ page }) => {
    const sheet = await nested(page)
    const x = xOf(sheet)
    const box = await boxOf(x)
    expect(await page.evaluate(([cx, cy]) => document.elementFromPoint(cx, cy)?.closest('button')?.getAttribute('aria-label'), [box.left + box.width / 2, box.top + box.height / 2] as const)).toBe(CLOSE.en)
    await x.click()
    await expect.poll(() => titles(page)).toEqual(['Project settings'])
  })

  test('a tooltip open inside the sheet closes first, then the sheet, then the dialog', async ({ page }) => {
    const sheet = await nested(page)
    await expect(sheet.locator('button[aria-label="Copy link"]')).toBeFocused()
    await expect(tooltip(page)).toHaveText('Copy link')

    await page.keyboard.press('Escape')
    await expect(tooltip(page)).toHaveCount(0)
    expect(await titles(page)).toEqual(['Project settings', 'Share this project'])
    await escape(page, ['Project settings'])
    await escape(page, [])
  })
})

test.describe('a mouse', () => {
  test('dragged on the header it moves the sheet and selects no text; dragged in the body it selects text and the sheet stays', async ({ page }) => {
    const popup = await open(page, 'drawer--end')
    const frame = await boxOf(popup)
    await page.mouse.move(frame.left + 20, 25)
    await page.mouse.down()
    await page.mouse.move(frame.left + 100, 27, { steps: 8 })
    expect((await boxOf(popup)).left, 'the sheet follows the mouse').toBeGreaterThan(frame.left + 40)
    expect(await page.evaluate(() => String(getSelection())), 'text selected on the way').toBe('')
    // Base UI dismisses a drag faster than 0.5 px/ms start to release: held, 80 px reads as a slow drop.
    await page.waitForTimeout(400)
    await page.mouse.up()
    await atRest(popup)
    expect(await boxOf(popup)).toEqual(frame)

    const { body } = await partsOf(popup)
    await page.mouse.move(body.left + 16, body.top + 20)
    await page.mouse.down()
    await page.mouse.move(body.left + 120, body.top + 90, { steps: 8 })
    expect(await boxOf(popup), 'the sheet did not move').toEqual(frame)
    expect(await page.evaluate(() => String(getSelection()))).toContain('Status')
    await page.mouse.up()
  })
})

test.describe('the page behind', () => {
  test('is hidden from assistive technology and cannot scroll while the sheet is open, and is given back on close', async ({ page }) => {
    await openLive(page, 'drawer--end', { tall: true })
    // The first portal is the toast region TopClassProvider mounts on every page, which a modal leaves readable.
    expect((await pageLock(page)).reachable).toEqual(['h1', 'main', 'pre', 'portal'])
    await expect(page.getByRole('button', { name: 'Filters' })).toHaveCount(1)

    await openOverlay(page, triggerOf(page, 'Filters'))
    const locked = await pageLock(page)
    // The first portal is the toast region TopClassProvider mounts on every page, which a modal leaves readable.
    expect(locked.reachable).toEqual(['portal', 'portal'])
    expect(locked.body).toBe('overflow: hidden;')
    expect(locked.overflow).toBe('hidden')
    await expect(page.getByRole('button', { name: 'Filters', exact: true })).toHaveCount(0)
    await expect(page.getByRole('dialog', { name: 'Filters' })).toHaveCount(1)

    await page.keyboard.press('Escape')
    await expectClosed(page)
    const released = await pageLock(page)
    // The first portal is the toast region TopClassProvider mounts on every page, which a modal leaves readable.
    expect(released.reachable).toEqual(['h1', 'main', 'pre', 'portal'])
    expect(released.overflow).toBe('visible')
  })

  for (const direction of DIRECTIONS) {
    test(`${direction}: a wheel over the scrim, the header and the end of the body leaves the page where it was`, async ({ page }) => {
      await openLive(page, 'drawer--long-body', { direction, tall: true })
      await scrollPageTo(page, 20)
      const popup = await openOverlay(page, triggerOf(page, 'Activity'))
      expect(await scrollY(page)).toBe(20)
      const { header, body, popup: frame } = await partsOf(popup)

      // The scrim is the half of the screen the sheet is not on.
      await wheelAt(page, frame.left > 400 ? 100 : 1100, 400, 500)
      expect(await scrollY(page), 'after a wheel over the scrim').toBe(20)
      await wheelAt(page, header.left + 80, header.top + 20, 500)
      expect(await scrollY(page), 'after a wheel over the header').toBe(20)
      expect((await partsOf(popup)).scrollTop).toBe(0)

      for (let turn = 0; turn < 8; turn++) await wheelAt(page, body.left + 80, body.top + 200, 1000)
      const end = await partsOf(popup)
      expect(end.scrollable).toBeGreaterThan(1000)
      expect(end.scrollTop, 'the body is at its end').toBe(end.scrollable)
      await wheelAt(page, body.left + 80, body.top + 200, 1000)
      expect(await scrollY(page), 'after a wheel past the end of the body').toBe(20)

      // The same wheel does move the page once the sheet is gone, or all of the above proved nothing.
      await page.keyboard.press('Escape')
      await expectClosed(page)
      await page.mouse.wheel(0, 200)
      await expect.poll(() => scrollY(page)).toBe(220)
    })
  }

  test.describe('under a finger', () => {
    test.use(PHONE)

    test('a drag on the header and on the scrim of an open side sheet never scrolls the page', async ({ page }) => {
      await openLive(page, 'drawer--long-body', { tall: true })
      await touchDrag(page, 195, 600, 560)
      const before = await scrollY(page)
      expect(before).toBeGreaterThan(10)

      const popup = await openOverlay(page, triggerOf(page, 'Activity'), { by: 'tap' })
      const { header } = await partsOf(popup)
      await touchDrag(page, header.left + 80, header.bottom - 10, header.top + 4)
      await touchDrag(page, 30, 700, 400)
      expect(await scrollY(page), 'after a drag on the header and on the scrim').toBe(before)
      await expect(popup).toHaveAttribute('data-open', '')
    })
  })

  test.describe('with a classic scrollbar', () => {
    for (const direction of DIRECTIONS) {
      for (const edge of ['start', 'end'] as const) {
        withScrollbar(`${direction}, trigger at the ${edge}: opening and closing the sheet does not move the trigger`, async ({ barPage: page }) => {
          await openLive(page, 'drawer--end', { direction, edge, tall: true })
          // A real bar, 10 px as the page draws it thin: the root's client box is narrower than the window.
          expect(await page.evaluate(() => window.innerWidth - document.documentElement.clientWidth)).toBe(10)
          const trigger = triggerOf(page, 'Filters')
          const before = await boxOf(trigger)

          const popup = await openOverlay(page, trigger)
          expect((await pageLock(page)).overflow).toBe('hidden')
          expect(await boxOf(trigger), 'while the sheet is open').toEqual(before)
          // The sheet is flush with the screen beside the gutter html keeps for that bar.
          expect((await seatOf(popup))[direction === 'ltr' ? 'right' : 'left']).toBe(0)

          await page.keyboard.press('Escape')
          await expectClosed(page)
          expect(await boxOf(trigger), 'after it has closed').toEqual(before)
        })
      }
    }

    withScrollbar('the comparison can fail: with the gutter forced off, the trigger at the end moves by the 10 px of the bar', async ({ barPage: page }) => {
      await openLive(page, 'drawer--end', { edge: 'end', tall: true })
      await page.addStyleTag({ content: 'html { scrollbar-gutter: auto !important }' })
      const trigger = triggerOf(page, 'Filters')
      const before = await boxOf(trigger)
      await openOverlay(page, trigger)
      expect((await boxOf(trigger)).left).toBe(before.left - 10)
    })
  })
})

test.describe('the long body', () => {
  test('scrolls inside the sheet while the header and the footer keep their boxes', async ({ page }) => {
    const popup = await open(page, 'drawer--long-body')
    const before = await partsOf(popup)
    expect(before.scrollable).toBeGreaterThan(1000)
    expect(before.header.top).toBe(before.popup.top)
    expect(before.footer?.bottom).toBe(before.popup.bottom)
    expect(before.body.top).toBe(before.header.bottom)
    expect(before.body.bottom).toBe(before.footer?.top)

    await wheelAt(page, before.body.left + 80, before.body.top + 200, 600)
    const after = await partsOf(popup)
    expect(after.scrollTop).toBe(600)
    expect(after.header).toEqual(before.header)
    expect(after.footer).toEqual(before.footer)
    expect(after.popup).toEqual(before.popup)
    // The sheet itself did not scroll: it is only the last resort of a screen too short for the three bars.
    expect(await popup.evaluate((el) => `${String(el.scrollTop)} ${String(el.scrollHeight - el.clientHeight)}`)).toBe('0 0')
  })

  test('is the first focus of the sheet: it takes tabindex 0 while it scrolls, shows its ring inside its box, and the keys scroll it', async ({ page }) => {
    const popup = await open(page, 'drawer--long-body', { by: 'keyboard' })
    const body = bodyOf(popup)
    await expect(body).toHaveAttribute('tabindex', '0')
    await expect(body).toBeFocused()
    await expect(body).toHaveCSS('outline-style', 'solid')
    await expect(body).toHaveCSS('outline-offset', '-2px')

    const box = await boxOf(body)
    const surface = await pixelsOf(page, { x: box.left + 200, y: box.top + 8, width: 1, height: 1 })
    const band = await pixelsOf(page, { x: box.left + 4, y: box.top, width: box.width - 8, height: 2 })
    expect(inkOn(band, surface[0] ?? [0, 0, 0]), 'pixels of ring along the top edge of the body').toBeGreaterThan(band.length * 0.9)

    await page.keyboard.press('PageDown')
    await expect.poll(async () => (await partsOf(popup)).scrollTop).toBeGreaterThan(200)
    expect(await pressInside(page, popup, 'Tab')).toBe('Mark all as read')
  })

  test('a body that holds all it has takes no tabindex, so the first focus goes straight to the actions', async ({ page }) => {
    const popup = await open(page, 'drawer--end', { by: 'keyboard' })
    expect((await partsOf(popup)).scrollable, 'px the body scrolls').toBe(0)
    await expect(bodyOf(popup)).not.toHaveAttribute('tabindex')
    await expect(popup.locator('button').filter({ hasText: 'Reset' })).toBeFocused()
  })
})

test.describe('a screen under 272 px tall', () => {
  /** How many boxes of a sheet really scroll up and down: the sheet itself and its body are the two that can. */
  const scrollersOf = (popup: Locator) => popup.evaluate((element) => {
    const body = element.querySelector('[data-drawer-content]')
    return [element, body].filter((box) => box && box.scrollHeight > box.clientHeight + 1 && getComputedStyle(box).overflowY !== 'visible').length
  })
  const below = (popup: Locator) => popup.evaluate((el) => el.scrollHeight - el.clientHeight - el.scrollTop)

  // 320 x 256 is where WCAG judges reflow: 1280 x 1024 at 400%. 844 x 190 is a phone on its side with its keyboard up.
  for (const [width, height] of [[320, 256], [844, 190]] as const) {
    test(`${String(width)} x ${String(height)}: the sheet is the one scroller, so a wheel that starts on the body reaches the last action`, async ({ page }) => {
      await page.setViewportSize({ width, height })
      const popup = await open(page, 'drawer--long-body')
      await expectInsideViewport(popup, 'the sheet')
      await expect(bodyOf(popup)).toHaveCSS('overflow-y', 'visible')
      expect(await scrollersOf(popup), 'boxes that scroll').toBe(1)

      const [frame, parts] = [await boxOf(popup), await partsOf(popup)]
      expect(parts.footer?.bottom ?? 0, 'the footer starts out below the sheet').toBeGreaterThan(frame.bottom + 1000)
      for (let turn = 0; turn < 6; turn++) await wheelAt(page, parts.body.left + 40, frame.top + frame.height / 2, 1000)
      expect(await below(popup), 'px of sheet still below').toBe(0)
      expect((await partsOf(popup)).footer?.bottom).toBe(frame.bottom)
      await expectNoSidewaysScroll(page)
    })
  }

  test('320 x 256, a bottom sheet: nine tenths of 256 px, and the sheet is the one scroller there too, down to its last row', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 256 })
    const popup = await open(page, 'drawer--bottom')
    await expectInsideViewport(popup, 'the sheet')
    expect(Math.round((await boxOf(popup)).height * 10) / 10).toBe(230.4)
    expect(await scrollersOf(popup), 'boxes that scroll').toBe(1)
    await expect(bodyOf(popup)).toHaveCSS('overflow-y', 'visible')
    const frame = await boxOf(popup)
    for (let turn = 0; turn < 4; turn++) await wheelAt(page, 100, frame.top + 150, 1000)
    expect(await below(popup), 'px of sheet still below').toBe(0)
    const last = await boxOf(popup.locator('button').filter({ hasText: 'Italy' }))
    expect(last.bottom).toBeLessThanOrEqual(frame.bottom)
    expect(last.top).toBeGreaterThanOrEqual(frame.top)
  })

  // The sheet has the focus and is the box that scrolls, so the keys that scroll act on it at once.
  test('320 x 256: the body is no tab stop there, and End, pressed on the sheet, scrolls it to its last action', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 256 })
    const popup = await open(page, 'drawer--long-body', { by: 'keyboard' })
    await expect(bodyOf(popup)).not.toHaveAttribute('tabindex')
    await expect(popup).toBeFocused()
    expect(await popup.evaluate((el) => el.scrollHeight - el.clientHeight), 'px the sheet scrolls').toBeGreaterThan(2000)

    await page.keyboard.press('End')
    await expect.poll(() => below(popup), { message: 'px of sheet still below' }).toBe(0)
    expect((await partsOf(popup)).footer?.bottom).toBe((await boxOf(popup)).bottom)
    expect((await axe(page)).violations).toEqual([])
  })

  test('568 x 320, a phone on its side: tall enough, so the bars stay put and the body is the one scroller', async ({ page }) => {
    await page.setViewportSize({ width: 568, height: 320 })
    const popup = await open(page, 'drawer--long-body')
    await expect(bodyOf(popup)).toHaveCSS('overflow-y', 'auto')
    expect(await scrollersOf(popup), 'boxes that scroll').toBe(1)
    const parts = await partsOf(popup)
    expect(parts.body.height).toBe(174)
    expect(parts.footer?.bottom).toBe(parts.popup.bottom)
    expect(await popup.evaluate((el) => el.scrollHeight - el.clientHeight)).toBe(0)
  })
})

test.describe('inside the screen', () => {
  for (const screen of SCREENS) {
    for (const direction of DIRECTIONS) {
      const label = `${String(screen.width)} x ${String(screen.height)} ${direction}`

      test(`${label}: sixty rows leave the side sheet as tall as the screen and no taller, with its actions at its foot`, async ({ page }) => {
        await page.setViewportSize(screen)
        const popup = await open(page, 'drawer--long-body', { direction })
        await expectInsideViewport(popup, 'the sheet')
        await expectNoSidewaysScroll(page)
        await expectNothingSideways(popup)
        const parts = await partsOf(popup)
        expect(parts.popup.height).toBe(screen.height)
        expect(parts.scrollable, 'px the body can scroll').toBeGreaterThan(1000)
        expect(parts.footer?.bottom).toBe(parts.popup.bottom)
      })

      test(`${label}: a long title, a 300-character word and three long actions stay inside the sheet, and every action can be reached`, async ({ page }) => {
        await page.setViewportSize(screen)
        const popup = await open(page, 'drawer--long-content', { direction })
        await expectInsideViewport(popup, 'the sheet')
        await expectNoSidewaysScroll(page)
        await expectNothingSideways(popup)

        // The title wraps short of the x and never runs under it.
        const [title, x] = [await inkOf(popup.locator('h2')), await boxOf(xOf(popup))]
        expect(title.height, 'px of title: more than one line').toBeGreaterThan(40)
        if (direction === 'ltr') expect(title.right).toBeLessThanOrEqual(x.left - 12)
        else expect(title.left).toBeGreaterThanOrEqual(x.right + 12)

        // The word is broken into lines no wider than the body, and the body still shows at least one of them.
        const [word, body] = [await inkOf(bodyOf(popup)), await boxOf(bodyOf(popup))]
        expect(word.left).toBeGreaterThanOrEqual(body.left + 16)
        expect(word.right).toBeLessThanOrEqual(body.right - 16)
        expect(word.height, 'px of word: several lines').toBeGreaterThan(100)
        expect(body.height).toBeGreaterThanOrEqual(52)

        // Where the three bars are taller than the screen the sheet scrolls as one, by a wheel over its header.
        const [frame, header] = [await boxOf(popup), (await partsOf(popup)).header]
        const hidden = await popup.evaluate((el) => el.scrollHeight - el.clientHeight)
        expect(hidden, 'px of sheet below its own box').toBe(screen.height === 390 ? 16 : 0)
        await wheelAt(page, header.left + 40, header.top + 20, hidden)
        expect(await popup.evaluate((el) => el.scrollTop), 'px the wheel scrolled the sheet').toBe(hidden)
        for (const button of await popup.locator('button:not([aria-label])').all()) {
          const box = await boxOf(button)
          const name = (await button.textContent()) ?? ''
          expect(box.top, `${name} starts above the sheet`).toBeGreaterThanOrEqual(frame.top)
          expect(box.bottom, `${name} ends below the sheet`).toBeLessThanOrEqual(frame.bottom)
          expect(box.left, `${name} starts outside the sheet`).toBeGreaterThanOrEqual(frame.left)
          expect(box.right, `${name} ends outside the sheet`).toBeLessThanOrEqual(frame.right)
          expect(await button.evaluate((el) => {
            const span = el.querySelector('span') ?? el
            return span.scrollWidth > span.clientWidth + 1 || span.scrollHeight > span.clientHeight + 1
          }), `${name} is cut`).toBe(false)
        }
      })

      test(`${label}: a top sheet and a bottom sheet are inside the screen and at most nine tenths of it`, async ({ page }) => {
        await page.setViewportSize(screen)
        for (const demo of ['drawer--top', 'drawer--bottom']) {
          const popup = await open(page, demo, { direction })
          await expectInsideViewport(popup, demo)
          await expectNoSidewaysScroll(page)
          await expectNothingSideways(popup, demo)
          expect((await boxOf(popup)).height, demo).toBeLessThanOrEqual(screen.height * 0.9 + 0.1)
        }
      })
    }
  }

  test('the five sizes are 256, 288, 320, 384 and 480 px wide, and custom takes the width of its className', async ({ page }) => {
    await openLive(page, 'drawer--sizes')
    const seen: string[] = []
    for (const size of ['xs', 'sm', 'md', 'lg', 'xl', 'custom']) {
      const popup = await openOverlay(page, triggerOf(page, size))
      seen.push(`${(await popup.getAttribute('data-size')) ?? ''} ${String((await boxOf(popup)).width)}`)
      await page.keyboard.press('Escape')
      await expectClosed(page)
    }
    expect(seen).toEqual(['xs 256', 'sm 288', 'md 320', 'lg 384', 'xl 480', 'custom 576'])
  })

  test('the stylesheet already holds the classes of a sheet nothing has rendered yet', async ({ page }) => {
    const popup = await open(page, 'drawer--end')
    const styles = await popup.evaluate((element) => {
      const own = getComputedStyle(element)
      const viewport = getComputedStyle(element.parentElement ?? element)
      const scrim = getComputedStyle(element.parentElement?.previousElementSibling ?? element)
      return {
        maxWidth: own.maxWidth, height: own.height, line: `${own.borderLeftWidth} ${own.borderRightWidth}`,
        raised: own.boxShadow !== 'none', wrap: own.overflowWrap, layer: `${viewport.zIndex} ${scrim.zIndex}`,
        seat: `${viewport.display} ${viewport.justifyContent}`, scrim: scrim.backgroundColor !== 'rgba(0, 0, 0, 0)',
        fixed: `${viewport.position} ${scrim.position}`, placement: element.getAttribute('data-placement'),
      }
    })
    // max-w-80, h-dvh, the line on the inline start only, shadow-lg, wrap-anywhere, --tc-z-drawer, a row that ends.
    expect(styles).toEqual({
      maxWidth: '320px', height: '720px', line: '1px 0px', raised: true, wrap: 'anywhere', layer: '60 60',
      seat: 'flex flex-end', scrim: true, fixed: 'fixed fixed', placement: 'end',
    })
  })
})

// The x floats over the first row of every sheet. A DrawerHeader keeps clear of it; these sheets have none.
test.describe('a sheet with no header', () => {
  /** Every line of text in the sheet that lies under the box of its x. */
  const underTheX = (popup: Locator) => popup.evaluate((element) => {
    const x = (element.querySelector(':scope > button:last-child') ?? element).getBoundingClientRect()
    const found: string[] = []
    const texts = document.createTreeWalker(element, NodeFilter.SHOW_TEXT)
    for (let node = texts.nextNode(); node; node = texts.nextNode()) {
      const range = document.createRange()
      range.selectNodeContents(node)
      for (const line of range.getClientRects()) {
        if (line.right > x.left && line.left < x.right && line.bottom > x.top && line.top < x.bottom) {
          found.push(`${(node.textContent ?? '').slice(0, 12)} at ${String(Math.round(line.top))}`)
        }
      }
    }
    return found
  })

  for (const pointer of ['a mouse', 'a finger'] as const) {
    test.describe(`under ${pointer}`, () => {
      test.use(pointer === 'a finger' ? PHONE : { viewport: { width: 390, height: 844 } })

      for (const direction of DIRECTIONS) {
        test(`${direction}: no line of a body, or of a title and the body under it, runs beneath the x, at any of the four edges`, async ({ page }) => {
          await shapes(page, { direction })
          const found: string[] = []
          for (const first of ['body', 'title']) {
            for (const placement of ['end', 'start', 'top', 'bottom']) {
              const popup = await openOverlay(page, triggerOf(page, `${first} ${placement}`, '#shapes'), { by: pointer === 'a finger' ? 'tap' : 'click' })
              found.push(...(await underTheX(popup)).map((line) => `${first} ${placement}: ${line}`))
              await expectNothingSideways(popup, `${first} ${placement}`)
              await page.keyboard.press('Escape')
              await expectClosed(page)
            }
          }
          expect(found).toEqual([])
        })
      }
    })
  }

  test('the measure can fail: with the first row given back its own padding, a body runs under the x of a top sheet', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await shapes(page)
    await page.addStyleTag({ content: '[role="dialog"] > [data-drawer-content] { padding-inline-end: 1rem !important }' })
    const popup = await openOverlay(page, triggerOf(page, 'body top', '#shapes'))
    expect((await underTheX(popup)).length).toBeGreaterThan(0)
  })

  test('a sheet with nothing in it is the x alone, 24 px square in its corner: the room kept for the x is not given to the x', async ({ page }) => {
    await shapes(page)
    const popup = await openOverlay(page, triggerOf(page, 'empty', '#shapes'))
    const [frame, x] = [await boxOf(popup), await boxOf(xOf(popup))]
    expect([x.width, x.height]).toEqual([24, 24])
    expect([frame.right - x.right, x.top - frame.top]).toEqual([12, 12])
    await expect(xOf(popup)).toHaveCSS('padding-right', '0px')
  })

  test('an element where the title is expected, an empty description, an empty body and an action with no label: nothing leaves the sheet', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 480 })
    await shapes(page)
    const popup = await openOverlay(page, triggerOf(page, 'hostile', '#shapes'))
    await expectInsideViewport(popup, 'the sheet')
    await expectNoSidewaysScroll(page)
    await expectNothingSideways(popup)
    const [button, x] = [await boxOf(popup.locator('h2 button')), await boxOf(xOf(popup))]
    expect(button.right, 'the button in the title ends short of the x').toBeLessThanOrEqual(x.left)
    expect((await boxOf(bodyOf(popup))).height, 'px of empty body: its one-line floor').toBe(52)
    expect((await axe(page)).violations).toEqual([])
  })

  // DrawerRoot renders no element, so a trigger is the caller's own control, laid out by the caller's own parent.
  test('in a grid track, a flex-1 column, a w-fit box and a table cell, the trigger is the box a plain Button is', async ({ page }) => {
    await shapes(page)
    const boxes = await page.locator('#layouts').evaluate((root) => Object.fromEntries([...root.children].map((layout) => {
      const [plain, trigger] = [...layout.querySelectorAll('button')].map((button) => button.getBoundingClientRect())
      return [layout.getAttribute('data-layout') ?? '', { plain: [plain?.width, plain?.height], trigger: [trigger?.width, trigger?.height] }]
    })))
    expect(Object.keys(boxes)).toEqual(['grid', 'flex', 'fit', 'table'])
    // Each track of the grid is 8rem: both buttons fill theirs. In the other three each is as wide as its own label.
    expect(boxes['grid']).toEqual({ plain: [128, 40], trigger: [128, 40] })
    for (const layout of ['flex', 'fit', 'table']) {
      expect(boxes[layout]?.trigger, layout).toEqual(boxes[layout]?.plain)
      expect(boxes[layout]?.trigger[0], `${layout}: as wide as its label, not its parent`).toBeLessThan(140)
    }
    await expectNoSidewaysScroll(page)
  })
})

test.describe('text a reader has made larger', () => {
  for (const [width, height] of [[390, 844], [1280, 800]] as const) {
    test(`${String(width)} x ${String(height)}, with the root at 32 px: the sheets stay on the screen, the title keeps clear of the x, and the actions wrap`, async ({ page }) => {
      await page.setViewportSize({ width, height })
      for (const demo of ['drawer--long-content', 'drawer--bottom']) {
        await openLive(page, demo)
        await page.addStyleTag({ content: 'html { font-size: 32px !important }' })
        const popup = await openOverlay(page, triggerOf(page, DRAWERS[demo]?.trigger ?? ''))
        await expectInsideViewport(popup, demo)
        await expectNoSidewaysScroll(page)
        await expectNothingSideways(popup, demo)
        const [title, x] = [await inkOf(popup.locator('h2')), await boxOf(xOf(popup))]
        expect(title.right, `${demo}: the title ends short of the x`).toBeLessThanOrEqual(x.left)
        // The glyph of the x is 1em, so it doubles with the text and its button with it: never under the 24 px floor.
        expect([x.width, x.height], demo).toEqual([32, 32])
      }
    })
  }

  // WCAG 1.4.12: line height 1.5, paragraph spacing 2, letter spacing 0.12 and word spacing 0.16 times the font size.
  test('320 x 480, with the text spacing of WCAG 1.4.12: nothing is cut and nothing leaves the sheet', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 480 })
    await openLive(page, 'drawer--long-content')
    await page.addStyleTag({ content: '* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important } p { margin-bottom: 2em !important }' })
    const popup = await openOverlay(page, triggerOf(page, 'Move to the archive'))
    await expectInsideViewport(popup, 'the sheet')
    await expectNoSidewaysScroll(page)
    await expectNothingSideways(popup)
    const [title, x] = [await inkOf(popup.locator('h2')), await boxOf(xOf(popup))]
    expect(title.right).toBeLessThanOrEqual(x.left)
    // The bars are taller than the screen now, so the sheet scrolls as one, down to its last action.
    const hidden = await popup.evaluate((el) => el.scrollHeight - el.clientHeight)
    expect(hidden, 'px of sheet below its own box').toBeGreaterThan(20)
    await popup.evaluate((el) => { el.scrollTop = el.scrollHeight })
    const [frame, last] = [await boxOf(popup), await boxOf(popup.locator('button:not([aria-label])').last())]
    expect(last.bottom).toBeLessThanOrEqual(frame.bottom)
  })
})

test.describe('each value of modal', () => {
  const behind = (page: Page) => triggerOf(page, 'Behind the panel')
  const scrims = (page: Page) => page.locator('[data-base-ui-portal] .bg-overlay')

  /** Counts the presses a page button receives from now on, on the button itself. */
  const count = (button: Locator) => button.evaluate((element: HTMLElement) => {
    element.dataset['presses'] = '0'
    element.addEventListener('click', () => { element.dataset['presses'] = String(Number(element.dataset['presses']) + 1) })
  })

  /** Presses the middle of a box with the mouse, whatever is painted there: locator.click would wait for the box itself. */
  const pressAt = async (page: Page, target: Locator) => {
    const box = await boxOf(target)
    await page.mouse.click(box.left + box.width / 2, box.top + box.height / 2)
  }

  /** Whether a press in the middle of the sheet lands on the sheet: under a viewport that lets presses through, it must take its own back. */
  const takesPresses = (popup: Locator) => popup.evaluate((element) => {
    const box = element.getBoundingClientRect()
    return element.contains(document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2))
  })

  test('true, the default: a scrim, and a press on a page button closes the sheet without reaching the button', async ({ page }) => {
    await open(page, 'drawer--end')
    await expect(scrims(page)).toHaveCount(1)
    const trigger = triggerOf(page, 'Filters')
    await count(trigger)
    await pressAt(page, trigger)
    await expectClosed(page)
    await expect(trigger).toHaveAttribute('data-presses', '0')
  })

  test('trap-focus: no scrim, the page takes a wheel and a press, and Tab and a screen reader stay in the sheet', async ({ page }) => {
    const popup = await open(page, 'drawer--trap-focus', { tall: true, by: 'keyboard' })
    await expect(scrims(page)).toHaveCount(0)
    await expect(popup.locator('xpath=..')).toHaveCSS('pointer-events', 'none')
    await expect(popup).toHaveCSS('pointer-events', 'auto')
    expect(await takesPresses(popup), 'a press on the sheet lands on it').toBe(true)

    // The keyboard and the screen reader: held, as in a modal sheet.
    await expect(popup.locator('button').filter({ hasText: 'Done' })).toBeFocused()
    const seen = [await pressInside(page, popup, 'Tab'), await pressInside(page, popup, 'Tab'), await pressInside(page, popup, 'Tab')]
    expect(seen).toEqual(['Close this panel', 'Done', 'Close this panel'])
    const lock = await pageLock(page)
    // The first portal is the toast region TopClassProvider mounts on every page, which a modal leaves readable.
    expect(lock.reachable).toEqual(['portal', 'portal'])

    // The pointer: free. The page scrolls beside the open sheet, and its button takes the press.
    expect(lock.overflow).toBe('visible')
    await wheelAt(page, 8, 500, 300)
    expect(await scrollY(page)).toBe(300)
    await page.evaluate(() => { window.scrollTo(0, 0) })
    await count(behind(page))
    await pressAt(page, behind(page))
    await expect(behind(page)).toHaveAttribute('data-presses', '1')
    // And that press outside closes it, as in every sheet without disablePointerDismissal.
    await expectClosed(page)
  })

  test('false: no scrim, the page takes a wheel and a press and is read, and Tab past the x closes the sheet', async ({ page }) => {
    const popup = await open(page, 'drawer--non-modal', { tall: true, by: 'keyboard' })
    await expect(scrims(page)).toHaveCount(0)
    await expect(popup.locator('xpath=..')).toHaveCSS('pointer-events', 'none')
    await expect(popup).toHaveCSS('pointer-events', 'auto')
    expect(await takesPresses(popup), 'a press on the sheet lands on it').toBe(true)
    const lock = await pageLock(page)
    // The first portal is the toast region TopClassProvider mounts on every page, which a modal leaves readable.
    expect(lock.reachable).toEqual(['h1', 'main', 'pre', 'portal', 'portal'])
    expect(lock.overflow).toBe('visible')
    await wheelAt(page, 8, 500, 300)
    expect(await scrollY(page)).toBe(300)
    await page.evaluate(() => { window.scrollTo(0, 0) })

    // Focus is not held: it starts on Done, Tab reaches the x, and the next leaves the sheet and closes it.
    await expect(popup.locator('button').filter({ hasText: 'Done' })).toBeFocused()
    expect(await pressInside(page, popup, 'Tab')).toBe('Close this panel')
    await page.keyboard.press('Tab')
    await expectClosed(page)

    await openOverlay(page, triggerOf(page, 'Outline'))
    await count(behind(page))
    await pressAt(page, behind(page))
    await expect(behind(page)).toHaveAttribute('data-presses', '1')
    await expectClosed(page)
  })

  // Base UI holds no page still under a sheet that is not modal: only overscroll-behavior on the body keeps the wheel in it.
  test('not modal, past the end of its body: a wheel leaves the page where it was, though the page is free to scroll', async ({ page }) => {
    const popup = await open(page, 'drawer--non-modal', { tall: true })
    await bodyOf(popup).evaluate((body) => {
      const more = document.createElement('div')
      more.style.height = '3000px'
      body.append(more)
    })
    const { body } = await partsOf(popup)
    // The control: the same wheel, beside the sheet, scrolls the page under it.
    await wheelAt(page, 100, 400, 200)
    expect(await scrollY(page)).toBe(200)

    for (let turn = 0; turn < 5; turn++) await wheelAt(page, body.left + 80, body.top + 200, 1000)
    const end = await partsOf(popup)
    expect(end.scrollable).toBeGreaterThan(2000)
    expect(end.scrollTop, 'the body is at its end').toBe(end.scrollable)
    await wheelAt(page, body.left + 80, body.top + 200, 1000)
    await wheelAt(page, body.left + 80, body.top + 200, 1000)
    expect(await scrollY(page), 'after two wheels past the end of the body').toBe(200)
  })

  // With no scrim the sheet has its line and its shadow to stand out from the page beside it.
  test('a sheet that is not modal keeps its place and its width: 256 px at the inline end, over a page that is still there', async ({ page }) => {
    const popup = await open(page, 'drawer--non-modal')
    expect(await seatOf(popup)).toMatchObject({ left: 1014, right: 0, top: 0, bottom: 0 })
    await expect(popup).toHaveCSS('border-left-width', '1px')
    expect(await popup.evaluate((el) => getComputedStyle(el).boxShadow !== 'none')).toBe(true)
  })
})

for (const scheme of ['light', 'dark'] as const) {
  test.describe(`forced colours, ${scheme} palette`, () => {
    test.use({ forcedColors: 'active', colorScheme: scheme })

    // Forced colours erase the fill, the shadow and the scrim: the line on its inner edge is all that parts the sheet from the page.
    test('a side sheet keeps a line against the page along its inner edge, and its x is drawn', async ({ page }) => {
      const popup = await open(page, 'drawer--end')
      expect(await page.evaluate(() => matchMedia('(forced-colors: active)').matches)).toBe(true)
      const canvas = FORCED_CANVAS[scheme]
      const frame = await boxOf(popup)
      const [left, top] = [Math.floor(frame.left), Math.floor(frame.top)]
      const outside = await pixelsOf(page, { x: left - 8, y: top + 300, width: 1, height: 1 })
      const inside = await pixelsOf(page, { x: left + 8, y: top + 300, width: 1, height: 1 })
      expect([outside[0], inside[0]]).toEqual([canvas, canvas])
      // Five pixels across the edge, 600 px of it: one of the five is line, all the way along.
      const edge = await pixelsOf(page, { x: left - 2, y: top + 60, width: 5, height: 600 })
      expect(inkOn(edge, canvas), 'pixels of line at 3:1 along the inner edge').toBeGreaterThanOrEqual(600)

      const x = await boxOf(xOf(popup))
      const glyph = { x: Math.floor(x.left), y: Math.floor(x.top), width: Math.ceil(x.width), height: Math.ceil(x.height) }
      expect(inkOn(await pixelsOf(page, glyph), canvas), 'pixels of the x at 3:1').toBeGreaterThanOrEqual(16)
    })

    test('a bottom sheet keeps a line along its top edge, and its grabber, a fill in every other mode, keeps a line of its own', async ({ page }) => {
      const popup = await open(page, 'drawer--bottom')
      const canvas = FORCED_CANVAS[scheme]
      const frame = await boxOf(popup)
      const top = Math.floor(frame.top)
      const edge = await pixelsOf(page, { x: 100, y: top - 2, width: 800, height: 5 })
      expect(inkOn(edge, canvas), 'pixels of line at 3:1 along the top edge').toBeGreaterThanOrEqual(800)

      // 36 by 4 px, drawn by a 1 px outline there: its two long sides alone are 72 pixels.
      const grabber = await boxOf(popup.locator(':scope > div[aria-hidden="true"]'))
      expect([grabber.width, grabber.height]).toEqual([36, 4])
      const around = { x: Math.floor(grabber.left) - 2, y: Math.floor(grabber.top) - 2, width: 40, height: 8 }
      expect(inkOn(await pixelsOf(page, around), canvas), 'pixels of the grabber at 3:1').toBeGreaterThanOrEqual(60)

      const x = await boxOf(xOf(popup))
      const glyph = { x: Math.floor(x.left), y: Math.floor(x.top), width: Math.ceil(x.width), height: Math.ceil(x.height) }
      expect(inkOn(await pixelsOf(page, glyph), canvas), 'pixels of the x at 3:1').toBeGreaterThanOrEqual(16)
    })
  })
}

test.describe('the grabber, where colours are not forced', () => {
  for (const mode of MODES) {
    test(`${mode}: it is drawn at 3:1 on the sheet, in the middle of its top`, async ({ page }) => {
      const popup = await open(page, 'drawer--bottom', { mode })
      const [frame, grabber] = [await boxOf(popup), await boxOf(popup.locator(':scope > div[aria-hidden="true"]'))]
      expect(Math.round(grabber.left - frame.left), 'centred').toBe(Math.round(frame.right - grabber.right))
      expect(Math.round(grabber.top - frame.top)).toBe(11)
      const surface = await pixelsOf(page, { x: Math.floor(grabber.left) - 20, y: Math.floor(grabber.top) + 1, width: 1, height: 1 })
      const bar = await pixelsOf(page, { x: Math.floor(grabber.left) + 4, y: Math.floor(grabber.top) + 1, width: 28, height: 2 })
      expect(inkOn(bar, surface[0] ?? [0, 0, 0]), 'pixels of the bar at 3:1').toBe(56)
    })
  }
})

test.describe('under a coarse pointer', () => {
  test.use(PHONE)

  for (const demo of Object.keys(DRAWERS)) {
    test(`${demo}: the sheet ends with the x, and the x, every button, every link and every field in it is at least 44 px`, async ({ page }) => {
      const popup = await open(page, demo, { by: 'tap' })
      // WCAG 2.5.7: a swipe is a drag, so every sheet has the other way out, and it is the last thing in it.
      await expect(popup.locator(':scope > :last-child')).toHaveAttribute('aria-label', /^(Close this panel|إغلاق هذه اللوحة)$/)
      const targets = await popup.locator('button, a, input').all()
      expect(targets.length).toBeGreaterThanOrEqual(1)
      for (const target of targets) {
        const box = await boxOf(target)
        const name = (await target.getAttribute('aria-label')) ?? (await target.getAttribute('name')) ?? (await target.textContent()) ?? ''
        expect(box.width, `${name} width`).toBeGreaterThanOrEqual(44)
        expect(box.height, `${name} height`).toBeGreaterThanOrEqual(44)
      }
      for (const field of await popup.locator('input').all()) {
        expect(await field.evaluate((el) => getComputedStyle(el).fontSize), 'a field is typed into at 16 px').toBe('16px')
      }
    })
  }
})

/**
 * axe on the demo and on the portal its sheet opens in. Not on the shell of the harness page: its
 * heading sits in no landmark, which a modal sheet hides and a sheet that is not modal leaves in view.
 */
async function axe(page: Page): Promise<{ violations: string[], passes: string[] }> {
  const results = await new AxeBuilder({ page }).include('#demo').include('[data-base-ui-portal]').analyze()
  return {
    violations: results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`),
    passes: results.passes.map((pass) => pass.id),
  }
}

test.describe('axe on the open sheet', () => {
  for (const demo of Object.keys(DRAWERS)) {
    for (const mode of MODES) {
      for (const direction of DIRECTIONS) {
        test(`${demo} ${mode} ${direction}: no violation, in the sheet or in the demo behind it`, async ({ page }) => {
          await open(page, demo, { mode, direction })
          const results = await axe(page)
          expect(results.violations).toEqual([])
          // Not an empty run: axe did read the sheet.
          expect(results.passes).toContain('aria-dialog-name')
        })
      }
    }
  }
})

test.describe('axe on the open sheet, on a 320 x 480 phone', () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 320, height: 480 } })

  for (const demo of Object.keys(DRAWERS)) {
    test(`${demo}: no violation`, async ({ page }) => {
      await open(page, demo, { by: 'tap' })
      expect((await axe(page)).violations).toEqual([])
    })
  }

  for (const mode of MODES) {
    for (const direction of DIRECTIONS) {
      test(`drawer--long-content ${mode} ${direction}: its body scrolls there, and the keyboard can reach it`, async ({ page }) => {
        const popup = await open(page, 'drawer--long-content', { mode, direction, by: 'tap' })
        expect((await partsOf(popup)).scrollable, 'px the body scrolls').toBeGreaterThan(50)
        await expect(bodyOf(popup)).toHaveAttribute('tabindex', '0')
        expect((await axe(page)).violations).toEqual([])
      })
    }
  }
})

test.describe('motion', () => {
  const durations = (popup: Locator) => popup.evaluate((element) => ({
    popup: getComputedStyle(element).transitionDuration,
    scrim: getComputedStyle(element.parentElement?.previousElementSibling ?? element).transitionDuration,
    animated: getComputedStyle(element).transitionProperty,
  }))

  test('the sheet takes 300 ms to slide and the scrim 150 ms to fade', async ({ page }) => {
    expect(await durations(await open(page, 'drawer--end'))).toEqual({ popup: '0.3s', scrim: '0.15s', animated: 'transform, translate, scale, rotate' })
  })

  test.describe('reduced', () => {
    test.use({ reducedMotion: 'reduce' })

    for (const demo of ['drawer--end', 'drawer--bottom']) {
      test(`${demo}: with prefers-reduced-motion it opens and closes in no time, with no slide left half way`, async ({ page }) => {
        const popup = await open(page, demo, { by: 'keyboard' })
        expect(await durations(popup)).toEqual({ popup: '0s', scrim: '0s', animated: 'transform, translate, scale, rotate' })
        await expect(popup).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)')
        const seat = await seatOf(popup)
        expect(demo === 'drawer--end' ? seat.right : seat.bottom, 'px between the sheet and its edge').toBe(0)

        await page.keyboard.press('Escape')
        await expectClosed(page)
        await expect(triggerOf(page, DRAWERS[demo]?.trigger ?? '')).toBeFocused()
        // And again: a sheet that never left its ending style would not come back to its edge.
        await page.keyboard.press('Enter')
        const again = page.locator('[role="dialog"][data-open]')
        await expect(again).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)')
        expect((await seatOf(again))[demo === 'drawer--end' ? 'right' : 'bottom']).toBe(0)
      })
    }
  })
})
