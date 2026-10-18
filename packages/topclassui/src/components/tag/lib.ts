// Where the focus goes when a removed tag takes its x, and the focus on it, out of the page.
import { findNeighbour, isTabStop, nearestOf } from '#shared/focus-neighbour.js'

/** The next x of the same list, else the one before, else the next tab stop on the page, else the one before. */
export function neighbourOf(x: HTMLElement): HTMLElement | null {
  const list = x.closest('ul, ol, [role="list"]') ?? x.ownerDocument
  const others = [...list.querySelectorAll<HTMLElement>('[data-tag-remove]')].filter(isTabStop)
  return nearestOf(x, others) ?? findNeighbour(x)
}
