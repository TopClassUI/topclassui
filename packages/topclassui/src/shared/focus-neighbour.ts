// Where the focus goes when the control that held it leaves the page (APG "Persistence of focus"); no tabbable dep (R-5.9-1).

const FOCUSABLE = [
  'a[href]', 'area[href]', 'button', 'input:not([type="hidden"])', 'select', 'textarea', 'iframe', 'summary',
  'audio[controls]', 'video[controls]', '[contenteditable]:not([contenteditable="false"])', '[tabindex]',
].join(', ')

/** Whether Tab stops on it: in the tab order, enabled, and neither inert, hidden nor undrawn. */
export function isTabStop(element: HTMLElement): boolean {
  if (element.tabIndex < 0 || element.matches(':disabled') || element.closest('[inert], [hidden]') !== null) return false
  // jsdom has no checkVisibility: there an element counts as drawn.
  return typeof element.checkVisibility !== 'function' || element.checkVisibility({ visibilityProperty: true })
}

/** The tab stops under `root`, in document order. */
export function tabStopsIn(root: ParentNode): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(isTabStop)
}

/** The first of `candidates` after `gone` and outside it, else the last one before it, else null. */
export function nearestOf(gone: Element, candidates: readonly HTMLElement[]): HTMLElement | null {
  const outside = candidates.filter((candidate) => !gone.contains(candidate))
  const after = outside.find((candidate) => (gone.compareDocumentPosition(candidate) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0)
  return after ?? outside.reverse().find((candidate) => (gone.compareDocumentPosition(candidate) & Node.DOCUMENT_POSITION_PRECEDING) !== 0) ?? null
}

/** The tab stop the focus moves to once `gone` leaves the page: the next one after it, else the one before. */
export function findNeighbour(gone: Element): HTMLElement | null {
  return nearestOf(gone, tabStopsIn(gone.ownerDocument))
}

/** Focuses `next` if the focus fell to the body and `next` is still on the page; a caller that moved it wins. */
export function restoreFocus(next: HTMLElement | null, visible: boolean): void {
  const active = next?.ownerDocument.activeElement
  if (!next?.isConnected || (active !== null && active !== undefined && active !== next.ownerDocument.body)) return
  // focusVisible is in the DOM lib from TypeScript 6 only; a typed variable keeps the copy compiling on 5.x.
  const options: FocusOptions & { focusVisible?: boolean } = { focusVisible: visible }
  next.focus(options)
}
