/** The selector of one popover's own popup, by the scope its root made. The Escape guard looks
 * no further: the popover's own trigger can sit inside another dialog, and is itself open. */
export function toPopupSelector(scope: string): string {
  return `[data-popover="${scope}"]`
}
