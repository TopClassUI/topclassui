// The steps every keyboard spec repeats (R-5.6-1): the keys a direction gives the next and the previous
// item, where the focus is, which element of a composite holds the one tab stop, and the ring.
// The ring is read as its computed outline, not as pixels: forced colours and the pixel reads are focus-ring.spec's.
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

export interface Ring { visible: boolean, style: string, width: string }

/**
 * The ring of the focused element, or of its closest ancestor that matches `holder` when the ring is
 * drawn around it (a label round an invisible radio). `visible` is whether the focus matches :focus-visible.
 */
export function ringOf(page: Page, holder?: string): Promise<Ring> {
  return page.evaluate((selector) => {
    const element = document.activeElement
    if (!element || element === document.body) throw new Error('nothing is focused')
    const target = selector ? element.closest(selector) : element
    if (!target) throw new Error(`the focused element has no ancestor ${selector ?? ''}`)
    const style = getComputedStyle(target)
    return { visible: element.matches(':focus-visible'), style: style.outlineStyle, width: style.outlineWidth }
  }, holder)
}

/** The library's ring, 2 px and solid, on the focused element or its holder, shown because the keyboard put it there. */
export async function expectRing(page: Page, label: string, holder?: string): Promise<void> {
  await expect.poll(() => ringOf(page, holder), { message: `${label}: no focus-visible ring` })
    .toEqual({ visible: true, style: 'solid', width: '2px' })
}

/**
 * A row of a list or menu whose focus stays elsewhere or is drawn by Base UI's highlight: ROW_HIGHLIGHT rings
 * the highlighted row, so the mark follows `data-highlighted` and not :focus-visible.
 */
export function rowRingOf(row: Locator): Promise<Ring> {
  return row.evaluate((element) => {
    const style = getComputedStyle(element)
    return { visible: element.hasAttribute('data-highlighted'), style: style.outlineStyle, width: style.outlineWidth }
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
