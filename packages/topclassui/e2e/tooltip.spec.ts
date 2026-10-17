import { expect, test, type Locator, type Page } from '@playwright/test'

import { DIRECTIONS, type Direction } from '../scripts/lib/harness.js'
import { EDGES, type Edge } from '../scripts/lib/live-harness.js'
import { expectInsideViewport, expectNoSidewaysScroll, openLive } from './live.js'
import { DEMOS } from './pages.js'

// What happy-dom cannot lay out and the static page cannot open: where the popup really lands
// when its trigger is flush against an edge, and which edge of it the arrow is drawn on.

/** Every trigger of every demo, by its accessible name, in tab order. Written out, so a renamed demo fails here. */
const TOOLTIPS: Record<string, readonly string[]> = {
  'tooltip--basic': ['Copy link'],
  'tooltip--delays': ['Copy', 'Delete this row', 'Settings'],
  'tooltip--long-label': [
    'Save this document and continue to the next step of the wizard',
    'quarterly-report-final-v2-reviewed-by-legal-and-finance.pdf',
  ],
  'tooltip--placements': [
    'top-start', 'top', 'top-end', 'start-top', 'start', 'start-bottom',
    'end-top', 'end', 'end-bottom', 'bottom-start', 'bottom', 'bottom-end',
  ],
  'tooltip--rtl': ['نسخ الرابط', 'حذف هذا الصف'],
  'tooltip--with-count': ['Delete 3 rows'],
}

type Where = 'above' | 'below' | 'left' | 'right'

/** Where a popup must land, written out: on its own side while there is room, on the opposite one at that edge. */
const SIDES: ReadonlyArray<{ demo: string, direction: Direction, edge: Edge, name: string, where: Where }> = [
  { demo: 'tooltip--basic', direction: 'ltr', edge: 'top', name: 'Copy link', where: 'below' },
  { demo: 'tooltip--basic', direction: 'ltr', edge: 'bottom', name: 'Copy link', where: 'above' },
  { demo: 'tooltip--basic', direction: 'rtl', edge: 'top', name: 'Copy link', where: 'below' },
  { demo: 'tooltip--delays', direction: 'ltr', edge: 'bottom', name: 'Delete this row', where: 'above' },
  { demo: 'tooltip--delays', direction: 'ltr', edge: 'top', name: 'Delete this row', where: 'below' },
  // The outer columns are 48 px from the edge they are pinned to, and a popup beside one needs more.
  { demo: 'tooltip--placements', direction: 'ltr', edge: 'start', name: 'start-top', where: 'right' },
  { demo: 'tooltip--placements', direction: 'ltr', edge: 'end', name: 'start-top', where: 'left' },
  { demo: 'tooltip--placements', direction: 'ltr', edge: 'end', name: 'end-bottom', where: 'left' },
  { demo: 'tooltip--placements', direction: 'ltr', edge: 'start', name: 'end-bottom', where: 'right' },
  // In Arabic start is the right-hand side, so the same two placements mirror.
  { demo: 'tooltip--placements', direction: 'rtl', edge: 'start', name: 'start-top', where: 'left' },
  { demo: 'tooltip--placements', direction: 'rtl', edge: 'end', name: 'start-top', where: 'right' },
  { demo: 'tooltip--placements', direction: 'rtl', edge: 'end', name: 'end-bottom', where: 'right' },
  { demo: 'tooltip--placements', direction: 'rtl', edge: 'start', name: 'end-bottom', where: 'left' },
  { demo: 'tooltip--rtl', direction: 'rtl', edge: 'start', name: 'نسخ الرابط', where: 'left' },
  { demo: 'tooltip--rtl', direction: 'rtl', edge: 'end', name: 'نسخ الرابط', where: 'right' },
  { demo: 'tooltip--rtl', direction: 'rtl', edge: 'end', name: 'حذف هذا الصف', where: 'right' },
  { demo: 'tooltip--rtl', direction: 'rtl', edge: 'start', name: 'حذف هذا الصف', where: 'left' },
  // The same demo as an island on an LTR page: its own provider still makes start the right-hand side.
  { demo: 'tooltip--rtl', direction: 'ltr', edge: 'start', name: 'نسخ الرابط', where: 'right' },
  { demo: 'tooltip--rtl', direction: 'ltr', edge: 'start', name: 'حذف هذا الصف', where: 'right' },
  { demo: 'tooltip--rtl', direction: 'ltr', edge: 'end', name: 'نسخ الرابط', where: 'left' },
  { demo: 'tooltip--rtl', direction: 'ltr', edge: 'end', name: 'حذف هذا الصف', where: 'left' },
]

interface Box { left: number, top: number, right: number, bottom: number }
interface Placed { popup: Box, arrow: Box, trigger: Box, where: Where }

/** R-10.5-2: the popup holds at most two lines of its own line height, and nothing inside it scrolls. */
async function expectTwoLinesAtMost(popup: Locator, name: string) {
  const box = await popup.evaluate((element) => {
    const style = getComputedStyle(element)
    const padding = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom)
    return { height: element.clientHeight, scroll: element.scrollHeight, cap: 2 * parseFloat(style.lineHeight) + padding }
  })
  expect(box.height, `"${name}" runs past two lines`).toBeLessThanOrEqual(box.cap)
  expect(box.scroll, `"${name}" scrolls`).toBe(box.height)
}

/** The one open popup. A popup on its way out has lost data-open, and may stay in the page for a frame or two. */
const openPopup = (page: Page) => page.locator('[data-placement][data-open]')

const measure = (page: Page, text: string) => page.evaluate((wanted): Omit<Placed, 'where'> | null => {
  const box = (element: Element): Box => {
    const { left, top, right, bottom } = element.getBoundingClientRect()
    return { left, top, right, bottom }
  }
  const popup = [...document.querySelectorAll('[data-placement][data-open]')].find((el) => el.textContent === wanted)
  const arrow = popup?.querySelector('[aria-hidden="true"]')
  const trigger = document.activeElement
  if (!popup || !arrow || !trigger) return null
  return { popup: box(popup), arrow: box(arrow), trigger: box(trigger) }
}, text)

/** The side of the trigger the popup lies on, and the gap between the two. Null while they overlap. */
function sideOf({ popup, trigger }: Omit<Placed, 'where'>): { where: Where, gap: number } | null {
  if (popup.bottom <= trigger.top) return { where: 'above', gap: trigger.top - popup.bottom }
  if (popup.top >= trigger.bottom) return { where: 'below', gap: popup.top - trigger.bottom }
  if (popup.right <= trigger.left) return { where: 'left', gap: trigger.left - popup.right }
  if (popup.left >= trigger.right) return { where: 'right', gap: popup.left - trigger.right }
  return null
}

/** Tabs to the next trigger and waits until its tooltip is placed 11 px off it: 6 of gap and 5 of arrow, as drawn. */
async function openNext(page: Page, name: string): Promise<Placed> {
  await page.keyboard.press('Tab')
  await expect(page.getByRole('button', { name, exact: true })).toBeFocused()

  const found: { placed?: Placed } = {}
  await expect(async () => {
    const measured = await measure(page, name)
    if (!measured) throw new Error(`no open tooltip reads "${name}"`)
    const side = sideOf(measured)
    if (!side) throw new Error(`the tooltip "${name}" lies over its trigger`)
    expect(Math.abs(side.gap - 11), `"${name}" is ${String(side.gap)} px from its trigger, not 11`).toBeLessThanOrEqual(1)
    found.placed = { ...measured, where: side.where }
  }).toPass({ timeout: 10_000 })
  if (!found.placed) throw new Error(`the tooltip "${name}" was never placed`)
  return found.placed
}

/** The arrow is a square turned 45 degrees and centred on one edge of the popup: the one the trigger is behind. */
function expectArrowTowardTrigger({ popup, arrow, trigger, where }: Placed, label: string): void {
  const x = (arrow.left + arrow.right) / 2
  const y = (arrow.top + arrow.bottom) / 2
  const facing = { above: popup.bottom, below: popup.top, left: popup.right, right: popup.left }[where]
  const upright = where === 'above' || where === 'below'

  expect(Math.abs((upright ? y : x) - facing), `${label}: the arrow is off the edge that faces the trigger`).toBeLessThanOrEqual(1)
  // Along that edge it points at the trigger, and never hangs off the popup's corner.
  const [along, from, to] = upright
    ? [x, Math.max(popup.left, trigger.left), Math.min(popup.right, trigger.right)]
    : [y, Math.max(popup.top, trigger.top), Math.min(popup.bottom, trigger.bottom)]
  expect(along, `${label}: the arrow is before the trigger`).toBeGreaterThanOrEqual(from)
  expect(along, `${label}: the arrow is past the trigger`).toBeLessThanOrEqual(to)
}

test('the tables name every tooltip demo but the one that never opens, and only triggers that exist', () => {
  const found = DEMOS.filter((demo) => demo.startsWith('tooltip--')).sort()
  expect(found).toEqual([
    'tooltip--basic', 'tooltip--delays', 'tooltip--disabled', 'tooltip--long-label',
    'tooltip--placements', 'tooltip--rtl', 'tooltip--with-count',
  ])
  expect(Object.keys(TOOLTIPS).sort()).toEqual(found.filter((demo) => demo !== 'tooltip--disabled'))
  // A row for a trigger the loop below never opens would be an expectation nobody checks.
  for (const row of SIDES) expect(TOOLTIPS[row.demo] ?? [], `${row.demo} has no "${row.name}"`).toContain(row.name)
})

test('focus on the trigger opens the tooltip, and Escape closes it without moving focus', async ({ page }) => {
  await openLive(page, 'tooltip--basic')
  const trigger = page.getByRole('button', { name: 'Copy link' })
  const popup = page.locator('[data-placement]')
  await expect(popup).toHaveCount(0)

  await page.keyboard.press('Tab')
  await expect(trigger).toBeFocused()
  await expect(popup).toHaveText('Copy link')
  await expect(popup).toBeVisible()
  await expect(popup).toHaveAttribute('data-placement', 'top')

  await page.keyboard.press('Escape')
  await expect(popup).toHaveCount(0)
  await expect(trigger).toBeFocused()
})

test('hover opens it, and the pointer leaving closes it', async ({ page }) => {
  await openLive(page, 'tooltip--delays')
  // delay={0}: the other two wait 600 ms, which is the provider's business and a unit test's.
  await page.getByRole('button', { name: 'Copy', exact: true }).hover()
  await expect(openPopup(page)).toHaveText('Copy')
  await page.mouse.move(600, 600)
  await expect(openPopup(page)).toHaveCount(0)
})

test('a disabled tooltip stays shut under focus and under the pointer', async ({ page }) => {
  await openLive(page, 'tooltip--disabled')
  const trigger = page.getByRole('button', { name: 'Rename' })
  await page.keyboard.press('Tab')
  await expect(trigger).toBeFocused()
  await trigger.hover()
  // Longer than Base UI's 600 ms, so a tooltip that only waited would be open by now.
  await page.waitForTimeout(900)
  await expect(page.locator('[data-placement]')).toHaveCount(0)
})

test('the stylesheet already holds the classes of a popup nothing has rendered yet', async ({ page }) => {
  await openLive(page, 'tooltip--basic')
  await page.keyboard.press('Tab')
  await expect(openPopup(page)).toHaveText('Copy link')

  const styles = await openPopup(page).evaluate((element) => {
    const own = getComputedStyle(element)
    const arrow = getComputedStyle(element.querySelector('[aria-hidden="true"]') ?? element)
    const positioner = getComputedStyle(element.parentElement ?? element)
    return {
      maxWidth: own.maxWidth, paddingInline: own.paddingInlineStart, fontSize: own.fontSize, wrap: own.overflowWrap,
      filled: own.backgroundColor !== 'rgba(0, 0, 0, 0)',
      arrow: `${arrow.width} ${arrow.height} ${arrow.rotate}`,
      zIndex: positioner.zIndex,
    }
  })
  // max-w-xs, px-3, text-xs and wrap-anywhere on the popup; size-2 rotate-45 on the arrow; --tc-z-popup on the positioner.
  expect(styles).toEqual({
    maxWidth: '320px', paddingInline: '12px', fontSize: '12px', wrap: 'anywhere', filled: true, arrow: '8px 8px 45deg', zIndex: '60',
  })
})

test.describe('with the trigger flush against an edge', () => {
  // Twelve tooltips on one page: 9 s on a busy machine, so the default half minute is too close.
  test.describe.configure({ timeout: 60_000 })

  for (const direction of DIRECTIONS) {
    for (const edge of EDGES) {
      for (const [demo, names] of Object.entries(TOOLTIPS)) {
        test(`${demo} ${direction}, pinned ${edge}: the popup stays inside the viewport, its arrow toward the trigger`, async ({ page }) => {
          await openLive(page, demo, { direction, edge })
          for (const name of names) {
            const placed = await openNext(page, name)
            // The shared collision padding: 8 px clear of every edge, not merely inside.
            await expectInsideViewport(openPopup(page), `the tooltip "${name}"`, 8)
            await expectTwoLinesAtMost(openPopup(page), name)
            await expectNoSidewaysScroll(page)

            const written = SIDES.find((row) => row.demo === demo && row.direction === direction && row.edge === edge && row.name === name)
            if (written) expect(placed.where, `"${name}" opened on the wrong side`).toBe(written.where)
            expectArrowTowardTrigger(placed, name)
          }
        })
      }
    }
  }
})

// The demo mounts its own RTL provider, so on an LTR page its portal sits in a <body> of the other direction.
// Without a dir of its own the popup took the body's: on 2026-10-10 the arrow was 76 px away, on the far edge.
test('an RTL island on an LTR page draws its arrow toward the trigger, and its popup is right to left and in Arabic', async ({ page }) => {
  await openLive(page, 'tooltip--rtl', { direction: 'ltr', edge: 'end' })
  const placed = await openNext(page, 'نسخ الرابط')
  expect(placed.where).toBe('left')
  expectArrowTowardTrigger(placed, 'نسخ الرابط')

  const directions = await openPopup(page).evaluate((popup) => ({
    body: getComputedStyle(document.body).direction,
    positioner: getComputedStyle(popup.parentElement ?? popup).direction,
    popup: getComputedStyle(popup).direction,
    arrow: getComputedStyle(popup.querySelector('[aria-hidden="true"]') ?? popup).direction,
  }))
  expect(directions).toEqual({ body: 'ltr', positioner: 'rtl', popup: 'rtl', arrow: 'rtl' })

  // The nearest lang is what a screen reader announces in and the browser shapes glyphs for: the island's, not the page's.
  const languages = await openPopup(page).evaluate((popup) => ({
    page: document.documentElement.lang,
    positioner: popup.parentElement?.getAttribute('lang') ?? null,
    arabic: popup.matches(':lang(ar)'),
    english: popup.matches(':lang(en)'),
  }))
  expect(languages).toEqual({ page: 'en', positioner: 'ar', arabic: true, english: false })
})

/** What a popup must inherit from each page when no provider tells it, written out. */
const INHERITED = {
  ltr: { direction: 'ltr', arabic: false, english: true, startEdge: 'left' },
  rtl: { direction: 'rtl', arabic: true, english: false, startEdge: 'right' },
} as const

// R-13-1 asks for the provider and the harness always mounts one, so these tooltips come from a fixture module.
// Base UI has no direction either then: start and end still open on the LTR sides, their arrow on the far edge.
test.describe('with no provider at all, a popup takes the direction and the language of its page', () => {
  for (const direction of DIRECTIONS) {
    test(`${direction} page: nothing is stamped on the positioner, and a top tooltip is whole`, async ({ page }) => {
      await openLive(page, 'separator--horizontal', { direction })
      await page.addScriptTag({ type: 'module', url: '/e2e/fixtures/tooltip-no-provider.tsx' })
      await expect(page.locator('#no-provider button')).toHaveCount(4)

      expectArrowTowardTrigger(await openNext(page, 'top'), 'top')
      const read = await openPopup(page).evaluate((popup) => ({
        dir: popup.parentElement?.getAttribute('dir') ?? null,
        lang: popup.parentElement?.getAttribute('lang') ?? null,
        direction: getComputedStyle(popup).direction,
        arabic: popup.matches(':lang(ar)'),
        english: popup.matches(':lang(en)'),
      }))
      const { startEdge, ...inherited } = INHERITED[direction]
      expect(read).toEqual({ dir: null, lang: null, ...inherited })

      // Floating UI reads the same inherited direction, so start is the page's start edge of the trigger.
      const aligned = await openNext(page, 'top-start')
      expectArrowTowardTrigger(aligned, 'top-start')
      expect(Math.abs(aligned.popup[startEdge] - aligned.trigger[startEdge]), `top-start is not aligned to the ${startEdge} edge`).toBeLessThanOrEqual(1)
    })
  }
})
