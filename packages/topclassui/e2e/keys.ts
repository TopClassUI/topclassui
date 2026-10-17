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

/** The focused element matches :focus-visible, and the focus itself draws a whole, solid, coloured outline of at least 2 px. */
export async function expectRing(page: Page, label: string): Promise<void> {
  const ring = await ringOfFocus(page)
  expect(ring, `${label}: nothing is focused`).not.toBeNull()
  expect(ring?.visible, `${label}: not :focus-visible`).toBe(true)
  expect(ring?.style, `${label}: no outline on ${String(ring?.on)}`).toBe('solid')
  expect(ring?.idle, `${label}: the outline on ${String(ring?.on)} stays without the focus`).toBe('none')
  expect(ring?.width, `${label}: outline width on ${String(ring?.on)}`).toBeGreaterThanOrEqual(2)
  expect(ring?.alpha, `${label}: the outline on ${String(ring?.on)} is transparent`).toBeGreaterThan(0)
  expect(ring?.cut, `${label}: the ring on ${String(ring?.on)} is cut`).toBeNull()
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
