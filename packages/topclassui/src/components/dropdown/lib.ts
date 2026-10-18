import type { MenuItem } from '#shared/contracts/menu.js'

/** The selector of one menu's own popup, by the scope its root made. The Escape guard looks no
 * further: the menu's own trigger can sit inside a dialog, and is itself marked open. */
export function toPopupSelector(scope: string): string {
  return `[data-dropdown="${scope}"]`
}

/** What a row of the data-driven menu draws around its label. */
export function toRowProps({ icon, shortcut, tone }: MenuItem) {
  return { icon, shortcut, tone }
}
