// The steps every keyboard spec repeats (R-5.6-1, R-5.6-3): the keys a direction gives the next and the previous item,
// where the focus is, the stops Tab walks, which element of a composite holds the one tab stop, and the ring.
// The ring is read as its computed outline, not as pixels: forced colours and the pixel reads are focus-ring.spec's.
import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

import { expect, type Locator, type Page } from '@playwright/test'

import type { Direction } from '../scripts/lib/harness.js'

/** The keys that go to the next and the previous item of a horizontal widget: mirrored right to left. */
export const inlineKeys = (direction: Direction) => (direction === 'rtl'
  ? { next: 'ArrowLeft', previous: 'ArrowRight' } as const
  : { next: 'ArrowRight', previous: 'ArrowLeft' } as const)

/** The focused element as a reader hears it: its aria-label, or else its text, or else its tag. */
export function focused(page: Page): Promise<string> {
  return page.evaluate(() => {
    const element = document.activeElement
    if (!element || element === document.body) return '(nothing)'
    if (element.hasAttribute('data-base-ui-focus-guard')) return '(focus guard)'
    return element.getAttribute('aria-label') ?? (element.textContent.trim() || element.tagName.toLowerCase())
  })
}

/** Presses a key and waits until the focus rests on the named element: Base UI moves it in a microtask. */
export async function pressTo(page: Page, key: string, lands: string): Promise<void> {
  await page.keyboard.press(key)
  await expect.poll(() => focused(page), { message: `${key} did not land on ${lands}` }).toBe(lands)
}

/** The names of the elements of a group that are in the tab order: one, for a roving tabindex. */
export function tabStops(items: Locator): Promise<string[]> {
  return items.evaluateAll((all) => all
    .filter((item) => (item as HTMLElement).tabIndex >= 0 && !item.hasAttribute('disabled'))
    .map((item) => item.getAttribute('aria-label') ?? item.textContent.trim()))
}

export interface OutlineRing { visible: boolean, style: string, width: string }

/**
 * The ring of the focused element, or of its closest ancestor that matches `holder` when the ring is
 * drawn around it (a label round an invisible radio). `visible` is whether the focus matches :focus-visible.
 */
export function ringOf(page: Page, holder?: string): Promise<OutlineRing> {
  return page.evaluate((selector) => {
    const element = document.activeElement
    if (!element || element === document.body) throw new Error('nothing is focused')
    const target = selector ? element.closest(selector) : element
    if (!target) throw new Error(`the focused element has no ancestor ${selector ?? ''}`)
    const style = getComputedStyle(target)
    return { visible: element.matches(':focus-visible'), style: style.outlineStyle, width: style.outlineWidth }
  }, holder)
}

/**
 * A row of a list or menu whose focus stays elsewhere or is drawn by Base UI's highlight: ROW_HIGHLIGHT rings
 * the highlighted row, so the mark follows `data-highlighted` and not :focus-visible.
 */
export function rowRingOf(row: Locator): Promise<OutlineRing> {
  return row.evaluate((element) => {
    const style = getComputedStyle(element)
    // Some Chromium builds resolve outline-width to the medium 3px even with outline-style none; an absent ring is 0.
    const width = style.outlineStyle === 'none' ? '0px' : style.outlineWidth
    return { visible: element.hasAttribute('data-highlighted'), style: style.outlineStyle, width }
  })
}

/** The highlighted row of a list or menu carries the 2 px ring. */
export async function expectRowRing(row: Locator, label: string): Promise<void> {
  await expect.poll(() => rowRingOf(row), { message: `${label}: the highlighted row has no ring` })
    .toEqual({ visible: true, style: 'solid', width: '2px' })
}

/** The name of the button addSentinel puts after the demo. */
export const SENTINEL = 'After the demo'

/** A button after the demo, outside React's root, so Tab out of a popup has a page control to go on to. */
export async function addSentinel(page: Page): Promise<void> {
  await page.evaluate((name) => {
    const button = document.createElement('button')
    button.type = 'button'
    button.textContent = name
    document.getElementById('demo')?.after(button)
  }, SENTINEL)
}

/** The component folders under `root` with neither their own `e2e/keyboard-<slug>.spec.ts` nor a reason for having none. */
export const foldersWithoutKeyboardSpec = (root: string, reasons: Readonly<Record<string, string>>): string[] =>
  readdirSync(join(root, 'src', 'components'), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((slug) => !existsSync(join(root, 'e2e', `keyboard-${slug}.spec.ts`)) && !(slug in reasons))
    .sort()

/** The outline an element paints now. */
export const outlineOf = (target: Locator) => target.evaluate((element) => {
  const style = getComputedStyle(element)
  return { style: style.outlineStyle, width: style.outlineWidth }
})

export async function expectNoRing(target: Locator, label = 'the element'): Promise<void> {
  expect((await outlineOf(target)).style, `${label} paints no ring`).toBe('none')
}

/** What names the focused element: its aria-label, its first label, its text, or its id. */
export const focusedName = (page: Page) => page.evaluate(() => {
  const at = document.activeElement
  if (!at || at === document.body) return 'body'
  const label = 'labels' in at ? (at.labels as NodeListOf<HTMLLabelElement> | null)?.[0]?.textContent : null
  return at.getAttribute('aria-label') || label || at.textContent.trim() || at.id
})

/** Presses the key once per stop and names each element that took the focus. */
export async function walk(page: Page, stops: number, key: 'Tab' | 'Shift+Tab' = 'Tab'): Promise<string[]> {
  const names: string[] = []
  for (let press = 0; press < stops; press += 1) {
    await page.keyboard.press(key)
    names.push(await focusedName(page))
  }
  return names
}

/** The tabindex of each element, so a roving tab stop can be read off in one line. */
export const tabIndexes = (items: Locator) => items.evaluateAll((all) => all.map((element) => element.getAttribute('tabindex')))

export interface Ring {
  /** Whether the focused element matches :focus-visible: the browser decided a ring belongs here. */
  visible: boolean
  /** The tag of the element that draws the ring: the focused one, a box inside it, or the zone around it. */
  on: string
  style: string
  width: number
  /** The outline colour's alpha, 0 to 1: a transparent outline is drawn and seen by nobody. */
  alpha: number
  /** The same element's outline style with the focus taken away: a ring that stays is not the focus ring. */
  idle: string
  /** The nearest ancestor whose overflow cuts the outline's box, or null when the whole ring shows. */
  cut: string | null
}

/** The ring of the focused element: its own outline, else a descendant's, a sibling's, or the nearest ancestor's inside #demo.
 * The focus is taken away and given back with no focus event reaching the page, so only an outline the focus draws counts. */
export function ringOfFocus(page: Page): Promise<Ring | null> {
  return page.evaluate(() => {
    const focused = document.activeElement
    if (!(focused instanceof HTMLElement) || focused === document.body) return null
    // A file input at opacity 0 over its zone, or a slider's clipped range input, keeps the browser's outline and paints none of it.
    const drawn = (element: Element) => {
      const style = getComputedStyle(element)
      const box = element.getBoundingClientRect()
      const hidden = style.opacity === '0' || style.visibility !== 'visible' || box.width <= 1 || box.height <= 1
        || style.clipPath !== 'none' || style.getPropertyValue('clip') !== 'auto'
      return style.outlineStyle !== 'none' && !hidden
    }
    const around: Element[] = []
    for (let up = focused.parentElement; up && up.id !== 'demo'; up = up.parentElement) around.push(up)
    // A slider's knob, beside its range input, draws the ring the input's focus asks for.
    const beside = [...(focused.parentElement?.children ?? [])].filter((el) => el !== focused).flatMap((el) => [el, ...el.querySelectorAll('*')])
    const candidates = [focused, ...focused.querySelectorAll('*'), ...beside, ...around].filter(drawn)
    const visible = focused.matches(':focus-visible')
    // Captured on the window and stopped there, so no handler hears the blur and the focus: no popup closes, no state moves.
    const silence = (event: Event) => { event.stopImmediatePropagation() }
    const kinds = ['blur', 'focus', 'focusin', 'focusout'] as const
    for (const kind of kinds) window.addEventListener(kind, silence, true)
    focused.blur()
    const idle = new Map(candidates.map((el) => [el, getComputedStyle(el).outlineStyle]))
    focused.focus({ focusVisible: true, preventScroll: true })
    for (const kind of kinds) window.removeEventListener(kind, silence, true)
    const ring = candidates.find((el) => drawn(el) && idle.get(el) === 'none') ?? candidates[0] ?? null
    const style = ring ? getComputedStyle(ring) : null
    const colour = style?.outlineColor ?? 'transparent'
    const [, alpha = '1', percent = ''] = /\/\s*([\d.]+)(%?)\s*\)$/.exec(colour) ?? /^rgba\([^,]+,[^,]+,[^,]+,\s*([\d.]+)()\)$/.exec(colour) ?? []
    let cut: string | null = null
    if (ring && style) {
      const reach = Number.parseFloat(style.outlineWidth) + Number.parseFloat(style.outlineOffset)
      const box = ring.getBoundingClientRect()
      for (let up = ring.parentElement; up && up !== document.body && cut === null; up = up.parentElement) {
        const { overflowX, overflowY } = getComputedStyle(up)
        const own = up.getBoundingClientRect()
        const [left, top] = [own.left + up.clientLeft, own.top + up.clientTop]
        const sideways = overflowX !== 'visible' && (box.left - reach < left - 0.5 || box.right + reach > left + up.clientWidth + 0.5)
        const upright = overflowY !== 'visible' && (box.top - reach < top - 0.5 || box.bottom + reach > top + up.clientHeight + 0.5)
        if (sideways || upright) cut = `${up.tagName.toLowerCase()}${up.id ? `#${up.id}` : ''} (overflow ${overflowX} ${overflowY})`
      }
    }
    return {
      visible,
      on: ring?.tagName.toLowerCase() ?? '(none)',
      style: style?.outlineStyle ?? 'none',
      width: style ? Number.parseFloat(style.outlineWidth) : 0,
      alpha: colour === 'transparent' ? 0 : Number(alpha) / (percent === '%' ? 100 : 1),
      idle: ring ? idle.get(ring) ?? 'none' : 'none',
      cut,
    }
  })
}

/** The focused element's name in the accname order: aria-labelledby, aria-label, a label for it, its text, else tag and role. */
export function focusName(page: Page): Promise<string> {
  return page.evaluate(() => {
    const at = document.activeElement
    if (!at || at === document.body) return '(body)'
    // A button may name itself among its labelling ids, by its own aria-label.
    const by = at.getAttribute('aria-labelledby')?.split(' ')
      .map((id) => { const part = document.getElementById(id); return part?.getAttribute('aria-label') ?? part?.textContent ?? '' })
      .join(' ').trim()
    const label = at.id ? document.querySelector(`label[for="${CSS.escape(at.id)}"]`)?.textContent.trim() : undefined
    return by || at.getAttribute('aria-label') || label || at.textContent.trim() || `${at.tagName.toLowerCase()} ${at.getAttribute('role') ?? ''}`.trim()
  })
}

/** How far the page is scrolled, rounded: a key a widget handles must not also scroll the page. */
export const pageScroll = (page: Page) => page.evaluate(() => Math.round(window.scrollY))

/**
 * The ring the focus draws, read by the strict probe: :focus-visible, solid, 2 px or more, coloured, gone without the focus,
 * not cut. With `holder`, that ancestor wears it too; a Locator paints it, and is probed when it holds the focus.
 */
export async function expectRing(target: Page | Locator, label = 'the focused element', holder?: string): Promise<void> {
  const page = 'keyboard' in target ? target : target.page()
  const state = () => page.evaluate(() => {
    const at = document.activeElement
    if (!at || at === document.body) return 'nothing is focused'
    return at.matches(':focus-visible') ? 'visible' : 'not :focus-visible'
  })
  // Base UI moves the focus in a microtask, so the keyboard's last step may still be landing.
  try {
    await expect.poll(state, { timeout: 2000 }).toBe('visible')
  } catch {
    throw new Error(`${label}: ${await state()}`)
  }
  if (!('keyboard' in target)) {
    expect(await outlineOf(target), `${label} paints the ring`).toEqual({ style: 'solid', width: '2px' })
    // A highlighted row draws its ring from data-highlighted (ROW_HIGHLIGHT), not from the focus, so it outlives a blur.
    if (await target.evaluate((element) => element.hasAttribute('data-highlighted') || !element.contains(document.activeElement))) return
  }
  const ring = await ringOfFocus(page)
  expect(ring, `${label}: nothing is focused`).not.toBeNull()
  expect(ring?.style, `${label}: no outline on ${String(ring?.on)}`).toBe('solid')
  expect(ring?.idle, `${label}: the outline on ${String(ring?.on)} stays without the focus`).toBe('none')
  expect(ring?.width, `${label}: outline width on ${String(ring?.on)}`).toBeGreaterThanOrEqual(2)
  expect(ring?.alpha, `${label}: the outline on ${String(ring?.on)} is transparent`).toBeGreaterThan(0)
  expect(ring?.cut, `${label}: the ring on ${String(ring?.on)} is cut`).toBeNull()
  if (holder !== undefined) expect(await ringOf(page, holder), `${label}: no ring on ${holder}`).toEqual({ visible: true, style: 'solid', width: '2px' })
}
