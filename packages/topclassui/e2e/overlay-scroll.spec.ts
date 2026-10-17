import { expect, test, type Locator, type Page } from '@playwright/test'

import { DIRECTIONS } from '../scripts/lib/harness.js'
import { liveErrors, openLive } from './live.js'
import { atRest, openOverlay, scrollPageTo, wheelAt } from './overlay.js'

// R-10.5-1 and R-10.5-3 across every overlay and bar at once, by what the browser computes: the spec of each
// component proves its own details. A scrolling overlay scrolls its Body between a header and a footer that
// keep their boxes; an anchored popup sits where POPUP_BOUNDS puts it, inside the room Base UI measured, and its list by
// the row cap; every scroll container in an overlay stops at its own edge; a sticky bar publishes its height.

/** Every element in an open portal that scrolls on the block axis, and how it ends a scroll. */
interface Scroller { name: string, overscroll: string, scrolls: boolean }

const scrollersIn = (page: Page) => page.evaluate((): Scroller[] =>
  [...document.querySelectorAll('[data-base-ui-portal], [data-base-ui-portal] *')]
    .filter((element) => ['auto', 'scroll'].includes(getComputedStyle(element).overflowY))
    .map((element) => ({
      name: `${element.tagName.toLowerCase()}[role=${element.getAttribute('role') ?? ''}]`,
      overscroll: getComputedStyle(element).overscrollBehaviorY,
      scrolls: element.scrollHeight > element.clientHeight + 1,
    })))

/** The used max-height of an element in px, or null when it has none. */
const maxHeightOf = (target: Locator) => target.evaluate((element) => {
  const value = getComputedStyle(element).maxHeight
  return value === 'none' ? null : Number.parseFloat(value)
})

const pageScrollY = (page: Page) => page.evaluate(() => Math.round(window.scrollY))

/** Scrolls an element to its end with the wheel, then once more, and returns where the page behind stands. */
async function wheelToEnd(page: Page, scroller: Locator): Promise<number> {
  const box = await scroller.boundingBox()
  if (!box) throw new Error('the scroll container has no box')
  const [x, y] = [box.x + box.width / 2, box.y + box.height / 2]
  for (let turn = 0; turn < 30; turn++) {
    const atEnd = await scroller.evaluate((element) => element.scrollTop + element.clientHeight >= element.scrollHeight - 1)
    if (atEnd) break
    await wheelAt(page, x, y, 400)
  }
  await wheelAt(page, x, y, 400)
  return pageScrollY(page)
}

test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

/** One of the bars or the body: the children of the popup that are laid out, less the x and the grabber. */
interface Part { overflow: string, overscroll: string, scrolls: boolean, scrollTop: number, heading: boolean, buttons: number, top: number, bottom: number }

/** The laid-out children of a popup, in order, and whether the popup itself scrolls. */
const partsOf = (popup: Locator) => popup.evaluate((element) => {
  const children = [...element.children].filter((child) => getComputedStyle(child).position !== 'absolute' && child.getAttribute('aria-hidden') !== 'true')
  return {
    popupScrolls: element.scrollHeight > element.clientHeight + 1,
    parts: children.map((child): Part => {
      const style = getComputedStyle(child)
      const { top, bottom } = child.getBoundingClientRect()
      return {
        overflow: style.overflowY, overscroll: style.overscrollBehaviorY, scrolls: child.scrollHeight > child.clientHeight + 1,
        scrollTop: Math.round(child.scrollTop), heading: child.querySelector('h2') !== null, buttons: child.querySelectorAll('button').length, top, bottom,
      }
    }),
  }
})

/** The three parts R-9.2-4 names, and the Body the one that scrolls. Throws the reason a popup breaks it. */
function expectThreeParts({ parts, popupScrolls }: Awaited<ReturnType<typeof partsOf>>): void {
  expect(parts.length, 'a header, a body and a footer, in that order').toBe(3)
  const [header, body, footer] = parts
  expect(header?.heading, 'the header holds the title').toBe(true)
  expect(body, 'the Body scrolls inside itself and stops at its edge').toMatchObject({ overflow: 'auto', overscroll: 'contain', scrolls: true })
  expect(footer?.buttons, 'the footer holds the actions').toBe(2)
  expect(popupScrolls, 'the popup itself does not scroll: the Body does').toBe(false)
}

// R-9.2-4 and R-10.5-1: the three parts, and the Body the one that scrolls.
const WITH_BODY = [
  { demo: 'dialog--long-body', trigger: 'Read the terms' },
  { demo: 'drawer--long-body', trigger: 'Activity' },
] as const

async function openWithBody(page: Page, demo: string, trigger: string, direction: 'ltr' | 'rtl' = 'ltr'): Promise<Locator> {
  await openLive(page, demo, { direction, tall: true })
  await scrollPageTo(page, 20)
  const popup = await openOverlay(page, page.getByRole('button', { name: trigger }))
  expect(await pageScrollY(page), 'opening held the page where it was').toBe(20)
  return popup
}

for (const { demo, trigger } of WITH_BODY) {
  for (const direction of DIRECTIONS) {
    test(`${demo}, ${direction}: the Body is the scroll container, and the header and the footer keep their boxes`, async ({ page }) => {
      const popup = await openWithBody(page, demo, trigger, direction)
      const before = await partsOf(popup)
      expectThreeParts(before)

      const index = await popup.locator(':scope > *').evaluateAll((all) => all.findIndex((child) => child.scrollHeight > child.clientHeight + 1))
      const behind = await wheelToEnd(page, popup.locator(':scope > *').nth(index))
      const after = await partsOf(popup)

      expect(after.parts[1]?.scrollTop, 'the Body moved').toBeGreaterThan(100)
      expect(after.parts[0]?.top, 'the header stayed where it was').toBe(before.parts[0]?.top)
      expect(after.parts[2]?.bottom, 'the footer stayed where it was').toBe(before.parts[2]?.bottom)
      expect(behind, 'the page behind never scrolled').toBe(20)
      const box = await popup.boundingBox()
      expect(box && box.y >= 0 && box.y + box.height <= (page.viewportSize()?.height ?? 0) + 0.5, 'the popup fits the screen').toBe(true)
      expect((await scrollersIn(page)).filter((s) => s.overscroll !== 'contain'), 'every scroll container in the overlay stops at its edge').toEqual([])
    })
  }
}

// R-10.5-1 for an anchored popup: POPUP_BOUNDS of src/shared/floating.ts gives the positioner its 6 px offset and
// its 8 px collision padding, the popup's own classes hold it to --available-height, and a list to --tc-list-rows.
/** From src/shared/floating.ts, written out: an expectation is never read from the code under test (R-17-1). */
const SIDE_OFFSET = 6
const COLLISION_PADDING = 8

/** short: the popup fits a desktop screen, so a 220 px one is what makes it scroll. */
interface Popup { demo: string, trigger: (page: Page) => Locator, list: string | null, rows: boolean, short?: boolean }

const POPUPS: Popup[] = [
  { demo: 'popover--long-content', trigger: (page) => page.getByRole('button', { name: 'Change log' }), list: null, rows: false },
  { demo: 'dropdown--sixty-items', trigger: (page) => page.getByRole('button', { name: 'Time zone' }), list: null, rows: true },
  { demo: 'select--sixty-items', trigger: (page) => page.getByRole('combobox', { name: 'Sixty options' }), list: '[role="listbox"]', rows: true },
  { demo: 'combobox--ten-thousand', trigger: (page) => page.getByRole('combobox', { name: 'Ten thousand options' }), list: '[role="listbox"]', rows: true },
  { demo: 'date-picker--basic', trigger: (page) => page.getByRole('button', { name: /Check-in/ }), list: null, rows: false, short: true },
]

/** The positioner Base UI measured the room on, and the popup it holds. */
const positionerOf = (page: Page) => page.locator('[data-base-ui-portal] [style*="--available-height"]').last()

for (const { demo, trigger, list, rows, short = false } of POPUPS) {
  for (const edge of ['top', 'bottom'] as const) {
    test(`${demo}, at the ${edge} edge: bounded by the room Base UI measured${rows ? ' and the row cap' : ''}, scrolling inside itself`, async ({ page }) => {
      if (short) await page.setViewportSize({ width: 1280, height: 220 })
      await openLive(page, demo, { edge, tall: true })
      await trigger(page).click()
      const positioner = positionerOf(page)
      const popup = positioner.locator(':scope > :not([data-base-ui-focus-guard])').first()
      await expect(popup).toBeVisible()
      await expect(popup).toHaveAttribute('data-open', '')
      await atRest(popup)

      const room = await positioner.evaluate((element) => ({
        height: Number.parseFloat(element.style.getPropertyValue('--available-height')),
        width: Number.parseFloat(element.style.getPropertyValue('--available-width')),
      }))
      expect(room.height, 'Base UI measured the room').toBeGreaterThan(0)
      const bounds = await popup.evaluate((element) => {
        const style = getComputedStyle(element)
        return { maxHeight: Number.parseFloat(style.maxHeight), maxWidth: Number.parseFloat(style.maxWidth) }
      })
      expect(bounds.maxHeight, 'the popup is never taller than the room').toBeLessThanOrEqual(room.height + 0.5)
      expect(bounds.maxWidth, 'the popup is never wider than the room').toBeLessThanOrEqual(room.width + 0.5)

      const [anchor, box] = [await trigger(page).boundingBox(), await popup.boundingBox()]
      if (!anchor || !box) throw new Error('the trigger or the popup has no box')
      const height = page.viewportSize()?.height ?? 0
      expect(box.y, 'the collision padding keeps the popup off the top of the screen').toBeGreaterThanOrEqual(COLLISION_PADDING - 0.5)
      expect(box.y + box.height, 'and off the bottom').toBeLessThanOrEqual(height - COLLISION_PADDING + 0.5)
      // Whichever side it took, flipped or shifted to a side of its own when neither above nor below had room.
      const gap = Math.max(box.y - (anchor.y + anchor.height), anchor.y - (box.y + box.height), box.x - (anchor.x + anchor.width), anchor.x - (box.x + box.width))
      expect(Math.round(gap), 'the side offset parts the popup from its trigger').toBe(SIDE_OFFSET)

      const scroller = list === null ? popup : popup.locator(list)
      if (rows) {
        const cap = await scroller.evaluate((element) => {
          const style = getComputedStyle(element)
          const probe = document.createElement('div')
          probe.style.cssText = 'position: absolute; height: calc(var(--tc-list-rows) * var(--tc-row-height))'
          element.append(probe)
          const height = probe.getBoundingClientRect().height
          probe.remove()
          return { rows: style.getPropertyValue('--tc-list-rows').trim(), height }
        })
        expect(cap.rows, 'the row cap is the --tc-list-rows knob').toBe('7')
        expect(await maxHeightOf(scroller), 'the list shows the smaller of the cap and the room').toBeCloseTo(Math.min(cap.height, room.height), 0)
      }

      const scrollers = await scrollersIn(page)
      expect(scrollers.filter((s) => s.overscroll !== 'contain'), 'every scroll container in the popup stops at its edge').toEqual([])
      expect(scrollers.some((s) => s.scrolls), 'the long content scrolls inside the popup').toBe(true)
      const behind = await wheelToEnd(page, scroller)
      expect(behind, 'a wheel at the end of the list never scrolls the page').toBe(0)
    })
  }
}

// Command is a dialog with a list, not an anchored popup: the row cap holds its list, and its input stays out of it.
test('command--thousand: the list is capped at --tc-list-rows, scrolls under a search input that stays, and stops at its edge', async ({ page }) => {
  await openLive(page, 'command--thousand', { tall: true })
  await scrollPageTo(page, 20)
  const popup = await openOverlay(page, page.getByRole('button', { name: 'A thousand commands' }))
  const list = popup.getByRole('listbox')
  const cap = await list.evaluate((element) => {
    const probe = document.createElement('div')
    probe.style.cssText = 'position: absolute; height: calc(var(--tc-list-rows) * var(--tc-row-height))'
    element.append(probe)
    const height = probe.getBoundingClientRect().height
    probe.remove()
    return height
  })
  expect(await maxHeightOf(list)).toBeCloseTo(cap, 0)
  const input = popup.getByRole('combobox')
  expect(await list.evaluate((element, field) => element.contains(field), await input.elementHandle()), 'the input is outside the list').toBe(false)
  const inputBox = await input.boundingBox()
  expect(await wheelToEnd(page, list), 'the page behind never scrolled').toBe(20)
  expect(await input.boundingBox(), 'the input stayed where it was').toEqual(inputBox)
  expect((await scrollersIn(page)).filter((s) => s.overscroll !== 'contain')).toEqual([])
})

test('toast--many: the viewport that holds the stack stops a scroll at its own edge', async ({ page }) => {
  await openLive(page, 'toast--many')
  await page.getByRole('button', { name: 'Twenty messages' }).click()
  await expect.poll(async () => (await scrollersIn(page)).length, 'the viewport is a scroll container').toBeGreaterThan(0)
  expect((await scrollersIn(page)).filter((s) => s.overscroll !== 'contain')).toEqual([])
})

// R-10.5-3: the bar writes its height, and the page reads both edges into scroll-padding-block.
const padding = (page: Page) => page.evaluate(() => {
  const html = getComputedStyle(document.documentElement)
  return { top: html.scrollPaddingTop, bottom: html.scrollPaddingBottom, variable: document.documentElement.style.getPropertyValue('--tc-sticky-top') }
})

for (const direction of DIRECTIONS) {
  test(`navbar--tall-page, ${direction}: the sticky bar sets --tc-sticky-top to its height, and the page reads it into scroll-padding`, async ({ page }) => {
    await openLive(page, 'navbar--tall-page', { direction })
    const bar = page.locator('header').first()
    await expect(bar).toHaveCSS('position', 'sticky')
    const height = Math.round((await bar.boundingBox())?.height ?? 0)
    expect(height).toBeGreaterThan(0)
    await expect.poll(() => padding(page)).toEqual({ top: `${String(height)}px`, bottom: '0px', variable: `${String(height)}px` })
  })
}

test('navbar--not-sticky: a bar in the flow publishes nothing, and the page keeps no padding', async ({ page }) => {
  await openLive(page, 'navbar--not-sticky')
  await expect(page.locator('header').first()).toHaveCSS('position', 'static')
  expect(await padding(page)).toEqual({ top: '0px', bottom: '0px', variable: '' })
})

test('a bar at the bottom: --tc-sticky-bottom reaches scroll-padding-block, so Tab never hides a control under it', async ({ page }) => {
  await openLive(page, 'navbar--tall-page')
  await page.evaluate(() => { document.documentElement.style.setProperty('--tc-sticky-bottom', '48px') })
  expect((await padding(page)).bottom).toBe('48px')
})

// The measures above, each shown a deliberately broken overlay or bar: a measure that passes these proves nothing.
test.describe('the measures reject a broken sample', () => {
  test('a Body that no longer scrolls, so the popup does: the three-part check fails', async ({ page }) => {
    const popup = await openWithBody(page, 'dialog--long-body', 'Read the terms')
    await popup.evaluate((element) => {
      const body = element.children[1]
      if (body instanceof HTMLElement) body.style.cssText = 'overflow-y: visible; flex: none'
    })
    const broken = await partsOf(popup)
    expect(broken.parts[1]?.overflow).toBe('visible')
    expect(broken.popupScrolls).toBe(true)
    expect(() => { expectThreeParts(broken) }).toThrow(/the Body scrolls inside itself/)
  })

  test('a scroll container that chains to the page: the overscroll measure finds it', async ({ page }) => {
    await openWithBody(page, 'drawer--long-body', 'Activity')
    await page.addStyleTag({ content: '[data-base-ui-portal] * { overscroll-behavior: auto !important }' })
    expect((await scrollersIn(page)).filter((s) => s.overscroll !== 'contain').length).toBeGreaterThan(0)
  })

  test('a popup freed of its max-height: it outgrows the room Base UI measured', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 400 })
    await openLive(page, 'popover--long-content', { edge: 'bottom', tall: true })
    await page.addStyleTag({ content: '[data-base-ui-portal] * { max-height: none !important }' })
    await page.getByRole('button', { name: 'Change log' }).click()
    const popup = positionerOf(page).locator(':scope > :not([data-base-ui-focus-guard])').first()
    await expect(popup).toBeVisible()
    await atRest(popup)
    expect(await maxHeightOf(popup)).toBeNull()
    const room = await positionerOf(page).evaluate((element) => Number.parseFloat(element.style.getPropertyValue('--available-height')))
    expect((await popup.boundingBox())?.height).toBeGreaterThan(room)
  })

  test('a page that drops the sticky variables from scroll-padding: the padding no longer matches the bar', async ({ page }) => {
    await openLive(page, 'navbar--tall-page')
    await page.addStyleTag({ content: 'html { scroll-padding-block: 0px !important }' })
    await expect.poll(async () => (await padding(page)).variable).not.toBe('')
    const read = await padding(page)
    expect(read.top).toBe('0px')
    expect(read.top).not.toBe(read.variable)
  })
})
