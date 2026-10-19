// R-5.12-4: one class string per element Dialog styles, built from the shared overlay constants.
import {
  ACTIONS_WRAP, FADE_MOTION, FOCUS_RING_INSET, HOVER, ICON_BUTTON, OVERLAY_SURFACE, POPUP_MOTION, SCRIM, SCROLL_AREA,
} from '#shared/classes.js'
import type { Size } from '#shared/contracts/size.js'

/** The scrim, on the dialog layer. It fades; the page behind is locked by Base UI. */
export const DIALOG_BACKDROP = `${SCRIM} z-(--tc-z-dialog) ${FADE_MOTION}`

/** The whole screen, with the inset every edge keeps clear. It centres the popup, and it is the
 * size container DIALOG_BODY_SHORT asks, since a container query reads rem from the root. */
export const DIALOG_VIEWPORT = 'fixed inset-0 z-(--tc-z-dialog) grid place-items-center p-(--tc-overlay-inset) [container-type:size]'

/** A column no taller than the screen less the inset, so the body is what scrolls. It scrolls
 * itself only where the three bars cannot fit, and it breaks a word too long for its width.
 * Its ring is drawn inside its box: outside it would lie on the scrim, at 1.8:1. */
export const DIALOG_POPUP = [
  'flex max-h-[calc(100dvh-2*var(--tc-overlay-inset))] w-full flex-col wrap-anywhere',
  SCROLL_AREA,
  OVERLAY_SURFACE,
  POPUP_MOTION,
  FOCUS_RING_INSET,
].join(' ')

/** R-5.2-3: the widest the popup grows, 320 to 640 px. Below that it fills the viewport. */
export const DIALOG_WIDTH = {
  xs: 'max-w-80',
  sm: 'max-w-90',
  md: 'max-w-95',
  lg: 'max-w-128',
  xl: 'max-w-160',
  custom: '',
} as const satisfies Record<Size, string>

/** It never shrinks, so it keeps its box while the body scrolls. */
export const DIALOG_HEADER = 'flex shrink-0 items-start gap-3 border-b-(length:--tc-line-width) border-line px-4.5 py-3.5'

/** The title and the description: the column that gives way, so the x keeps its place. */
export const DIALOG_HEADING = 'min-w-0 flex-1'

export const DIALOG_TITLE = 'text-base font-semibold text-body'

export const DIALOG_DESCRIPTION = 'text-sm text-muted'

/** Where the viewport, less its inset, is under 15rem tall (272 px of screen at a 16 px root) the body
 * has four lines or fewer. It stops scrolling and the popup scrolls as one, or a wheel that starts on
 * the body ends inside it. Not @media: there rem stays 16 px, while the bars grow with the root. */
export const DIALOG_BODY_SHORT = '[@container(height<15rem)]:shrink-0 [@container(height<15rem)]:overflow-y-visible'

/** R-10.5-1: the scroll container. Never shorter than one line of text and its padding, and
 * its ring is drawn inside its box, because the popup clips whatever is outside it. */
export const DIALOG_BODY = `min-h-15 flex-1 px-4.5 py-4.5 text-sm text-muted ${SCROLL_AREA} ${FOCUS_RING_INSET} ${DIALOG_BODY_SHORT}`

/** It never shrinks either. The actions sit at the end and wrap onto rows on a narrow screen,
 * and a label too long for its row wraps inside its action. */
export const DIALOG_FOOTER = `flex shrink-0 flex-wrap items-center justify-end gap-2 border-t-(length:--tc-line-width) border-line px-4.5 py-3.5 ${ACTIONS_WRAP}`

/** The x: an icon button on the neutral ramp, so its hover is the ghost tint. It reaches 5 px into the
 * padding, so its 14 px glyph ends on the padding line, as drawn, while its box keeps 24 px. */
export const DIALOG_CLOSE = `-me-1.25 ${ICON_BUTTON} text-muted tone-neutral ${HOVER.ghost}`
