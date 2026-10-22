// R-5.12-4: one class string per element Accordion styles, built from the shared constants.
import {
  BORDER, FADE_MOTION, FOCUS_RING_INSET, HOVER, POINTER, SCROLL_X, TOUCH_TARGET, TRANSITION,
} from '#shared/classes.js'
import type { Size } from '#shared/contracts/size.js'

/** A disabled root dims as one box, fill and edge too, as Figma 138:1118 draws it; forced colours keep it opaque
 * and grey the trigger instead. The named group lets a trigger inside it skip its own dimming. */
export const ACCORDION_ROOT_DISABLED = 'group/accordion data-disabled:opacity-50 forced-colors:data-disabled:opacity-100'

/** The box. It clips, so a hover fill ends at its rounded corners, and it breaks a word too long
 * for it. One grid column: a parent that fits its content is never widened by what a panel holds. */
export const ACCORDION_ROOT = `grid grid-cols-1 overflow-hidden rounded-box bg-surface-raised text-body wrap-anywhere ${BORDER} ${ACCORDION_ROOT_DISABLED}`

/** A line above every item but the first, whose edge the box draws. */
export const ACCORDION_ITEM = 'border-t-(length:--tc-line-width) border-line first:border-t-0'

/** The box clips a square ring at its corners, so the first and the last trigger take its radius. */
export const ACCORDION_TRIGGER_CORNERS = '[:first-child>*>&]:rounded-t-box [:last-child>*>&]:not-data-panel-open:rounded-b-box'

/** Forced colours keep the 50% of a disabled trigger, which a theme can make unreadable: it takes the system's own grey. */
export const ACCORDION_TRIGGER_FORCED = 'forced-colors:data-disabled:text-[GrayText] forced-colors:data-disabled:opacity-100'

/** A disabled item dims its trigger, but not inside a disabled root, which has dimmed the whole box already,
 * and not under forced colours, where the trigger takes GrayText at full strength instead. */
export const ACCORDION_TRIGGER_DISABLED = [
  'disabled:pointer-events-none data-disabled:pointer-events-none',
  'not-forced-colors:not-group-data-disabled/accordion:disabled:opacity-50',
  'not-forced-colors:not-group-data-disabled/accordion:data-disabled:opacity-50',
].join(' ')

/** A row as wide as the box. Its ring is drawn inside it, because the box clips. Where six letters
 * of the title and the caret do not fit side by side (text at 200%), the caret wraps below. */
export const ACCORDION_TRIGGER = [
  'group flex w-full flex-wrap items-center gap-2.5 text-start font-medium text-body tone-neutral',
  HOVER.ghost,
  FOCUS_RING_INSET,
  POINTER,
  TOUCH_TARGET,
  TRANSITION,
  ACCORDION_TRIGGER_DISABLED,
  ACCORDION_TRIGGER_CORNERS,
  ACCORDION_TRIGGER_FORCED,
].join(' ')

/** The trigger's padding and type step: md is the 41 px row Figma 138:994 draws on the stage, xs the 33 px box of its states
 * strip; custom emits none. */
export const ACCORDION_TRIGGER_SIZE = {
  xs: 'px-2.5 py-2 text-xs',
  sm: 'px-3 py-2.5 text-sm',
  md: 'px-3.5 py-3 text-sm',
  lg: 'px-4 py-3.5 text-base',
  xl: 'px-5 py-4 text-base',
  custom: '',
} as const satisfies Record<Size, string>

/** The title gives way and wraps, but never below six letters: under that the caret wraps instead (it fell to 0 px). */
export const ACCORDION_TITLE = 'min-w-0 grow basis-[6ch]'

/** The box around the caret. It turns upside down while its panel is open: the group is the trigger,
 * which Base UI marks. The colour sits here, not on the svg, where forced colours would keep it;
 * there it is the text colour of the system, and the grey of a disabled trigger has to be named. */
export const ACCORDION_CARET = [
  'ms-auto flex shrink-0 text-muted transition-[rotate] duration-(--tc-duration) group-data-panel-open:rotate-180',
  'forced-colors:group-data-disabled:text-[GrayText]',
].join(' ')

/** PLAN 5.8: a fade and no height. It has no padding: a closed panel is laid out, and must be 0 px tall. */
export const ACCORDION_PANEL = `text-muted ${FADE_MOTION}`

/** The panel's type step, the trigger's own; custom emits none. */
export const ACCORDION_PANEL_SIZE = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-base',
  custom: '',
} as const satisfies Record<Size, string>

/** What a panel holds. It scrolls sideways under a table wider than the box, and its ring is drawn
 * inside it. The 4 px above keep the ring of a control on its first line from being cut. */
export const ACCORDION_CONTENT = `pt-1 ${SCROLL_X} ${FOCUS_RING_INSET} [:last-child>*>&]:rounded-b-box`

/** The content's padding, lined up with the trigger's at each size; custom emits none. */
export const ACCORDION_CONTENT_SIZE = {
  xs: 'px-2.5 pb-2.5',
  sm: 'px-3 pb-3',
  md: 'px-3.5 pb-3.5',
  lg: 'px-4 pb-4',
  xl: 'px-5 pb-5',
  custom: '',
} as const satisfies Record<Size, string>
