import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Locator, type Page } from '@playwright/test'

import { DIRECTIONS, MODES, type Direction } from '../scripts/lib/harness.js'
import { EDGES, type Edge } from '../scripts/lib/live-harness.js'
import { type LiveOptions, expectInsideViewport, expectNoSidewaysScroll, liveErrors, openLive, pinTo } from './live.js'
import {
  type Box, type OpenOptions, OPENED, atRest, boxOf, expectClosed, expectNothingSideways, openOverlay, pageLock, touchDrag,
  wheelAt, withScrollbar,
} from './overlay.js'
import { DEMOS } from './pages.js'
import { FORCED_CANVAS, type Rgb, inkOn, paintedIn, pixelsOf, rgbOf } from './pixels.js'

// What happy-dom cannot lay out and the static page cannot open: the keys of the menu-button pattern in a real
// browser, where the menu lands, what scrolls, what the page behind still does, and what forced colours leave.

/** Every menu trigger of every demo, by its label, in tab order. Written out, so a renamed demo fails here. */
const MENUS: Record<string, readonly string[]> = {
  'dropdown--basic': ['Actions'],
  'dropdown--danger-item': ['Project'],
  'dropdown--data-driven': ['Account'],
  'dropdown--groups': ['View'],
  // Its one menu is inside a dialog, which has to be opened first: it has tests of its own below.
  'dropdown--in-dialog': [],
  'dropdown--placements': [
    'top-start', 'top', 'top-end', 'start-top', 'start', 'start-bottom',
    'end-top', 'end', 'end-bottom', 'bottom-start', 'bottom', 'bottom-end',
  ],
  'dropdown--rtl': ['الإجراءات', 'المزيد'],
  'dropdown--sixty-items': ['Time zone'],
  'dropdown--with-links': ['Help'],
}

/** The demos whose menus open straight from the page. */
const OPEN = Object.entries(MENUS).filter(([, names]) => names.length > 0)

/** The four screens Unit 3 measures at: a small phone, a phone, a phone on its side and a desktop. */
const SCREENS = [
  { width: 320, height: 480 }, { width: 390, height: 844 }, { width: 844, height: 390 }, { width: 1280, height: 800 },
] as const

const MENU = '[role="menu"]'
const asMenu = (options: OpenOptions = {}): OpenOptions => ({ ...options, popup: MENU })

/** A trigger by its whole label. Not by role: the page behind a dialog is hidden from roles. */
const triggerOf = (page: Page, name: string, scope = '#demo') =>
  page.locator(`${scope} button`).filter({ has: page.getByText(name, { exact: true }) })

const rowsOf = (menu: Locator) => menu.locator('[role="menuitem"]')
const rowOf = (menu: Locator, name: string) => menu.getByRole('menuitem', { name, exact: true })
const openMenus = (page: Page) => page.locator(`${MENU}[data-open]`)
const scrollY = (page: Page) => page.evaluate(() => Math.round(window.scrollY))
const closed = (page: Page) => expectClosed(page, MENU)

/** Opens a demo page and its first menu, and returns the settled menu. */
async function open(page: Page, demo: string, options: LiveOptions & OpenOptions = {}): Promise<Locator> {
  const [first] = MENUS[demo] ?? []
  if (first === undefined) throw new Error(`no menu opens from the page of ${demo}`)
  await openLive(page, demo, options)
  return openOverlay(page, triggerOf(page, first), asMenu(options))
}

/** Loads a fixture module into a plain live page and waits for its first button. */
async function fixture(page: Page, file: string, scope: string, options: LiveOptions = {}): Promise<void> {
  await openLive(page, 'separator--horizontal', options)
  await page.addScriptTag({ type: 'module', url: `/e2e/fixtures/${file}.tsx` })
  await expect(page.locator(`${scope} button`).first()).toBeVisible()
}

/** The label of the row that holds the focus: its own text, without its shortcut. The role of anything else. */
const focusedRow = (page: Page) => page.evaluate(() => {
  const element = document.activeElement
  if (element?.getAttribute('role') !== 'menuitem') return `(${element?.getAttribute('role') ?? element?.tagName.toLowerCase() ?? 'nothing'})`
  return element.querySelector('span.min-w-0')?.textContent ?? element.getAttribute('aria-label') ?? element.textContent
})

/** Presses one key and returns the row focus rests on once it has moved there. */
async function press(page: Page, key: string, lands: string): Promise<void> {
  await page.keyboard.press(key)
  await expect.poll(() => focusedRow(page), { message: `after ${key}` }).toBe(lands)
}

type Where = 'above' | 'below' | 'left' | 'right'

/** The side of the trigger a menu lies on, and the gap between the two. Null while they overlap. */
function sideOf(popup: Box, trigger: Box): { where: Where, gap: number } | null {
  if (popup.bottom <= trigger.top) return { where: 'above', gap: trigger.top - popup.bottom }
  if (popup.top >= trigger.bottom) return { where: 'below', gap: popup.top - trigger.bottom }
  if (popup.right <= trigger.left) return { where: 'left', gap: trigger.left - popup.right }
  if (popup.left >= trigger.right) return { where: 'right', gap: popup.left - trigger.right }
  return null
}

/** How far the menu scrolls, and how far it still can. */
const scrollOf = (menu: Locator) => menu.evaluate((element) => ({
  top: Math.round(element.scrollTop),
  left: element.scrollHeight - element.clientHeight - Math.round(element.scrollTop),
  far: element.scrollHeight - element.clientHeight,
  sideways: element.scrollWidth - element.clientWidth,
}))

/** The room between the focused row and the two block edges of its menu, inside the line of the menu. */
const roomOf = (page: Page) => page.evaluate(() => {
  const row = document.activeElement as HTMLElement
  const menu = row.closest('[role="menu"]') as HTMLElement
  const top = menu.getBoundingClientRect().top + menu.clientTop
  const box = row.getBoundingClientRect()
  return { above: Math.round(box.top - top), below: Math.round(top + menu.clientHeight - box.bottom) }
})

test('the table names every dropdown demo', () => {
  expect(Object.keys(MENUS).sort()).toEqual(DEMOS.filter((demo) => demo.startsWith('dropdown--')).sort())
  expect(Object.keys(MENUS)).toHaveLength(9)
})

// The menu-button pattern of the ARIA Authoring Practices, key by key, in a real browser and in both directions.
for (const direction of DIRECTIONS) {
  test.describe(`the keyboard, ${direction}`, () => {
    test('Enter, Space and ArrowDown on the trigger open the menu on its first row, ArrowUp on its last, and Escape hands the focus back', async ({ page }) => {
      await openLive(page, 'dropdown--basic', { direction })
      const trigger = triggerOf(page, 'Actions')
      await expect(trigger).toHaveAttribute('aria-haspopup', 'menu')
      for (const [key, first] of [['Enter', 'Profile'], ['Space', 'Profile'], ['ArrowDown', 'Profile'], ['ArrowUp', 'Delete']] as const) {
        await trigger.focus()
        await page.keyboard.press(key)
        const menu = page.locator(`${MENU}${OPENED}`)
        await expect(menu, `${key} did not open the menu`).toBeVisible()
        await atRest(menu)
        await expect.poll(() => focusedRow(page), { message: `the row ${key} opens on` }).toBe(first)
        await expect(trigger).toHaveAttribute('aria-expanded', 'true')
        await page.keyboard.press('Escape')
        await closed(page)
        await expect(trigger).toBeFocused()
        await expect(trigger).toHaveAttribute('aria-expanded', 'false')
      }
      expect(await liveErrors(page)).toEqual([])
    })

    test('the arrows move row by row, stop on the disabled row, and loop at both ends; Home and End jump; the side arrows do nothing', async ({ page }) => {
      const menu = await open(page, 'dropdown--basic', { direction, by: 'keyboard' })
      await expect.poll(() => focusedRow(page)).toBe('Profile')
      for (const lands of ['Settings', 'Duplicate', 'Rename', 'Delete', 'Profile']) await press(page, 'ArrowDown', lands)
      await expect(rowOf(menu, 'Rename')).toHaveAttribute('aria-disabled', 'true')
      for (const lands of ['Delete', 'Rename', 'Duplicate']) await press(page, 'ArrowUp', lands)
      await press(page, 'End', 'Delete')
      await press(page, 'Home', 'Profile')
      // No submenu is built, so neither side arrow has anywhere to go, in either direction.
      await press(page, 'ArrowRight', 'Profile')
      await press(page, 'ArrowLeft', 'Profile')
      await expect(menu).toHaveAttribute('data-open', '')
    })

    test('a letter goes to the next row that starts with it, and a second letter typed with it to the row that starts with both', async ({ page }) => {
      await open(page, 'dropdown--basic', { direction, by: 'keyboard' })
      await press(page, 'd', 'Duplicate')
      await press(page, 'e', 'Delete')
    })

    test('the highlighted row is the one tab stop, is filled, and no other row is', async ({ page }) => {
      const menu = await open(page, 'dropdown--basic', { direction, by: 'keyboard' })
      await press(page, 'ArrowDown', 'Settings')
      expect(await rowsOf(menu).evaluateAll((rows) => rows.map((row) => `${row.getAttribute('tabindex') ?? ''} ${String(row.hasAttribute('data-highlighted'))}`)))
        .toEqual(['-1 false', '0 true', '-1 false', '-1 false', '-1 false'])
      const fills = await rowsOf(menu).evaluateAll((rows) => rows.map((row) => getComputedStyle(row).backgroundColor))
      expect(fills.filter((fill) => fill !== 'rgba(0, 0, 0, 0)')).toHaveLength(1)
      expect(fills[1]).not.toBe('rgba(0, 0, 0, 0)')
    })
  })
}

test.describe('what a key does to the menu', () => {
  const SCOPE = '#kinds'
  const counts = async (page: Page) => ({
    selected: await page.locator('#selected').textContent(), acted: await page.locator('#acted').textContent(),
    forms: await page.locator('#forms').textContent(), hash: await page.evaluate(() => location.hash),
  })
  const NOTHING = { selected: '0', acted: '0', forms: '0', hash: '' }

  for (const key of ['Enter', 'Space'] as const) {
    test(`${key} on a row runs it once, closes the menu and hands the focus back to the trigger`, async ({ page }) => {
      await fixture(page, 'dropdown-kinds', SCOPE)
      await openOverlay(page, triggerOf(page, 'Kinds', SCOPE), asMenu({ by: 'keyboard' }))
      await press(page, 'ArrowDown', 'A handler')
      await page.keyboard.press(key)
      await closed(page)
      await expect(triggerOf(page, 'Kinds', SCOPE)).toBeFocused()
      expect(await counts(page)).toEqual({ ...NOTHING, selected: '1' })
    })
  }

  test('an action item calls its action exactly once, with a FormData, by a press and by Enter', async ({ page }) => {
    await fixture(page, 'dropdown-kinds', SCOPE)
    const menu = await openOverlay(page, triggerOf(page, 'Kinds', SCOPE), asMenu())
    await rowOf(menu, 'An action').click()
    await closed(page)
    await expect(page.locator('#acted')).toHaveText('1')
    expect(await counts(page)).toEqual({ ...NOTHING, acted: '1', forms: '1' })

    await openOverlay(page, triggerOf(page, 'Kinds', SCOPE), asMenu({ by: 'keyboard' }))
    await press(page, 'ArrowDown', 'A handler')
    await press(page, 'ArrowDown', 'An action')
    await page.keyboard.press('Enter')
    await closed(page)
    await expect(page.locator('#acted')).toHaveText('2')
    expect(await counts(page)).toEqual({ ...NOTHING, acted: '2', forms: '2' })
    expect(await liveErrors(page)).toEqual([])
  })

  test('a disabled row does nothing by Enter, by Space or by a press, whichever of the three kinds it is, and the menu stays open', async ({ page }) => {
    await fixture(page, 'dropdown-kinds', SCOPE)
    const menu = await openOverlay(page, triggerOf(page, 'Kinds', SCOPE), asMenu({ by: 'keyboard' }))
    await press(page, 'End', 'Disabled link')
    for (const lands of ['Disabled link', 'Disabled action', 'Disabled handler']) {
      await expect.poll(() => focusedRow(page)).toBe(lands)
      await page.keyboard.press('Enter')
      await page.keyboard.press('Space')
      await page.keyboard.press('ArrowUp')
    }
    for (const name of ['Disabled handler', 'Disabled action', 'Disabled link']) {
      const box = await boxOf(rowOf(menu, name))
      await page.mouse.click(box.left + 30, box.top + box.height / 2)
    }
    await expect(menu).toHaveAttribute('data-open', '')
    expect(await counts(page)).toEqual(NOTHING)
    // A disabled link is a row with no address, so there is nothing to follow either.
    expect(await rowOf(menu, 'Disabled link').evaluate((row) => `${row.tagName} ${String(row.hasAttribute('href'))}`)).toBe('DIV false')
  })

  test('Space right after a letter is part of the search, as in a native menu, and runs the row again once the search has ended', async ({ page }) => {
    // The page's own clock, so the end of a search is a step of the test and never a wait.
    await page.clock.install()
    const menu = await open(page, 'dropdown--sixty-items', { by: 'keyboard' })
    for (const key of ['z', 'o', 'n', 'e', 'Space', '4', '5']) await page.keyboard.press(key)
    await expect.poll(() => focusedRow(page)).toBe('Zone 45')
    await expect(menu).toHaveAttribute('data-open', '')
    // Base UI ends a search 750 ms after its last key.
    await page.clock.fastForward(1000)
    await page.keyboard.press('Space')
    await closed(page)
    await expect(triggerOf(page, 'Time zone')).toBeFocused()
  })

  test('Tab closes the menu and goes on to the next control of the page; Shift+Tab closes it and returns to the trigger', async ({ page }) => {
    await openLive(page, 'dropdown--placements')
    await openOverlay(page, triggerOf(page, 'top'), asMenu({ by: 'keyboard' }))
    await page.keyboard.press('Tab')
    await closed(page)
    await expect(triggerOf(page, 'top-end')).toBeFocused()

    await openOverlay(page, triggerOf(page, 'top'), asMenu({ by: 'keyboard' }))
    await page.keyboard.press('Shift+Tab')
    await closed(page)
    await expect(triggerOf(page, 'top')).toBeFocused()
  })
})

test.describe('where the focus is drawn', () => {
  test('a menu a press opened holds the focus itself and draws no ring; a row the pointer is on takes it', async ({ page }) => {
    const menu = await open(page, 'dropdown--basic')
    await expect(menu).toBeFocused()
    await expect(menu).toHaveCSS('outline-style', 'none')
    await rowOf(menu, 'Settings').hover()
    await expect.poll(() => focusedRow(page)).toBe('Settings')
    await expect(rowOf(menu, 'Settings')).toHaveAttribute('data-highlighted', '')
    // A row draws no ring: its fill is its focus mark.
    await expect(rowOf(menu, 'Settings')).toHaveCSS('outline-style', 'none')
  })

  test('opened from the keyboard, a menu the pointer then leaves holds the focus and draws its ring inside its own box', async ({ page }) => {
    const menu = await open(page, 'dropdown--basic', { by: 'keyboard' })
    await rowOf(menu, 'Settings').hover()
    await expect.poll(() => focusedRow(page)).toBe('Settings')
    await page.mouse.move(700, 700)
    await expect(menu).toBeFocused()
    await expect(menu).toHaveCSS('outline-style', 'solid')
    await expect(menu).toHaveCSS('outline-width', '2px')
    await expect(menu).toHaveCSS('outline-offset', '-2px')
  })

  test('an empty menu opened from the keyboard is itself the stop, with the same ring', async ({ page }) => {
    await fixture(page, 'dropdown-hostile', '#hostile')
    const menu = await openOverlay(page, triggerOf(page, 'Empty', '#hostile'), asMenu({ by: 'keyboard' }))
    await expect(menu).toBeFocused()
    await expect(menu).toHaveCSS('outline-style', 'solid')
    await page.keyboard.press('Escape')
    await closed(page)
    await expect(triggerOf(page, 'Empty', '#hostile')).toBeFocused()
  })
})

/** Where a menu must land, written out: on its own side while there is room, on the opposite one at that edge. */
const SIDES: ReadonlyArray<{ demo: string, direction: Direction, edge: Edge, name: string, where: Where }> = [
  { demo: 'dropdown--basic', direction: 'ltr', edge: 'top', name: 'Actions', where: 'below' },
  { demo: 'dropdown--basic', direction: 'ltr', edge: 'start', name: 'Actions', where: 'below' },
  { demo: 'dropdown--basic', direction: 'ltr', edge: 'end', name: 'Actions', where: 'below' },
  { demo: 'dropdown--basic', direction: 'ltr', edge: 'bottom', name: 'Actions', where: 'above' },
  { demo: 'dropdown--basic', direction: 'rtl', edge: 'bottom', name: 'Actions', where: 'above' },
  { demo: 'dropdown--data-driven', direction: 'rtl', edge: 'bottom', name: 'Account', where: 'above' },
  { demo: 'dropdown--sixty-items', direction: 'ltr', edge: 'bottom', name: 'Time zone', where: 'above' },
  { demo: 'dropdown--sixty-items', direction: 'rtl', edge: 'top', name: 'Time zone', where: 'below' },
  // Above and below flip at the edge that has no room for them.
  { demo: 'dropdown--placements', direction: 'ltr', edge: 'top', name: 'top', where: 'below' },
  { demo: 'dropdown--placements', direction: 'ltr', edge: 'bottom', name: 'bottom', where: 'above' },
  // start is the left-hand side in English, and flips to the right at the left edge.
  { demo: 'dropdown--placements', direction: 'ltr', edge: 'top', name: 'start', where: 'left' },
  { demo: 'dropdown--placements', direction: 'ltr', edge: 'top', name: 'end', where: 'right' },
  { demo: 'dropdown--placements', direction: 'ltr', edge: 'start', name: 'start', where: 'right' },
  { demo: 'dropdown--placements', direction: 'ltr', edge: 'end', name: 'end', where: 'left' },
  // In Arabic start is the right-hand side, so the same placements mirror.
  { demo: 'dropdown--placements', direction: 'rtl', edge: 'top', name: 'start', where: 'right' },
  { demo: 'dropdown--placements', direction: 'rtl', edge: 'top', name: 'end', where: 'left' },
  { demo: 'dropdown--placements', direction: 'rtl', edge: 'start', name: 'start', where: 'left' },
  { demo: 'dropdown--placements', direction: 'rtl', edge: 'end', name: 'end', where: 'right' },
  // The island: on an LTR page its own provider still makes end the left-hand side.
  { demo: 'dropdown--rtl', direction: 'ltr', edge: 'top', name: 'المزيد', where: 'left' },
  { demo: 'dropdown--rtl', direction: 'ltr', edge: 'start', name: 'المزيد', where: 'right' },
  { demo: 'dropdown--rtl', direction: 'rtl', edge: 'top', name: 'المزيد', where: 'left' },
  { demo: 'dropdown--rtl', direction: 'ltr', edge: 'bottom', name: 'الإجراءات', where: 'above' },
]

test('every written side names a trigger that exists', () => {
  for (const row of SIDES) expect(MENUS[row.demo] ?? [], `${row.demo} has no "${row.name}"`).toContain(row.name)
  expect(SIDES).toHaveLength(22)
})

test.describe('with the trigger flush against an edge', () => {
  test.describe.configure({ timeout: 120_000 })

  for (const direction of DIRECTIONS) {
    for (const [demo, names] of OPEN) {
      test(`${demo} ${direction}: at each of the four edges the menu is inside the viewport, 6 px off its trigger, on the side it should be`, async ({ page }) => {
        await openLive(page, demo, { direction })
        for (const edge of EDGES) {
          await pinTo(page, edge)
          for (const name of names) {
            const trigger = triggerOf(page, name)
            const menu = await openOverlay(page, trigger, asMenu())
            const label = `the menu of "${name}", pinned ${edge}`
            // The shared collision padding: 8 px clear of every edge, not merely inside.
            await expectInsideViewport(menu, label, 8)
            await expectNoSidewaysScroll(page)

            const side = sideOf(await boxOf(menu), await boxOf(trigger))
            if (!side) throw new Error(`${label} lies over its trigger`)
            // The shared side offset. A trigger has a fractional width and Base UI places on whole pixels.
            expect(Math.abs(side.gap - 6), `${label} is ${String(side.gap)} px from its trigger, not 6`).toBeLessThanOrEqual(1)
            const written = SIDES.find((row) => row.demo === demo && row.direction === direction && row.edge === edge && row.name === name)
            if (written) expect(side.where, `${label} opened on the wrong side`).toBe(written.where)

            await page.keyboard.press('Escape')
            await closed(page)
          }
        }
      })
    }
  }
})

test.describe('the alignment half of a placement', () => {
  /** The edges of a menu and of its trigger, with the menu closed again. */
  const edgesOf = async (page: Page, name: string) => {
    const trigger = triggerOf(page, name)
    const menu = await openOverlay(page, trigger, asMenu())
    const found = { menu: await boxOf(menu), trigger: await boxOf(trigger) }
    await page.keyboard.press('Escape')
    await closed(page)
    return found
  }

  test('ltr: bottom-start, the default, opens at the left edge of its trigger, bottom-end at its right edge, start-top at its top', async ({ page }) => {
    await openLive(page, 'dropdown--basic', { edge: 'top' })
    const first = await edgesOf(page, 'Actions')
    expect(Math.abs(first.menu.left - first.trigger.left), 'the default is not bottom-start').toBeLessThanOrEqual(1)
    await openLive(page, 'dropdown--placements', { edge: 'top' })
    const end = await edgesOf(page, 'bottom-end')
    expect(Math.abs(end.menu.right - end.trigger.right)).toBeLessThanOrEqual(1)
    const top = await edgesOf(page, 'start-top')
    expect(Math.abs(top.menu.top - top.trigger.top)).toBeLessThanOrEqual(1)
    const centre = await edgesOf(page, 'bottom')
    expect(Math.abs((centre.menu.left + centre.menu.right) - (centre.trigger.left + centre.trigger.right))).toBeLessThanOrEqual(2)
  })

  test('rtl: the two mirror, so bottom-start opens at the right edge of its trigger and bottom-end at its left', async ({ page }) => {
    await openLive(page, 'dropdown--basic', { direction: 'rtl', edge: 'top' })
    const first = await edgesOf(page, 'Actions')
    expect(Math.abs(first.menu.right - first.trigger.right), 'the default is not bottom-start').toBeLessThanOrEqual(1)
    await openLive(page, 'dropdown--placements', { direction: 'rtl', edge: 'top' })
    const end = await edgesOf(page, 'bottom-end')
    expect(Math.abs(end.menu.left - end.trigger.left)).toBeLessThanOrEqual(1)
  })

  test('with no room at the start edge it lines up the end edges instead, and stays 8 px inside', async ({ page }) => {
    await openLive(page, 'dropdown--basic', { edge: 'end' })
    const found = await edgesOf(page, 'Actions')
    // The body, not the root: the page keeps a scrollbar gutter, which the root still counts.
    const width = await page.evaluate(() => document.body.clientWidth)
    expect(found.menu.right).toBe(width - 8)
    expect(found.menu.left).toBeLessThan(found.trigger.left)
  })
})

test.describe('every demo on every screen', () => {
  test.describe.configure({ timeout: 120_000 })

  for (const screen of SCREENS) {
    for (const direction of DIRECTIONS) {
      test(`${String(screen.width)} x ${String(screen.height)} ${direction}: each menu is whole, beside its trigger and not over it, and neither it nor the page scrolls sideways`, async ({ page }) => {
        await page.setViewportSize(screen)
        for (const [demo, names] of OPEN) {
          await openLive(page, demo, { direction })
          for (const name of names) {
            const trigger = triggerOf(page, name)
            await trigger.scrollIntoViewIfNeeded()
            const menu = await openOverlay(page, trigger, asMenu())
            const label = `${demo}: the menu of "${name}"`
            await expectInsideViewport(menu, label, 8)
            await expectNoSidewaysScroll(page)
            await expectNothingSideways(menu, label)
            expect(sideOf(await boxOf(menu), await boxOf(trigger)), `${label} lies over its trigger`).not.toBeNull()
            await page.keyboard.press('Escape')
            await closed(page)
          }
        }
      })
    }
  }
})

test.describe('sixty rows', () => {
  /** Whether the row at an index of the open menu ends inside the box of the menu, and where it starts and ends in it. */
  const rowIn = (menu: Locator, index: number) => menu.evaluate((element, at) => {
    const top = element.getBoundingClientRect().top + element.clientTop
    const row = element.querySelectorAll('[role="menuitem"]')[at]?.getBoundingClientRect()
    return row ? { top: Math.round(row.top - top), bottom: Math.round(row.bottom - top), height: element.clientHeight } : null
  }, index)

  for (const screen of SCREENS) {
    for (const direction of DIRECTIONS) {
      test(`${String(screen.width)} x ${String(screen.height)} ${direction}: the menu shows seven rows and cuts the last, scrolls inside itself, and the arrows keep the highlighted row whole`, async ({ page }) => {
        await page.setViewportSize(screen)
        const menu = await open(page, 'dropdown--sixty-items', { direction, by: 'keyboard', tall: true })
        await expectInsideViewport(menu, 'the menu', 8)
        await expectNoSidewaysScroll(page)
        // LIST_CAP: seven rows of 40 px. Sixty rows, their gaps and the padding are 2530 px, in a box that shows 278.
        expect((await boxOf(menu)).height).toBe(280)
        expect(await scrollOf(menu)).toEqual({ top: 0, left: 2252, far: 2252, sideways: 0 })
        // The seventh row starts inside the menu and ends below it: a cut row says there is more.
        expect(await rowIn(menu, 5)).toEqual({ top: 216, bottom: 256, height: 278 })
        expect(await rowIn(menu, 6)).toEqual({ top: 258, bottom: 298, height: 278 })

        const cut: string[] = []
        for (let stop = 2; stop <= 14; stop++) {
          await press(page, 'ArrowDown', `Zone ${String(stop)}`)
          const { above, below } = await roomOf(page)
          // SCROLL_AREA keeps the reach of a focus ring clear of the edge a row is scrolled to: 4 px.
          if (above < 4 || below < 4) cut.push(`Zone ${String(stop)}: ${String(above)} px above, ${String(below)} px below`)
        }
        expect(cut).toEqual([])
        expect((await scrollOf(menu)).top, 'the menu did not scroll with the highlight').toBeGreaterThan(250)

        await press(page, 'End', 'Zone 60')
        expect((await roomOf(page)).below).toBeGreaterThanOrEqual(4)
        expect((await scrollOf(menu)).left).toBeLessThanOrEqual(2)
        await press(page, 'ArrowDown', 'Zone 1')
        expect((await roomOf(page)).above).toBeGreaterThanOrEqual(4)
        await press(page, 'ArrowUp', 'Zone 60')
        expect(await scrollY(page), 'the page moved').toBe(0)
      })
    }
  }

  test('a wheel reaches the last row and no further: at its end it stays in the menu, and the page behind does not take it', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 480 })
    const menu = await open(page, 'dropdown--sixty-items', { tall: true })
    const frame = await boxOf(menu)
    for (let turn = 0; turn < 6; turn++) await wheelAt(page, frame.left + 60, frame.top + 60, 500)
    expect((await scrollOf(menu)).left, 'px of menu still below').toBe(0)
    const last = await boxOf(rowsOf(menu).last())
    expect(last.bottom, 'the last row ends below the menu').toBeLessThanOrEqual(frame.bottom - 6)
    await wheelAt(page, frame.left + 60, frame.top + 60, 500)
    expect(await scrollY(page)).toBe(0)
  })

  test('844 x 390, with its trigger half way down: the menu shrinks to the 161 px under it and End still reaches the last row', async ({ page }) => {
    await page.setViewportSize({ width: 844, height: 390 })
    const menu = await open(page, 'dropdown--sixty-items', { edge: 'start', by: 'keyboard' })
    await expectInsideViewport(menu, 'the menu', 8)
    // 390 less the trigger that ends at 215, the 6 px offset and the 8 px padding.
    expect((await boxOf(menu)).height).toBe(161)
    await press(page, 'End', 'Zone 60')
    expect((await roomOf(page)).below).toBeGreaterThanOrEqual(4)
  })

  test.describe('under a finger', () => {
    test.use({ hasTouch: true, isMobile: true, viewport: { width: 320, height: 480 } })
    // Up to seventeen drags of twelve steps, each waiting for the fling to stop.
    test.describe.configure({ timeout: 90_000 })

    // A modal menu does not lock the page under a finger, so overscroll-contain alone keeps the drag in the menu.
    test('rows are 44 px, a drag scrolls the menu to its last row, and a drag past its end never moves the page', async ({ page }) => {
      const menu = await open(page, 'dropdown--sixty-items', { tall: true, by: 'tap' })
      expect((await pageLock(page)).overflow, 'the page is locked under a finger').toBe('visible')
      // A tap highlights no row, so the menu itself is the tab stop while it scrolls, and axe finds it reachable.
      await expect(menu).toHaveAttribute('tabindex', '0')
      expect((await axe(page)).violations).toEqual([])
      await expectInsideViewport(menu, 'the menu', 8)
      expect(await rowsOf(menu).evaluateAll((rows) => [...new Set(rows.map((row) => row.getBoundingClientRect().height))])).toEqual([44])
      // The cap still counts seven rows of 40 px, so under a finger it shows six and cuts the seventh.
      const frame = await boxOf(menu)
      expect(frame.height).toBe(280)
      for (let drag = 0; drag < 16 && (await scrollOf(menu)).left > 0; drag++) {
        await touchDrag(page, frame.left + 60, frame.bottom - 40, frame.top + 40)
      }
      expect((await scrollOf(menu)).left, 'px of menu still below').toBe(0)
      await touchDrag(page, frame.left + 60, frame.bottom - 40, frame.top + 40)
      expect(await scrollY(page), 'after a drag past the end of the menu').toBe(0)
      await expect(menu).toHaveAttribute('data-open', '')
    })
  })
})

test.describe('links', () => {
  const kinds = (menu: Locator) => rowsOf(menu).evaluateAll((rows) => rows.map((row) =>
    [row.tagName, row.getAttribute('href'), row.getAttribute('data-link'), row.getAttribute('role')].join(' ')))
  const hash = (page: Page) => page.evaluate(() => location.hash)

  test('a link item is an anchor with its address and the menuitem role, and through render it is the element given', async ({ page }) => {
    const menu = await open(page, 'dropdown--with-links')
    expect(await kinds(menu)).toEqual([
      'A #docs  menuitem', 'A #changelog  menuitem', 'A #support app menuitem', 'A https://example.com/status  menuitem',
    ])
    await expect(rowOf(menu, 'Contact support')).toHaveText('Contact support')
  })

  test('a press on a link follows it, closes the menu and hands the focus back; Enter does the same', async ({ page }) => {
    const menu = await open(page, 'dropdown--with-links')
    await rowOf(menu, 'Documentation').click()
    await closed(page)
    expect(await hash(page)).toBe('#docs')
    await expect(triggerOf(page, 'Help')).toBeFocused()

    await openOverlay(page, triggerOf(page, 'Help'), asMenu({ by: 'keyboard' }))
    await press(page, 'ArrowDown', 'Changelog')
    await page.keyboard.press('Enter')
    await closed(page)
    expect(await hash(page)).toBe('#changelog')
  })

  test('data-driven: each href row is the link element with the address of its item, a disabled one is no anchor, and the rows sit in a group named by the title', async ({ page }) => {
    const menu = await open(page, 'dropdown--data-driven')
    expect(await kinds(menu)).toEqual(['A #profile app menuitem', 'A #settings app menuitem', 'DIV   menuitem', 'DIV   menuitem'])
    await expect(page.getByRole('group', { name: 'Account' })).toHaveCount(1)
    await expect(rowOf(menu, 'Billing')).toHaveAttribute('aria-disabled', 'true')
    await rowOf(menu, 'Settings').click()
    await closed(page)
    expect(await hash(page)).toBe('#settings')
  })

  test('with a link element the rows keep their label, and with none a row is a plain anchor', async ({ page }) => {
    await fixture(page, 'dropdown-kinds', '#kinds')
    const linked = await openOverlay(page, triggerOf(page, 'Kinds', '#kinds'), asMenu())
    expect((await kinds(linked))[0]).toBe('A #linked app menuitem')
    await expect(rowsOf(linked).first()).toHaveText('A link')
    await page.keyboard.press('Escape')
    await closed(page)
    const plain = await openOverlay(page, triggerOf(page, 'Plain links', '#kinds'), asMenu())
    expect(await kinds(plain)).toEqual(['A #plain  menuitem'])
  })
})

test.describe('hostile content', () => {
  const SCOPE = '#hostile'
  /** What a row holds, part by part: its width, and whether its text is cut with an ellipsis. */
  const partsOf = (row: Locator) => row.evaluate((element) => [...element.children].map((part) => ({
    width: Math.round(part.getBoundingClientRect().width), cut: part.scrollWidth > part.clientWidth,
    inside: part.getBoundingClientRect().left >= element.getBoundingClientRect().left && part.getBoundingClientRect().right <= element.getBoundingClientRect().right,
  })))

  for (const [width, height, direction, widest] of [[1280, 800, 'ltr', 320], [320, 480, 'ltr', 289], [320, 480, 'rtl', 289]] as const) {
    const label = `${String(width)} x ${String(height)} ${direction}`

    test(`${label}: a 300-character label ends in an ellipsis, its icon and its shortcut stay whole, and the menu is ${String(widest)} px wide`, async ({ page }) => {
      await page.setViewportSize({ width, height })
      await fixture(page, 'dropdown-hostile', SCOPE, { direction })
      const menu = await openOverlay(page, triggerOf(page, 'Long labels', SCOPE), asMenu({ by: 'keyboard' }))
      await expectInsideViewport(menu, 'the menu', 8)
      await expectNoSidewaysScroll(page)
      await expectNothingSideways(menu)
      expect((await boxOf(menu)).width).toBe(widest)
      for (const index of [0, 1]) {
        const row = rowsOf(menu).nth(index)
        expect((await boxOf(row)).height).toBe(40)
        const [icon, text, shortcut] = await partsOf(row)
        expect(icon).toEqual({ width: 14, cut: false, inside: true })
        expect(text?.cut, 'the label is not cut').toBe(true)
        expect(shortcut).toEqual({ width: 56, cut: false, inside: true })
      }
      // The string itself is bounded too: 100 characters of the 300.
      expect(await rowsOf(menu).first().locator('span.min-w-0').evaluate((span) => span.textContent.length)).toBe(100)
      // A group label is no row: a 300-character word in one wraps inside the menu.
      const name = menu.locator('[role="group"] > :not([role])').first()
      expect((await boxOf(name)).height).toBeGreaterThan(40)
    })

    test(`${label}: a shortcut longer than its label is cut at its cap and never crowds the label out`, async ({ page }) => {
      await page.setViewportSize({ width, height })
      await fixture(page, 'dropdown-hostile', SCOPE, { direction })
      const menu = await openOverlay(page, triggerOf(page, 'Long shortcut', SCOPE), asMenu({ by: 'keyboard' }))
      await expectInsideViewport(menu, 'the menu', 8)
      await expectNoSidewaysScroll(page)
      await expectNothingSideways(menu)
      // 10rem, or half the room Base UI measured where that is less: 304 px on a 320 px screen less its gutter.
      const cap = widest === 320 ? 160 : 145
      const [go, goShortcut] = await partsOf(rowsOf(menu).first())
      expect(go).toEqual({ width: 18, cut: false, inside: true })
      expect(goShortcut).toEqual({ width: cap, cut: true, inside: true })
      const [text, shortcut] = await partsOf(rowsOf(menu).nth(1))
      expect(shortcut).toEqual({ width: cap, cut: true, inside: true })
      expect(text?.width, 'px left to the label').toBeGreaterThanOrEqual(96)
    })
  }

  test('a real shortcut beside a short label is never cut: the cap is a length, not a share of the row', async ({ page }) => {
    await fixture(page, 'dropdown-layouts', '#layouts')
    const menu = await openOverlay(page, triggerOf(page, 'In a grid track', '#layouts'), asMenu())
    const [text, shortcut] = await partsOf(rowOf(menu, 'Rename F2'))
    expect([text?.cut, shortcut?.cut]).toEqual([false, false])
    expect((await boxOf(menu)).width).toBe(192)
  })

  test('a row with an icon alone is named by its aria-label, and is a row like any other', async ({ page }) => {
    await fixture(page, 'dropdown-hostile', SCOPE)
    const menu = await openOverlay(page, triggerOf(page, 'Icon only', SCOPE), asMenu({ by: 'keyboard' }))
    await expect(menu.getByRole('menuitem', { name: 'Settings', exact: true })).toHaveCount(1)
    await expect(menu.getByRole('menuitem', { name: 'Delete', exact: true })).toHaveCount(1)
    expect(await rowsOf(menu).evaluateAll((rows) => rows.map((row) => row.getBoundingClientRect().height))).toEqual([40, 40])
    await press(page, 'ArrowDown', 'Delete')
    const results = await new AxeBuilder({ page }).include('[data-base-ui-portal]').analyze()
    expect(results.violations.map((violation) => violation.id)).toEqual([])
    expect(results.passes.map((pass) => pass.id)).toContain('aria-command-name')
  })

  test('320 x 480: elements where text is expected, and sixty groups, stay inside the menu, which scrolls to its last row', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 480 })
    await fixture(page, 'dropdown-hostile', SCOPE)
    const elements = await openOverlay(page, triggerOf(page, 'Elements', SCOPE), asMenu({ by: 'keyboard' }))
    await expectInsideViewport(elements, 'the menu of elements', 8)
    await expectNothingSideways(elements, 'the menu of elements')
    await expect(elements.locator('#block')).toBeVisible()
    await page.keyboard.press('Escape')
    await closed(page)

    const groups = await openOverlay(page, triggerOf(page, 'Sixty groups', SCOPE), asMenu({ by: 'keyboard' }))
    await expectInsideViewport(groups, 'the menu of sixty groups', 8)
    await expectNoSidewaysScroll(page)
    expect((await scrollOf(groups)).far).toBeGreaterThan(4000)
    await press(page, 'End', 'Row 60')
    expect((await roomOf(page)).below).toBeGreaterThanOrEqual(4)
    expect(await liveErrors(page)).toEqual([])
  })
})

/** The system colours Chromium paints under forced colours, for each palette. */
const SYSTEM = {
  light: { highlight: [55, 0, 110], gray: 'rgb(96, 0, 0)', text: 'rgb(0, 0, 0)', highlightText: 'rgb(255, 255, 255)' },
  dark: { highlight: [26, 235, 255], gray: 'rgb(63, 242, 63)', text: 'rgb(255, 255, 255)', highlightText: 'rgb(0, 0, 0)' },
} as const satisfies Record<string, { highlight: Rgb, gray: string, text: string, highlightText: string }>

/** Sixteen pixels of a row, at its end, where it holds no text: its fill and nothing else. */
async function fillOf(page: Page, row: Locator, direction: Direction = 'ltr'): Promise<Rgb[]> {
  const box = await boxOf(row)
  const x = direction === 'ltr' ? Math.floor(box.right) - 8 : Math.ceil(box.left) + 4
  return pixelsOf(page, { x, y: Math.floor(box.top) + 18, width: 4, height: 4 })
}

for (const scheme of ['light', 'dark'] as const) {
  test.describe(`forced colours, ${scheme} palette`, () => {
    test.use({ forcedColors: 'active', colorScheme: scheme })
    const { highlight, gray, text, highlightText } = SYSTEM[scheme]

    test('the highlighted row is a box of the system highlight with its label on it, and no other row is filled', async ({ page }) => {
      const menu = await open(page, 'dropdown--basic', { by: 'keyboard' })
      expect(await page.evaluate(() => matchMedia('(forced-colors: active)').matches)).toBe(true)
      await press(page, 'ArrowDown', 'Settings')
      expect(paintedIn(await fillOf(page, rowOf(menu, 'Settings')), highlight), 'pixels of highlight in the highlighted row').toBe(16)
      for (const name of ['Profile Ctrl P', 'Duplicate', 'Delete Del']) {
        expect(paintedIn(await fillOf(page, rowOf(menu, name)), FORCED_CANVAS[scheme]), `pixels of canvas in "${name}"`).toBe(16)
      }
      await expect(rowOf(menu, 'Settings')).toHaveCSS('color', highlightText)
      const label = await boxOf(rowOf(menu, 'Settings').locator('span.min-w-0'))
      const glyphs = await pixelsOf(page, { x: Math.floor(label.left), y: Math.floor(label.top), width: Math.ceil(label.width), height: Math.ceil(label.height) })
      expect(inkOn(glyphs, highlight), 'pixels of label at 3:1 on the highlight').toBeGreaterThan(40)
    })

    test('the shortcut of a highlighted row takes the colour of its row, and a highlighted danger row is repainted like any other', async ({ page }) => {
      const menu = await open(page, 'dropdown--basic', { by: 'keyboard' })
      await expect(rowOf(menu, 'Profile Ctrl P').locator('span.font-mono')).toHaveCSS('color', highlightText)
      await press(page, 'End', 'Delete')
      expect(paintedIn(await fillOf(page, rowOf(menu, 'Delete Del')), highlight)).toBe(16)
      await expect(rowOf(menu, 'Delete Del')).toHaveCSS('color', highlightText)
      await expect(rowOf(menu, 'Delete Del').locator('span.font-mono')).toHaveCSS('color', highlightText)
    })

    test('a disabled row is told from an enabled one by the grey of the system, at full strength', async ({ page }) => {
      const menu = await open(page, 'dropdown--basic', { by: 'keyboard' })
      await expect(rowOf(menu, 'Duplicate')).toHaveCSS('color', text)
      await expect(rowOf(menu, 'Rename')).toHaveCSS('color', gray)
      await expect(rowOf(menu, 'Rename').locator('span.min-w-0')).toHaveCSS('opacity', '1')
      const label = await boxOf(rowOf(menu, 'Rename').locator('span.min-w-0'))
      const glyphs = await pixelsOf(page, { x: Math.floor(label.left), y: Math.floor(label.top), width: Math.ceil(label.width), height: Math.ceil(label.height) })
      expect(paintedIn(glyphs, rgbOf(gray)), 'pixels of the label in the grey of the system').toBeGreaterThan(20)
      // The row the keyboard is on keeps the whole highlight, disabled or not: its fill is the focus mark.
      for (const lands of ['Settings', 'Duplicate', 'Rename']) await press(page, 'ArrowDown', lands)
      expect(paintedIn(await fillOf(page, rowOf(menu, 'Rename')), highlight)).toBe(16)
    })

    // Measured, not wished for: forced colours erase the red, so a danger row is its label and the caller's icon.
    test('a danger row at rest is painted like any other row: nothing but its label tells it apart', async ({ page }) => {
      const menu = await open(page, 'dropdown--basic', { by: 'keyboard' })
      await expect(rowOf(menu, 'Delete Del')).toHaveCSS('color', text)
      await expect(rowOf(menu, 'Duplicate')).toHaveCSS('color', text)
      expect(paintedIn(await fillOf(page, rowOf(menu, 'Delete Del')), FORCED_CANVAS[scheme])).toBe(16)
    })

    test('the menu keeps a line against the page on every side, and its separator is drawn', async ({ page }) => {
      const menu = await open(page, 'dropdown--basic', { edge: 'top' })
      const canvas = FORCED_CANVAS[scheme]
      const frame = await boxOf(menu)
      const [left, top, right, bottom] = [Math.floor(frame.left), Math.floor(frame.top), Math.ceil(frame.right), Math.ceil(frame.bottom)]
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
      const line = await boxOf(menu.locator('[role="separator"]'))
      const drawn = await pixelsOf(page, { x: Math.floor(line.left) + 8, y: Math.floor(line.top) - 2, width: 40, height: 5 })
      expect(inkOn(drawn, canvas), 'pixels of the separator at 3:1').toBeGreaterThanOrEqual(40)
    })
  })
}

test.describe('a disabled row keeps its focus mark', () => {
  for (const mode of MODES) {
    test(`${mode}: the row the keyboard is on is filled as any highlighted row is, and only what it holds is dimmed`, async ({ page }) => {
      const menu = await open(page, 'dropdown--basic', { mode, by: 'keyboard' })
      await press(page, 'ArrowDown', 'Settings')
      const enabled = await fillOf(page, rowOf(menu, 'Settings'))
      await press(page, 'ArrowDown', 'Duplicate')
      await press(page, 'ArrowDown', 'Rename')
      const disabled = rowOf(menu, 'Rename')
      expect(await fillOf(page, disabled)).toEqual(enabled)
      await expect(disabled).toHaveCSS('opacity', '1')
      await expect(disabled.locator('span.min-w-0')).toHaveCSS('opacity', '0.5')
      await expect(disabled).toHaveCSS('pointer-events', 'none')
    })
  }
})

test.describe('under a coarse pointer', () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } })

  for (const [demo, names] of OPEN) {
    test(`${demo}: the trigger is 44 px, and every row of each open menu is at least 44 px tall`, async ({ page }) => {
      await openLive(page, demo)
      for (const name of names) {
        const trigger = triggerOf(page, name)
        const box = await boxOf(trigger)
        expect(Math.min(box.width, box.height), `the trigger "${name}"`).toBeGreaterThanOrEqual(44)
        const menu = await openOverlay(page, trigger, asMenu({ by: 'tap' }))
        const heights = await rowsOf(menu).evaluateAll((rows) => rows.map((row) => row.getBoundingClientRect().height))
        expect(heights.length).toBeGreaterThan(0)
        expect(Math.min(...heights), `the shortest row of "${name}"`).toBeGreaterThanOrEqual(44)
        await page.keyboard.press('Escape')
        await closed(page)
      }
    })
  }

  test('a row the root or the density makes taller than 44 px keeps its height: a finger raises a row, never shortens it', async ({ page }) => {
    await openLive(page, 'dropdown--basic')
    const shortest = async () => {
      const menu = await openOverlay(page, triggerOf(page, 'Actions'), asMenu({ by: 'tap' }))
      const heights = await rowsOf(menu).evaluateAll((rows) => rows.map((row) => row.getBoundingClientRect().height))
      await page.keyboard.press('Escape')
      await closed(page)
      return Math.min(...heights)
    }
    await page.evaluate(() => { document.documentElement.style.fontSize = '32px' })
    expect(await shortest()).toBeGreaterThanOrEqual(80)
    await page.evaluate(() => { document.documentElement.style.fontSize = ''; document.documentElement.style.setProperty('--tc-density', '1.25') })
    expect(await shortest()).toBeGreaterThanOrEqual(50)
  })

  test('a tap puts the focus on the menu itself, and a tap on a row runs it', async ({ page }) => {
    await fixture(page, 'dropdown-kinds', '#kinds')
    const menu = await openOverlay(page, triggerOf(page, 'Kinds', '#kinds'), asMenu({ by: 'tap' }))
    await expect(menu).toBeFocused()
    await rowOf(menu, 'A handler').tap()
    await closed(page)
    await expect(page.locator('#selected')).toHaveText('1')
  })
})

test.describe('a larger text', () => {
  // Text-only zoom: the root at 32 px doubles every rem, and the 12rem floor of the menu would be 384 px on a 390 px phone.
  test('390 x 844 with the root at 32 px: the menu narrows to the screen, its rows double, and nothing is cut or scrolls sideways', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await openLive(page, 'dropdown--basic')
    await page.addStyleTag({ content: 'html { font-size: 32px }' })
    const menu = await openOverlay(page, triggerOf(page, 'Actions'), asMenu())
    await expectInsideViewport(menu, 'the menu', 8)
    await expectNoSidewaysScroll(page)
    await expectNothingSideways(menu)
    // The screen less its gutter and 8 px on each side.
    expect((await boxOf(menu)).width).toBe(359)
    expect((await boxOf(rowsOf(menu).first())).height).toBe(80)
    await expect(rowsOf(menu).first()).toHaveCSS('font-size', '28px')
    const cut = await menu.evaluate((el) => [...el.querySelectorAll('span')].filter((span) => span.scrollWidth > span.clientWidth + 1).length)
    expect(cut, 'labels and shortcuts wider than their box').toBe(0)
  })

  // WCAG 1.4.12: the four spacings a reader may set, all at once.
  test('320 x 480 with the text spacing of WCAG 1.4.12: no label and no shortcut is cut, and nothing scrolls sideways', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 480 })
    await openLive(page, 'dropdown--basic')
    await page.addStyleTag({ content: '* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important }' })
    const menu = await openOverlay(page, triggerOf(page, 'Actions'), asMenu())
    await expectInsideViewport(menu, 'the menu', 8)
    await expectNoSidewaysScroll(page)
    await expectNothingSideways(menu)
    const cut = await menu.evaluate((el) => [...el.querySelectorAll('span')].filter((span) => span.scrollWidth > span.clientWidth + 1).length)
    expect(cut, 'labels and shortcuts wider than their box').toBe(0)
  })
})

test.describe('each value of modal', () => {
  const SCOPE = '#modal-values'
  const after = (page: Page) => triggerOf(page, 'After', SCOPE)
  const layers = (page: Page) => page.locator('[data-base-ui-portal] > [data-base-ui-inert]')

  /** Opens one menu of the fixture on a page three screens high and presses the middle of the page button beside it. */
  async function behind(page: Page, name: string) {
    await fixture(page, 'dropdown-kinds', SCOPE, { tall: true })
    const trigger = triggerOf(page, name, SCOPE)
    const menu = await openOverlay(page, trigger, asMenu())
    const lock = await pageLock(page)
    const count = await layers(page).count()
    await wheelAt(page, 900, 600, 300)
    const scrolled = await scrollY(page)
    const follows = scrolled === 0 ? null : sideOf(await boxOf(menu), await boxOf(trigger))
    await page.evaluate(() => { window.scrollTo(0, 0) })
    const box = await boxOf(after(page))
    await page.mouse.click(box.left + box.width / 2, box.top + box.height / 2)
    await closed(page)
    return { layers: count, overflow: lock.overflow, read: lock.reachable.includes('main'), scrolled, follows, presses: await page.locator('#presses').textContent() }
  }

  test('true, the default: the page behind does not scroll and takes no press, yet nothing dims it and a screen reader still reads it', async ({ page }) => {
    expect(await behind(page, 'modal')).toEqual({ layers: 1, overflow: 'hidden', read: true, scrolled: 0, follows: null, presses: '0' })
    // That press landed on Base UI's own layer and only closed the menu: focus is back on its trigger.
    await expect(triggerOf(page, 'modal', SCOPE)).toBeFocused()
  })

  test('the layer that blocks the page under a modal menu paints nothing', async ({ page }) => {
    await fixture(page, 'dropdown-kinds', SCOPE)
    await openOverlay(page, triggerOf(page, 'modal', SCOPE), asMenu())
    await expect(layers(page)).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
    await expect(layers(page)).toHaveCSS('position', 'fixed')
  })

  test('false: the page scrolls and takes the press, and the menu follows its trigger, still 6 px under it', async ({ page }) => {
    expect(await behind(page, 'not modal')).toEqual({
      layers: 0, overflow: 'visible', read: true, scrolled: 300, follows: { where: 'below', gap: 6 }, presses: '1',
    })
  })

  test('false: once its trigger has scrolled off the screen the menu is hidden with it, and it is back when the trigger is', async ({ page }) => {
    await fixture(page, 'dropdown-kinds', SCOPE, { tall: true })
    const menu = await openOverlay(page, triggerOf(page, 'not modal', SCOPE), asMenu())
    await wheelAt(page, 900, 600, 600)
    await expect(menu).toBeHidden()
    await expect(menu.locator('..')).toHaveAttribute('data-anchor-hidden', '')
    await wheelAt(page, 900, 600, -600)
    await expect(menu).toBeVisible()
    await page.keyboard.press('Escape')
    await closed(page)
  })

  for (const direction of DIRECTIONS) {
    // Playwright hides scrollbars in headless Chromium: a page with no bar cannot shift when a modal menu locks it.
    withScrollbar(`${direction}, with a real scrollbar: the page keeps its gutter while the menu is open, so a trigger at the far edge does not move`, async ({ barPage }) => {
      await openLive(barPage, 'dropdown--basic', { direction, tall: true, edge: 'end' })
      const trigger = triggerOf(barPage, 'Actions')
      const bar = await barPage.evaluate(() => window.innerWidth - document.documentElement.clientWidth)
      expect(bar, 'px of scrollbar').toBeGreaterThan(0)
      const before = await boxOf(trigger)
      await openOverlay(barPage, trigger, asMenu())
      expect((await pageLock(barPage)).overflow).toBe('hidden')
      expect(await boxOf(trigger)).toEqual(before)
      expect(await barPage.evaluate(() => document.body.clientWidth)).toBe(1280 - bar)
    })
  }

  test.describe('opened by a finger', () => {
    test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } })

    // Base UI's own rule for touch: a modal menu narrower than the screen leaves the page to the finger.
    test('true blocks a tap on the page but does not lock its scroll', async ({ page }) => {
      await fixture(page, 'dropdown-kinds', SCOPE, { tall: true })
      await openOverlay(page, triggerOf(page, 'modal', SCOPE), asMenu({ by: 'tap' }))
      await expect(layers(page)).toHaveCount(1)
      expect((await pageLock(page)).overflow).toBe('visible')
      await after(page).tap({ force: true })
      await closed(page)
      await expect(page.locator('#presses')).toHaveText('0')
    })
  })
})

test.describe('one Escape closes one layer', () => {
  const dialogs = (page: Page) => page.locator('[role="dialog"][data-open]')
  const tooltip = (page: Page) => page.locator('[data-placement][data-open]:not([role])')

  /** Opens the dialog of the in-dialog demo and then the menu inside it, both from the keyboard. */
  async function openRole(page: Page, options: LiveOptions = {}): Promise<Locator> {
    await openLive(page, 'dropdown--in-dialog', options)
    await openOverlay(page, triggerOf(page, 'Invite people'), { by: 'keyboard' })
    return openOverlay(page, triggerOf(page, 'Role', 'body'), asMenu({ by: 'keyboard' }))
  }

  for (const direction of DIRECTIONS) {
    test(`${direction}: a menu inside a dialog closes first, with the focus back on its trigger in the dialog, and the dialog on the next press`, async ({ page }) => {
      await openRole(page, { direction })
      await expect.poll(() => focusedRow(page)).toBe('Viewer')
      await page.keyboard.press('Escape')
      await closed(page)
      await expect(dialogs(page)).toHaveCount(1)
      await expect(triggerOf(page, 'Role', 'body')).toBeFocused()
      await page.keyboard.press('Escape')
      await expectClosed(page)
      await expect(triggerOf(page, 'Invite people')).toBeFocused()
      expect(await liveErrors(page)).toEqual([])
    })
  }

  for (const screen of [SCREENS[0], SCREENS[3]]) {
    test(`${String(screen.width)} x ${String(screen.height)}: the menu opens above the dialog, whole, 6 px off its trigger`, async ({ page }) => {
      await page.setViewportSize(screen)
      const menu = await openRole(page)
      await expectInsideViewport(menu, 'the menu', 8)
      await expectNoSidewaysScroll(page)
      expect(sideOf(await boxOf(menu), await boxOf(triggerOf(page, 'Role', 'body')))?.gap).toBe(6)
      // The popup layer is above the dialog layer: what is painted at a row of the menu is that row.
      const row = await boxOf(rowsOf(menu).first())
      expect(await page.evaluate(([x, y]) => document.elementFromPoint(x ?? 0, y ?? 0)?.closest('[role]')?.getAttribute('role'), [row.left + 20, row.top + 20])).toBe('menuitem')
    })
  }

  // Base UI's tooltip is outside its tree of popups: without the guard one Escape would close it and the menu.
  for (const path of ['hover', 'focus'] as const) {
    test(`a tooltip on a row, opened by ${path}: the first Escape closes the tooltip, the second the menu`, async ({ page }) => {
      await fixture(page, 'dropdown-kinds', '#nested')
      const menu = await openOverlay(page, triggerOf(page, 'Tooltip inside', '#nested'), asMenu({ by: 'keyboard' }))
      if (path === 'hover') await rowOf(menu, 'Transfer').hover()
      else await press(page, 'ArrowDown', 'Transfer')
      await expect(tooltip(page)).toHaveText('Only the owner can transfer it')

      await page.keyboard.press('Escape')
      await expect(tooltip(page)).toHaveCount(0)
      await expect(openMenus(page)).toHaveCount(1)
      await page.keyboard.press('Escape')
      await closed(page)
      await expect(triggerOf(page, 'Tooltip inside', '#nested')).toBeFocused()
    })
  }

  test('a menu the pointer opened inside a dialog: the dialog stays open under it, and Escape closes the menu first', async ({ page }) => {
    await fixture(page, 'dropdown-kinds', '#nested')
    await openOverlay(page, triggerOf(page, 'Dialog', '#nested'), { by: 'keyboard' })
    await triggerOf(page, 'By hover', 'body').hover()
    await expect(openMenus(page)).toHaveCount(1)
    await expect(dialogs(page)).toHaveCount(1)
    await page.keyboard.press('Escape')
    await closed(page)
    await expect(dialogs(page)).toHaveCount(1)
    await page.keyboard.press('Escape')
    await expectClosed(page)
  })
})

test.describe('where a real page puts a trigger', () => {
  const SCOPE = '#layouts'
  const PLACES = ['In a sticky header', 'In a table cell', 'In a box that clips', 'In a grid track', 'In a flex-1 column', 'In a w-fit parent']

  for (const screen of [SCREENS[0], SCREENS[3]]) {
    for (const direction of DIRECTIONS) {
      test(`${String(screen.width)} x ${String(screen.height)} ${direction}: from each place the menu is whole, 6 px off its trigger and above the page`, async ({ page }) => {
        await page.setViewportSize(screen)
        await fixture(page, 'dropdown-layouts', SCOPE, { direction })
        for (const name of PLACES) {
          const trigger = triggerOf(page, name, SCOPE)
          await trigger.scrollIntoViewIfNeeded()
          const menu = await openOverlay(page, trigger, asMenu())
          await expectInsideViewport(menu, `the menu of "${name}"`, 8)
          await expectNoSidewaysScroll(page)
          const side = sideOf(await boxOf(menu), await boxOf(trigger))
          expect(Math.abs((side?.gap ?? 99) - 6), `"${name}" is ${String(side?.gap)} px from its trigger`).toBeLessThanOrEqual(1)
          const row = await boxOf(rowsOf(menu).first())
          const painted = await page.evaluate(([x, y]) => document.elementFromPoint(x ?? 0, y ?? 0)?.closest('[role]')?.getAttribute('role'), [row.left + row.width / 2, row.top + 20])
          expect(painted, `what is painted where the menu of "${name}" is`).toBe('menuitem')
          await page.keyboard.press('Escape')
          await closed(page)
        }
      })
    }
  }

  test('in a box that scrolls and clips: the menu is outside the box, and hides once the box has scrolled its trigger away', async ({ page }) => {
    await fixture(page, 'dropdown-layouts', SCOPE)
    const trigger = triggerOf(page, 'In a box that clips', SCOPE)
    const menu = await openOverlay(page, trigger, asMenu())
    const clip = await boxOf(page.locator('#clip'))
    expect((await boxOf(menu)).bottom, 'the menu is clipped by the box').toBeGreaterThan(clip.bottom)
    await page.locator('#clip').evaluate((box) => { box.scrollTop = 300 })
    await expect(menu).toBeHidden()
    await page.locator('#clip').evaluate((box) => { box.scrollTop = 0 })
    await expect(menu).toBeVisible()
  })

  /** What a menu must inherit from each page when no provider tells it, written out. */
  const INHERITED = {
    ltr: { direction: 'ltr', arabic: false, english: true, startEdge: 'left' },
    rtl: { direction: 'rtl', arabic: true, english: false, startEdge: 'right' },
  } as const

  // R-13-1 asks for the provider and the harness always mounts one, so this menu comes from a fixture module.
  for (const direction of DIRECTIONS) {
    test(`with no provider at all, on the ${direction} page: nothing is stamped on the positioner, and the menu is laid out as its page is`, async ({ page }) => {
      await fixture(page, 'dropdown-layouts', '#no-provider', { direction })
      const trigger = triggerOf(page, 'No provider', '#no-provider')
      await trigger.scrollIntoViewIfNeeded()
      const menu = await openOverlay(page, trigger, asMenu())
      const read = await menu.evaluate((element) => ({
        dir: element.parentElement?.getAttribute('dir') ?? null,
        lang: element.parentElement?.getAttribute('lang') ?? null,
        direction: getComputedStyle(element).direction,
        arabic: element.matches(':lang(ar)'),
        english: element.matches(':lang(en)'),
      }))
      const { startEdge, ...inherited } = INHERITED[direction]
      expect(read).toEqual({ dir: null, lang: null, ...inherited })
      // Floating UI reads the same inherited direction, so bottom-start is the page's start edge of the trigger.
      expect(Math.abs((await boxOf(menu))[startEdge] - (await boxOf(trigger))[startEdge])).toBeLessThanOrEqual(1)
      expect(await liveErrors(page)).toEqual([])
    })
  }
})

test.describe('direction', () => {
  /** How far the icon and the shortcut of the first row are from the two edges of that row. */
  async function layoutOf(menu: Locator) {
    const row = rowsOf(menu).first()
    const [frame, icon, shortcut] = [await boxOf(row), await boxOf(row.locator('span[aria-hidden]')), await boxOf(row.locator('span.font-mono'))]
    return {
      iconFromLeft: icon.left - frame.left, iconFromRight: frame.right - icon.right,
      shortcutFromLeft: shortcut.left - frame.left, shortcutFromRight: frame.right - shortcut.right,
    }
  }

  test('ltr: the icon is at the left of its row and the shortcut at the right', async ({ page }) => {
    expect(await layoutOf(await open(page, 'dropdown--basic'))).toMatchObject({ iconFromLeft: 12, shortcutFromRight: 12 })
  })

  test('rtl: the icon is at the right of its row and the shortcut at the left', async ({ page }) => {
    expect(await layoutOf(await open(page, 'dropdown--basic', { direction: 'rtl' }))).toMatchObject({ iconFromRight: 12, shortcutFromLeft: 12 })
  })

  // The demo mounts its own RTL provider, so on an LTR page its portal sits in a <body> of the other direction.
  test('an RTL island on an LTR page lays its menu out right to left, in Arabic, and opens it at the right edge of its trigger', async ({ page }) => {
    await openLive(page, 'dropdown--rtl', { direction: 'ltr', edge: 'top' })
    const trigger = triggerOf(page, 'الإجراءات')
    const menu = await openOverlay(page, trigger, asMenu())
    expect(Math.abs((await boxOf(menu)).right - (await boxOf(trigger)).right), 'bottom-start is not aligned to the right edge').toBeLessThanOrEqual(1)
    expect(await layoutOf(menu)).toMatchObject({ iconFromRight: 12, shortcutFromLeft: 12 })
    const read = await menu.evaluate((element) => ({
      body: getComputedStyle(document.body).direction,
      positioner: getComputedStyle(element.parentElement ?? element).direction,
      menu: getComputedStyle(element).direction,
      page: document.documentElement.lang,
      lang: element.parentElement?.getAttribute('lang') ?? null,
      own: element.getAttribute('lang'),
      arabic: element.matches(':lang(ar)'),
    }))
    expect(read).toEqual({ body: 'ltr', positioner: 'rtl', menu: 'rtl', page: 'en', lang: 'ar', own: null, arabic: true })
  })
})

test('the stylesheet already holds the classes of a menu nothing has rendered yet', async ({ page }) => {
  const menu = await open(page, 'dropdown--basic', { edge: 'top' })
  const styles = await menu.evaluate((element) => {
    const own = getComputedStyle(element)
    const row = getComputedStyle(element.querySelector('[role="menuitem"]') ?? element)
    const shortcut = getComputedStyle(element.querySelector('span.font-mono') ?? element)
    const line = getComputedStyle(element.querySelector('[role="separator"]') ?? element)
    return {
      minWidth: own.minWidth, maxWidth: own.maxWidth, maxHeight: own.maxHeight, padding: own.paddingTop, gap: own.rowGap,
      radius: own.borderRadius, edge: own.borderTopWidth, raised: own.boxShadow !== 'none', wrap: own.overflowWrap,
      scrolls: `${own.overflowY} ${own.overscrollBehaviorY}`, layer: getComputedStyle(element.parentElement ?? element).zIndex,
      row: `${row.minHeight} ${row.fontSize} ${row.paddingInlineStart} ${row.columnGap} ${row.borderRadius} ${row.cursor} ${row.userSelect} ${row.flexShrink}`,
      shortcut: `${shortcut.fontSize} ${shortcut.maxWidth} ${shortcut.paddingInlineStart} ${shortcut.flexShrink} ${shortcut.textOverflow}`,
      line: `${line.marginTop} ${line.borderTopWidth} ${line.flexShrink}`,
    }
  })
  // 12rem and 20rem, seven rows, p-1.5, gap-0.5, rounded-box, the line, shadow-lg, wrap-anywhere, SCROLL_AREA, --tc-z-popup.
  expect(styles).toEqual({
    minWidth: '192px', maxWidth: '320px', maxHeight: '280px', padding: '6px', gap: '2px', radius: '12px', edge: '1px',
    raised: true, wrap: 'anywhere', scrolls: 'auto contain', layer: '60',
    row: '40px 14px 12px 8px 8px default none 0', shortcut: '12px 160px 16px 0 ellipsis', line: '4px 1px 0',
  })
})

test.describe('motion', () => {
  const durations = (menu: Locator) => menu.evaluate((element) => ({
    menu: getComputedStyle(element).transitionDuration, animated: getComputedStyle(element).transitionProperty,
  }))

  test('the menu takes 150 ms to come and go, and grows from the side that faces its trigger', async ({ page }) => {
    const menu = await open(page, 'dropdown--basic', { edge: 'top' })
    expect(await durations(menu)).toEqual({ menu: '0.15s', animated: 'opacity, scale' })
    // Under a trigger: the origin is on the top edge, 6 px above the menu.
    expect(await menu.evaluate((el) => getComputedStyle(el).transformOrigin.split(' ')[1])).toBe('-6px')
  })

  test.describe('reduced', () => {
    test.use({ reducedMotion: 'reduce' })

    test('with prefers-reduced-motion the menu still opens and closes, in no time at all', async ({ page }) => {
      const menu = await open(page, 'dropdown--basic', { by: 'keyboard' })
      expect(await durations(menu)).toEqual({ menu: '0s', animated: 'opacity, scale' })
      await expect(menu).toHaveCSS('opacity', '1')
      await expect(menu).toHaveCSS('scale', 'none')
      await page.keyboard.press('Escape')
      await closed(page)
      await expect(triggerOf(page, 'Actions')).toBeFocused()
      // And again: a menu that never left its ending style would not come back.
      await page.keyboard.press('Enter')
      await expect(openMenus(page)).toHaveCSS('opacity', '1')
    })
  })
})

/** axe on the demo and on the portals its menu opens in. Not on the shell of the harness page. */
async function axe(page: Page): Promise<{ violations: string[], passes: string[] }> {
  // Base UI's focus guards are aria-hidden with tabindex 0 while a menu is open, and pass the focus on at once.
  const results = await new AxeBuilder({ page }).include('#demo').include('[data-base-ui-portal]').exclude('[data-base-ui-focus-guard]').analyze()
  return {
    violations: results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`),
    passes: results.passes.map((pass) => pass.id),
  }
}

/** Opens the first menu of a demo from the keyboard, so its first row is highlighted: through its dialog where it has one. */
async function openForAxe(page: Page, demo: string, options: LiveOptions & OpenOptions): Promise<Locator> {
  if (demo !== 'dropdown--in-dialog') return open(page, demo, options)
  await openLive(page, demo, options)
  await openOverlay(page, triggerOf(page, 'Invite people'), options)
  return openOverlay(page, triggerOf(page, 'Role', 'body'), asMenu(options))
}

test.describe('axe on the open menu', () => {
  test.describe.configure({ timeout: 90_000 })

  for (const demo of Object.keys(MENUS)) {
    for (const direction of DIRECTIONS) {
      test(`${demo} ${direction}: no violation in any of the three modes, in the menu or in the demo behind it`, async ({ page }) => {
        for (const mode of MODES) {
          await openForAxe(page, demo, { mode, direction, by: 'keyboard' })
          const results = await axe(page)
          expect(results.violations, mode).toEqual([])
          // Not an empty run: axe did read the rows of the menu.
          // A row that is a real anchor is named under the rule for links.
          expect(results.passes, mode).toContain(demo === 'dropdown--with-links' ? 'link-name' : 'aria-command-name')
          expect(results.passes, mode).toContain('aria-required-parent')
        }
      })
    }
  }
})

test.describe('axe on the open menu, on a 320 x 480 phone', () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 320, height: 480 } })

  for (const demo of Object.keys(MENUS)) {
    test(`${demo}: no violation`, async ({ page }) => {
      const menu = await openForAxe(page, demo, { by: 'tap' })
      await expectInsideViewport(menu, 'the menu', 8)
      expect((await axe(page)).violations).toEqual([])
    })
  }
})
