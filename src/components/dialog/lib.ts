import type { DialogRootProps } from './types.js'

type OpenChange = NonNullable<DialogRootProps['onOpenChange']>

/** Whether children put anything on the page. React draws nothing for null, undefined, a
 * boolean or an empty string, so `{saving && 'Saving'}` is no content while it is false. */
export function hasContent(children: unknown): boolean {
  if (Array.isArray(children)) return children.some(hasContent)
  return children !== null && children !== undefined && typeof children !== 'boolean' && children !== ''
}

/** Whether the dialog a key was pressed in holds a trigger whose own popup is still open.
 * Asked of the method, not of `instanceof Element`: an element of another frame is no instance. */
function holdsOpenPopup(target: EventTarget | null): boolean {
  const from = target as Partial<Element> | null
  const dialog = typeof from?.closest === 'function' ? from.closest('[role="dialog"], [role="alertdialog"]') : null
  return dialog?.querySelector('[data-popup-open]') != null
}

/** One Escape closes one thing. A tooltip opened by hover is not in Base UI's tree of popups,
 * so the key that closes it would close the dialog as well. While a trigger inside the dialog
 * shows its popup open, the dialog cancels its own close and lets the key travel on to it. */
export function guardEscape(onOpenChange: DialogRootProps['onOpenChange']): OpenChange {
  return (open, details) => {
    if (!open && details.reason === 'escape-key' && holdsOpenPopup(details.event.target)) {
      details.cancel()
      // Base UI stops the key at the popup; the tooltip listens on the document, further up.
      details.allowPropagation()
      return
    }
    onOpenChange?.(open, details)
  }
}
