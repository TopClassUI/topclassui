import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Locator, type Page } from '@playwright/test'

import { DIRECTIONS, MODES } from '../scripts/lib/harness.js'
import { EDGES } from '../scripts/lib/live-harness.js'
import { TARGETS } from '../scripts/lib/targets.js'
import { serverEntries } from './form.js'
import { type LiveOptions, expectInsideViewport, expectNoSidewaysScroll, liveErrors, openLive } from './live.js'
import { type Box, OPENED, atRest, boxOf, expectClosed, expectNothingSideways, openOverlay } from './overlay.js'
import { urlFor } from './pages.js'
import { FORCED_CANVAS, contrast, inkOn, pixelsOf, rgbOf } from './pixels.js'

// What happy-dom cannot lay out or open: the trigger's box and width, the list beside it at every edge, the keys in a
// real browser, the page behind, forced colours, the screens, and the form, before hydration and after a reset.

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const
const NAMES = { xs: 'Extra small', sm: 'Small', md: 'Medium', lg: 'Large', xl: 'Extra large' } as const
const SCREENS = [{ width: 320, height: 480 }, { width: 390, height: 844 }, { width: 844, height: 390 }, { width: 1280, height: 800 }] as const
const DEMOS = ['basic', 'form', 'four-rows', 'long-content', 'phase-4-form', 'rtl', 'sixty-items', 'sizes', 'states'].map((demo) => `select--${demo}`)
const COARSE = { hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } } as const
/** The listbox has no data-open of its own: the popup around it carries the placement and the state. */
const POPUP = '[data-placement]'

const combo = (page: Page, name?: string) => (name === undefined ? page.locator('#demo [role="combobox"]').first() : page.getByRole('combobox', { name, exact: true }))
const css = (element: Locator, property: string) => element.evaluate((el, name) => getComputedStyle(el).getPropertyValue(name), property)
const focusedText = (page: Page) => page.evaluate(() => document.activeElement?.textContent ?? '')
const hiddenValue = (page: Page, scope = '#demo') => page.locator(`${scope} input[aria-hidden="true"]`).first().inputValue()
const openList = (page: Page, trigger: Locator, by: 'click' | 'keyboard' | 'tap' = 'click') => openOverlay(page, trigger, { by, popup: POPUP })

/** The colour a value resolves to on this page: a token, or a system colour painted as it is. */
const resolve = (page: Page, value: string) => page.evaluate((colour) => {
  const probe = document.createElement('span')
  probe.style.setProperty('forced-color-adjust', 'none')
  probe.style.backgroundColor = colour
  document.body.appendChild(probe)
  return getComputedStyle(probe).backgroundColor
}, value)

type Where = 'above' | 'below' | 'left' | 'right'
/** The side of the trigger a popup lies on, and the gap between the two. Null while they overlap. */
function sideOf(popup: Box, trigger: Box): { where: Where, gap: number } | null {
  if (popup.bottom <= trigger.top) return { where: 'above', gap: trigger.top - popup.bottom }
  if (popup.top >= trigger.bottom) return { where: 'below', gap: popup.top - trigger.bottom }
  if (popup.right <= trigger.left) return { where: 'left', gap: trigger.left - popup.right }
  if (popup.left >= trigger.right) return { where: 'right', gap: popup.left - trigger.right }
  return null
}

/** Loads a fixture module into a plain live page and waits for its first trigger. */
async function fixture(page: Page, file: string, options: LiveOptions = {}): Promise<void> {
  await openLive(page, 'separator--horizontal', options)
  await page.addScriptTag({ type: 'module', url: `/e2e/fixtures/${file}.tsx` })
  await expect(page.locator('[role="combobox"]').first()).toBeVisible()
}

test.describe('the static page: the server HTML, before any script runs', () => {
  test.use({ reducedMotion: 'reduce' })

  const FINE = { xs: [165.6, 28], sm: [193.2, 32], md: [193.2, 40], lg: [220.8, 48], xl: [220.8, 56] }
  const sizes = async (page: Page) => {
    const out: Record<string, number[]> = {}
    for (const size of SIZES) { const box = await boxOf(combo(page, NAMES[size])); out[size] = [box.width, box.height] }
    return out
  }

  for (const direction of DIRECTIONS) {
    test(`${direction}: at each size the trigger is as wide as an Input of that size, and as tall as a control`, async ({ page }) => {
      await page.goto(urlFor('select--sizes', 'light', direction))
      expect(await sizes(page)).toEqual(FINE)
    })
  }

  test.describe('under a coarse pointer', () => {
    test.use(COARSE)

    test('every trigger is at least 44 px tall, and its text is 16 px, so the width is an Input\'s of 16 px', async ({ page }) => {
      await page.goto(urlFor('select--sizes', 'light', 'ltr'))
      expect(await sizes(page)).toEqual({ xs: [220.8, 44], sm: [220.8, 44], md: [220.8, 44], lg: [220.8, 48], xl: [220.8, 56] })
      for (const size of SIZES) expect(await css(combo(page, NAMES[size]), 'font-size'), size).toBe('16px')
    })
  })

  test('select--form sends country=jo, and the target spec measures the trigger and the button, not the hidden input', async ({ page }) => {
    await page.goto(urlFor('select--form', 'light', 'ltr'))
    expect(await serverEntries(page)).toEqual([['country', 'jo']])
    expect(await page.locator(`#demo :is(${TARGETS})`).evaluateAll((all) => all.map((el) => el.getAttribute('role') ?? el.tagName)))
      .toEqual(['combobox', 'BUTTON'])
  })

  for (const direction of DIRECTIONS) {
    test(`${direction}: Tab stops on the trigger, the one stop, and the next Tab goes on`, async ({ page }) => {
      await page.goto(urlFor('select--form', 'light', direction))
      await page.keyboard.press('Tab')
      await expect(combo(page)).toBeFocused()
      await page.keyboard.press('Tab')
      expect(await page.evaluate(() => document.activeElement?.getAttribute('type'))).toBe('submit')
    })
  }

  test('the states: the placeholder is muted, invalid is red and 2 px, disabled is dimmed, read-only takes the soft fill', async ({ page }) => {
    await page.goto(urlFor('select--states', 'light', 'ltr'))
    const danger = await resolve(page, 'var(--tc-danger-solid)')
    expect(await css(combo(page, 'Nothing chosen').locator('span').first(), 'color')).toBe(await resolve(page, 'var(--tc-muted)'))
    expect(await css(combo(page, 'Invalid'), 'border-top-color')).toBe(danger)
    expect(await css(combo(page, 'Invalid'), 'box-shadow')).toContain(`${danger} 0px 0px 0px 1px inset`)
    expect(await css(combo(page, 'Disabled'), 'opacity')).toBe('0.5')
    expect(await css(combo(page, 'Read-only'), 'background-color')).toBe(await resolve(page, 'var(--tc-neutral-soft)'))
    expect(await css(combo(page, 'Nothing chosen'), 'background-color')).toBe(await resolve(page, 'var(--tc-surface-raised)'))
  })

  for (const scheme of ['light', 'dark'] as const) {
    test(`forced colours, ${scheme}: the trigger keeps a line at 3:1 on every side, and invalid thickens it to 2 px`, async ({ page }) => {
      await page.emulateMedia({ forcedColors: 'active', colorScheme: scheme })
      await page.goto(urlFor('select--states', 'light', 'ltr'))
      const canvas = FORCED_CANVAS[scheme]
      const box = await boxOf(combo(page, 'Nothing chosen'))
      const middle = Math.round(box.top + box.height / 2)
      const left = await pixelsOf(page, { x: Math.floor(box.left), y: middle, width: 3, height: 1 })
      expect(inkOn(left, canvas), 'line pixels at 3:1 on the inline-start edge').toBeGreaterThan(0)
      expect(contrast(rgbOf(await css(combo(page, 'Nothing chosen'), 'border-top-color')), canvas)).toBeGreaterThanOrEqual(3)
      expect(await css(combo(page, 'Invalid'), 'border-top-width')).toBe('2px')
      expect(await css(combo(page, 'Nothing chosen'), 'border-top-width')).toBe('1px')
    })
  }

  for (const scheme of ['light', 'dark'] as const) {
    for (const direction of DIRECTIONS) {
      test(`forced colours, ${scheme} ${direction}: a read-only trigger is told by a dashed line, which every other state keeps solid`, async ({ page }) => {
        await page.emulateMedia({ forcedColors: 'active', colorScheme: scheme })
        await page.goto(urlFor('select--states', 'light', direction))
        const line = (name: string) => combo(page, name).evaluate((el) => {
          const style = getComputedStyle(el)
          return [style.borderTopStyle, style.borderInlineStartStyle, style.borderBottomStyle, style.borderInlineEndStyle, style.borderTopWidth].join(' ')
        })
        expect(await line('Read-only')).toBe('dashed dashed dashed dashed 1px')
        for (const name of ['Nothing chosen', 'Disabled']) expect(await line(name), name).toBe('solid solid solid solid 1px')
        expect(await line('Invalid')).toBe('solid solid solid solid 2px')
        const topEdge = async (name: string) => {
          const box = await boxOf(combo(page, name))
          const row = await pixelsOf(page, { x: Math.round(box.left + 8), y: Math.floor(box.top), width: Math.round(box.width - 16), height: 1 })
          return [inkOn(row, FORCED_CANVAS[scheme]), row.length]
        }
        const [plain, length] = await topEdge('Nothing chosen')
        expect(plain, 'the plain line is whole').toBe(length)
        const [dashed] = await topEdge('Read-only')
        expect(dashed, 'the dashes are drawn').toBeGreaterThan(0)
        expect(dashed, 'the dashes leave gaps').toBeLessThan((length ?? 0) * 0.8)
      })
    }
  }

  test('forced colours, after hydration: the read-only line is still dashed, and the list still opens', async ({ page }) => {
    await page.emulateMedia({ forcedColors: 'active' })
    await openLive(page, 'select--states')
    expect(await css(combo(page, 'Read-only'), 'border-top-style')).toBe('dashed')
    await openList(page, combo(page, 'Read-only'))
    expect(await css(combo(page, 'Read-only'), 'border-top-style')).toBe('dashed')
    expect(await liveErrors(page)).toEqual([])
  })

  test('outside forced colours the read-only line stays solid: the soft fill tells it there', async ({ page }) => {
    await page.goto(urlFor('select--states', 'light', 'ltr'))
    expect(await css(combo(page, 'Read-only'), 'border-top-style')).toBe('solid')
  })

  for (const direction of DIRECTIONS) {
    for (const screen of SCREENS) {
      test(`${direction} ${String(screen.width)} x ${String(screen.height)}: no demo scrolls the page sideways`, async ({ page }) => {
        await page.setViewportSize(screen)
        for (const demo of DEMOS) {
          await page.goto(urlFor(demo, 'light', direction))
          await expectNoSidewaysScroll(page)
        }
      })
    }
  }

  test('text zoom: at a root of 32 px the trigger grows with its text and the page does not scroll sideways at 320 px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 480 })
    await page.goto(urlFor('select--long-content', 'light', 'ltr'))
    await page.evaluate(() => { document.documentElement.style.fontSize = '32px' })
    const box = await boxOf(combo(page))
    expect(box.height).toBe(80)
    expect(box.right).toBeLessThanOrEqual(320)
    await expectNoSidewaysScroll(page)
  })

  test('WCAG 1.4.12 spacing: the trigger keeps its text on one line, cut by an ellipsis, and its height', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 480 })
    await page.goto(urlFor('select--long-content', 'light', 'ltr'))
    await page.addStyleTag({ content: '* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; } p { margin-block-end: 2em !important; }' })
    const value = combo(page).locator('span').first()
    expect(await value.evaluate((el) => [el.scrollWidth > el.clientWidth, getComputedStyle(el).textOverflow])).toEqual([true, 'ellipsis'])
    expect((await boxOf(combo(page))).height).toBe(40)
    await expectNoSidewaysScroll(page)
  })
})

test.describe('live: the keyboard, the Authoring Practices select-only combobox', () => {
  test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

  for (const direction of DIRECTIONS) {
    test(`${direction}: ArrowDown opens on the chosen option, in view; the arrows, Home and End move and stop; Enter chooses; focus comes back`, async ({ page }) => {
      await openLive(page, 'select--sixty-items', { direction })
      const trigger = combo(page)
      await trigger.focus()
      await page.keyboard.press('ArrowDown')
      const popup = page.locator(`${POPUP}${OPENED}`)
      await expect(popup).toBeVisible()
      await atRest(popup)
      await expect.poll(() => focusedText(page)).toBe('Option 30')
      const option = (name: string) => popup.getByRole('option', { name, exact: true })
      await expect(option('Option 30')).toBeInViewport()
      expect(await option('Option 30').evaluate((el) => [el.hasAttribute('data-highlighted'), el.getAttribute('aria-selected'), getComputedStyle(el).fontWeight, el.querySelector('svg') !== null]))
        .toEqual([true, 'true', '500', true])
      for (let press = 0; press < 12; press += 1) await page.keyboard.press('ArrowDown')
      await expect.poll(() => focusedText(page)).toBe('Option 42')
      await expect(option('Option 42')).toBeInViewport()
      expect(await page.evaluate(() => window.scrollY)).toBe(0)
      await page.keyboard.press('End')
      await expect.poll(() => focusedText(page)).toBe('Option 60')
      await page.keyboard.press('ArrowDown')
      await expect.poll(() => focusedText(page)).toBe('Option 60')
      await page.keyboard.press('Home')
      await expect.poll(() => focusedText(page)).toBe('Option 1')
      await page.keyboard.press('ArrowUp')
      await expect.poll(() => focusedText(page)).toBe('Option 1')
      await page.keyboard.press('ArrowDown')
      await page.keyboard.press('Enter')
      await expectClosed(page, POPUP)
      await expect(trigger).toBeFocused()
      await expect(trigger).toHaveText('Option 2')
      expect(await hiddenValue(page)).toBe('2')
    })
  }

  test('a disabled option takes the highlight and the focus, is dimmed, and neither Enter nor a click chooses it', async ({ page }) => {
    await openLive(page, 'select--sixty-items')
    const popup = await openList(page, combo(page))
    await page.keyboard.press('Home')
    for (let press = 0; press < 12; press += 1) await page.keyboard.press('ArrowDown')
    const thirteen = popup.getByRole('option', { name: 'Option 13' })
    await expect(thirteen).toBeFocused()
    expect(await thirteen.evaluate((el) => [el.hasAttribute('data-highlighted'), el.getAttribute('aria-disabled'), getComputedStyle(el).opacity])).toEqual([true, 'true', '0.5'])
    await page.keyboard.press('Enter')
    await thirteen.click({ force: true })
    await expect(popup).toBeVisible()
    expect(await hiddenValue(page)).toBe('30')
  })

  test('Escape closes with the value as it was, Enter and Space open, and a letter on the closed trigger chooses the next option it starts', async ({ page }) => {
    await openLive(page, 'select--basic')
    const trigger = combo(page)
    await openList(page, trigger, 'keyboard')
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Escape')
    await expectClosed(page, POPUP)
    await expect(trigger).toBeFocused()
    await expect(trigger).toHaveText('Jordan')
    await page.keyboard.press(' ')
    await expect(page.locator(`${POPUP}${OPENED}`)).toBeVisible()
    await page.keyboard.press('Escape')
    await expectClosed(page, POPUP)
    await page.keyboard.press('s')
    await expect(trigger).toHaveText('Saudi Arabia')
    expect(await hiddenValue(page)).toBe('sa')
  })
})

test.describe('live: where the list opens', () => {
  test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

  test('ltr: 6 px under the trigger, its left edge on the trigger\'s, at least as wide, seven rows of 40 px, scrolling inside itself', async ({ page }) => {
    await openLive(page, 'select--sixty-items')
    const trigger = combo(page)
    const popup = await openList(page, trigger)
    const [p, t] = [await boxOf(popup), await boxOf(trigger)]
    expect(sideOf(p, t)).toEqual({ where: 'below', gap: 6 })
    expect(Math.abs(p.left - t.left)).toBeLessThanOrEqual(1)
    expect(p.width).toBeGreaterThanOrEqual(t.width - 1)
    const list = popup.getByRole('listbox')
    expect(await list.evaluate((el) => [el.clientHeight, el.scrollHeight, getComputedStyle(el).overscrollBehaviorY])).toEqual([280, 2530, 'contain'])
    expect((await boxOf(popup.getByRole('option').first())).height).toBe(40)
  })

  test('rtl: the list ends at the right edge of the trigger, and the caret and the tick sit at the left', async ({ page }) => {
    await openLive(page, 'select--rtl', { direction: 'rtl' })
    const trigger = combo(page)
    const popup = await openList(page, trigger)
    expect(Math.abs((await boxOf(popup)).right - (await boxOf(trigger)).right)).toBeLessThanOrEqual(1)
    const [value, caret] = [await boxOf(trigger.locator(':scope > span').first()), await boxOf(trigger.locator(':scope > span').last())]
    expect(caret.right).toBeLessThanOrEqual(value.left)
    const chosen = popup.locator('[role="option"][data-selected]')
    expect((await boxOf(chosen.locator(':scope > :last-child'))).right).toBeLessThanOrEqual((await boxOf(chosen.locator(':scope > :first-child'))).left)
  })

  test('an RTL island on an LTR page: the list is laid out right to left, in Arabic, and ends at the trigger\'s right edge', async ({ page }) => {
    await openLive(page, 'select--rtl', { direction: 'ltr' })
    const trigger = combo(page)
    const popup = await openList(page, trigger)
    expect(await popup.evaluate((el) => [getComputedStyle(document.body).direction, getComputedStyle(el).direction, el.parentElement?.getAttribute('lang'), document.documentElement.lang]))
      .toEqual(['ltr', 'rtl', 'ar', 'en'])
    expect(Math.abs((await boxOf(popup)).right - (await boxOf(trigger)).right)).toBeLessThanOrEqual(1)
  })

  for (const direction of DIRECTIONS) {
    test(`no provider, on the ${direction} page: nothing stamped on the positioner, the page's direction and language apply`, async ({ page }) => {
      await openLive(page, 'separator--horizontal', { direction })
      await page.addScriptTag({ type: 'module', url: '/e2e/fixtures/select-no-provider.tsx' })
      const trigger = page.locator('#no-provider [role="combobox"]')
      const popup = await openList(page, trigger)
      expect(await popup.evaluate((el) => [el.parentElement?.getAttribute('dir') ?? null, el.parentElement?.getAttribute('lang') ?? null, getComputedStyle(el).direction]))
        .toEqual([null, null, direction])
      const edge = direction === 'ltr' ? 'left' : 'right'
      expect(Math.abs((await boxOf(popup))[edge] - (await boxOf(trigger))[edge])).toBeLessThanOrEqual(1)
      await expect(trigger).toHaveText('Jordan')
    })
  }

  test('visibleRows={4}: the list is 160 px tall', async ({ page }) => {
    await openLive(page, 'select--four-rows')
    const popup = await openList(page, combo(page))
    expect(await popup.getByRole('listbox').evaluate((el) => el.clientHeight)).toBe(160)
  })

  test.describe('under a coarse pointer', () => {
    test.use(COARSE)

    test('390 px: a row is 44 px, the trigger 44 px, and the list stays 8 px inside the screen', async ({ page }) => {
      await openLive(page, 'select--sixty-items')
      const trigger = combo(page)
      const popup = await openList(page, trigger, 'tap')
      expect((await boxOf(popup.getByRole('option').first())).height).toBe(44)
      expect((await boxOf(trigger)).height).toBe(44)
      await expectInsideViewport(popup, 'the list', 8)
    })
  })

  for (const direction of DIRECTIONS) {
    for (const edge of EDGES) {
      test(`${direction}, pinned ${edge}: each list is 8 px inside the viewport, 6 px off its trigger, and never over it`, async ({ page }) => {
        for (const demo of ['select--basic', 'select--sixty-items', 'select--long-content']) {
          await openLive(page, demo, { direction, edge })
          const trigger = combo(page)
          const popup = await openList(page, trigger)
          await expectInsideViewport(popup, `the list of ${demo}`, 8)
          await expectNoSidewaysScroll(page)
          const side = sideOf(await boxOf(popup), await boxOf(trigger))
          expect(side, `the list of ${demo} lies over its trigger`).not.toBeNull()
          expect(Math.abs((side?.gap ?? 0) - 6), `${demo}: ${String(side?.gap)} px from its trigger`).toBeLessThanOrEqual(1)
          await page.keyboard.press('Escape')
          await expectClosed(page, POPUP)
        }
      })
    }
  }

  test.describe('a side placement on a phone, under a coarse pointer', () => {
    test.use(COARSE)
    const SIDES = ['start', 'start-top', 'start-bottom', 'end', 'end-top', 'end-bottom'] as const
    const SPOTS = ['top-start', 'top-end', 'bottom-start', 'bottom-end', 'middle'] as const

    for (const screen of [{ width: 390, height: 844 }, { width: 320, height: 480 }]) {
      for (const direction of DIRECTIONS) {
        test(`${String(screen.width)} x ${String(screen.height)} ${direction}: beside a trigger wider than the room, each list stays 8 px inside the screen and the page never scrolls`, async ({ page }) => {
          await page.setViewportSize(screen)
          await fixture(page, 'select-placements', { direction })
          for (const placement of SIDES) {
            for (const spot of SPOTS) {
              const label = `${placement} at ${spot}`
              await page.evaluate((detail) => document.dispatchEvent(new CustomEvent('select-case', { detail })), { placement, spot })
              await expect(page.locator('#placements')).toHaveAttribute('data-case', `${placement} ${spot}`)
              const trigger = combo(page, 'Country')
              const popup = await openList(page, trigger, 'tap')
              await expectInsideViewport(popup, `the list of ${label}`, 8)
              await expectNoSidewaysScroll(page)
              expect(await page.evaluate(() => [window.scrollX, document.documentElement.scrollWidth - document.documentElement.clientWidth]), label).toEqual([0, 0])
              expect(sideOf(await boxOf(popup), await boxOf(trigger)), `${label}: over its trigger`).not.toBeNull()
              await page.keyboard.press('Escape')
              await expectClosed(page, POPUP)
            }
          }
        })

        test(`${String(screen.width)} x ${String(screen.height)} ${direction}: with no room on either side, a fullWidth trigger or a 32 px root, the list opens below or above, as wide as the trigger`, async ({ page }) => {
          await page.setViewportSize(screen)
          await fixture(page, 'select-placements', { direction })
          for (const [spot, root] of [['full-width', '16px'], ['top-start', '32px'], ['bottom-end', '32px']] as const) {
            await page.evaluate((size) => { document.documentElement.style.fontSize = size }, root)
            for (const placement of SIDES) {
              const label = `${placement} at ${spot}, root ${root}`
              await page.evaluate((detail) => document.dispatchEvent(new CustomEvent('select-case', { detail })), { placement, spot })
              await expect(page.locator('#placements')).toHaveAttribute('data-case', `${placement} ${spot}`)
              const trigger = combo(page, 'Country')
              const popup = await openList(page, trigger, 'tap')
              await expectInsideViewport(popup, `the list of ${label}`, 8)
              await expectNoSidewaysScroll(page)
              const [list, box] = [await boxOf(popup), await boxOf(trigger)]
              expect(['above', 'below'], label).toContain(sideOf(list, box)?.where)
              expect(Math.abs(list.width - Math.min(box.width, screen.width - 16)), `${label}: as wide as the trigger`).toBeLessThan(1)
              await page.keyboard.press('Escape')
              await expectClosed(page, POPUP)
            }
          }
        })
      }
    }
  })

  for (const screen of [{ width: 320, height: 480 }, { width: 844, height: 390 }]) {
    for (const direction of DIRECTIONS) {
      test(`${String(screen.width)} x ${String(screen.height)} ${direction}: at the four edges the list is whole, beside its trigger, and nothing in it scrolls sideways`, async ({ page }) => {
        await page.setViewportSize(screen)
        for (const edge of EDGES) {
          await openLive(page, 'select--sixty-items', { direction, edge })
          const trigger = combo(page)
          const popup = await openList(page, trigger)
          await expectInsideViewport(popup, `pinned ${edge}`, 8)
          await expectNothingSideways(popup)
          expect(sideOf(await boxOf(popup), await boxOf(trigger)), `pinned ${edge}: over its trigger`).not.toBeNull()
          await expectNoSidewaysScroll(page)
        }
      })
    }
  }
})

test.describe('live: a long label', () => {
  test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

  const cut = (text: Locator) => text.evaluate((el) => [el.scrollWidth > el.clientWidth, getComputedStyle(el).textOverflow])

  for (const screen of [{ width: 1280, height: 800 }, { width: 320, height: 480 }]) {
    test(`${String(screen.width)} px: it ends in an ellipsis in the trigger and in its row, and the list stays inside the screen`, async ({ page }) => {
      await page.setViewportSize(screen)
      await openLive(page, 'select--long-content')
      const trigger = combo(page)
      expect(await cut(trigger.locator('span').first())).toEqual([true, 'ellipsis'])
      const popup = await openList(page, trigger)
      expect(await cut(popup.locator('[role="option"][data-selected] > :first-child'))).toEqual([true, 'ellipsis'])
      await expectInsideViewport(popup, 'the list', 8)
      await expectNothingSideways(popup)
      expect(await hiddenValue(page)).toBe('north')
    })
  }
})

test.describe('live: where a page puts a Select', () => {
  test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

  /** The width of every trigger of every case, by the case. */
  const widths = (page: Page) => page.locator('#layouts [data-case]').evaluateAll((all) => Object.fromEntries(all.map((holder): [string, number[]] => [
    holder.getAttribute('data-case') ?? '',
    [...holder.querySelectorAll('[role="combobox"], input:not([aria-hidden="true"])')].map((el) => Math.round(el.getBoundingClientRect().width * 10) / 10),
  ])))
  const ALONE = ['grid', 'track', 'flex-1', 'w-fit', 'cell', 'label-row', 'beside-label', 'beside-label-wrapped'] as const
  const PAIRS = ['grid-pair', 'grid-pair-wrapped', 'flex-pair', 'flex-pair-wrapped'] as const

  for (const direction of DIRECTIONS) {
    test(`1280 px, ${direction}: in every parent the trigger is an Input wide, 193.2 px, whatever its parent sizes by`, async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 })
      await fixture(page, 'select-layouts', { direction })
      const found = await widths(page)
      for (const name of ALONE) expect(found[name], name).toEqual([193.2])
      for (const name of PAIRS) expect(found[name], name).toEqual([193.2, 193.2])
      await expectNoSidewaysScroll(page)
    })
  }

  for (const width of [320, 390]) {
    test.describe(`${String(width)} px, coarse pointer`, () => {
      test.use({ ...COARSE, viewport: { width, height: 700 } })

      for (const direction of DIRECTIONS) {
        test(`${direction}: two side by side are as wide as two Inputs, alone in a w-fit parent it is an Input wide, and the page does not scroll`, async ({ page }) => {
          await fixture(page, 'select-layouts', { direction })
          const found = await widths(page)
          const inputs = found['input-pair'] ?? []
          expect(inputs[0], 'the Input of the pair').toBeLessThan(220.8)
          for (const name of PAIRS) expect(found[name], name).toEqual(inputs)
          for (const name of ['w-fit', 'label-row', 'grid'] as const) expect(found[name], name).toEqual([220.8])
          await expectNoSidewaysScroll(page)
        })
      }
    })
  }
})

test.describe('live: hostile content', () => {
  test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })
  test.use({ ...COARSE, viewport: { width: 320, height: 600 } })

  for (const direction of DIRECTIONS) {
    test(`${direction}: one 300-character word ends in an ellipsis, fullWidth in a table cell does not widen the page, and its list stays on screen`, async ({ page }) => {
      await fixture(page, 'select-hostile', { direction })
      await expectNoSidewaysScroll(page)
      for (const name of ['Long word', 'Long word, full width']) {
        const trigger = combo(page, name)
        expect(await trigger.locator('span').first().evaluate((el) => el.scrollWidth > el.clientWidth), name).toBe(true)
        const box = await boxOf(trigger)
        expect(box.left, name).toBeGreaterThanOrEqual(0)
        expect(box.right, name).toBeLessThanOrEqual(320)
      }
      const popup = await openList(page, combo(page, 'Long word'), 'tap')
      await expectInsideViewport(popup, 'the list', 8)
      await expectNothingSideways(popup)
    })
  }

  // Base UI reads the empty string as nothing chosen: the trigger shows the placeholder, and the form sends name= either way.
  test('an option whose value is the empty string reads as nothing chosen and is sent as name=; sixty rows all open', async ({ page }) => {
    await fixture(page, 'select-hostile')
    expect(await serverEntries(page, '#hostile')).toEqual([['word', 'long'], ['empty', ''], ['sixty', '1']])
    await expect(combo(page, 'Empty value')).toHaveText('Select')
    const popup = await openList(page, combo(page, 'Sixty'), 'tap')
    await expect(popup.getByRole('option')).toHaveCount(60)
    await page.keyboard.press('Escape')
    await expectClosed(page, POPUP)
  })
})

test.describe('live: a form reset', () => {
  test.beforeEach(async ({ page }) => {
    await openLive(page, 'separator--horizontal')
    await page.addScriptTag({ type: 'module', url: '/e2e/fixtures/select-reset.tsx' })
    await expect(page.locator('#select-reset')).toHaveAttribute('data-ready', '')
  })
  test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

  const sent = (page: Page, form: string) => page.evaluate((name) => window.selectSent?.[name] ?? [], form)
  async function choose(page: Page, name: string, label: string) {
    const popup = await openList(page, combo(page, name))
    await popup.getByRole('option', { name: label, exact: true }).click()
    await expectClosed(page, POPUP)
  }

  for (const how of ['form.reset()', 'a reset button'] as const) {
    test(`after ${how}, each Select is back at its default on screen and in the form; one with none is empty; a controlled one keeps its owner's value`, async ({ page }) => {
      for (const name of ['Plan', 'Empty', 'Owned', 'Far']) await choose(page, name, 'Beirut')
      expect(await serverEntries(page, '#plain')).toEqual([['plan', 'b'], ['empty', 'b'], ['owned', 'b'], ['far', 'b']])
      if (how === 'form.reset()') await page.locator('#plain').evaluate((node) => { (node as HTMLFormElement).reset() })
      else await page.getByRole('button', { name: 'Reset' }).click()
      await expect(combo(page, 'Plan')).toHaveText('Amman')
      await expect(combo(page, 'Empty')).toHaveText('Select')
      await expect(combo(page, 'Owned')).toHaveText('Beirut')
      await expect(combo(page, 'Far')).toHaveText('Amman')
      await expect(page.locator('#owner')).toHaveText('b')
      expect(await serverEntries(page, '#plain')).toEqual([['plan', 'a'], ['empty', ''], ['owned', 'b'], ['far', 'a']])
    })
  }

  test('after a React 19 form action settles, the Select is back at its default on screen and in the form', async ({ page }) => {
    await choose(page, 'Pick', 'Cairo')
    await page.locator('#action').getByRole('button', { name: 'Send' }).click()
    await expect.poll(() => sent(page, 'action')).toEqual([[['pick', 'c']]])
    await expect(combo(page, 'Pick')).toHaveText('Amman')
    expect(await serverEntries(page, '#action')).toEqual([['pick', 'a']])
  })

  test('with the action\'s answer as the new default, the choice stays, on screen and in the form, and is sent again', async ({ page }) => {
    await choose(page, 'Again', 'Cairo')
    const send = page.locator('#echo').getByRole('button', { name: 'Send' })
    await send.click()
    await expect.poll(() => sent(page, 'echo')).toHaveLength(1)
    await page.evaluate(() => new Promise((done) => { setTimeout(() => { requestAnimationFrame(() => { done(null) }) }, 0) }))
    await expect(combo(page, 'Again')).toHaveText('Cairo')
    expect(await serverEntries(page, '#echo')).toEqual([['again', 'c']])
    await send.click()
    await expect.poll(() => sent(page, 'echo')).toEqual([[['again', 'c']], [['again', 'c']]])
  })

  test('required with nothing chosen blocks the submit, and the focus goes to the trigger', async ({ page }) => {
    await page.locator('#required').getByRole('button', { name: 'Submit' }).click()
    await expect(combo(page, 'Needed')).toBeFocused()
    expect(await sent(page, 'required')).toEqual([])
    await choose(page, 'Needed', 'Amman')
    await page.locator('#required').getByRole('button', { name: 'Submit' }).click()
    await expect.poll(() => sent(page, 'required')).toEqual([[['needed', 'a']]])
  })
})

test.describe('live: the page behind, and a Dialog around it', () => {
  test.beforeEach(async ({ page }) => {
    await openLive(page, 'separator--horizontal')
    await page.addScriptTag({ type: 'module', url: '/e2e/fixtures/select-in-dialog.tsx' })
    await expect(page.locator('#in-dialog [role="combobox"]').first()).toBeVisible()
  })
  test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

  const scrollY = (page: Page) => page.evaluate(() => Math.round(window.scrollY))

  test('in a Dialog: the list is painted above it, the first Escape closes the list, the second the Dialog, and then the page scrolls', async ({ page }) => {
    await page.getByRole('button', { name: 'Edit address' }).click()
    await expect(page.locator(`[role="dialog"]${OPENED}`)).toBeVisible()
    const trigger = combo(page, 'In the dialog')
    const popup = await openList(page, trigger)
    const box = await boxOf(popup)
    expect(await page.evaluate(({ x, y }) => document.elementFromPoint(x, y)?.closest('[data-placement]') !== null, { x: box.left + box.width / 2, y: box.top + box.height / 2 })).toBe(true)
    await page.keyboard.press('Escape')
    await expectClosed(page, POPUP)
    await expect(trigger).toBeFocused()
    await expect(page.locator('[role="dialog"]:visible')).toHaveCount(1)
    await page.keyboard.press('Escape')
    await expectClosed(page)
    const before = await scrollY(page)
    await page.mouse.move(600, 400)
    await page.mouse.wheel(0, 300)
    await expect.poll(() => scrollY(page)).toBeGreaterThan(before)
  })

  test('modal, the default: while the list is open a wheel over the page does not move it', async ({ page }) => {
    await openList(page, combo(page, 'Modal'))
    const before = await scrollY(page)
    await page.mouse.move(900, 400)
    await page.mouse.wheel(0, 300)
    await page.evaluate(() => new Promise((done) => { requestAnimationFrame(() => { requestAnimationFrame(() => { done(null) }) }) }))
    expect(await scrollY(page)).toBe(before)
    expect(await page.evaluate(() => getComputedStyle(document.body).overflowY)).toBe('hidden')
  })

  test('modal={false}: while the list is open the page scrolls', async ({ page }) => {
    await openList(page, combo(page, 'Not modal'))
    const before = await scrollY(page)
    await page.mouse.move(900, 400)
    await page.mouse.wheel(0, 300)
    await expect.poll(() => scrollY(page)).toBeGreaterThan(before)
  })
})

test.describe('live: the open list carries the name of its field', () => {
  test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

  /** The name Chromium gives the open listbox in its own accessibility tree, the one a screen reader reads. */
  const chromiumName = async (page: Page) => {
    const cdp = await page.context().newCDPSession(page)
    const { nodes } = await cdp.send('Accessibility.getFullAXTree') as { nodes: { role?: { value?: string }, name?: { value?: string } }[] }
    return nodes.filter((node) => node.role?.value === 'listbox').map((node) => node.name?.value ?? '')
  }

  for (const direction of DIRECTIONS) {
    test(`${direction}: a <label for> names the list as it names the trigger, and the value never does`, async ({ page }) => {
      await openLive(page, 'select--phase-4-form', { direction })
      const popup = await openList(page, combo(page, 'Country'), 'keyboard')
      await expect(popup.getByRole('listbox')).toHaveAccessibleName('Country')
      expect(await chromiumName(page)).toEqual(['Country'])
      await expect(combo(page, 'Country')).toHaveAccessibleName('Country')
    })
  }

  test('in Arabic, the label of the RTL demo names its list', async ({ page }) => {
    await openLive(page, 'select--rtl', { direction: 'rtl' })
    const popup = await openList(page, combo(page))
    await expect(popup.getByRole('listbox')).toHaveAccessibleName('الدولة')
  })

  for (const [name, how] of [['Wrapped label', 'a label around it'], ['Heading name', 'aria-labelledby'], ['Plain name', 'aria-label']] as const) {
    test(`${how}: the list is named "${name}", not by the value`, async ({ page }) => {
      await fixture(page, 'select-names')
      const popup = await openList(page, combo(page, name))
      await expect(popup.getByRole('listbox')).toHaveAccessibleName(name)
      expect(await chromiumName(page)).toEqual([name])
    })
  }
})

test.describe('live: focus, forced colours and motion', () => {
  test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

  for (const pointer of ['fine', 'coarse'] as const) {
    test.describe(`${pointer} pointer`, () => {
      test.use(pointer === 'coarse' ? COARSE : {})

      test('the ring is drawn whole around the trigger, 2 px at 2 px, and no parent cuts it', async ({ page }) => {
        await openLive(page, 'select--basic')
        await page.keyboard.press('Tab')
        const trigger = combo(page)
        await expect(trigger).toBeFocused()
        expect([await css(trigger, 'outline-style'), await css(trigger, 'outline-width'), await css(trigger, 'outline-offset')]).toEqual(['solid', '2px', '2px'])
        const cut = await trigger.evaluate((el) => {
          const r = el.getBoundingClientRect()
          const edge = { left: r.left - 4, top: r.top - 4, right: r.right + 4, bottom: r.bottom + 4 }
          const found: string[] = []
          for (let up = el.parentElement; up; up = up.parentElement) {
            const style = getComputedStyle(up)
            if (style.overflowX === 'visible' && style.overflowY === 'visible') continue
            const clip = up.getBoundingClientRect()
            if (edge.left < clip.left || edge.top < clip.top || edge.right > clip.right || edge.bottom > clip.bottom) found.push(up.tagName)
          }
          return found
        })
        expect(cut).toEqual([])
      })
    })
  }

  for (const scheme of ['light', 'dark'] as const) {
    test.describe(`forced colours, ${scheme} palette`, () => {
      test.use({ forcedColors: 'active', colorScheme: scheme, reducedMotion: 'reduce' })

      test('the highlighted row takes the Highlight pair, and the chosen row is told by its tick, not by a fill', async ({ page }) => {
        await openLive(page, 'select--four-rows')
        const popup = await openList(page, combo(page), 'keyboard')
        const chosen = popup.locator('[role="option"][data-selected]')
        await expect(chosen).toBeFocused()
        expect(await css(chosen, 'background-color')).toBe(await resolve(page, 'Highlight'))
        await page.keyboard.press('ArrowDown')
        expect(await css(chosen, 'background-color')).toMatch(/^rgba\(\d+, \d+, \d+, 0\)$/)
        const tick = await boxOf(chosen.locator(':scope > :last-child'))
        const pixels = await pixelsOf(page, { x: Math.floor(tick.left), y: Math.floor(tick.top), width: Math.ceil(tick.width), height: Math.ceil(tick.height) })
        expect(inkOn(pixels, FORCED_CANVAS[scheme]), 'pixels of the tick at 3:1').toBeGreaterThan(10)
      })
    })
  }

  test('the list takes 150 ms to come and go; with reduced motion it opens in no time', async ({ page, browser }) => {
    await openLive(page, 'select--basic')
    const popup = await openList(page, combo(page))
    expect(await css(popup, 'transition-duration')).toBe('0.15s')
    const reduced = await browser.newPage({ reducedMotion: 'reduce' })
    await openLive(reduced, 'select--basic')
    const still = await openList(reduced, combo(reduced))
    expect([await css(still, 'transition-duration'), await css(still, 'opacity')]).toEqual(['0s', '1'])
    await reduced.close()
  })
})

test.describe('the form that closes Phase 4: six controls in one plain form', () => {
  const DEFAULTS = [['terms', 'on'], ['plan', 'pro'], ['digest', 'on'], ['country', 'jo'], ['volume', '60'], ['guests', '2']]

  test('the static page, before any script runs, sends the six defaults', async ({ page }) => {
    await page.goto(urlFor('select--phase-4-form', 'light', 'ltr'))
    expect(await serverEntries(page)).toEqual(DEFAULTS)
  })

  test('live: each control changed sends what the screen shows; a reset brings all six back, on screen and in the form', async ({ page }) => {
    await openLive(page, 'select--phase-4-form')
    expect(await serverEntries(page)).toEqual(DEFAULTS)
    await page.getByRole('checkbox', { name: 'I accept the terms' }).click()
    await page.getByRole('radio', { name: 'Team' }).click()
    await page.getByRole('switch', { name: 'Weekly digest' }).click()
    const popup = await openList(page, combo(page, 'Country'))
    await popup.getByRole('option', { name: 'Egypt' }).click()
    await expectClosed(page, POPUP)
    await page.getByRole('slider').focus()
    await page.keyboard.press('ArrowRight')
    await page.getByRole('textbox', { name: 'Guests' }).focus()
    await page.keyboard.press('ArrowUp')
    await page.getByRole('textbox', { name: 'Guests' }).blur()
    await expect.poll(() => serverEntries(page)).toEqual([['plan', 'team'], ['country', 'eg'], ['volume', '65'], ['guests', '3']])
    await page.getByRole('button', { name: 'Reset' }).click()
    await expect.poll(() => serverEntries(page)).toEqual(DEFAULTS)
    await expect(page.getByRole('checkbox', { name: 'I accept the terms' })).toHaveAttribute('aria-checked', 'true')
    await expect(page.getByRole('radio', { name: 'Pro' })).toHaveAttribute('aria-checked', 'true')
    await expect(page.getByRole('switch', { name: 'Weekly digest' })).toHaveAttribute('aria-checked', 'true')
    await expect(combo(page, 'Country')).toHaveText('Jordan')
    await expect(page.getByRole('slider')).toHaveValue('60')
    await expect(page.getByRole('textbox', { name: 'Guests' })).toHaveValue('2')
    expect(await liveErrors(page)).toEqual([])
  })
})

/** axe on the demo and on the portal its list opens in. Base UI's four focus guards are aria-hidden and focusable on
 * purpose (aria-hidden-focus counts them), so they are left out. */
async function axe(page: Page): Promise<string[]> {
  const results = await new AxeBuilder({ page }).include('#demo').include('[data-base-ui-portal]').exclude('[data-base-ui-focus-guard]').analyze()
  return results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)
}

test.describe('axe on the open list', () => {
  for (const demo of ['select--basic', 'select--sixty-items', 'select--rtl', 'select--states']) {
    for (const mode of MODES) {
      for (const direction of DIRECTIONS) {
        test(`${demo} ${mode} ${direction}: no violation, in the list or in the demo behind it`, async ({ page }) => {
          await openLive(page, demo, { mode, direction })
          await openList(page, combo(page))
          expect(await axe(page)).toEqual([])
        })
      }
    }
  }

  test.describe('on a 320 x 480 phone', () => {
    test.use({ hasTouch: true, isMobile: true, viewport: { width: 320, height: 480 } })

    for (const demo of ['select--sixty-items', 'select--long-content']) {
      test(`${demo}: no violation`, async ({ page }) => {
        await openLive(page, demo)
        await openList(page, combo(page), 'tap')
        expect(await axe(page)).toEqual([])
      })
    }
  })
})
