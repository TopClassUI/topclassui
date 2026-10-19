import { expect, test, type Locator, type Page } from '@playwright/test'

import { DIRECTIONS } from '../scripts/lib/harness.js'
import { expectRing, focused, pressTo } from './keyboard.js'
import { openLive } from './live.js'
import { atRest, expectClosed } from './overlay.js'

// R-5.6-1, the combobox pattern with a listbox popup, inside a modal dialog: Ctrl+K opens it with the focus
// in the input, the focus never leaves the input while the vertical arrows move the active row (aria-activedescendant)
// and wrap, Enter runs the active row and closes, Escape closes, and both give the focus back.

/** The input, as each direction's labels name it. */
const INPUT = { ltr: 'Type a command or search', rtl: 'اكتب أمرًا أو ابحث' } as const

const active = (page: Page) => page.locator('[role="option"][data-highlighted]')
const ran = (page: Page) => page.getByTestId('ran')

/** A mark the palette draws on a pseudo-element, with the --tc-ring colour resolved beside it for comparison. */
function markOf(target: Locator, pseudo: '::after' | '::before', side: 'bottom' | 'inline-start') {
  return target.evaluate((element, [where, edge]) => {
    const style = getComputedStyle(element, where)
    const probe = document.createElement('span')
    probe.style.color = 'var(--tc-ring)'
    element.append(probe)
    const ring = getComputedStyle(probe).color
    probe.remove()
    return {
      display: style.display,
      style: style.getPropertyValue(`border-${edge}-style`),
      width: style.getPropertyValue(`border-${edge}-width`),
      ring: style.getPropertyValue(`border-${edge}-color`) === ring,
    }
  }, [pseudo, side] as const)
}

/** DECISIONS 2026-10-19: the input's focus is the ring-thick line under its row, there while it has the focus only. */
async function expectUnderline(page: Page): Promise<void> {
  const row = page.getByRole('combobox').locator('..')
  await expect.poll(() => markOf(row, '::after', 'bottom')).toEqual({ display: 'block', style: 'solid', width: '2px', ring: true })
  // Taken away and given back with no event reaching the palette, as ringOfFocus does, so only the focus draws it.
  const idle = await page.getByRole('combobox').evaluate((input, where) => {
    const silence = (event: Event) => { event.stopImmediatePropagation() }
    const kinds = ['blur', 'focus', 'focusin', 'focusout'] as const
    for (const kind of kinds) window.addEventListener(kind, silence, true)
    input.blur()
    const display = getComputedStyle(input.parentElement as Element, where).display
    input.focus({ focusVisible: true, preventScroll: true })
    for (const kind of kinds) window.removeEventListener(kind, silence, true)
    return display
  }, '::after')
  expect(idle, 'the line stays without the focus').toBe('none')
}

/** The active row's mark: a ring-thick --tc-ring bar at its inline start, on that row only. */
async function expectBar(page: Page, label: string): Promise<void> {
  await expect.poll(() => markOf(active(page), '::before', 'inline-start'), { message: `${label}: the active row has no bar` })
    .toEqual({ display: 'block', style: 'solid', width: '2px', ring: true })
  const others = await page.locator('[role="option"]:not([data-highlighted])').evaluateAll((rows) => rows.map((row) => getComputedStyle(row, '::before').display))
  expect(others.filter((display) => display !== 'none'), `${label}: a row that is not active has a bar`).toEqual([])
}

async function openPalette(page: Page, input: string): Promise<void> {
  await page.keyboard.press('Control+k')
  const popup = page.locator('[role="dialog"]:visible')
  await expect(popup).toBeVisible()
  await atRest(popup)
  await expect.poll(() => focused(page)).toBe(input)
}

for (const direction of DIRECTIONS) {
  const input = INPUT[direction]

  test.describe(direction, () => {
    test('Ctrl+K opens it with the focus in the input and its line under the search row, and Tab and Shift+Tab keep the focus there', async ({ page }) => {
      await openLive(page, 'command--basic', { direction })
      await pressTo(page, 'Tab', 'Search')
      await openPalette(page, input)
      await expectUnderline(page)
      await pressTo(page, 'Tab', input)
      await pressTo(page, 'Shift+Tab', input)
    })

    test('the vertical arrows move the active row with its bar, wrap at both ends, and leave the focus in the input', async ({ page }) => {
      await openLive(page, 'command--basic', { direction })
      await pressTo(page, 'Tab', 'Search')
      await openPalette(page, input)
      await page.keyboard.press('ArrowDown')
      await expect(active(page)).toHaveText('Button')
      await expectBar(page, 'the first row')
      await page.keyboard.press('ArrowDown')
      await expect(active(page)).toHaveText('Button group')
      await page.keyboard.press('ArrowUp')
      await page.keyboard.press('ArrowUp')
      await expect(active(page)).toHaveText('Tooltip')
      await page.keyboard.press('ArrowDown')
      await expect(active(page)).toHaveText('Button')
      expect(await focused(page)).toBe(input)
      const controls = await page.getByRole('combobox').getAttribute('aria-activedescendant')
      expect(controls).toBe(await active(page).getAttribute('id'))
    })

    test('typing filters the rows, and Enter runs the active one once, closes, and gives the focus back to the trigger', async ({ page }) => {
      await openLive(page, 'command--basic', { direction })
      await pressTo(page, 'Tab', 'Search')
      await openPalette(page, input)
      await page.keyboard.type('dr')
      await page.keyboard.press('ArrowDown')
      await expect(active(page)).toHaveText('Drawer')
      await page.keyboard.press('Enter')
      await expectClosed(page)
      await expect(ran(page)).toHaveText('Ran Drawer, 1 in all.')
      await expect.poll(() => focused(page)).toBe('Search')
      await expectRing(page, 'the trigger after Enter')
    })

    test('Escape closes it, runs nothing, and gives the focus and the ring back to the trigger', async ({ page }) => {
      await openLive(page, 'command--basic', { direction })
      await pressTo(page, 'Tab', 'Search')
      await openPalette(page, input)
      await page.keyboard.press('ArrowDown')
      await page.keyboard.press('Escape')
      await expectClosed(page)
      await expect(ran(page)).toHaveText('Nothing ran yet.')
      await expect.poll(() => focused(page)).toBe('Search')
      await expectRing(page, 'the trigger after Escape')
    })

    test('groups: the arrows pass over the headings, from the last command of one group to the first of the next, and wrap', async ({ page }) => {
      await openLive(page, 'command--groups', { direction })
      await pressTo(page, 'Tab', 'Commands by group')
      await page.keyboard.press('Enter')
      await expect.poll(() => focused(page)).toBe(input)
      const order = ['New file', 'Open recent', 'Save all', 'Change the theme', 'Keyboard shortcuts', 'Read the docs', 'Report a problem']
      for (const name of order) {
        await page.keyboard.press('ArrowDown')
        await expect(active(page)).toHaveText(name)
      }
      await page.keyboard.press('ArrowDown')
      await expect(active(page)).toHaveText('New file')
      await page.keyboard.press('ArrowUp')
      await expect(active(page)).toHaveText('Report a problem')
      await page.keyboard.press('ArrowUp')
      await page.keyboard.press('ArrowUp')
      await expect(active(page)).toHaveText('Keyboard shortcuts')
      await expectBar(page, 'a row of the second group')
      expect(await focused(page)).toBe(input)
      await page.keyboard.press('Enter')
      await expectClosed(page)
      await expect(ran(page)).toHaveText('Ran Keyboard shortcuts.')
      await expect.poll(() => focused(page)).toBe('Commands by group')
    })

    test('the trigger opens it with Enter as well as Ctrl+K', async ({ page }) => {
      await openLive(page, 'command--basic', { direction })
      await pressTo(page, 'Tab', 'Search')
      await page.keyboard.press('Enter')
      await expect.poll(() => focused(page)).toBe(input)
    })
  })
}
