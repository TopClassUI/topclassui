// The steps every modal spec repeats on the live harness: open by a trigger and wait until the popup
// has settled, read where focus is, read what locks the page behind, and scroll with a wheel or a finger.
// Dialog uses them first; Drawer, Command and a modal Popover open and lock the same way.
// openOverlay, atRest and expectClosed open and close; focusedName and pressInside follow the focus; pageLock,
// scrollPageTo, wheelAt and touchDrag test the lock; withScrollbar gives a page whose bar is real;
// boxOf, inkOf and expectNothingSideways measure what is inside the popup.
import { chromium, expect, test, type Locator, type Page } from '@playwright/test'

/** A popup Base UI has opened and moved past its first frame. Its transition is still running: atRest waits for it. */
export const OPENED = '[data-open]:not([data-starting-style])'

/**
 * A test whose `barPage` is a page in a browser that draws its scrollbars. Playwright hides them in headless
 * Chromium, and a page with no bar cannot shift when a modal locks it. launchOptions cannot change inside a
 * describe, so each test launches its own browser: use it only for the layout-shift tests.
 */
export const withScrollbar = test.extend<{ barPage: Page }>({
  barPage: async ({ launchOptions }, use) => {
    const browser = await chromium.launch({ ...launchOptions, ignoreDefaultArgs: ['--hide-scrollbars'] })
    await use(await browser.newPage({ viewport: { width: 1280, height: 720 } }))
    await browser.close()
  },
})

export interface OpenOptions {
  /** How the trigger is pressed: Base UI focuses the popup itself after a touch, the first control otherwise. */
  by?: 'click' | 'keyboard' | 'tap'
  /** The popup to wait for. Every modal of Unit 3 is a dialog to assistive technology. */
  popup?: string
}

/**
 * Resolves once nothing moves any more: every transition and every animation that ends, on the popup, inside
 * it, and on the scrim and the viewport that share its portal. A fade, a slide that never fades and a popup
 * with no motion at all end the same way, with nothing running; a spinner that turns for ever is not waited for.
 */
export async function atRest(popup: Locator): Promise<void> {
  await popup.evaluate(async (element) => {
    const layer = element.closest('[data-base-ui-portal]') ?? element
    const running = () => layer.getAnimations({ subtree: true }).filter((animation) => {
      const end = animation.effect?.getComputedTiming().endTime
      return animation.playState === 'running' && typeof end === 'number' && Number.isFinite(end)
    })
    // Read again after each wait: a transition can start when another ends. allSettled, since a cancelled one rejects.
    for (let pending = running(); pending.length > 0; pending = running()) {
      await Promise.allSettled(pending.map((animation) => animation.finished))
    }
  })
}

/**
 * Presses a trigger and returns its popup once it is open, at rest and holds the focus. Never a fixed wait,
 * and never one property: on its first frame an open popup is still at opacity 0 and scale 0.95, 20 px narrow.
 */
export async function openOverlay(page: Page, trigger: Locator, { by = 'click', popup = '[role="dialog"]' }: OpenOptions = {}): Promise<Locator> {
  if (by === 'keyboard') {
    await trigger.focus()
    await page.keyboard.press('Enter')
  } else if (by === 'tap') await trigger.tap()
  else await trigger.click()

  const opened = page.locator(`${popup}${OPENED}`).last()
  await expect(opened, 'the popup never opened, or never left its starting style').toBeVisible()
  await atRest(opened)
  await expect.poll(() => focusIsInside(opened), { message: 'focus never moved into the popup' }).toBe(true)
  return opened
}

/** Waits until no popup can be seen: a closed one stays mounted while it leaves, and for good with keepMounted. */
export async function expectClosed(page: Page, popup = '[role="dialog"]'): Promise<void> {
  await expect(page.locator(`${popup}:visible`)).toHaveCount(0)
}

/** Whether the focused element is the popup or inside it. A focus guard beside the popup is outside. */
export function focusIsInside(popup: Locator): Promise<boolean> {
  return popup.evaluate((element) => element.contains(document.activeElement))
}

/** The focused element as a reader hears it: its aria-label, or else its text, or else its tag. */
export function focusedName(page: Page): Promise<string> {
  return page.evaluate(() => {
    const element = document.activeElement
    if (!element) return '(nothing)'
    // Base UI parks focus on a guard for a moment before it wraps round; a poll waits it out.
    if (element.hasAttribute('data-base-ui-focus-guard')) return '(focus guard)'
    return element.getAttribute('aria-label') ?? (element.textContent.trim() || element.tagName.toLowerCase())
  })
}

/** Presses a key and waits until focus rests on a named control inside the popup. Returns that name. */
export async function pressInside(page: Page, popup: Locator, key: 'Tab' | 'Shift+Tab'): Promise<string> {
  await page.keyboard.press(key)
  await expect.poll(() => focusIsInside(popup), { message: `${key} took focus out of the popup` }).toBe(true)
  return focusedName(page)
}

export interface PageLock {
  /** How far the page behind is scrolled. */
  scrollY: number
  /** The inline styles Base UI wrote to lock the page, as written, or null. */
  html: string | null
  body: string | null
  /** The used overflow of the element whose overflow the viewport takes. */
  overflow: string
  /** Every child of the body that assistive technology can still reach, by tag: the portal alone, when locked. */
  reachable: string[]
}

/** What holds the page behind an open modal still, and what of it a screen reader can still reach. */
export function pageLock(page: Page): Promise<PageLock> {
  return page.evaluate(() => ({
    scrollY: Math.round(window.scrollY),
    html: document.documentElement.getAttribute('style'),
    body: document.body.getAttribute('style'),
    overflow: getComputedStyle(document.body).overflowY,
    reachable: [...document.body.children]
      .filter((child) => !['SCRIPT', 'STYLE'].includes(child.tagName) && child.getAttribute('aria-hidden') !== 'true' && !child.hasAttribute('inert'))
      .map((child) => (child.hasAttribute('data-base-ui-portal') ? 'portal' : child.tagName.toLowerCase())),
  }))
}

/** Scrolls the page of a closed overlay with the wheel and waits for it, so a lock has something to hold. */
export async function scrollPageTo(page: Page, y: number): Promise<void> {
  await page.mouse.move(8, 8)
  await page.mouse.wheel(0, y)
  await expect.poll(() => page.evaluate(() => Math.round(window.scrollY))).toBe(y)
}

/** Turns the wheel over a point and gives the page two frames to answer. */
export async function wheelAt(page: Page, x: number, y: number, deltaY: number): Promise<void> {
  await page.mouse.move(x, y)
  await page.mouse.wheel(0, deltaY)
  await twoFrames(page)
}

/**
 * A finger dragged from one height to another, as raw touch events: Playwright has no swipe, and CDP's
 * synthesizeScrollGesture scrolled nothing in headless Chromium. Needs `hasTouch: true` on the context.
 */
export async function touchDrag(page: Page, x: number, fromY: number, toY: number): Promise<void> {
  const session = await page.context().newCDPSession(page)
  const steps = 12
  await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y: fromY }] })
  for (let step = 1; step <= steps; step++) {
    await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: fromY + ((toY - fromY) * step) / steps }] })
    await twoFrames(page)
  }
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  // The fling after the finger lifts: the scroll position is read only once it has stopped.
  await expect.poll(async () => {
    const before = await scrollPositions(page)
    await twoFrames(page)
    return JSON.stringify(before) === JSON.stringify(await scrollPositions(page))
  }).toBe(true)
  await session.detach()
}

/** The scroll offset of the page and of everything that scrolls inside an open popup. */
function scrollPositions(page: Page): Promise<number[]> {
  return page.evaluate(() => [
    window.scrollY,
    ...[...document.querySelectorAll('[data-base-ui-portal] *')].filter((el) => el.scrollHeight > el.clientHeight).map((el) => el.scrollTop),
  ])
}

const twoFrames = (page: Page) => page.evaluate(() => new Promise<void>((resolve) => {
  requestAnimationFrame(() => { requestAnimationFrame(() => { resolve() }) })
}))

export interface Box { left: number, top: number, right: number, bottom: number, width: number, height: number }

/** A box in viewport coordinates, to a tenth of a pixel. */
export function boxOf(target: Locator): Promise<Box> {
  return target.evaluate((element) => {
    const { left, top, right, bottom, width, height } = element.getBoundingClientRect()
    const round = (value: number) => Math.round(value * 10) / 10
    return { left: round(left), top: round(top), right: round(right), bottom: round(bottom), width: round(width), height: round(height) }
  })
}

/** The rectangle the text of an element really covers, which is narrower than its box when it is aligned. */
export function inkOf(target: Locator): Promise<Box> {
  return target.evaluate((element) => {
    const range = document.createRange()
    range.selectNodeContents(element)
    const { left, top, right, bottom, width, height } = range.getBoundingClientRect()
    return { left, top, right, bottom, width, height }
  })
}

/**
 * Nothing in a popup is wider than the popup: no element crosses its left or right edge, and neither it
 * nor anything in it scrolls sideways. Heights are left out: a body that scrolls is taller than its box.
 */
export async function expectNothingSideways(popup: Locator, label = 'the popup'): Promise<void> {
  const found = await popup.evaluate((element) => {
    const frame = element.getBoundingClientRect()
    const crossing: string[] = []
    const scrolling: string[] = []
    for (const child of [element, ...element.querySelectorAll('*')]) {
      if (child.closest('svg') && child.tagName !== 'svg') continue
      const box = child.getBoundingClientRect()
      const name = `${child.tagName.toLowerCase()}.${(child.getAttribute('class') ?? '').slice(0, 24)}`
      if (box.width > 0 && (box.left < frame.left - 0.5 || box.right > frame.right + 0.5)) crossing.push(name)
      // hidden clips a truncated label on purpose; only auto and scroll let a reader drag the content sideways.
      if (child.scrollWidth > child.clientWidth && ['auto', 'scroll'].includes(getComputedStyle(child).overflowX)) scrolling.push(name)
    }
    return { crossing, scrolling }
  })
  expect(found.crossing, `${label}: these cross its left or right edge`).toEqual([])
  expect(found.scrolling, `${label}: these scroll sideways`).toEqual([])
}
