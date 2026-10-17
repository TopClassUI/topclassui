import { truncateLabel } from '#shared/truncate-label.js'
import { DROPDOWN_BOUNDARIES } from '../boundaries.js'
import { DROPDOWN_ICON, DROPDOWN_SHORTCUT } from '../classes.js'
import type { DropdownRowProps } from '../types.js'

/** What a row holds: the icon, hidden from a screen reader since the label is the name, the label
 * in the span that truncates it (R-5.2-7), and the shortcut, which is read out after the label. */
export function DropdownRow({ icon, label, shortcut }: DropdownRowProps) {
  return (
    <>
      {icon == null ? null : <span aria-hidden="true" className={DROPDOWN_ICON}>{icon}</span>}
      {truncateLabel(label, DROPDOWN_BOUNDARIES.labelMaxLength)}
      {shortcut === undefined ? null : <span className={DROPDOWN_SHORTCUT}>{shortcut}</span>}
    </>
  )
}
