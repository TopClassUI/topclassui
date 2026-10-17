// The keyboard specs: where the focus is, and the ring the browser draws for it.
// The ring is read as computed outline style and width, never as forced-colours pixels, so any Chromium proves it.
import { expect, type Page } from '@playwright/test'

export interface Ring {
  /** Whether the focused element matches :focus-visible: the browser decided a ring belongs here. */
  visible: boolean
  /** The tag of the element that draws the ring: the focused one, a box inside it, or the zone around it. */
  on: string
  style: string
  width: number
}

/** The ring of the focused element: its own outline, else the first descendant's, else the nearest ancestor's inside #demo. */
export function ringOfFocus(page: Page): Promise<Ring | null> {
  return page.evaluate(() => {
    const focused = document.activeElement
    if (!(focused instanceof HTMLElement) || focused === document.body) return null
    // An element at opacity 0, as a file input over its zone, keeps the browser's outline and paints none of it.
    const drawn = (element: Element) => {
      const style = getComputedStyle(element)
      return style.outlineStyle !== 'none' && style.opacity !== '0' && style.visibility === 'visible'
    }
    const inside = [...focused.querySelectorAll('*')].find(drawn)
    let around: Element | null = null
    for (let up = focused.parentElement; up && up.id !== 'demo'; up = up.parentElement) if (drawn(up)) { around = up; break }
    const ring = drawn(focused) ? focused : inside ?? around
    const style = ring ? getComputedStyle(ring) : null
    return {
      visible: focused.matches(':focus-visible'),
      on: ring?.tagName.toLowerCase() ?? '(none)',
      style: style?.outlineStyle ?? 'none',
      width: style ? Number.parseFloat(style.outlineWidth) : 0,
    }
  })
}

/** The focused element matches :focus-visible and something draws a solid outline of at least 2 px for it. */
export async function expectRing(page: Page, label: string): Promise<void> {
  const ring = await ringOfFocus(page)
  expect(ring, `${label}: nothing is focused`).not.toBeNull()
  expect(ring?.visible, `${label}: not :focus-visible`).toBe(true)
  expect(ring?.style, `${label}: no outline on ${String(ring?.on)}`).toBe('solid')
  expect(ring?.width, `${label}: outline width on ${String(ring?.on)}`).toBeGreaterThanOrEqual(2)
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
    return by || at.getAttribute('aria-label') || label || at.textContent?.trim() || `${at.tagName.toLowerCase()} ${at.getAttribute('role') ?? ''}`.trim()
  })
}

/** How far the page is scrolled, rounded: a key a widget handles must not also scroll the page. */
export const pageScroll = (page: Page) => page.evaluate(() => Math.round(window.scrollY))
