import { expect, test, type Page } from '@playwright/test'

import { openLive } from './live.js'
import { DEMOS, urlFor } from './pages.js'

// POINTER in a real browser: the hand on every control a pointer can press, the arrow back on one that is
// disabled, read-only or loading. Measured on the computed cursor, so a class that never compiles fails too.
// An element with no box has nothing to point at: Base UI's visually hidden Dismiss button, a closed panel.
const PRESSABLE = 'button, [role="button"], [role="tab"], [role="option"], [role="menuitem"], [role="treeitem"], [role="gridcell"][tabindex]'
const INACTIVE = ':disabled, [aria-disabled="true"], [data-disabled], [data-readonly], [aria-readonly="true"], [data-loading], [aria-busy="true"]'

interface Cursors { active: number; inactive: number; wrong: string[] }

/** Every pressable element on the page, counted, with each one whose cursor is not the one its state asks for. */
const cursorsOf = (page: Page): Promise<Cursors> => page.evaluate(([pressable, inactive]) => {
  const found = { active: 0, inactive: 0, wrong: [] as string[] }
  for (const element of document.querySelectorAll(pressable)) {
    const box = element.getBoundingClientRect()
    if (box.width <= 1 || box.height <= 1) continue
    const off = element.matches(inactive)
    const cursor = getComputedStyle(element).cursor
    if (off) found.inactive += 1
    else found.active += 1
    if ((cursor === 'pointer') === off) {
      const name = element.getAttribute('aria-label') ?? element.textContent.trim().slice(0, 30)
      found.wrong.push(`${element.tagName.toLowerCase()}[role=${element.getAttribute('role') ?? ''}] "${name}" ${off ? 'inactive' : 'active'}: ${cursor}`)
    }
  }
  return found
}, [PRESSABLE, INACTIVE] as const)

test('the selector finds active and inactive controls across the set', async ({ page }) => {
  const total = { active: 0, inactive: 0 }
  for (const demo of ['button--states', 'tree-view--basic']) {
    await page.goto(urlFor(demo, 'light', 'ltr'))
    const { active, inactive } = await cursorsOf(page)
    total.active += active
    total.inactive += inactive
  }
  expect(total.active).toBeGreaterThan(0)
  expect(total.inactive).toBeGreaterThan(0)
})

for (const demo of DEMOS) {
  test(`${demo}: every active control shows the hand, every inactive one the arrow`, async ({ page }) => {
    await page.goto(urlFor(demo, 'light', 'ltr'))
    expect((await cursorsOf(page)).wrong).toEqual([])
  })
}

// Options, menu items and calendar days exist only while their popup is open, so these open it first.
const POPUPS = [
  { demo: 'select--basic', open: (page: Page) => page.getByRole('combobox').first().click(), rows: '[role="option"]' },
  { demo: 'combobox--basic', open: (page: Page) => page.getByRole('combobox').first().press('ArrowDown'), rows: '[role="option"]' },
  { demo: 'dropdown--basic', open: (page: Page) => page.getByRole('button').first().click(), rows: '[role="menuitem"]' },
  { demo: 'command--basic', open: (page: Page) => page.getByRole('button').first().click(), rows: '[role="option"]' },
  { demo: 'date-picker--limits', open: (page: Page) => page.getByRole('button').first().click(), rows: '[role="gridcell"] button' },
] as const

for (const { demo, open, rows } of POPUPS) {
  test(`${demo}, open: every row shows the hand unless it is disabled`, async ({ page }) => {
    await openLive(page, demo)
    await open(page)
    await expect(page.locator(rows).first()).toBeVisible()
    const found = await cursorsOf(page)
    expect(found.wrong).toEqual([])
    expect(found.active).toBeGreaterThan(0)
  })
}
