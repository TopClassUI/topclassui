import { expect, test, type Page } from '@playwright/test'

import { openLive } from './live.js'
import { DEMOS, urlFor } from './pages.js'

// POINTER in a real browser, read on the computed cursor, so a class that never compiles fails too: the hand on every
// control a pointer can press, not-allowed on every disabled one, and never the hand on one that is read-only or loading.
// An element with no box has nothing to point at: Base UI's visually hidden Dismiss button, a closed panel.
const PRESSABLE = 'button, [role="button"], [role="tab"], [role="option"], [role="menuitem"], [role="treeitem"], [role="gridcell"][tabindex]'
/** Every control a pointer can reach, the fields too: what a disabled mark turns to not-allowed. */
const CONTROL = `${PRESSABLE}, a, input, select, textarea, [role="link"], [role="checkbox"], [role="radio"], [role="switch"], [role="combobox"], [role="spinbutton"], [role="slider"]`
const DISABLED = ':disabled, [aria-disabled="true"], [data-disabled]'
/** Read-only and loading keep the arrow they always had: a loading control takes no pointer events at all. */
const KEPT = '[data-readonly], [aria-readonly="true"], [data-loading], [aria-busy="true"]'

interface Cursors { active: number; disabled: number; kept: number; wrong: string[] }

/** Every control on the page, counted by state, with each one whose cursor is not the one its state asks for. A disabled
 * control is read where the pointer meets it, at its centre: a star drawn over its radio, or the slider around its input. */
const cursorsOf = (page: Page): Promise<Cursors> => page.evaluate(([control, pressable, disabled, kept]) => {
  const found = { active: 0, disabled: 0, kept: 0, wrong: [] as string[] }
  const nameOf = (element: Element) => `${element.tagName.toLowerCase()}[role=${element.getAttribute('role') ?? ''}] "${element.getAttribute('aria-label') ?? element.textContent.trim().slice(0, 30)}"`
  for (const element of document.querySelectorAll(control)) {
    // A picture of a state, inert, is no control.
    if (element.closest('[inert]')) continue
    const box = element.getBoundingClientRect()
    if (box.width <= 1 || box.height <= 1) continue
    const own = getComputedStyle(element).cursor
    if (element.matches(kept)) {
      found.kept += 1
      if (own === 'pointer') found.wrong.push(`${nameOf(element)} read-only or loading: ${own}`)
    } else if (element.matches(disabled)) {
      found.disabled += 1
      element.scrollIntoView({ block: 'nearest', inline: 'nearest' })
      const at = element.getBoundingClientRect()
      const hit = document.elementFromPoint(at.left + at.width / 2, at.top + at.height / 2)
      const related = hit !== null && (element.contains(hit) || hit.contains(element) || element.closest('label')?.contains(hit) === true)
      const shown = related ? getComputedStyle(hit).cursor : own
      if (shown !== 'not-allowed') found.wrong.push(`${nameOf(element)} disabled: ${shown}${related && hit !== element ? ` on ${hit.tagName.toLowerCase()}` : ''}`)
    } else if (element.matches(pressable)) {
      found.active += 1
      if (own !== 'pointer') found.wrong.push(`${nameOf(element)} active: ${own}`)
    }
  }
  return found
}, [CONTROL, PRESSABLE, DISABLED, KEPT] as const)

test('the selector finds active, disabled and kept controls across the set', async ({ page }) => {
  const total = { active: 0, disabled: 0, kept: 0 }
  for (const demo of ['button--states', 'tree-view--basic', 'input--states']) {
    await page.goto(urlFor(demo, 'light', 'ltr'))
    const { active, disabled, kept } = await cursorsOf(page)
    total.active += active
    total.disabled += disabled
    total.kept += kept
  }
  expect(total.active).toBeGreaterThan(0)
  expect(total.disabled).toBeGreaterThan(0)
  expect(total.kept).toBeGreaterThan(0)
})

for (const demo of DEMOS) {
  test(`${demo}: the hand on every active control, not-allowed on every disabled one, never the hand on a kept one`, async ({ page }) => {
    await page.goto(urlFor(demo, 'light', 'ltr'))
    expect((await cursorsOf(page)).wrong).toEqual([])
  })
}

// Options, menu items and calendar days exist only while their popup is open, so these open it first.
const POPUPS = [
  { demo: 'select--basic', open: (page: Page) => page.getByRole('combobox').first().click(), rows: '[role="option"]' },
  { demo: 'select--sixty-items', open: (page: Page) => page.getByRole('combobox').first().click(), rows: '[role="option"]' },
  { demo: 'combobox--basic', open: (page: Page) => page.getByRole('combobox').first().press('ArrowDown'), rows: '[role="option"]' },
  { demo: 'combobox--states', open: (page: Page) => page.getByRole('combobox').first().press('ArrowDown'), rows: '[role="option"]' },
  { demo: 'dropdown--basic', open: (page: Page) => page.getByRole('button').first().click(), rows: '[role="menuitem"]' },
  { demo: 'command--basic', open: (page: Page) => page.getByRole('button').first().click(), rows: '[role="option"]' },
  { demo: 'date-picker--limits', open: (page: Page) => page.getByRole('button').first().click(), rows: '[role="gridcell"] button' },
  {
    // September, the month of minDate: its first days and the previous button are disabled.
    demo: 'date-picker--limits',
    open: async (page: Page) => {
      await page.getByRole('button').first().click()
      await page.getByRole('button', { name: 'Previous month' }).click()
    },
    rows: '[role="gridcell"] button[aria-disabled="true"]',
  },
] as const

for (const { demo, open, rows } of POPUPS) {
  test(`${demo}, open on ${rows}: every row shows the hand, or not-allowed when it is disabled`, async ({ page }) => {
    await openLive(page, demo)
    await open(page)
    await expect(page.locator(rows).first()).toBeVisible()
    const found = await cursorsOf(page)
    expect(found.wrong).toEqual([])
    expect(found.active).toBeGreaterThan(0)
  })
}

// The cursor is the one change: a disabled control keeps its pointer events for it, so the proof that it still does
// nothing is taken here, on the hydrated page. Each disabled control is hovered, pressed and clicked where a pointer
// meets it; nothing it or the demo shows may change, the focus may not land on it, and a native one fires no click.

/** What a press could change: every state attribute of the page, the value of every input, and the address. */
const stateOf = (page: Page) => page.evaluate(() => {
  const keys = [
    'aria-checked', 'aria-selected', 'aria-pressed', 'aria-expanded', 'aria-current', 'aria-valuenow', 'aria-activedescendant',
    'data-checked', 'data-highlighted', 'data-popup-open', 'data-panel-open', 'data-active', 'data-pressed', 'data-open',
  ]
  const state: string[] = [location.href]
  document.querySelectorAll('body *').forEach((element, index) => {
    for (const key of keys) if (element.hasAttribute(key)) state.push(`${String(index)} ${key}=${element.getAttribute(key) ?? ''}`)
    if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) state.push(`${String(index)} value=${element.value}`)
    if (element instanceof HTMLInputElement) state.push(`${String(index)} checked=${String(element.checked)}`)
  })
  return state
})

/** How a control looks: the fill, the text, the line and the underline a hover or a press would change. */
const lookOf = (page: Page, id: string) => page.evaluate((at) => {
  const element = document.querySelector(`[data-probe="${at}"]`)
  if (!element) throw new Error(`no element marked ${at}`)
  const style = getComputedStyle(element)
  return [style.backgroundColor, style.color, style.borderColor, style.textDecorationLine, style.opacity].join(' | ')
}, id)

/** Marks every disabled control of `scope` with a box, so the page can be reloaded and each found again by its number. */
const markDisabled = (page: Page, scope: string) => page.evaluate(([inside, control, disabled, kept]) => {
  let count = 0
  for (const element of document.querySelectorAll(`${inside} :is(${control})`)) {
    const box = element.getBoundingClientRect()
    if (box.width <= 1 || box.height <= 1 || !element.matches(disabled) || element.matches(kept) || element.closest('[inert]')) continue
    element.setAttribute('data-probe', String(count))
    count += 1
  }
  return count
}, [scope, CONTROL, DISABLED, KEPT] as const)

/** Resolves once every transition running has ended: a control disabled a moment ago is still fading to its half. */
const settle = (page: Page) => page.evaluate(() => Promise.all(
  document.getAnimations().filter((running) => running instanceof CSSTransition).map((running) => running.finished.catch(() => null)),
))

interface Stage { demo: string, open?: (page: Page) => Promise<unknown>, scope?: string }

const STAGES: Stage[] = [
  { demo: 'button--states' }, { demo: 'accordion--disabled' }, { demo: 'checkbox--states' }, { demo: 'switch--states' },
  { demo: 'radio-group--states' }, { demo: 'segmented-control--track-states' }, { demo: 'tabs--disabled' }, { demo: 'tabs--states' },
  { demo: 'input--states' }, { demo: 'textarea--states' }, { demo: 'otp-field--states' }, { demo: 'number-field--states' },
  { demo: 'number-field--limits' }, { demo: 'select--states' }, { demo: 'combobox--states' }, { demo: 'date-picker--states' },
  { demo: 'pagination--states' }, { demo: 'rating--disabled' }, { demo: 'slider--states' }, { demo: 'file-upload--states' },
  { demo: 'tag--states' },
  { demo: 'tree-view--selected', open: (page) => page.getByRole('treeitem', { name: 'docs' }).click() },
  { demo: 'dropdown--basic', open: (page) => page.getByRole('button').first().click(), scope: '[role="menu"]' },
  { demo: 'select--sixty-items', open: (page) => page.getByRole('combobox').first().click(), scope: '[role="listbox"]' },
  { demo: 'combobox--states', open: (page) => page.getByRole('combobox').first().press('ArrowDown'), scope: '[role="listbox"]' },
  {
    demo: 'date-picker--limits', scope: '[role="dialog"]',
    open: async (page) => {
      await page.getByRole('button').first().click()
      await page.getByRole('button', { name: 'Previous month' }).click()
    },
  },
]

test.describe('a disabled control still does nothing', () => {
  for (const { demo, open, scope = 'body' } of STAGES) {
    test(`${demo}${open ? ', open' : ''}: a hover, a press, a click and a key change nothing, and a native one fires no click`, async ({ page }) => {
      test.setTimeout(120_000)
      const stage = async () => {
        await openLive(page, demo)
        if (open) await open(page)
        await page.locator(scope).first().waitFor()
        await settle(page)
        return markDisabled(page, scope)
      }
      const count = await stage()
      expect(count, 'no disabled control was found').toBeGreaterThan(0)
      for (let at = 0; at < count; at += 1) {
        if (at > 0) await stage()
        const id = String(at)
        const target = page.locator(`[data-probe="${id}"]`)
        const name = await target.evaluate((element) => {
          element.scrollIntoView({ block: 'nearest', inline: 'nearest' })
          // Counted in the capture phase, so no handler of the page can hide a click from it.
          element.addEventListener('click', () => { element.setAttribute('data-clicked', String(Number(element.getAttribute('data-clicked') ?? '0') + 1)) }, true)
          return `${element.tagName.toLowerCase()} "${element.getAttribute('aria-label') ?? element.textContent.trim().slice(0, 30)}"`
        })
        await settle(page)
        const box = await target.boundingBox()
        if (!box) throw new Error(`${name} has no box`)
        const [x, y] = [box.x + box.width / 2, box.y + box.height / 2]
        const before = await stateOf(page)
        const rest = await lookOf(page, id)
        // A month button disabled under the focus keeps it: only a focus the click brings would be a reaction.
        const hadFocus = await target.evaluate((element) => element === document.activeElement)
        // One move straight onto it, so no other row is passed over on the way.
        await page.mouse.move(x, y)
        await page.waitForTimeout(250)
        expect(await lookOf(page, id), `${name}: a hover changed how it looks`).toBe(rest)
        await page.mouse.down()
        await page.waitForTimeout(250)
        expect(await lookOf(page, id), `${name}: a press changed how it looks`).toBe(rest)
        await page.mouse.up()
        await page.waitForTimeout(250)
        expect(await stateOf(page), `${name}: a click changed the page`).toEqual(before)
        const focused = await target.evaluate((element) => element === document.activeElement)
        expect(focused && !hadFocus, `${name}: a click put the focus on it`).toBe(false)
        const native = await target.evaluate((element) => element.matches(':disabled') ? Number(element.getAttribute('data-clicked') ?? '0') : 0)
        expect(native, `${name}: a native disabled control fired a click`).toBe(0)
        // A key reaches only a control that keeps its focus while disabled, as a tab or a menu row does; the focus alone may
        // move a highlight onto it, as the arrow keys do, so the keys are measured from there.
        if (await target.evaluate((element) => { (element as HTMLElement).focus(); return element === document.activeElement })) {
          await page.waitForTimeout(150)
          const focusedState = await stateOf(page)
          await page.keyboard.press('Enter')
          await page.keyboard.press(' ')
          await page.waitForTimeout(150)
          expect(await stateOf(page), `${name}: Enter or Space changed the page`).toEqual(focusedState)
        }
      }
    })
  }

  test('the probe sees a hover and a click where there is one: an enabled button and checkbox beside the disabled ones', async ({ page }) => {
    await openLive(page, 'button--states')
    const save = page.getByRole('group', { name: 'idle' }).getByRole('button')
    await save.evaluate((element) => { element.setAttribute('data-probe', 'live') })
    const rest = await lookOf(page, 'live')
    await save.hover()
    await page.waitForTimeout(250)
    expect(await lookOf(page, 'live')).not.toBe(rest)
    await openLive(page, 'checkbox--states')
    const before = await stateOf(page)
    await page.getByRole('checkbox').first().click()
    expect(await stateOf(page)).not.toEqual(before)
  })
})

test.describe('under a finger', () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } })

  for (const demo of ['button--states', 'checkbox--states', 'switch--states', 'tabs--disabled', 'segmented-control--track-states', 'rating--disabled', 'pagination--states']) {
    test(`${demo}: a tap on a disabled control changes nothing`, async ({ page }) => {
      await openLive(page, demo)
      const count = await markDisabled(page, 'body')
      expect(count).toBeGreaterThan(0)
      const before = await stateOf(page)
      for (let at = 0; at < count; at += 1) {
        const target = page.locator(`[data-probe="${String(at)}"]`)
        await target.evaluate((element) => { element.scrollIntoView({ block: 'nearest', inline: 'nearest' }) })
        const box = await target.boundingBox()
        if (!box) continue
        await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2)
      }
      await page.waitForTimeout(250)
      expect(await stateOf(page)).toEqual(before)
    })
  }
})
