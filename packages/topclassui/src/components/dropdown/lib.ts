import { Children, isValidElement, type ReactElement, type ReactNode } from 'react'

import type { MenuItem } from '#shared/contracts/menu.js'
import { renderLink } from '#shared/link.js'
import { renderTrigger } from '#shared/render-trigger.js'
import { truncateLabel } from '#shared/truncate-label.js'
import { DROPDOWN_BOUNDARIES } from './boundaries.js'
import { DROPDOWN_ICON, DROPDOWN_SHORTCUT } from './classes.js'

/** The selector of one menu's own popup, by the scope its root made. The Escape guard looks no
 * further: the menu's own trigger can sit inside a dialog, and is itself marked open. */
export function toPopupSelector(scope: string): string {
  return `[data-dropdown="${scope}"]`
}

/** What a row holds: the icon, hidden from a screen reader since the label is the name, the label
 * in the span that truncates it (R-5.2-7), and the shortcut, which is read out after the label. */
export function renderRow(icon: ReactNode, label: ReactNode, shortcut: string | undefined): ReactNode {
  return (
    <>
      {icon == null ? null : <span aria-hidden="true" className={DROPDOWN_ICON}>{icon}</span>}
      {truncateLabel(label, DROPDOWN_BOUNDARIES.labelMaxLength)}
      {shortcut === undefined ? null : <span className={DROPDOWN_SHORTCUT}>{shortcut}</span>}
    </>
  )
}

/** What a row of the data-driven menu draws around its label. */
export function toRowProps({ icon, shortcut, tone }: MenuItem) {
  return { icon, shortcut, tone }
}

/** The anchor of one href item: the caller's `link` element with the item's href cloned in, or a
 * plain anchor. Flight can hand an element built on the server over as a lazy wrapper; toArray unwraps it.
 * renderLink leaves a children key that holds nothing, which Base UI would let erase the row: renderTrigger drops it. */
export function toLinkElement(link: ReactElement | undefined, href: string): ReactElement {
  const unwrapped = link == null || isValidElement(link) ? link : Children.toArray(link as ReactNode)[0]
  return renderTrigger(renderLink('DropdownMenu', unwrapped as ReactElement | undefined, href, {}), undefined).render
}
