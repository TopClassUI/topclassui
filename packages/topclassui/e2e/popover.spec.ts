import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Locator, type Page } from '@playwright/test'

import { DIRECTIONS, MODES, type Direction } from '../scripts/lib/harness.js'
import { EDGES, type Edge } from '../scripts/lib/live-harness.js'
import { type LiveOptions, expectInsideViewport, expectNoSidewaysScroll, liveErrors, openLive } from './live.js'
import {
  type Box, type OpenOptions, OPENED, atRest, boxOf, expectClosed, expectNothingSideways, focusedName, inkOf, openOverlay,
  pageLock, touchDrag, wheelAt,
} from './overlay.js'
import { DEMOS } from './pages.js'
import { FORCED_CANVAS, inkOn, pixelsOf } from './pixels.js'

// What happy-dom cannot lay out and the static page cannot open: where the popup lands beside its trigger,
// what it does at an edge and on a small screen, where focus goes, and what the page behind still does.

/** Every trigger of every demo, by its label, in tab order. Written out, so a renamed demo fails here. */
const POPOVERS: Record<string, readonly string[]> = {
  'popover--basic': ['Share'],
  'popover--hover': ['Billing details'],
  'popover--long-content': ['Change log'],
  'popover--modal': ['Delete draft'],
  'popover--placements': [
    'top-start', 'top', 'top-end', 'start-top', 'start', 'start-bottom',
    'end-top', 'end', 'end-bottom', 'bottom-start', 'bottom', 'bottom-end',
  ],
  'popover--rtl': ['مشاركة', 'التفاصيل', 'الإعدادات'],
  'popover--with-close': ['Notifications'],
  'popover--with-form': ['Rename'],
}

/** The four screens Unit 3 measures at: a small phone, a phone, a phone on its side and a desktop. */
const SCREENS = [
  { width: 320, height: 480 }, { width: 390, height: 844 }, { width: 844, height: 390 }, { width: 1280, height: 800 },
] as const

/** The x. In English and in Arabic, since the island demo names it from its own provider. */
const CLOSE = { en: 'Close', ar: 'إغلاق' } as const

/** A trigger by its whole label. Not by role: the page behind a modal popover is hidden from roles. */
const triggerOf = (page: Page, name: string, scope = '#demo') =>
  page.locator(`${scope} button`).filter({ has: page.getByText(name, { exact: true }) })

/** Opens a demo page and its first popover, and returns the settled popup. */
async function open(page: Page, demo: string, options: LiveOptions & OpenOptions = {}): Promise<Locator> {
  const [first] = POPOVERS[demo] ?? []
  if (first === undefined) throw new Error(`no row for ${demo}`)
  await openLive(page, demo, options)
  return openOverlay(page, triggerOf(page, first), options)
}

/** Loads a fixture module into a plain live page and waits for its first button. */
async function fixture(page: Page, file: string, scope: string, options: LiveOptions = {}): Promise<void> {
  await openLive(page, 'separator--horizontal', options)
  await page.addScriptTag({ type: 'module', url: `/e2e/fixtures/${file}.tsx` })
  await expect(page.locator(`${scope} button`).first()).toBeVisible()
}

const xOf = (popup: Locator) => popup.locator(`button[aria-label="${CLOSE.en}"], button[aria-label="${CLOSE.ar}"]`)
const scrollY = (page: Page) => page.evaluate(() => Math.round(window.scrollY))
const openPopups = (page: Page) => page.locator('[role="dialog"][data-open]')

type Where = 'above' | 'below' | 'left' | 'right'

/** The side of the trigger a popup lies on, and the gap between the two. Null while they overlap. */
function sideOf(popup: Box, trigger: Box): { where: Where, gap: number } | null {
  if (popup.bottom <= trigger.top) return { where: 'above', gap: trigger.top - popup.bottom }
  if (popup.top >= trigger.bottom) return { where: 'below', gap: popup.top - trigger.bottom }
  if (popup.right <= trigger.left) return { where: 'left', gap: trigger.left - popup.right }
  if (popup.left >= trigger.right) return { where: 'right', gap: popup.left - trigger.right }
  return null
}

/** How far the popup scrolls, and how far it still can. */
const scrollOf = (popup: Locator) => popup.evaluate((element) => ({
  top: Math.round(element.scrollTop),
  left: element.scrollHeight - element.clientHeight - Math.round(element.scrollTop),
  far: element.scrollHeight - element.clientHeight,
  sideways: element.scrollWidth - element.clientWidth,
}))

test('the table names every popover demo', () => {
  expect(Object.keys(POPOVERS).sort()).toEqual(DEMOS.filter((demo) => demo.startsWith('popover--')).sort())
  expect(Object.keys(POPOVERS)).toHaveLength(8)
})

/** Where a popup must land, written out: on its own side while there is room, on the opposite one at that edge. */
const SIDES: ReadonlyArray<{ demo: string, direction: Direction, edge: Edge, name: string, where: Where }> = [
  { demo: 'popover--basic', direction: 'ltr', edge: 'top', name: 'Share', where: 'below' },
  { demo: 'popover--basic', direction: 'ltr', edge: 'start', name: 'Share', where: 'below' },
  { demo: 'popover--basic', direction: 'ltr', edge: 'end', name: 'Share', where: 'below' },
  { demo: 'popover--basic', direction: 'ltr', edge: 'bottom', name: 'Share', where: 'above' },
  { demo: 'popover--basic', direction: 'rtl', edge: 'bottom', name: 'Share', where: 'above' },
  { demo: 'popover--hover', direction: 'ltr', edge: 'bottom', name: 'Billing details', where: 'above' },
  { demo: 'popover--modal', direction: 'rtl', edge: 'bottom', name: 'Delete draft', where: 'above' },
  { demo: 'popover--with-close', direction: 'ltr', edge: 'bottom', name: 'Notifications', where: 'above' },
  { demo: 'popover--with-form', direction: 'rtl', edge: 'bottom', name: 'Rename', where: 'above' },
  // Sixty lines fit neither above nor below, so Base UI moves the popup beside its trigger: the end side while it has room.
  { demo: 'popover--long-content', direction: 'ltr', edge: 'top', name: 'Change log', where: 'right' },
  { demo: 'popover--long-content', direction: 'ltr', edge: 'end', name: 'Change log', where: 'left' },
  { demo: 'popover--long-content', direction: 'rtl', edge: 'top', name: 'Change log', where: 'left' },
  { demo: 'popover--long-content', direction: 'rtl', edge: 'end', name: 'Change log', where: 'right' },
  // Above and below flip at the edge that has no room for them.
  { demo: 'popover--placements', direction: 'ltr', edge: 'top', name: 'top', where: 'below' },
  { demo: 'popover--placements', direction: 'ltr', edge: 'top', name: 'bottom', where: 'below' },
  { demo: 'popover--placements', direction: 'ltr', edge: 'bottom', name: 'top', where: 'above' },
  { demo: 'popover--placements', direction: 'ltr', edge: 'bottom', name: 'bottom', where: 'above' },
  // start is the left-hand side in English, and flips to the right at the left edge.
  { demo: 'popover--placements', direction: 'ltr', edge: 'top', name: 'start', where: 'left' },
  { demo: 'popover--placements', direction: 'ltr', edge: 'top', name: 'end', where: 'right' },
  { demo: 'popover--placements', direction: 'ltr', edge: 'start', name: 'start', where: 'right' },
  { demo: 'popover--placements', direction: 'ltr', edge: 'start', name: 'end-bottom', where: 'right' },
  { demo: 'popover--placements', direction: 'ltr', edge: 'end', name: 'start-top', where: 'left' },
  { demo: 'popover--placements', direction: 'ltr', edge: 'end', name: 'end', where: 'left' },
  // In Arabic start is the right-hand side, so the same placements mirror.
  { demo: 'popover--placements', direction: 'rtl', edge: 'top', name: 'start', where: 'right' },
  { demo: 'popover--placements', direction: 'rtl', edge: 'top', name: 'end', where: 'left' },
  { demo: 'popover--placements', direction: 'rtl', edge: 'start', name: 'start', where: 'left' },
  { demo: 'popover--placements', direction: 'rtl', edge: 'start', name: 'end-bottom', where: 'left' },
  { demo: 'popover--placements', direction: 'rtl', edge: 'end', name: 'start-top', where: 'right' },
  { demo: 'popover--placements', direction: 'rtl', edge: 'end', name: 'end', where: 'right' },
  { demo: 'popover--rtl', direction: 'rtl', edge: 'top', name: 'مشاركة', where: 'right' },
  { demo: 'popover--rtl', direction: 'rtl', edge: 'top', name: 'التفاصيل', where: 'left' },
  { demo: 'popover--rtl', direction: 'rtl', edge: 'start', name: 'مشاركة', where: 'left' },
  { demo: 'popover--rtl', direction: 'rtl', edge: 'end', name: 'التفاصيل', where: 'right' },
  // The same demo as an island on an LTR page: its own provider still makes start the right-hand side.
  { demo: 'popover--rtl', direction: 'ltr', edge: 'top', name: 'مشاركة', where: 'right' },
  { demo: 'popover--rtl', direction: 'ltr', edge: 'top', name: 'التفاصيل', where: 'left' },
  { demo: 'popover--rtl', direction: 'ltr', edge: 'bottom', name: 'مشاركة', where: 'right' },
  { demo: 'popover--rtl', direction: 'ltr', edge: 'start', name: 'التفاصيل', where: 'right' },
  { demo: 'popover--rtl', direction: 'ltr', edge: 'end', name: 'مشاركة', where: 'left' },
]

test('every written side names a trigger that exists', () => {
  // A row for a trigger the loop below never opens would be an expectation nobody checks.
  for (const row of SIDES) expect(POPOVERS[row.demo] ?? [], `${row.demo} has no "${row.name}"`).toContain(row.name)
  expect(SIDES).toHaveLength(38)
})

test.describe('with the trigger flush against an edge', () => {
  // Twelve popovers on one page, each opened, measured and closed.
  test.describe.configure({ timeout: 90_000 })

  for (const direction of DIRECTIONS) {
    for (const edge of EDGES) {
      for (const [demo, names] of Object.entries(POPOVERS)) {
        test(`${demo} ${direction}, pinned ${edge}: the popup is inside the viewport, 6 px off its trigger, on the side it should be`, async ({ page }) => {
          await openLive(page, demo, { direction, edge })
          for (const name of names) {
            const trigger = triggerOf(page, name)
            const popup = await openOverlay(page, trigger)
            // The shared collision padding: 8 px clear of every edge, not merely inside.
            await expectInsideViewport(popup, `the popover of "${name}"`, 8)
            await expectNoSidewaysScroll(page)

            const side = sideOf(await boxOf(popup), await boxOf(trigger))
            if (!side) throw new Error(`the popover of "${name}" lies over its trigger`)
            // The shared side offset. A trigger has a fractional width and Base UI places on whole pixels.
            expect(Math.abs(side.gap - 6), `"${name}" is ${String(side.gap)} px from its trigger, not 6`).toBeLessThanOrEqual(1)
            const written = SIDES.find((row) => row.demo === demo && row.direction === direction && row.edge === edge && row.name === name)
            if (written) expect(side.where, `"${name}" opened on the wrong side`).toBe(written.where)

            await page.keyboard.press('Escape')
            await expectClosed(page)
          }
        })
      }
    }
  }
})

test.describe('the alignment half of a placement', () => {
  const edgesOf = async (page: Page, name: string) => {
    const trigger = triggerOf(page, name)
    const popup = await openOverlay(page, trigger)
    const found = { popup: await boxOf(popup), trigger: await boxOf(trigger) }
    await page.keyboard.press('Escape')
    await expectClosed(page)
    return found
  }

  test('ltr: bottom-start lines its left edge up with the trigger, bottom-end its right edge, start-top its top edge', async ({ page }) => {
    await openLive(page, 'popover--placements', { edge: 'top' })
    const start = await edgesOf(page, 'bottom-start')
    expect(Math.abs(start.popup.left - start.trigger.left)).toBeLessThanOrEqual(1)
    const end = await edgesOf(page, 'bottom-end')
    expect(Math.abs(end.popup.right - end.trigger.right)).toBeLessThanOrEqual(1)
    const top = await edgesOf(page, 'start-top')
    expect(Math.abs(top.popup.top - top.trigger.top)).toBeLessThanOrEqual(1)
    // And the plain one is centred on its trigger.
    const centre = await edgesOf(page, 'bottom')
    expect(Math.abs((centre.popup.left + centre.popup.right) - (centre.trigger.left + centre.trigger.right))).toBeLessThanOrEqual(2)
  })

  test('rtl: the two mirror, so bottom-start lines up the right edges and bottom-end the left ones', async ({ page }) => {
    await openLive(page, 'popover--placements', { direction: 'rtl', edge: 'top' })
    const start = await edgesOf(page, 'bottom-start')
    expect(Math.abs(start.popup.right - start.trigger.right)).toBeLessThanOrEqual(1)
    const end = await edgesOf(page, 'bottom-end')
    expect(Math.abs(end.popup.left - end.trigger.left)).toBeLessThanOrEqual(1)
  })
})

test.describe('every demo on every screen', () => {
  test.describe.configure({ timeout: 90_000 })

  for (const screen of SCREENS) {
    for (const direction of DIRECTIONS) {
      for (const [demo, names] of Object.entries(POPOVERS)) {
        test(`${demo} ${String(screen.width)} x ${String(screen.height)} ${direction}: each popup is whole, beside its trigger and not over it, and the page does not scroll sideways`, async ({ page }) => {
          await page.setViewportSize(screen)
          await openLive(page, demo, { direction })
          for (const name of names) {
            const trigger = triggerOf(page, name)
            await trigger.scrollIntoViewIfNeeded()
            const popup = await openOverlay(page, trigger)
            await expectInsideViewport(popup, `the popover of "${name}"`, 8)
            await expectNoSidewaysScroll(page)
            await expectNothingSideways(popup, `the popover of "${name}"`)
            expect(sideOf(await boxOf(popup), await boxOf(trigger)), `the popover of "${name}" lies over its trigger`).not.toBeNull()
            await page.keyboard.press('Escape')
            await expectClosed(page)
          }
        })
      }
    }
  }
})

// Tab scrolls a control only just into view, flush with the edge of the box that scrolls it, and the ring
// is drawn 4 px outside the control: SCROLL_AREA keeps that much clear with scroll-padding, on the popup.
test.describe('twenty fields in the popup', () => {
  /** Adds twenty copies of the demo's field after it, named f0 to f19, and says how far the popup scrolls now. */
  const addFields = (popup: Locator) => popup.evaluate((element) => {
    const field = element.querySelector('input')
    if (!field?.parentElement) throw new Error('the popup holds no field')
    for (let index = 0; index < 20; index++) {
      const copy = field.cloneNode(true) as HTMLInputElement
      copy.id = `f${String(index)}`
      copy.name = copy.id
      copy.removeAttribute('autofocus')
      field.parentElement.append(copy)
    }
    return element.scrollHeight - element.clientHeight
  })

  /** The room between the focused field and the two block edges of the popup, inside its line. */
  const roomOf = (popup: Locator) => popup.evaluate((element) => {
    const top = element.getBoundingClientRect().top + element.clientTop
    const field = (document.activeElement ?? element).getBoundingClientRect()
    return { above: field.top - top, below: top + element.clientHeight - field.bottom }
  })

  for (const direction of DIRECTIONS) {
    test(`320 x 480 ${direction}: every field Tab brings into view keeps the 4 px its ring reaches, forward and back`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 480 })
      const popup = await open(page, 'popover--with-form', { direction, by: 'keyboard', edge: 'top' })
      expect(await addFields(popup), 'px the popup scrolls').toBeGreaterThan(500)
      await expectInsideViewport(popup, 'the popup', 8)

      const cut: string[] = []
      const visit = async (key: 'Tab' | 'Shift+Tab', index: number) => {
        await page.keyboard.press(key)
        await expect(popup.locator(`#f${String(index)}`)).toBeFocused()
        const { above, below } = await roomOf(popup)
        if (above < 4 || below < 4) cut.push(`${key} to f${String(index)}: ${String(above)} px above, ${String(below)} px below`)
      }
      for (let index = 0; index < 20; index++) await visit('Tab', index)
      // The ring those 4 px are for: 2 px wide, 2 px away from the field.
      await expect(popup.locator('#f19')).toHaveCSS('outline-style', 'solid')
      await expect(popup.locator('#f19')).toHaveCSS('outline-width', '2px')
      await expect(popup.locator('#f19')).toHaveCSS('outline-offset', '2px')
      for (let index = 18; index >= 0; index--) await visit('Shift+Tab', index)
      expect(cut).toEqual([])
    })
  }
})

test.describe('sixty lines', () => {
  for (const screen of SCREENS) {
    for (const direction of DIRECTIONS) {
      test(`${String(screen.width)} x ${String(screen.height)} ${direction}: the popup shrinks to the room it has and scrolls inside itself`, async ({ page }) => {
        await page.setViewportSize(screen)
        const popup = await open(page, 'popover--long-content', { direction, edge: 'bottom' })
        await expectInsideViewport(popup, 'the popup', 8)
        await expectNoSidewaysScroll(page)
        const scroll = await scrollOf(popup)
        expect(scroll.far, 'px the popup scrolls').toBeGreaterThan(700)
        expect(scroll.sideways, 'px the popup scrolls sideways').toBe(0)
        const frame = await boxOf(popup)
        expect(frame.width).toBe(280)

        // A wheel, not a script: it reaches the last line, which then lies inside the popup and not under the screen.
        await wheelAt(page, frame.left + 100, frame.top + 60, 5000)
        expect((await scrollOf(popup)).left, 'px of popup still below').toBe(0)
        expect((await boxOf(popup.locator('li').last())).bottom).toBeLessThanOrEqual(frame.bottom - 16)
      })
    }
  }

  test('320 x 480, near the bottom: it flips above its trigger, 426 px tall, and a wheel reaches the last line and no further', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 480 })
    const popup = await open(page, 'popover--long-content', { edge: 'bottom', tall: true })
    const [frame, trigger] = [await boxOf(popup), await boxOf(triggerOf(page, 'Change log'))]
    expect(sideOf(frame, trigger)).toEqual({ where: 'above', gap: 6 })
    // From 8 px under the top of the screen to 6 px above a trigger that sits at 440.
    expect({ top: frame.top, bottom: frame.bottom }).toEqual({ top: 8, bottom: 434 })

    for (let turn = 0; turn < 4; turn++) await wheelAt(page, frame.left + 100, frame.top + 100, 500)
    expect((await scrollOf(popup)).left, 'px of popup still below').toBe(0)
    const last = await boxOf(popup.locator('li').last())
    expect(last.bottom, 'the last line ends below the popup').toBeLessThanOrEqual(frame.bottom - 16)
    expect(last.top, 'the last line starts above the popup').toBeGreaterThanOrEqual(frame.top)

    // R-10.5-1: at its end the wheel stays in the popup, and the page behind does not take it.
    await wheelAt(page, frame.left + 100, frame.top + 100, 500)
    expect(await scrollY(page)).toBe(0)
    // The same wheel does move the page beside the popup, or the line above proved nothing.
    await wheelAt(page, 4, 460, 100)
    expect(await scrollY(page)).toBe(100)
  })

  test('opened from the keyboard it holds the focus itself, is a tab stop while it scrolls, and End reaches the last line', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 480 })
    const popup = await open(page, 'popover--long-content', { edge: 'bottom', by: 'keyboard' })
    // No control inside: Base UI focuses the popup, and the ring is drawn inside its box.
    await expect(popup).toBeFocused()
    await expect(popup).toHaveAttribute('tabindex', '0')
    await expect(popup).toHaveCSS('outline-style', 'solid')
    await expect(popup).toHaveCSS('outline-offset', '-2px')

    await page.keyboard.press('End')
    await expect.poll(async () => (await scrollOf(popup)).left, { message: 'px of popup still below' }).toBe(0)
    const [frame, last] = [await boxOf(popup), await boxOf(popup.locator('li').last())]
    expect(last.bottom).toBeLessThanOrEqual(frame.bottom - 16)
    await page.keyboard.press('Home')
    await expect.poll(async () => (await scrollOf(popup)).top).toBe(0)
  })

  test('a popup that holds all it has keeps the tabindex -1 of Base UI, so it is no stop of its own', async ({ page }) => {
    const popup = await open(page, 'popover--basic', { by: 'keyboard' })
    expect((await scrollOf(popup)).far).toBe(0)
    await expect(popup).toHaveAttribute('tabindex', '-1')
  })

  test.describe('under a finger', () => {
    test.use({ hasTouch: true, isMobile: true, viewport: { width: 320, height: 480 } })

    test('a drag inside the popup scrolls it to its last line and never the page', async ({ page }) => {
      const popup = await open(page, 'popover--long-content', { edge: 'bottom', tall: true, by: 'tap' })
      const frame = await boxOf(popup)
      await expectInsideViewport(popup, 'the popup', 8)
      for (let drag = 0; drag < 8 && (await scrollOf(popup)).left > 0; drag++) {
        await touchDrag(page, frame.left + 100, frame.bottom - 40, frame.top + 40)
      }
      expect((await scrollOf(popup)).left, 'px of popup still below').toBe(0)
      await touchDrag(page, frame.left + 100, frame.bottom - 40, frame.top + 40)
      expect(await scrollY(page), 'after a drag past the end of the popup').toBe(0)
      await expect(popup).toHaveAttribute('data-open', '')
    })
  })
})

// A flex item gives up its height before its container scrolls: without shrink-0 the 32 px action was 24 px here.
test('320 x 160: where the popup has to scroll, its action keeps its 32 px and is not squeezed first', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 160 })
  const popup = await open(page, 'popover--basic', { edge: 'top' })
  await expectInsideViewport(popup, 'the popup', 8)
  expect((await boxOf(popup.locator('button'))).height).toBe(32)
  // The whole content, 148 px, in a box that shows 104 of it.
  expect(await popup.evaluate((el) => `${String(el.scrollHeight)} in ${String(el.clientHeight)}`)).toBe('148 in 104')
})

test.describe('focus', () => {
  test('the trigger says what it opens and whether it is open, and names its popup while it is', async ({ page }) => {
    await openLive(page, 'popover--basic')
    const trigger = triggerOf(page, 'Share')
    await expect(trigger).toHaveAttribute('aria-haspopup', 'dialog')
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(await trigger.getAttribute('aria-controls')).toBeNull()

    const popup = await openOverlay(page, trigger, { by: 'keyboard' })
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    const id = await popup.getAttribute('id')
    expect(id).not.toBeNull()
    await expect(trigger).toHaveAttribute('aria-controls', id ?? '')
    // The title names the popup and the description describes it, so both are read when focus lands inside.
    await expect(page.getByRole('dialog', { name: 'Share this page' })).toHaveCount(1)
    await expect(page.getByRole('dialog', { name: 'Share this page' })).toHaveAccessibleDescription('Anyone with the link can read it. Only your team can edit.')
  })

  test('opened from the keyboard, focus moves to the first control, and Escape hands it back to the trigger', async ({ page }) => {
    const popup = await open(page, 'popover--basic', { by: 'keyboard' })
    await expect(popup.locator('button')).toBeFocused()
    await expect(popup.locator('button')).toHaveCSS('outline-style', 'solid')

    await page.keyboard.press('Escape')
    await expectClosed(page)
    await expect(triggerOf(page, 'Share')).toBeFocused()
    expect(await liveErrors(page)).toEqual([])
  })

  // The disclosure pattern of the Authoring Practices: Enter and Space on the button, in both directions.
  for (const direction of DIRECTIONS) {
    test(`${direction}: Space opens it as Enter does, and Escape closes it`, async ({ page }) => {
      await openLive(page, 'popover--basic', { direction })
      const trigger = triggerOf(page, 'Share')
      await trigger.focus()
      await page.keyboard.press('Space')
      const popup = page.locator(`[role="dialog"]${OPENED}`)
      await expect(popup).toBeVisible()
      await atRest(popup)
      await expect(popup.locator('button')).toBeFocused()
      await page.keyboard.press('Escape')
      await expectClosed(page)
      await expect(trigger).toBeFocused()
    })
  }

  test('a popover of text and one link starts on the link: the title and the description are its name, so they are read first', async ({ page }) => {
    const popup = await open(page, 'popover--hover', { by: 'keyboard' })
    await expect(popup.locator('a')).toBeFocused()
    await expect(page.getByRole('dialog', { name: 'How billing works' })).toHaveAccessibleDescription('Only the seats in use are billed.')
  })

  test('a popover of text alone takes the focus itself, with its ring drawn inside its box', async ({ page }) => {
    await openLive(page, 'popover--placements', { edge: 'top' })
    const popup = await openOverlay(page, triggerOf(page, 'bottom'), { by: 'keyboard' })
    await expect(popup).toBeFocused()
    await expect(popup).toHaveCSS('outline-style', 'solid')
    await expect(popup).toHaveCSS('outline-width', '2px')
    await expect(popup).toHaveCSS('outline-offset', '-2px')
  })

  test('a form popover starts in its field', async ({ page }) => {
    const popup = await open(page, 'popover--with-form', { by: 'keyboard' })
    await expect(popup.locator('input[name="name"]')).toBeFocused()
    // The popup keeps the dialog role a form may not carry: the form is inside it.
    expect(await popup.evaluate((el) => `${el.tagName} ${el.getAttribute('role') ?? ''}`)).toBe('DIV dialog')
  })

  // POPOVER-1. A form with no action and no onSubmit is sent by the browser: the page reloads with ?name= on it.
  for (const how of ['a press on Save', 'Enter in the field'] as const) {
    test(`the form popover saves on ${how}: it closes, the focus is back on its trigger, and the page does not reload`, async ({ page }) => {
      const popup = await open(page, 'popover--with-form', { by: 'keyboard' })
      const address = page.url()
      let loads = 0
      page.on('framenavigated', (frame) => { if (frame === page.mainFrame()) loads++ })
      await popup.locator('input[name="name"]').fill('New name')
      if (how === 'Enter in the field') await page.keyboard.press('Enter')
      else await popup.getByRole('button', { name: 'Save' }).click()
      await expectClosed(page)
      await expect(triggerOf(page, 'Rename')).toBeFocused()
      expect({ address: page.url(), loads }).toEqual({ address, loads: 0 })
    })
  }

  test('the form popover stays open on Save with the field empty, since the field is required', async ({ page }) => {
    const popup = await open(page, 'popover--with-form', { by: 'keyboard' })
    await popup.locator('input[name="name"]').fill('')
    await popup.getByRole('button', { name: 'Save' }).click()
    await expect(popup.locator('input[name="name"]:invalid')).toBeFocused()
    await expect(openPopups(page)).toHaveCount(1)
  })

  // The order of Tab is the order of the document, which does not turn with the direction.
  for (const direction of DIRECTIONS) {
    test(`${direction}: it is not modal: Tab past the last control closes it and goes on to the next control of the page`, async ({ page }) => {
      await openLive(page, 'popover--placements', { direction, edge: 'top' })
      await openOverlay(page, triggerOf(page, 'bottom-start'), { by: 'keyboard' })
      await page.keyboard.press('Tab')
      await expectClosed(page)
      await expect(triggerOf(page, 'bottom')).toBeFocused()
    })

    test(`${direction}: Shift+Tab goes back to the trigger and leaves it open, and once more closes it and moves on`, async ({ page }) => {
      await openLive(page, 'popover--placements', { direction, edge: 'top' })
      await openOverlay(page, triggerOf(page, 'bottom'), { by: 'keyboard' })
      await page.keyboard.press('Shift+Tab')
      await expect(triggerOf(page, 'bottom')).toBeFocused()
      await expect(openPopups(page)).toHaveCount(1)

      await page.keyboard.press('Shift+Tab')
      await expectClosed(page)
      await expect(triggerOf(page, 'bottom-start')).toBeFocused()
    })
  }

  test('a press outside closes it, and focus returns to the trigger', async ({ page }) => {
    await open(page, 'popover--basic')
    await page.mouse.click(700, 600)
    await expectClosed(page)
    await expect(triggerOf(page, 'Share')).toBeFocused()
  })

  test('the x closes it and focus returns to the trigger', async ({ page }) => {
    const popup = await open(page, 'popover--with-close', { by: 'keyboard' })
    await expect(xOf(popup)).toBeFocused()
    await page.keyboard.press('Enter')
    await expectClosed(page)
    await expect(triggerOf(page, 'Notifications')).toBeFocused()
  })

  // The popup takes the focus when it holds no control. Its ring is 6 px from the trigger and 8 from the screen edge.
  for (const mode of MODES) {
    test(`${mode}: the ring of the popup is drawn inside it, on its own surface, and not on the page`, async ({ page }) => {
      await openLive(page, 'popover--placements', { mode, edge: 'top' })
      const popup = await openOverlay(page, triggerOf(page, 'bottom'), { by: 'keyboard' })
      await expect(popup).toBeFocused()

      // Its bottom edge, clear of the corners: the second row from the edge is ring against the surface, at 3:1 or more.
      const frame = await boxOf(popup)
      const [left, bottom] = [Math.floor(frame.left), Math.ceil(frame.bottom)]
      const surface = await pixelsOf(page, { x: left + 40, y: bottom - 9, width: 1, height: 1 })
      const band = await pixelsOf(page, { x: left + 24, y: bottom - 2, width: 232, height: 1 })
      expect(inkOn(band, surface[0] ?? [0, 0, 0]), 'pixels of ring at 3:1 on the surface, along the bottom edge').toBe(232)
      // And none of it outside the box.
      const ring = (band[0] ?? [0, 0, 0]).join(',')
      const outside = await pixelsOf(page, { x: left + 24, y: bottom + 1, width: 232, height: 3 })
      expect(outside.filter((pixel) => pixel.join(',') === ring), 'pixels of ring in the three rows under the popup').toEqual([])
    })
  }
})

test.describe('the page stays live', () => {
  test('a wheel over the page scrolls it, the popup follows its trigger, and hides once the trigger has left the screen', async ({ page }) => {
    const popup = await open(page, 'popover--basic', { tall: true })
    const trigger = triggerOf(page, 'Share')
    const before = { popup: await boxOf(popup), trigger: await boxOf(trigger) }
    expect((await pageLock(page)).overflow).toBe('visible')

    await wheelAt(page, 700, 500, 20)
    expect(await scrollY(page)).toBe(20)
    await expect.poll(async () => (await boxOf(popup)).top).toBe(before.popup.top - 20)
    expect((await boxOf(trigger)).top).toBe(before.trigger.top - 20)
    await expect(popup).toBeVisible()

    // 60 px further the trigger is above the screen: the positioner is marked and the popup no longer floats alone.
    await wheelAt(page, 700, 500, 60)
    expect((await boxOf(trigger)).bottom).toBeLessThan(0)
    await expect(popup.locator('xpath=..')).toHaveAttribute('data-anchor-hidden', '')
    await expect(popup).toHaveCSS('visibility', 'hidden')
    await expect(openPopups(page)).toHaveCount(1)

    // Back in view, it is shown again where it was.
    await wheelAt(page, 700, 500, -80)
    await expect(popup).toHaveCSS('visibility', 'visible')
    expect(await boxOf(popup)).toEqual(before.popup)
  })

  test('the page behind is read by a screen reader and none of it is hidden, and nothing dims it', async ({ page }) => {
    await open(page, 'popover--basic')
    const lock = await pageLock(page)
    // The first portal is the toast region TopClassProvider mounts on every page, which a modal leaves readable.
    expect(lock.reachable).toEqual(['h1', 'main', 'pre', 'portal', 'portal'])
    expect(lock.body).toBeNull()
    await expect(page.getByRole('button', { name: 'Share' })).toHaveCount(1)
    // The portal holds the positioner and Base UI's focus guards, and no layer over the page.
    expect(await page.evaluate(() => [...document.querySelectorAll('[data-base-ui-portal] > [role="presentation"]')].map((el) => getComputedStyle(el).position))).toEqual(['absolute'])
  })
})

test.describe('each value of modal', () => {
  const SCOPE = '#modal-values'
  const after = (page: Page) => triggerOf(page, 'After', SCOPE)

  /** Counts the presses a page button receives from now on, on the button itself. */
  const count = (button: Locator) => button.evaluate((element: HTMLElement) => {
    element.dataset['presses'] = '0'
    element.addEventListener('click', () => { element.dataset['presses'] = String(Number(element.dataset['presses']) + 1) })
  })

  /** Presses the middle of a box with the mouse, whatever is painted there. */
  const pressAt = async (page: Page, target: Locator) => {
    const box = await boxOf(target)
    await page.mouse.click(box.left + box.width / 2, box.top + box.height / 2)
  }

  /** Opens one popover of the fixture from the keyboard and presses Tab: the names focus rests on, press after press. */
  async function tabs(page: Page, name: string, presses = 3): Promise<string[]> {
    await fixture(page, 'popover-modal', SCOPE, { tall: true })
    await openOverlay(page, triggerOf(page, name, SCOPE), { by: 'keyboard' })
    const seen = [await focusedName(page)]
    for (let press = 0; press < presses; press++) {
      await page.keyboard.press('Tab')
      await expect.poll(() => focusedName(page)).not.toBe('(focus guard)')
      seen.push(await focusedName(page))
    }
    return seen
  }

  /** What the page behind an open popover of the fixture still does under a mouse. */
  async function behind(page: Page, name: string) {
    await fixture(page, 'popover-modal', SCOPE, { tall: true })
    await openOverlay(page, triggerOf(page, name, SCOPE))
    const lock = await pageLock(page)
    await wheelAt(page, 900, 600, 300)
    const scrolled = await scrollY(page)
    await page.evaluate(() => { window.scrollTo(0, 0) })
    // Base UI's own layer over the page: one under a modal popover, and it is not drawn.
    const layers = await page.locator('[data-base-ui-portal] > [data-base-ui-inert]').count()
    await count(after(page))
    await pressAt(page, after(page))
    await expectClosed(page)
    return { scrolls: scrolled === 300, read: lock.reachable.includes('main'), pressed: await after(page).getAttribute('data-presses'), layers }
  }

  test('false, the default: the page scrolls, takes a press and is read, and Tab past the last control closes the popover', async ({ page }) => {
    expect(await tabs(page, 'false')).toEqual(['Apply', 'trap-focus with a close', 'trap-focus with no close', 'true with a close'])
    await expectClosed(page)
    expect(await behind(page, 'false')).toEqual({ scrolls: true, read: true, pressed: '1', layers: 0 })
  })

  test('trap-focus with a PopoverClose inside: Tab stays in and the page is hidden from a screen reader, yet it scrolls and takes a press', async ({ page }) => {
    expect(await tabs(page, 'trap-focus with a close')).toEqual(['Apply', 'Done', 'Apply', 'Done'])
    await expect(openPopups(page)).toHaveCount(1)
    expect(await behind(page, 'trap-focus with a close')).toEqual({ scrolls: true, read: false, pressed: '1', layers: 0 })
  })

  test('trap-focus with no PopoverClose: nothing is held, and it behaves as false', async ({ page }) => {
    expect(await tabs(page, 'trap-focus with no close')).toEqual(['Apply', 'true with a close', 'true with no close', 'After'])
    await expectClosed(page)
    expect(await behind(page, 'trap-focus with no close')).toEqual({ scrolls: true, read: true, pressed: '1', layers: 0 })
  })

  test('true with a PopoverClose inside: Tab stays in, the page is hidden, does not scroll, and a press on it only closes the popover', async ({ page }) => {
    expect(await tabs(page, 'true with a close')).toEqual(['Apply', 'Done', 'Apply', 'Done'])
    await expect(openPopups(page)).toHaveCount(1)
    expect(await behind(page, 'true with a close')).toEqual({ scrolls: false, read: false, pressed: '0', layers: 1 })
    // That press landed on Base UI's own layer, which is not drawn: a modal popover has no scrim.
    await expect(triggerOf(page, 'true with a close', SCOPE)).toBeFocused()
  })

  test('true with no PopoverClose: the page is still blocked for the pointer, but Tab leaves and a screen reader reads on', async ({ page }) => {
    // After is the last control of the page, so one press is all there is to follow.
    expect(await tabs(page, 'true with no close', 1)).toEqual(['Apply', 'After'])
    await expectClosed(page)
    expect(await behind(page, 'true with no close')).toEqual({ scrolls: false, read: true, pressed: '0', layers: 1 })
  })

  test('the layer that blocks the page under a modal popover paints nothing: the page looks the same, less the popup', async ({ page }) => {
    const popup = await open(page, 'popover--modal')
    const layer = page.locator('[data-base-ui-portal] > [data-base-ui-inert]')
    await expect(layer).toHaveCount(1)
    await expect(layer).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
    await expect(layer).toHaveCSS('position', 'fixed')
    // The button beside the trigger is hidden from a screen reader, and the trigger itself is not.
    await expect(page.getByRole('button', { name: 'Behind the panel' })).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Delete draft' })).toHaveCount(1)
    // And the demo holds its focus, since it carries a close.
    expect(await focusedName(page)).toBe('Close')
    await page.keyboard.press('Shift+Tab')
    await expect.poll(() => focusedName(page)).toBe('Delete')
    await expect(popup).toHaveAttribute('data-open', '')
  })

  test.describe('opened by a finger', () => {
    test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } })

    // Base UI's own rule for touch: a modal popover narrower than the screen leaves the page to the finger.
    test('true blocks a tap on the page but does not lock its scroll, as a popover does on iOS', async ({ page }) => {
      await open(page, 'popover--modal', { by: 'tap', tall: true })
      await expect(page.locator('[data-base-ui-portal] > [data-base-ui-inert]')).toHaveCount(1)
      expect((await pageLock(page)).overflow).toBe('visible')

      // A tap on the page button closes the popover and never reaches the button.
      const behind = triggerOf(page, 'Behind the panel')
      await count(behind)
      await behind.tap({ force: true })
      await expectClosed(page)
      await expect(behind).toHaveAttribute('data-presses', '0')
    })
  })
})

test.describe('one Escape closes one layer', () => {
  const SCOPE = '#nested'
  const tooltip = (page: Page) => page.locator('[data-placement][data-open]:not([role])')
  /** The titles of every popover and dialog still open, outermost first. */
  const titles = (page: Page) => openPopups(page).locator('h2').allTextContents()
  const escape = async (page: Page, left: string[]) => {
    await page.keyboard.press('Escape')
    await expect.poll(() => titles(page)).toEqual(left)
  }

  // Base UI's tooltip is outside its tree of popups: opened by hover, one Escape would close it and the popover.
  for (const path of ['hover', 'focus'] as const) {
    test(`a tooltip inside the popover, opened by ${path}: the first Escape closes the tooltip, the second the popover`, async ({ page }) => {
      await fixture(page, 'popover-nested', SCOPE)
      const popup = await openOverlay(page, triggerOf(page, 'Tooltip inside', SCOPE), { by: 'keyboard' })
      const copy = popup.locator('button[aria-label="Copy link"]')
      if (path === 'hover') {
        await popup.locator('button').last().focus()
        await copy.hover()
      } else await copy.focus()
      await expect(tooltip(page)).toHaveText('Copy link')

      await page.keyboard.press('Escape')
      await expect(tooltip(page)).toHaveCount(0)
      expect(await titles(page)).toEqual(['Share this page'])
      await escape(page, [])
      await expect(triggerOf(page, 'Tooltip inside', SCOPE)).toBeFocused()
    })
  }

  test('a popover inside a dialog, focus inside the popover: the popover closes first and focus lands on its trigger, in the dialog', async ({ page }) => {
    await fixture(page, 'popover-nested', SCOPE)
    await openOverlay(page, triggerOf(page, 'Dialog', SCOPE), { by: 'keyboard' })
    await openOverlay(page, triggerOf(page, 'By a press', 'body'), { by: 'keyboard' })
    expect(await titles(page)).toEqual(['Project settings', 'Opened by a press'])
    expect(await focusedName(page)).toBe('Apply')

    await escape(page, ['Project settings'])
    await expect(triggerOf(page, 'By a press', 'body')).toBeFocused()
    await escape(page, [])
    await expect(triggerOf(page, 'Dialog', SCOPE)).toBeFocused()
  })

  // The popover's own trigger sits in the dialog and is itself marked open. A guard that looked at any dialog
  // found it there and cancelled the popover's own close: on 2026-10-10 three presses closed nothing.
  test('a popover inside a dialog, focus back on its trigger: Escape is not swallowed', async ({ page }) => {
    await fixture(page, 'popover-nested', SCOPE)
    await openOverlay(page, triggerOf(page, 'Dialog', SCOPE), { by: 'keyboard' })
    await openOverlay(page, triggerOf(page, 'By a press', 'body'), { by: 'keyboard' })
    await page.keyboard.press('Shift+Tab')
    await expect(triggerOf(page, 'By a press', 'body')).toBeFocused()

    await escape(page, ['Project settings'])
    await escape(page, [])
  })

  test('a popover inside a dialog, opened by hover, focus still in the dialog: the same', async ({ page }) => {
    await fixture(page, 'popover-nested', SCOPE)
    await openOverlay(page, triggerOf(page, 'Dialog', SCOPE), { by: 'keyboard' })
    await triggerOf(page, 'By hover', 'body').hover()
    await expect.poll(() => titles(page)).toEqual(['Project settings', 'Opened by hover'])
    expect(await focusedName(page)).toBe('Close this dialog')

    await escape(page, ['Project settings'])
    await escape(page, [])
  })

  for (const focus of ['in the inner popover', 'back on the inner trigger'] as const) {
    test(`a popover inside a popover, focus ${focus}: the inner one closes first`, async ({ page }) => {
      await fixture(page, 'popover-nested', SCOPE)
      await openOverlay(page, triggerOf(page, 'Outer', SCOPE), { by: 'keyboard' })
      await openOverlay(page, triggerOf(page, 'Inner', 'body'), { by: 'keyboard' })
      if (focus === 'back on the inner trigger') {
        await page.keyboard.press('Shift+Tab')
        await expect(triggerOf(page, 'Inner', 'body')).toBeFocused()
      }
      await escape(page, ['Outer popover'])
      await expect(triggerOf(page, 'Inner', 'body')).toBeFocused()
      await escape(page, [])
      await expect(triggerOf(page, 'Outer', SCOPE)).toBeFocused()
    })
  }
})

test.describe('opened by hover', () => {
  test('the pointer opens it without moving the focus, keeps it open on the way to the link, and closes it on leaving', async ({ page }) => {
    await openLive(page, 'popover--hover')
    const trigger = triggerOf(page, 'Billing details')
    await page.keyboard.press('Tab')
    await expect(trigger).toBeFocused()

    await trigger.hover()
    const popup = page.locator(`[role="dialog"]${OPENED}`)
    await expect(popup).toBeVisible()
    await atRest(popup)
    await expect(trigger).toBeFocused()
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')

    // Across the 6 px between the two, and longer than the 200 ms it waits before closing.
    await popup.locator('a').hover()
    await page.waitForTimeout(500)
    await expect(popup).toHaveAttribute('data-open', '')

    await page.mouse.move(900, 600)
    await expectClosed(page)
    await expect(trigger).toBeFocused()
  })

  test('Escape closes a popover the pointer opened, with the focus anywhere', async ({ page }) => {
    await openLive(page, 'popover--hover')
    await triggerOf(page, 'Billing details').hover()
    await expect(page.locator(`[role="dialog"]${OPENED}`)).toBeVisible()
    await page.keyboard.press('Escape')
    await expectClosed(page)
  })

  // Base UI 1.8.0, pinned so a fix is noticed: its focus manager is off for a popover the pointer opened, so the
  // guard after the trigger passes the focus to a second guard and it rests there for one press of Tab.
  test('Tab from the trigger reaches the link in two presses: the first rests on a focus guard of Base UI', async ({ page }) => {
    await openLive(page, 'popover--hover')
    const trigger = triggerOf(page, 'Billing details')
    await page.keyboard.press('Tab')
    await trigger.hover()
    const popup = page.locator(`[role="dialog"]${OPENED}`)
    await expect(popup).toBeVisible()
    await atRest(popup)

    await page.keyboard.press('Tab')
    expect(await focusedName(page)).toBe('(focus guard)')
    await page.keyboard.press('Tab')
    await expect(popup.locator('a')).toBeFocused()
  })
})

test.describe('where a real page puts a trigger', () => {
  const SCOPE = '#layouts'
  const NAMES = ['In a sticky header', 'In a table cell', 'In a box that clips', 'In a grid track', 'In a flex-1 column', 'In a w-fit parent']

  /** Whether the middle of the popup is the popup: nothing of the page is painted over it. */
  const onTop = (popup: Locator) => popup.evaluate((element) => {
    const box = element.getBoundingClientRect()
    return element.contains(document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2))
  })

  for (const screen of [SCREENS[0], SCREENS[3]]) {
    for (const direction of DIRECTIONS) {
      test(`${String(screen.width)} x ${String(screen.height)} ${direction}: from each place the popup is whole, 6 px off its trigger and above the page`, async ({ page }) => {
        await page.setViewportSize(screen)
        await fixture(page, 'popover-layouts', SCOPE, { direction })
        for (const name of NAMES) {
          const trigger = triggerOf(page, name, SCOPE)
          await trigger.scrollIntoViewIfNeeded()
          const popup = await openOverlay(page, trigger)
          await expectInsideViewport(popup, `the popover "${name}"`, 8)
          await expectNoSidewaysScroll(page)
          expect((await boxOf(popup)).width, name).toBe(280)
          expect(sideOf(await boxOf(popup), await boxOf(trigger))?.gap, name).toBe(6)
          expect(await onTop(popup), `${name}: the page is painted over the popup`).toBe(true)
          await page.keyboard.press('Escape')
          await expectClosed(page)
        }
      })
    }
  }

  test('in a sticky header: the page scrolls 200 px under the bar, and the popup stays 6 px under its trigger', async ({ page }) => {
    await fixture(page, 'popover-layouts', SCOPE)
    const trigger = triggerOf(page, 'In a sticky header', SCOPE)
    const popup = await openOverlay(page, trigger)
    const before = await boxOf(trigger)
    // Over the bare page to the left of the bar's button, under every box of the fixture.
    await wheelAt(page, 600, 700, 200)
    expect(await scrollY(page)).toBe(200)
    const [bar, frame] = [await boxOf(trigger), await boxOf(popup)]
    // The bar has stuck to the top of the screen, so its trigger moved up by less than the page did.
    expect(bar.top).toBe(8)
    expect(before.top - bar.top).toBeLessThan(200)
    expect(frame.top).toBe(bar.bottom + 6)
    await expect(popup).toBeVisible()
  })

  test('in a box that scrolls and clips: the popup is outside the box, follows the trigger, and hides when the box has scrolled it away', async ({ page }) => {
    await fixture(page, 'popover-layouts', SCOPE)
    const trigger = triggerOf(page, 'In a box that clips', SCOPE)
    const clip = page.locator('#clip')
    const popup = await openOverlay(page, trigger)
    const [box, frame] = [await boxOf(clip), await boxOf(popup)]
    // The box is 160 px tall and clips; the popup ends below it, whole.
    expect(await clip.evaluate((el) => getComputedStyle(el).overflowY)).toBe('auto')
    expect(frame.bottom).toBeGreaterThan(box.bottom)
    expect(frame.height).toBe(106)

    await clip.evaluate((el) => { el.scrollTop = 40 })
    await expect.poll(async () => (await boxOf(popup)).top).toBe(frame.top - 40)
    expect((await boxOf(popup)).top).toBe((await boxOf(trigger)).bottom + 6)
    await expect(popup).toHaveCSS('visibility', 'visible')

    await clip.evaluate((el) => { el.scrollTop = 200 })
    await expect(popup).toHaveCSS('visibility', 'hidden')
    await expect(popup.locator('xpath=..')).toHaveAttribute('data-anchor-hidden', '')
  })
})

test.describe('hostile content', () => {
  const SCOPE = '#hostile'

  for (const screen of SCREENS) {
    for (const direction of DIRECTIONS) {
      const label = `${String(screen.width)} x ${String(screen.height)} ${direction}`

      test(`${label}: a title of one 300-character word wraps beside the x and never runs under it`, async ({ page }) => {
        await page.setViewportSize(screen)
        await fixture(page, 'popover-hostile', SCOPE, { direction })
        const popup = await openOverlay(page, triggerOf(page, 'Long word', SCOPE))
        await expectInsideViewport(popup, 'the popup', 8)
        await expectNoSidewaysScroll(page)
        expect((await scrollOf(popup)).sideways, 'px the popup scrolls sideways').toBe(0)

        const [title, x, frame] = [await inkOf(popup.locator('h2')), await boxOf(xOf(popup)), await boxOf(popup)]
        expect(title.height, 'px of title: many lines').toBeGreaterThan(200)
        // The row's gap is 8 px, and the x keeps its 24 at the end of the row, 17 px inside the popup.
        expect({ width: x.width, height: x.height }).toEqual({ width: 24, height: 24 })
        if (direction === 'ltr') {
          expect(title.right).toBeLessThanOrEqual(x.left - 8)
          expect(frame.right - x.right).toBe(17)
        } else {
          expect(title.left).toBeGreaterThanOrEqual(x.right + 8)
          expect(x.left - frame.left).toBe(17)
        }
        // Every action is inside the popup, edge to edge.
        for (const button of await popup.locator('button:not([aria-label])').all()) {
          const box = await boxOf(button)
          expect(box.left).toBeGreaterThanOrEqual(frame.left + 17)
          expect(box.right).toBeLessThanOrEqual(frame.right - 17)
        }
      })
    }
  }

  test('320 x 480: the popup is shorter than its text there, and Tab and a wheel each bring its last action whole into view', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 480 })
    await fixture(page, 'popover-hostile', SCOPE)
    const popup = await openOverlay(page, triggerOf(page, 'Long word', SCOPE), { by: 'keyboard' })
    expect((await scrollOf(popup)).far, 'px the popup scrolls').toBeGreaterThan(150)
    const [frame, last] = [await boxOf(popup), popup.locator('button').last()]

    // From the x, past two actions, to the third: the popup scrolls it into view with room for its ring.
    await expect(xOf(popup)).toBeFocused()
    for (let press = 0; press < 3; press++) await page.keyboard.press('Tab')
    await expect(last).toBeFocused()
    const focused = await boxOf(last)
    expect(focused.top).toBeGreaterThanOrEqual(frame.top + 4)
    expect(focused.bottom).toBeLessThanOrEqual(frame.bottom - 4)

    await popup.evaluate((el) => { el.scrollTop = 0 })
    await wheelAt(page, frame.left + 100, frame.top + 100, 1000)
    expect((await scrollOf(popup)).left, 'px of popup still below').toBe(0)
    expect((await boxOf(last)).bottom).toBeLessThanOrEqual(frame.bottom - 16)
  })

  test('an element that cannot wrap makes the popup scroll sideways inside itself, and never the page', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 480 })
    await fixture(page, 'popover-hostile', SCOPE)
    const popup = await openOverlay(page, triggerOf(page, 'Elements', SCOPE))
    await expectInsideViewport(popup, 'the popup', 8)
    await expectNoSidewaysScroll(page)
    expect((await boxOf(popup)).width).toBe(280)
    // The pre keeps its one line, 300 px wider than the popup, and the popup is what scrolls to its end.
    expect((await scrollOf(popup)).sideways).toBe(300)
    // The code in the title is text, and breaks like text.
    const [title, frame] = [await inkOf(popup.locator('h2')), await boxOf(popup)]
    expect(title.right).toBeLessThanOrEqual(frame.right - 17)
    expect(title.height).toBeGreaterThan(40)
  })

  test('an empty title and description, and a popover with nothing in it, are still boxes that open and close', async ({ page }) => {
    await fixture(page, 'popover-hostile', SCOPE)
    const empty = await openOverlay(page, triggerOf(page, 'Empty', SCOPE))
    // Two empty lines and the gap between them: 12 px inside 16 px of padding and the line.
    expect(await boxOf(empty)).toMatchObject({ width: 280, height: 46 })
    await page.keyboard.press('Escape')
    await expectClosed(page)

    const nothing = await openOverlay(page, triggerOf(page, 'Nothing', SCOPE), { by: 'keyboard' })
    expect(await boxOf(nothing)).toMatchObject({ width: 280, height: 34 })
    await expect(nothing).toBeFocused()
    await page.keyboard.press('Escape')
    await expectClosed(page)
    await expect(triggerOf(page, 'Nothing', SCOPE)).toBeFocused()
    expect(await liveErrors(page)).toEqual([])
  })
})

test.describe('direction', () => {
  /** Where the x and the title lie between the edges of a popup. */
  async function layoutOf(popup: Locator) {
    const [frame, x, title] = [await boxOf(popup), await boxOf(xOf(popup)), await inkOf(popup.locator('h2'))]
    return {
      xFromLeft: x.left - frame.left, xFromRight: frame.right - x.right,
      titleFromLeft: Math.round(title.left - frame.left), titleFromRight: Math.round(frame.right - title.right),
    }
  }

  test('ltr: the x is at the right of its row and the title starts at the left', async ({ page }) => {
    expect(await layoutOf(await open(page, 'popover--with-close'))).toMatchObject({ xFromRight: 17, titleFromLeft: 17 })
  })

  test('rtl: the x is at the left of its row and the title starts at the right', async ({ page }) => {
    expect(await layoutOf(await open(page, 'popover--with-close', { direction: 'rtl' }))).toMatchObject({ xFromLeft: 17, titleFromRight: 17 })
  })

  // The demo mounts its own RTL provider, so on an LTR page its portal sits in a <body> of the other direction.
  test('an RTL island on an LTR page lays its popover out right to left, in Arabic, and opens start on the right', async ({ page }) => {
    await openLive(page, 'popover--rtl', { direction: 'ltr', edge: 'top' })
    const trigger = triggerOf(page, 'مشاركة')
    const popup = await openOverlay(page, trigger)
    expect(sideOf(await boxOf(popup), await boxOf(trigger))?.where).toBe('right')

    const directions = await popup.evaluate((element) => ({
      body: getComputedStyle(document.body).direction,
      positioner: getComputedStyle(element.parentElement ?? element).direction,
      popup: getComputedStyle(element).direction,
      title: getComputedStyle(element.querySelector('h2') ?? element).direction,
    }))
    expect(directions).toEqual({ body: 'ltr', positioner: 'rtl', popup: 'rtl', title: 'rtl' })
    expect(await layoutOf(popup)).toMatchObject({ xFromLeft: 17, titleFromRight: 17 })
    // Named by the island's own labels, not the page's.
    await expect(xOf(popup)).toHaveAttribute('aria-label', CLOSE.ar)

    // And read in the island's language: the positioner carries the locale of the provider, and no demo writes lang.
    const languages = await popup.evaluate((element) => ({
      page: document.documentElement.lang,
      positioner: element.parentElement?.getAttribute('lang') ?? null,
      popup: element.getAttribute('lang'),
      arabic: element.matches(':lang(ar)'),
      english: element.matches(':lang(en)'),
    }))
    expect(languages).toEqual({ page: 'en', positioner: 'ar', popup: null, arabic: true, english: false })

    // Floating UI aligns by the direction of the element it positions: bottom-start lines up the right edges.
    await page.keyboard.press('Escape')
    await expectClosed(page)
    const settings = triggerOf(page, 'الإعدادات')
    const aligned = await boxOf(await openOverlay(page, settings))
    expect(Math.abs(aligned.right - (await boxOf(settings)).right), 'bottom-start is not aligned to the right edge').toBeLessThanOrEqual(1)
  })

  /** What a popover must inherit from each page when no provider tells it, written out. */
  const INHERITED = {
    ltr: { direction: 'ltr', arabic: false, english: true, startEdge: 'left', layout: { xFromRight: 17, titleFromLeft: 17 } },
    rtl: { direction: 'rtl', arabic: true, english: false, startEdge: 'right', layout: { xFromLeft: 17, titleFromRight: 17 } },
  } as const

  // R-13-1 asks for the provider and the harness always mounts one, so these popovers come from a fixture module.
  for (const direction of DIRECTIONS) {
    test(`with no provider at all, on the ${direction} page: nothing is stamped on the positioner, and the popover is laid out as its page is`, async ({ page }) => {
      await fixture(page, 'popover-no-provider', '#no-provider', { direction })
      const popup = await openOverlay(page, triggerOf(page, 'bottom', '#no-provider'))
      const read = await popup.evaluate((element) => ({
        dir: element.parentElement?.getAttribute('dir') ?? null,
        lang: element.parentElement?.getAttribute('lang') ?? null,
        direction: getComputedStyle(element).direction,
        arabic: element.matches(':lang(ar)'),
        english: element.matches(':lang(en)'),
      }))
      const { layout, startEdge, ...inherited } = INHERITED[direction]
      expect(read).toEqual({ dir: null, lang: null, ...inherited })
      expect(await layoutOf(popup)).toMatchObject(layout)
      // With no provider the labels are the English defaults, on either page.
      await expect(xOf(popup)).toHaveAttribute('aria-label', CLOSE.en)
      await page.keyboard.press('Escape')
      await expectClosed(page)

      // Floating UI reads the same inherited direction, so start is the page's start edge of the trigger.
      const trigger = triggerOf(page, 'bottom-start', '#no-provider')
      const aligned = await boxOf(await openOverlay(page, trigger))
      expect(Math.abs(aligned[startEdge] - (await boxOf(trigger))[startEdge]), `bottom-start is not aligned to the ${startEdge} edge`).toBeLessThanOrEqual(1)
      expect(await liveErrors(page)).toEqual([])
    })
  }
})

for (const scheme of ['light', 'dark'] as const) {
  test.describe(`forced colours, ${scheme} palette`, () => {
    test.use({ forcedColors: 'active', colorScheme: scheme })

    // Forced colours erase the fill and the shadow, and a popover has no scrim: the line of the surface is its only edge.
    test('the popup keeps a line against the page on every side, and the x is drawn', async ({ page }) => {
      const popup = await open(page, 'popover--with-close', { edge: 'top' })
      expect(await page.evaluate(() => matchMedia('(forced-colors: active)').matches)).toBe(true)
      const canvas = FORCED_CANVAS[scheme]
      const frame = await boxOf(popup)
      const [left, top, right, bottom] = [Math.floor(frame.left), Math.floor(frame.top), Math.ceil(frame.right), Math.ceil(frame.bottom)]
      // Both sides of the edge are Canvas there: the page and the surface of the popup.
      const outside = await pixelsOf(page, { x: left - 4, y: top + 60, width: 1, height: 1 })
      const inside = await pixelsOf(page, { x: left + 8, y: top + 60, width: 1, height: 1 })
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
      expect(inkOn(await pixelsOf(page, glyph), canvas), 'pixels of the x at 3:1').toBeGreaterThanOrEqual(16)
    })

    test('the focused x has an outline, and the one that is not focused has none', async ({ page }) => {
      const popup = await open(page, 'popover--modal', { by: 'keyboard' })
      await expect(xOf(popup)).toBeFocused()
      await expect(xOf(popup)).toHaveCSS('outline-style', 'solid')
      await page.keyboard.press('Tab')
      await expect(xOf(popup)).toHaveCSS('outline-style', 'none')
    })
  })
}

test.describe('under a coarse pointer', () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } })

  for (const demo of Object.keys(POPOVERS)) {
    test(`${demo}: the trigger, and every button, link and field of the open popover, is at least 44 px`, async ({ page }) => {
      const popup = await open(page, demo, { by: 'tap' })
      const [first = ''] = POPOVERS[demo] ?? []
      const targets = [triggerOf(page, first), ...await popup.locator('button, a[href], input').all()]
      for (const target of targets) {
        const box = await boxOf(target)
        const name = (await target.getAttribute('aria-label')) ?? (await target.getAttribute('name')) ?? (await target.textContent()) ?? ''
        expect(box.width, `${name} width`).toBeGreaterThanOrEqual(44)
        expect(box.height, `${name} height`).toBeGreaterThanOrEqual(44)
      }
    })
  }

  test('a tap puts the focus on the popup itself, so no keyboard slides up over it', async ({ page }) => {
    const popup = await open(page, 'popover--basic', { by: 'tap' })
    await expect(popup).toBeFocused()
  })

  test('the field of the form popover is 16 px, so iOS does not zoom the page to it', async ({ page }) => {
    const popup = await open(page, 'popover--with-form', { by: 'tap' })
    await expect(popup.locator('input')).toHaveCSS('font-size', '16px')
  })

  test('320 x 480: the x of a long title is 44 px, and the title still wraps beside it', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 480 })
    await fixture(page, 'popover-hostile', '#hostile')
    const popup = await openOverlay(page, triggerOf(page, 'Long word', '#hostile'), { by: 'tap' })
    await expectInsideViewport(popup, 'the popup', 8)
    await expectNoSidewaysScroll(page)
    const [title, x] = [await inkOf(popup.locator('h2')), await boxOf(xOf(popup))]
    expect({ width: x.width, height: x.height }).toEqual({ width: 44, height: 44 })
    expect(title.right).toBeLessThanOrEqual(x.left - 8)
  })
})

test.describe('a larger text', () => {
  // Text-only zoom: the root at 32 px doubles every rem, and the 17.5rem popup would be 560 px on a 390 px phone.
  test('390 x 844 with the root at 32 px: the popup narrows to the screen and nothing in it is cut or scrolls sideways', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await openLive(page, 'popover--modal')
    await page.addStyleTag({ content: 'html { font-size: 32px }' })
    const popup = await openOverlay(page, triggerOf(page, 'Delete draft'))
    await expectInsideViewport(popup, 'the popup', 8)
    await expectNoSidewaysScroll(page)
    // The screen less its gutter and 8 px on each side.
    expect((await boxOf(popup)).width).toBe(359)
    expect((await scrollOf(popup)).sideways).toBe(0)
    await expect(popup.locator('p')).toHaveCSS('font-size', '28px')
    const cut = await popup.evaluate((el) => [...el.querySelectorAll('h2, p, span')].filter((text) => text.scrollWidth > text.clientWidth + 1).length)
    expect(cut, 'texts wider than their box').toBe(0)
  })

  // POPOVER-2. Three fixed tracks went to 0 px at 320 px, and each trigger lay over half of the next one.
  for (const screen of [SCREENS[0], SCREENS[1]]) {
    for (const direction of DIRECTIONS) {
      test(`${String(screen.width)} x ${String(screen.height)} ${direction} with the root at 32 px: the twelve placement triggers wrap, and each takes its own press`, async ({ page }) => {
        await page.setViewportSize(screen)
        await openLive(page, 'popover--placements', { direction })
        await page.addStyleTag({ content: 'html { font-size: 32px }' })
        const faults = await page.locator('#demo button').evaluateAll((buttons) => {
          const found: string[] = []
          const boxes = buttons.map((button) => button.getBoundingClientRect())
          boxes.forEach((one, i) => {
            boxes.forEach((other, j) => {
              const overlap = one.left < other.right && other.left < one.right && one.top < other.bottom && other.top < one.bottom
              if (j > i && overlap) found.push(`${buttons[i]?.textContent ?? ''} over ${buttons[j]?.textContent ?? ''}`)
            })
          })
          for (const button of buttons) {
            button.scrollIntoView({ block: 'center', inline: 'center' })
            const box = button.getBoundingClientRect()
            if (!button.contains(document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2))) found.push(`${button.textContent} covered`)
          }
          return [String(buttons.length), ...found]
        })
        expect(faults).toEqual(['12'])
        await expectNoSidewaysScroll(page)
      })
    }
  }

  // WCAG 1.4.12: the four spacings a reader may set, all at once.
  test('with the text spacing of WCAG 1.4.12 the popup grows with its text, and nothing is cut', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 480 })
    await openLive(page, 'popover--modal')
    const before = await boxOf(await openOverlay(page, triggerOf(page, 'Delete draft')))
    await page.addStyleTag({ content: '* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important } p { margin-bottom: 2em !important }' })
    const popup = openPopups(page)
    await expect.poll(async () => (await boxOf(popup)).height).toBeGreaterThan(before.height)
    await expectInsideViewport(popup, 'the popup', 8)
    await expectNoSidewaysScroll(page)
    expect((await scrollOf(popup)).sideways).toBe(0)
    const cut = await popup.evaluate((el) => [...el.querySelectorAll('h2, p, span')].filter((text) => text.scrollWidth > text.clientWidth + 1).length)
    expect(cut, 'texts wider than their box').toBe(0)
  })
})

test('the stylesheet already holds the classes of a popup nothing has rendered yet', async ({ page }) => {
  const popup = await open(page, 'popover--with-close', { edge: 'top' })
  const styles = await popup.evaluate((element) => {
    const own = getComputedStyle(element)
    const positioner = getComputedStyle(element.parentElement ?? element)
    const title = getComputedStyle(element.querySelector('h2') ?? element)
    const text = getComputedStyle(element.querySelector('p') ?? element)
    return {
      width: own.width, maxWidth: own.maxWidth, maxHeight: own.maxHeight, padding: own.paddingTop, gap: own.rowGap,
      radius: own.borderRadius, line: own.borderTopWidth, raised: own.boxShadow !== 'none', wrap: own.overflowWrap,
      scrolls: `${own.overflowY} ${own.overscrollBehaviorY}`, layer: positioner.zIndex,
      title: `${title.fontSize} ${title.fontWeight}`, text: text.fontSize, shrink: title.flexShrink,
    }
  })
  // w-70, the room Base UI measured on both axes, p-4, gap-3, rounded-box, the line, shadow-lg, wrap-anywhere, SCROLL_AREA, --tc-z-popup.
  expect(styles).toEqual({
    width: '280px', maxWidth: '1249px', maxHeight: '666px', padding: '16px', gap: '12px', radius: '12px', line: '1px',
    raised: true, wrap: 'anywhere', scrolls: 'auto contain', layer: '60', title: '14px 600', text: '14px', shrink: '1',
  })
})

test.describe('motion', () => {
  const durations = (popup: Locator) => popup.evaluate((element) => ({
    popup: getComputedStyle(element).transitionDuration, animated: getComputedStyle(element).transitionProperty,
  }))

  test('the popup takes 150 ms to come and go, and grows from the side that faces its trigger', async ({ page }) => {
    const popup = await open(page, 'popover--basic', { edge: 'top' })
    expect(await durations(popup)).toEqual({ popup: '0.15s', animated: 'opacity, scale' })
    // Under a trigger: the origin is on the top edge, 6 px above the popup.
    expect(await popup.evaluate((el) => getComputedStyle(el).transformOrigin.split(' ')[1])).toBe('-6px')
  })

  test.describe('reduced', () => {
    test.use({ reducedMotion: 'reduce' })

    test('with prefers-reduced-motion the popover still opens and closes, in no time at all', async ({ page }) => {
      const popup = await open(page, 'popover--basic', { by: 'keyboard' })
      expect(await durations(popup)).toEqual({ popup: '0s', animated: 'opacity, scale' })
      await expect(popup).toHaveCSS('opacity', '1')
      await expect(popup).toHaveCSS('scale', 'none')

      await page.keyboard.press('Escape')
      await expectClosed(page)
      await expect(triggerOf(page, 'Share')).toBeFocused()
      // And again: a popup that never left its ending style would not come back.
      await page.keyboard.press('Enter')
      await expect(openPopups(page)).toHaveCSS('opacity', '1')
    })
  })
})

/** axe on the demo and on the portal its popover opens in. Not on the shell of the harness page. */
async function axe(page: Page): Promise<{ violations: string[], passes: string[] }> {
  const results = await new AxeBuilder({ page }).include('#demo').include('[data-base-ui-portal]').analyze()
  return {
    violations: results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`),
    passes: results.passes.map((pass) => pass.id),
  }
}

test.describe('axe on the open popover', () => {
  for (const demo of Object.keys(POPOVERS)) {
    for (const mode of MODES) {
      for (const direction of DIRECTIONS) {
        test(`${demo} ${mode} ${direction}: no violation, in the popover or in the demo behind it`, async ({ page }) => {
          await open(page, demo, { mode, direction })
          const results = await axe(page)
          expect(results.violations).toEqual([])
          // Not an empty run: axe did read the popover.
          expect(results.passes).toContain('aria-dialog-name')
        })
      }
    }
  }
})

test.describe('axe on the open popover, on a 320 x 480 phone', () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 320, height: 480 } })

  for (const demo of Object.keys(POPOVERS)) {
    test(`${demo}: no violation`, async ({ page }) => {
      await open(page, demo, { by: 'tap' })
      expect((await axe(page)).violations).toEqual([])
    })
  }

  for (const mode of MODES) {
    for (const direction of DIRECTIONS) {
      test(`popover--long-content ${mode} ${direction}: it scrolls there, and the keyboard can reach it`, async ({ page }) => {
        const popup = await open(page, 'popover--long-content', { mode, direction, by: 'tap' })
        expect((await scrollOf(popup)).far, 'px the popup scrolls').toBeGreaterThan(1000)
        await expect(popup).toHaveAttribute('tabindex', '0')
        expect((await axe(page)).violations).toEqual([])
      })
    }
  }
})
