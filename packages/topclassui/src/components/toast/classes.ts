// R-5.12-4: one class string per element Toast styles, built from the shared overlay constants.
import {
  BORDER, FADE_MOTION, FOCUS_RING, FOCUS_RING_INSET, HOVER, ICON_BUTTON, POPUP_PASSIVE, SCROLL_AREA, VIEWPORT_PASSIVE,
} from '#shared/classes.js'
import type { ToastIconType, ToastPlacement } from './types.js'

/** A column on the toast layer, 352 px wide or the screen, so a toast is the frame's 320. It lets every press through where no toast is, and
 * scrolls itself when its toasts are taller than the screen. F6 focuses it, so its ring is drawn inside its padding.
 * It is the container a toast measures, so enlarged text gets a narrow layout. */
export const TOAST_VIEWPORT = `@container fixed z-(--tc-z-toast) flex max-h-dvh w-88 max-w-full gap-2 p-(--tc-overlay-inset) ${SCROLL_AREA} ${FOCUS_RING_INSET} ${VIEWPORT_PASSIVE}`

/** Base UI lists the newest first, so the column runs away from the edge: the newest toast is the nearest. */
const TOP = 'top-0 flex-col pt-[calc(var(--tc-overlay-inset)+var(--tc-safe-top))]'
const BOTTOM = 'bottom-0 flex-col-reverse pb-[calc(var(--tc-overlay-inset)+var(--tc-safe-bottom))]'

/** R-5.3-1: the block edge and the inline side, logical, so start and end swap sides in RTL. */
export const TOAST_PLACEMENT = {
  'top-start': `${TOP} inset-s-0`,
  top: `${TOP} inset-x-0 mx-auto`,
  'top-end': `${TOP} inset-e-0`,
  'bottom-start': `${BOTTOM} inset-s-0`,
  bottom: `${BOTTOM} inset-x-0 mx-auto`,
  'bottom-end': `${BOTTOM} inset-e-0`,
} as const satisfies Record<ToastPlacement, string>

/** Base UI moves a held toast by an inline transform and leaves these two once it lets go, so the toast rests
 * on a transform too: on the translate property the two would add up, twice the finger's travel. */
const FOLLOW = 'transform-[translate(var(--toast-swipe-movement-x,0px),var(--toast-swipe-movement-y,0px))] data-swiping:select-none'

/** One toast: the raised surface with the frame's own shadow (forced colours drop it and keep the line), the fade, a grid of icon, text and x, the action under the text. Under 16rem (a
 * 32px root on a phone) the icon and the action take rows of their own, so the text keeps a usable width (WCAG 1.4.4).
 * It takes presses inside a viewport that lets them through; a toast past the limit stays mounted, not drawn. */
export const TOAST_ROOT = [
  `rounded-box bg-surface-raised text-body ${BORDER} shadow-(--tc-shadow-toast) ${FADE_MOTION} ${FOCUS_RING} ${POPUP_PASSIVE}`,
  'grid shrink-0 grid-cols-[auto_minmax(0,1fr)_auto] items-start p-3.5 wrap-anywhere data-limited:hidden',
  FOLLOW,
].join(' ')

/** The icon sits on the first line of the title, and its colour is on this box, never on the svg. Margins, not a
 * column gap: a toast with no icon keeps no gap for it. */
export const TOAST_ICON = 'col-start-1 row-start-1 me-2.5 flex h-5 shrink-0 items-center @max-3xs:mb-2'

/** R-5.2-3: the on-soft colour of each tone that has an icon; a toast that waits is muted. */
export const TOAST_ICON_TONE = {
  success: 'text-success-on-soft',
  danger: 'text-danger-on-soft',
  error: 'text-danger-on-soft',
  warning: 'text-warning-on-soft',
  info: 'text-info-on-soft',
  loading: 'text-muted',
} as const satisfies Record<ToastIconType, string>

/** Only the spinner turns, and not at all for a reader who asked for less motion. */
export const TOAST_ICON_SVG = {
  success: '',
  danger: '',
  error: '',
  warning: '',
  info: '',
  loading: 'animate-spin motion-reduce:animate-none',
} as const satisfies Record<ToastIconType, string>

export const TOAST_CONTENT = 'col-start-2 row-start-1 flex min-w-0 flex-col gap-0.75 @max-3xs:col-span-2 @max-3xs:col-start-1 @max-3xs:row-start-2'

/** The frame sets both on tight lines, 3 px apart. */
export const TOAST_TITLE = 'text-sm/tight font-semibold text-body'

export const TOAST_DESCRIPTION = 'text-sm/tight text-muted wrap-anywhere'

/** A small outline button under the text, or across the whole toast when it is narrow. A long label wraps onto
 * more lines instead of leaving the toast. */
export const TOAST_ACTION = 'col-start-2 row-start-2 mt-2.5 self-start justify-self-start h-auto min-h-control-sm cursor-pointer whitespace-normal py-1 text-start @max-3xs:col-span-3 @max-3xs:col-start-1 @max-3xs:row-start-3'

/** The x: an icon button on the neutral ramp, so its hover is the ghost tint, its 14 px glyph on the padding's corner.
 * Beside the text and sticky, so it stays on screen while any of a toast taller than the screen shows (WCAG 2.5.7). */
export const TOAST_CLOSE = `${ICON_BUTTON} cursor-pointer text-muted tone-neutral ${HOVER.ghost} col-start-3 row-span-2 row-start-1 -me-1.25 -mt-1.25 ms-1.25 self-start sticky top-0`
