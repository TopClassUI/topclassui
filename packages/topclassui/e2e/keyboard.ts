// Helpers for the keyboard specs (R-5.6-1, R-5.6-3): the ring a focused control paints, and the stops Tab walks.
import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

import { expect, type Locator, type Page } from '@playwright/test'

/** The outline an element paints now. */
export const outlineOf = (target: Locator) => target.evaluate((element) => {
  const style = getComputedStyle(element)
  return { style: style.outlineStyle, width: style.outlineWidth }
})

/** The library's ring: solid and --tc-ring-width wide. */
export async function expectRing(target: Locator, label = 'the focused element'): Promise<void> {
  expect(await outlineOf(target), `${label} paints the ring`).toEqual({ style: 'solid', width: '2px' })
}

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

/** The component folders under `root` with neither their own `e2e/keyboard-<slug>.spec.ts` nor a reason for having none. */
export const foldersWithoutKeyboardSpec = (root: string, reasons: Readonly<Record<string, string>>): string[] =>
  readdirSync(join(root, 'src', 'components'), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((slug) => !existsSync(join(root, 'e2e', `keyboard-${slug}.spec.ts`)) && !(slug in reasons))
    .sort()
