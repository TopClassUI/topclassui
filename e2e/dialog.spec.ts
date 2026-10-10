import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Locator, type Page } from '@playwright/test'

import { DIRECTIONS, MODES } from '../scripts/lib/harness.js'
import { type LiveOptions, expectInsideViewport, expectNoSidewaysScroll, liveErrors, openLive } from './live.js'
import {
  type Box, type OpenOptions, boxOf, expectClosed, expectNothingSideways, focusedName, inkOf, openOverlay,
  pageLock, pressInside, scrollPageTo, touchDrag, wheelAt, withScrollbar,
} from './overlay.js'
import { DEMOS } from './pages.js'
import { FORCED_CANVAS, inkOn, pixelsOf } from './pixels.js'

// What happy-dom cannot lay out and the static page cannot open: where focus goes, what holds the page
// behind still, what scrolls, and whether the popup and everything in it stay inside a small screen.

/** The first trigger of every demo and the title its dialog shows. Written out, so a renamed demo fails here. */
const DIALOGS: Record<string, { trigger: string, title: string }> = {
  'dialog--basic': { trigger: 'Publish', title: 'Publish changes' },
  'dialog--confirm': { trigger: 'Delete project', title: 'Delete this project?' },
  'dialog--long-body': { trigger: 'Read the terms', title: 'Terms of service' },
  'dialog--long-content': {
    trigger: 'Move to the archive',
    title: 'Move the quarterly report, its eleven attachments and every comment thread to the shared archive of the finance team',
  },
  'dialog--no-close-button': { trigger: 'What is new', title: 'Version 2.4' },
  'dialog--rtl': { trigger: 'نشر', title: 'نشر التغييرات' },
  'dialog--sizes': { trigger: 'xs', title: 'Size xs' },
  'dialog--with-form': { trigger: 'Rename', title: 'Rename this project' },
}

/** The three screens Unit 3 measures at: a small phone, a phone and a desktop. */
const SCREENS = [{ width: 320, height: 480 }, { width: 390, height: 844 }, { width: 1280, height: 800 }] as const

/** The x. In English and in Arabic, since the island demo names it from its own provider. */
const CLOSE = { en: 'Close this dialog', ar: 'إغلاق هذا الحوار' } as const

/** A trigger by its whole label. Not by role: the page behind an open dialog is hidden from roles. */
const triggerOf = (page: Page, name: string) =>
  page.locator('#demo button').filter({ has: page.getByText(name, { exact: true }) })

/** Opens a demo page and its first dialog, and returns the settled popup. */
async function open(page: Page, demo: string, options: LiveOptions & OpenOptions = {}): Promise<Locator> {
  const known = DIALOGS[demo]
  if (!known) throw new Error(`no row for ${demo}`)
  await openLive(page, demo, options)
  const popup = await openOverlay(page, triggerOf(page, known.trigger), options)
  await expect(popup.locator('h2')).toHaveText(known.title)
  return popup
}

const xOf = (popup: Locator) => popup.locator(`button[aria-label="${CLOSE.en}"], button[aria-label="${CLOSE.ar}"]`)

interface Parts { popup: Box, header: Box, body: Box, footer: Box, scrollTop: number, scrollable: number }

/** The three bars of a popup, found from its title: the header holds it, the body and the footer follow. */
const partsOf = (popup: Locator) => popup.evaluate((element): Parts => {
  const header = element.querySelector('h2')?.parentElement?.parentElement
  const body = header?.nextElementSibling
  const footer = body?.nextElementSibling
  if (!header || !body || !footer) throw new Error('the popup has no header, body and footer')
  const box = (target: Element): Box => {
    const { left, top, right, bottom, width, height } = target.getBoundingClientRect()
    return { left, top, right, bottom, width, height }
  }
  return {
    popup: box(element), header: box(header), body: box(body), footer: box(footer),
    scrollTop: body.scrollTop, scrollable: body.scrollHeight - body.clientHeight,
  }
})

const bodyOf = (popup: Locator) => popup.locator('div:has(> div > h2) + div')
const scrollY = (page: Page) => page.evaluate(() => Math.round(window.scrollY))

test('the table names every dialog demo', () => {
  expect(Object.keys(DIALOGS).sort()).toEqual(DEMOS.filter((demo) => demo.startsWith('dialog--')).sort())
  expect(Object.keys(DIALOGS)).toHaveLength(8)
})

test.describe('focus', () => {
  test('opened from the keyboard, focus moves to the x with its ring, and Escape hands it back to the trigger', async ({ page }) => {
    const popup = await open(page, 'dialog--basic', { by: 'keyboard' })
    await expect(xOf(popup)).toBeFocused()
    await expect(xOf(popup)).toHaveCSS('outline-style', 'solid')
    await expect(xOf(popup)).toHaveCSS('outline-width', '2px')

    await page.keyboard.press('Escape')
    await expectClosed(page)
    await expect(triggerOf(page, 'Publish')).toBeFocused()
    expect(await liveErrors(page)).toEqual([])
  })

  test('the x closes the dialog and focus returns to the trigger', async ({ page }) => {
    const popup = await open(page, 'dialog--basic')
    await xOf(popup).click()
    await expectClosed(page)
    await expect(triggerOf(page, 'Publish')).toBeFocused()
  })

  test('Tab and Shift+Tab go round inside the dialog and never reach the page behind', async ({ page }) => {
    const popup = await open(page, 'dialog--basic', { by: 'keyboard' })
    expect(await focusedName(page)).toBe('Close this dialog')
    const seen: string[] = []
    for (const key of ['Tab', 'Tab', 'Tab', 'Tab', 'Shift+Tab', 'Shift+Tab', 'Shift+Tab'] as const) {
      seen.push(await pressInside(page, popup, key))
    }
    // Three controls: forward past the last one wraps to the x, and back from the x wraps to the last.
    expect(seen).toEqual([
      'Cancel', 'Publish now', 'Close this dialog', 'Cancel', 'Close this dialog', 'Publish now', 'Cancel',
    ])
  })

  test('a press outside closes it, and focus returns to the trigger', async ({ page }) => {
    await open(page, 'dialog--basic')
    await page.mouse.click(20, 600)
    await expectClosed(page)
    await expect(triggerOf(page, 'Publish')).toBeFocused()
  })

  test('with disablePointerDismissal a press outside leaves it open, and Escape still closes it', async ({ page }) => {
    const popup = await open(page, 'dialog--confirm')
    await page.mouse.click(20, 600)
    // Longer than the 150 ms it would take to fade out, so a dialog on its way out is not read as open.
    await page.waitForTimeout(400)
    await expect(popup).toBeVisible()
    await expect(popup).toHaveAttribute('data-open', '')

    await page.keyboard.press('Escape')
    await expectClosed(page)
    await expect(triggerOf(page, 'Delete project')).toBeFocused()
  })

  test('a form dialog starts in its first field, and Enter there submits the form the footer button belongs to', async ({ page }) => {
    const popup = await open(page, 'dialog--with-form', { by: 'keyboard' })
    const field = popup.locator('input[name="name"]')
    await expect(field).toBeFocused()
    // The whole column is one form, and the popup keeps the dialog role a form may not carry.
    expect(await popup.evaluate((el) => `${el.tagName} ${el.getAttribute('role') ?? ''}`)).toBe('DIV dialog')
    expect(await popup.locator('button[type="submit"]').evaluate((el: HTMLButtonElement) => el.form?.contains(document.activeElement))).toBe(true)

    await popup.locator('form').evaluate((form) => {
      form.addEventListener('submit', (event) => { event.preventDefault(); form.dataset['submitted'] = 'yes' })
    })
    await page.keyboard.press('Enter')
    await expect(popup.locator('form')).toHaveAttribute('data-submitted', 'yes')
  })

  test('in a window too short for the form, its body is still what scrolls: the form makes no box of its own', async ({ page }) => {
    // 228 px of popup, 226 inside its line, for 234 px of header, body and footer.
    await page.setViewportSize({ width: 400, height: 260 })
    const popup = await open(page, 'dialog--with-form')
    const parts = await partsOf(popup)
    expect(parts.popup.height).toBe(228)
    expect(parts.scrollable, 'px the body scrolls').toBe(8)
    expect(parts.footer.bottom).toBe(parts.popup.bottom - 1)
    expect(await popup.evaluate((el) => el.scrollHeight - el.clientHeight), 'px the popup scrolls').toBe(0)
  })
})

test.describe('the page behind', () => {
  test('is hidden from assistive technology and cannot scroll while the dialog is open, and is given back on close', async ({ page }) => {
    await openLive(page, 'dialog--basic', { tall: true })
    expect((await pageLock(page)).reachable).toEqual(['h1', 'main', 'pre'])
    await expect(page.getByRole('button', { name: 'Publish' })).toHaveCount(1)

    await openOverlay(page, triggerOf(page, 'Publish'))
    // Base UI 1.8.0 marks every sibling of its portal aria-hidden, and locks the scroll on the body.
    const locked = await pageLock(page)
    expect(locked.reachable).toEqual(['portal'])
    expect(locked.body).toBe('overflow: hidden;')
    expect(locked.overflow).toBe('hidden')
    await expect(page.getByRole('button', { name: 'Publish', exact: true })).toHaveCount(0)
    await expect(page.getByRole('dialog', { name: 'Publish changes' })).toHaveCount(1)

    await page.keyboard.press('Escape')
    await expectClosed(page)
    const released = await pageLock(page)
    expect(released.reachable).toEqual(['h1', 'main', 'pre'])
    expect(released.overflow).toBe('visible')
  })

  for (const direction of DIRECTIONS) {
    test(`${direction}: a wheel over the scrim, the header and the end of the body leaves the page where it was`, async ({ page }) => {
      await openLive(page, 'dialog--long-body', { direction, tall: true })
      await scrollPageTo(page, 20)
      const popup = await openOverlay(page, triggerOf(page, 'Read the terms'))
      expect(await scrollY(page)).toBe(20)
      const { header, body } = await partsOf(popup)

      await wheelAt(page, 8, 400, 500)
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

      // The same wheel does move the page once the dialog is gone, or all of the above proved nothing.
      await page.keyboard.press('Escape')
      await expectClosed(page)
      await page.mouse.wheel(0, 200)
      await expect.poll(() => scrollY(page)).toBe(220)
    })
  }

  test.describe('under a finger', () => {
    test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } })

    test('a drag inside the open dialog scrolls its body and never the page', async ({ page }) => {
      await openLive(page, 'dialog--long-body', { tall: true })
      // The control: the same drag scrolls the page while nothing is open.
      await touchDrag(page, 195, 600, 560)
      const before = await scrollY(page)
      expect(before).toBeGreaterThan(10)

      const popup = await openOverlay(page, triggerOf(page, 'Read the terms'), { by: 'tap' })
      const { body, header } = await partsOf(popup)
      await touchDrag(page, body.left + 80, body.top + 400, body.top + 100)
      expect((await partsOf(popup)).scrollTop).toBeGreaterThan(200)
      expect(await scrollY(page), 'after a drag in the body').toBe(before)

      for (let drag = 0; drag < 12; drag++) await touchDrag(page, body.left + 80, body.bottom - 20, body.top + 20)
      const end = await partsOf(popup)
      expect(end.scrollTop, 'the body is at its end').toBe(end.scrollable)
      await touchDrag(page, body.left + 80, body.bottom - 20, body.top + 20)
      expect(await scrollY(page), 'after a drag past the end of the body').toBe(before)

      await touchDrag(page, header.left + 80, header.bottom - 10, header.top + 4)
      await touchDrag(page, 8, 700, 400)
      expect(await scrollY(page), 'after a drag on the header and on the scrim').toBe(before)
      await expect(popup).toHaveAttribute('data-open', '')
    })
  })

  test.describe('with a classic scrollbar', () => {
    for (const direction of DIRECTIONS) {
      for (const edge of ['start', 'end'] as const) {
        withScrollbar(`${direction}, trigger at the ${edge}: opening and closing the dialog does not move the trigger`, async ({ barPage: page }) => {
          await openLive(page, 'dialog--basic', { direction, edge, tall: true })
          // A real bar 15 px wide: the root's client box is narrower than the window.
          expect(await page.evaluate(() => window.innerWidth - document.documentElement.clientWidth)).toBe(15)
          const trigger = triggerOf(page, 'Publish')
          const before = await boxOf(trigger)

          await openOverlay(page, trigger)
          expect((await pageLock(page)).overflow).toBe('hidden')
          expect(await boxOf(trigger), 'while the dialog is open').toEqual(before)

          await page.keyboard.press('Escape')
          await expectClosed(page)
          expect(await boxOf(trigger), 'after it has closed').toEqual(before)
        })
      }
    }

    withScrollbar('the comparison can fail: with the gutter forced off, the trigger at the end moves by the 15 px of the bar', async ({ barPage: page }) => {
      await openLive(page, 'dialog--basic', { edge: 'end', tall: true })
      await page.addStyleTag({ content: 'html { scrollbar-gutter: auto !important }' })
      const trigger = triggerOf(page, 'Publish')
      const before = await boxOf(trigger)
      await openOverlay(page, trigger)
      expect((await boxOf(trigger)).left).toBe(before.left - 15)
    })
  })
})

test.describe('the long body', () => {
  test('scrolls inside the popup while the header and the footer keep their boxes', async ({ page }) => {
    const popup = await open(page, 'dialog--long-body')
    const before = await partsOf(popup)
    expect(before.scrollable).toBeGreaterThan(1000)
    // Flush: the header starts and the footer ends one line width inside the popup.
    expect(before.header.top).toBe(before.popup.top + 1)
    expect(before.footer.bottom).toBe(before.popup.bottom - 1)
    expect(before.body.top).toBe(before.header.bottom)
    expect(before.body.bottom).toBe(before.footer.top)

    await wheelAt(page, before.body.left + 80, before.body.top + 200, 600)
    const after = await partsOf(popup)
    expect(after.scrollTop).toBe(600)
    expect(after.header).toEqual(before.header)
    expect(after.footer).toEqual(before.footer)
    expect(after.popup).toEqual(before.popup)
    // The popup itself did not scroll: it is only the last resort of a screen too short for the three bars.
    expect(await popup.evaluate((el) => `${String(el.scrollTop)} ${String(el.scrollHeight - el.clientHeight)}`)).toBe('0 0')
  })

  test('takes focus from the keyboard with a ring drawn inside its own box, where the popup cannot clip it', async ({ page }) => {
    const popup = await open(page, 'dialog--long-body', { by: 'keyboard' })
    const body = bodyOf(popup)
    await page.keyboard.press('Tab')
    await expect(body).toBeFocused()
    await expect(body).toHaveCSS('outline-style', 'solid')
    await expect(body).toHaveCSS('outline-offset', '-2px')

    // The two pixels inside its top edge are ring from end to end: outside the box the popup would cut it.
    const box = await boxOf(body)
    const surface = await pixelsOf(page, { x: box.left + 40, y: box.top + 10, width: 1, height: 1 })
    const band = await pixelsOf(page, { x: box.left, y: box.top, width: box.width, height: 2 })
    expect(inkOn(band, surface[0] ?? [0, 0, 0]), 'pixels of ring along the top edge of the body').toBeGreaterThan(band.length * 0.9)

    // And the keyboard scrolls it from there.
    await page.keyboard.press('PageDown')
    await expect.poll(async () => (await partsOf(popup)).scrollTop).toBeGreaterThan(200)
  })
})

test.describe('inside the viewport', () => {
  for (const screen of SCREENS) {
    for (const direction of DIRECTIONS) {
      const label = `${String(screen.width)} x ${String(screen.height)} ${direction}`

      test(`${label}: a body taller than the screen leaves the popup inside it, 16 px clear of every edge`, async ({ page }) => {
        await page.setViewportSize(screen)
        const popup = await open(page, 'dialog--long-body', { direction })
        await expectInsideViewport(popup, 'the popup', 16)
        await expectNoSidewaysScroll(page)
        await expectNothingSideways(popup)
        const parts = await partsOf(popup)
        expect(parts.scrollable, 'px the body can scroll').toBeGreaterThan(1000)
        expect(parts.footer.bottom).toBe(parts.popup.bottom - 1)
      })

      test(`${label}: a long title, a 300-character word and three long actions stay inside the popup`, async ({ page }) => {
        await page.setViewportSize(screen)
        const popup = await open(page, 'dialog--long-content', { direction })
        await expectInsideViewport(popup, 'the popup', 16)
        await expectNoSidewaysScroll(page)
        await expectNothingSideways(popup)

        // The title wraps beside the x and never runs under it.
        const [title, x] = [await inkOf(popup.locator('h2')), await boxOf(xOf(popup))]
        expect(title.height, 'px of title: more than one line').toBeGreaterThan(40)
        if (direction === 'ltr') expect(title.right).toBeLessThanOrEqual(x.left - 12)
        else expect(title.left).toBeGreaterThanOrEqual(x.right + 12)

        // The word is broken into lines no wider than the body, and the body still shows at least one of them.
        const [word, body] = [await inkOf(bodyOf(popup)), await boxOf(bodyOf(popup))]
        expect(word.left).toBeGreaterThanOrEqual(body.left + 20)
        expect(word.right).toBeLessThanOrEqual(body.right - 20)
        expect(word.height, 'px of word: several lines').toBeGreaterThan(100)
        expect(body.height).toBeGreaterThanOrEqual(60)

        // Where the three bars are taller than the screen, a wheel over the header scrolls the popup to its last
        // action. A wheel, not scrollIntoView: a script scrolls a box that clips, and a reader cannot.
        const [frame, header] = [await boxOf(popup), (await partsOf(popup)).header]
        const hidden = await popup.evaluate((el) => el.scrollHeight - el.clientHeight)
        expect(hidden, 'px of popup below its own box').toBe(screen.height === 480 ? 16 : 0)
        await wheelAt(page, header.left + 40, header.top + 20, hidden)
        expect(await popup.evaluate((el) => el.scrollTop), 'px the wheel scrolled the popup').toBe(hidden)
        for (const button of await popup.locator('button:not([aria-label])').all()) {
          const box = await boxOf(button)
          const name = (await button.textContent()) ?? ''
          expect(box.top, `${name} starts above the popup`).toBeGreaterThanOrEqual(frame.top)
          expect(box.bottom, `${name} ends below the popup`).toBeLessThanOrEqual(frame.bottom)
          expect(box.left, `${name} starts outside the popup`).toBeGreaterThanOrEqual(frame.left)
          expect(box.right, `${name} ends outside the popup`).toBeLessThanOrEqual(frame.right)
        }
      })
    }
  }

  test('the five sizes are 320, 360, 400, 512 and 640 px wide, and custom takes the width of its className', async ({ page }) => {
    await openLive(page, 'dialog--sizes')
    const seen: string[] = []
    for (const size of ['xs', 'sm', 'md', 'lg', 'xl', 'custom']) {
      const popup = await openOverlay(page, triggerOf(page, size))
      seen.push(`${(await popup.getAttribute('data-size')) ?? ''} ${String((await boxOf(popup)).width)}`)
      await page.keyboard.press('Escape')
      await expectClosed(page)
    }
    expect(seen).toEqual(['xs 320', 'sm 360', 'md 400', 'lg 512', 'xl 640', 'custom 768'])
  })

  test('the stylesheet already holds the classes of a popup nothing has rendered yet', async ({ page }) => {
    const popup = await open(page, 'dialog--basic')
    const styles = await popup.evaluate((element) => {
      const own = getComputedStyle(element)
      const viewport = getComputedStyle(element.parentElement ?? element)
      const scrim = getComputedStyle(element.parentElement?.previousElementSibling ?? element)
      return {
        maxWidth: own.maxWidth, maxHeight: own.maxHeight, radius: own.borderRadius, line: own.borderTopWidth,
        raised: own.boxShadow !== 'none', wrap: own.overflowWrap, layer: `${viewport.zIndex} ${scrim.zIndex}`,
        inset: viewport.paddingTop, scrim: scrim.backgroundColor !== 'rgba(0, 0, 0, 0)', fixed: `${viewport.position} ${scrim.position}`,
      }
    })
    // max-w-100, the screen less two insets, rounded-box, the line, shadow-lg, wrap-anywhere, --tc-z-dialog, --tc-overlay-inset.
    expect(styles).toEqual({
      maxWidth: '400px', maxHeight: '688px', radius: '12px', line: '1px', raised: true, wrap: 'anywhere', layer: '50 50',
      inset: '16px', scrim: true, fixed: 'fixed fixed',
    })
  })
})

test.describe('direction', () => {
  /** Where the x, the title and the two actions lie between the inner edges of a popup, 21 px in from its box. */
  async function layoutOf(popup: Locator) {
    const [frame, x, title] = [await boxOf(popup), await boxOf(xOf(popup)), await inkOf(popup.locator('h2'))]
    const [first, second] = await Promise.all((await popup.locator('button:not([aria-label])').all()).map((b) => boxOf(b)))
    if (!first || !second) throw new Error('the footer holds two actions')
    return {
      xFromLeft: x.left - frame.left, xFromRight: frame.right - x.right,
      titleFromLeft: Math.round(title.left - frame.left), titleFromRight: Math.round(frame.right - title.right),
      firstFromLeft: first.left - frame.left, secondFromRight: Math.round(frame.right - second.right),
      secondFromLeft: second.left - frame.left, firstIsRightOfSecond: first.left > second.right,
    }
  }

  test('ltr: the x is at the right, the title starts at the left and the actions end at the right', async ({ page }) => {
    const layout = await layoutOf(await open(page, 'dialog--basic'))
    expect(layout).toMatchObject({ xFromRight: 21, titleFromLeft: 21, secondFromRight: 21, firstIsRightOfSecond: false })
  })

  test('rtl: the x is at the left, the title starts at the right and the actions end at the left', async ({ page }) => {
    const layout = await layoutOf(await open(page, 'dialog--basic', { direction: 'rtl' }))
    expect(layout).toMatchObject({ xFromLeft: 21, titleFromRight: 21, secondFromLeft: 21, firstIsRightOfSecond: true })
  })

  // The demo mounts its own RTL provider, so on an LTR page its portal sits in a <body> of the other direction.
  test('an RTL island on an LTR page lays its dialog out right to left: the x at the left, the text right-aligned', async ({ page }) => {
    const popup = await open(page, 'dialog--rtl', { direction: 'ltr' })
    const directions = await popup.evaluate((element) => ({
      body: getComputedStyle(document.body).direction,
      viewport: getComputedStyle(element.parentElement ?? element).direction,
      popup: getComputedStyle(element).direction,
      footer: getComputedStyle(element.lastElementChild ?? element).direction,
    }))
    expect(directions).toEqual({ body: 'ltr', viewport: 'rtl', popup: 'rtl', footer: 'rtl' })
    expect(await layoutOf(popup)).toMatchObject({ xFromLeft: 21, titleFromRight: 21, secondFromLeft: 21, firstIsRightOfSecond: true })
    // Named by the island's own labels, not the page's.
    await expect(xOf(popup)).toHaveAttribute('aria-label', CLOSE.ar)
  })

  test('the same demo on the RTL page is laid out the same way', async ({ page }) => {
    const popup = await open(page, 'dialog--rtl', { direction: 'rtl' })
    expect(await layoutOf(popup)).toMatchObject({ xFromLeft: 21, titleFromRight: 21, secondFromLeft: 21, firstIsRightOfSecond: true })
  })
})

for (const scheme of ['light', 'dark'] as const) {
  test.describe(`forced colours, ${scheme} palette`, () => {
    test.use({ forcedColors: 'active', colorScheme: scheme })

    // Forced colours erase the fill, the shadow and the scrim: the line of the surface is the only edge left.
    test('the popup keeps a line against the page on every side, and the x is drawn', async ({ page }) => {
      const popup = await open(page, 'dialog--basic')
      expect(await page.evaluate(() => matchMedia('(forced-colors: active)').matches)).toBe(true)
      const canvas = FORCED_CANVAS[scheme]
      const frame = await boxOf(popup)
      const [left, top, right, bottom] = [Math.floor(frame.left), Math.floor(frame.top), Math.ceil(frame.right), Math.ceil(frame.bottom)]
      // Both sides of the edge are Canvas there: the page behind the scrim and the surface of the popup.
      const outside = await pixelsOf(page, { x: left - 8, y: top + 100, width: 1, height: 1 })
      const inside = await pixelsOf(page, { x: left + 8, y: top + 100, width: 1, height: 1 })
      expect([outside[0], inside[0]]).toEqual([canvas, canvas])

      // Five pixels across each edge, clear of the rounded corners: one of the five is line, all the way along.
      const [along, across] = [bottom - top - 48, right - left - 48]
      const edges = {
        left: { x: left - 2, y: top + 24, width: 5, height: along },
        right: { x: right - 3, y: top + 24, width: 5, height: along },
        top: { x: left + 24, y: top - 2, width: across, height: 5 },
        bottom: { x: left + 24, y: bottom - 3, width: across, height: 5 },
      }
      for (const [side, clip] of Object.entries(edges)) {
        const length = side === 'left' || side === 'right' ? along : across
        expect(inkOn(await pixelsOf(page, clip), canvas), `pixels of line at 3:1 along the ${side} edge`).toBeGreaterThanOrEqual(length)
      }

      const x = await boxOf(xOf(popup))
      const glyph = { x: Math.floor(x.left), y: Math.floor(x.top), width: Math.ceil(x.width), height: Math.ceil(x.height) }
      // Two strokes one pixel wide across a 16 px glyph: 20 pixels were measured at 3:1 on both palettes.
      expect(inkOn(await pixelsOf(page, glyph), canvas), 'pixels of the x at 3:1').toBeGreaterThanOrEqual(16)
    })
  })
}

test.describe('under a coarse pointer', () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } })

  for (const demo of ['dialog--basic', 'dialog--confirm', 'dialog--no-close-button', 'dialog--with-form', 'dialog--long-content']) {
    test(`${demo}: the x, every button and every field of the open dialog is at least 44 px`, async ({ page }) => {
      const popup = await open(page, demo, { by: 'tap' })
      const targets = await popup.locator('button, input').all()
      expect(targets.length).toBeGreaterThanOrEqual(1)
      for (const target of targets) {
        const box = await boxOf(target)
        const name = (await target.getAttribute('aria-label')) ?? (await target.getAttribute('name')) ?? (await target.textContent()) ?? ''
        expect(box.width, `${name} width`).toBeGreaterThanOrEqual(44)
        expect(box.height, `${name} height`).toBeGreaterThanOrEqual(44)
      }
    })
  }

  test('on a 320 x 480 phone the hostile dialog is taller than its screen, so the popup scrolls and no action is cut off', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 480 })
    const popup = await open(page, 'dialog--long-content', { by: 'tap' })
    await expectInsideViewport(popup, 'the popup', 16)
    const parts = await partsOf(popup)
    // The body keeps one whole line, and what no longer fits is reached by scrolling the popup.
    expect(parts.body.height).toBe(60)
    expect(await popup.evaluate((el) => el.scrollHeight - el.clientHeight), 'px of popup below its own box').toBe(52)
    const last = popup.locator('button').last()
    const frame = await boxOf(popup)
    expect((await boxOf(last)).bottom, 'the last action, before any scroll').toBe(frame.bottom + 35)

    // A finger on the header drags the popup up: a real drag, since a script scrolls a box that clips and a finger cannot.
    await touchDrag(page, parts.header.left + 40, parts.header.top + 200, parts.header.top + 80)
    expect(await popup.evaluate((el) => el.scrollTop), 'px the drag scrolled the popup').toBe(52)
    const box = await boxOf(last)
    expect(box.height).toBe(44)
    expect(box.bottom, 'the last action ends below the popup').toBeLessThanOrEqual(frame.bottom)
    expect(box.top, 'the last action starts above the popup').toBeGreaterThanOrEqual(frame.top)
    expect(await scrollY(page)).toBe(0)
  })
})

test.describe('axe on the open dialog', () => {
  for (const demo of Object.keys(DIALOGS)) {
    for (const mode of MODES) {
      for (const direction of DIRECTIONS) {
        test(`${demo} ${mode} ${direction}: no violation, the page behind included`, async ({ page }) => {
          await open(page, demo, { mode, direction })
          const results = await new AxeBuilder({ page }).analyze()
          expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([])
          // Not an empty run: axe did read the dialog.
          expect(results.passes.map((pass) => pass.id)).toContain('aria-dialog-name')
        })
      }
    }
  }
})

test.describe('motion', () => {
  const durations = (popup: Locator) => popup.evaluate((element) => ({
    popup: getComputedStyle(element).transitionDuration,
    scrim: getComputedStyle(element.parentElement?.previousElementSibling ?? element).transitionDuration,
    animated: getComputedStyle(element).transitionProperty,
  }))

  test('the popup and the scrim take 150 ms to come and go', async ({ page }) => {
    expect(await durations(await open(page, 'dialog--basic'))).toEqual({ popup: '0.15s', scrim: '0.15s', animated: 'opacity, scale' })
  })

  test.describe('reduced', () => {
    test.use({ reducedMotion: 'reduce' })

    test('with prefers-reduced-motion the dialog still opens and closes, in no time at all', async ({ page }) => {
      const popup = await open(page, 'dialog--basic', { by: 'keyboard' })
      expect(await durations(popup)).toEqual({ popup: '0s', scrim: '0s', animated: 'opacity, scale' })
      await expect(popup).toHaveCSS('opacity', '1')
      await expect(popup).toHaveCSS('scale', 'none')

      await page.keyboard.press('Escape')
      await expectClosed(page)
      await expect(triggerOf(page, 'Publish')).toBeFocused()
      // And again: a popup that never left its ending style would not come back.
      await page.keyboard.press('Enter')
      await expect(page.locator('[role="dialog"][data-open]')).toHaveCSS('opacity', '1')
    })
  })
})
