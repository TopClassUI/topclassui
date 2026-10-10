/** What the guard reads of the details Base UI hands the onOpenChange of every overlay root. */
interface CloseDetails {
  reason: string
  event: { target: EventTarget | null }
  cancel: () => void
  allowPropagation: () => void
}

/** Whether the popup a key was pressed in holds a trigger whose own popup is still open.
 * Asked of the method, not of `instanceof Element`: an element of another frame is no instance. */
function holdsOpenPopup(target: EventTarget | null, popups: string): boolean {
  const from = target as Partial<Element> | null
  const popup = typeof from?.closest === 'function' ? from.closest(popups) : null
  return popup?.querySelector('[data-popup-open]') != null
}

/** One Escape closes one thing. A tooltip opened by hover is not in Base UI's tree of popups,
 * so its key would close the overlay too: while a trigger inside `popups` shows its popup open,
 * the overlay cancels its own close and lets the key travel on. A menu passes its own selector. */
export function guardEscape<Details extends CloseDetails>(
  onOpenChange: ((open: boolean, details: Details) => void) | undefined,
  popups = '[role="dialog"], [role="alertdialog"]',
): (open: boolean, details: Details) => void {
  return (open, details) => {
    if (!open && details.reason === 'escape-key' && holdsOpenPopup(details.event.target, popups)) {
      details.cancel()
      // Base UI stops the key at the popup; the tooltip listens on the document, further up.
      details.allowPropagation()
      return
    }
    onOpenChange?.(open, details)
  }
}
