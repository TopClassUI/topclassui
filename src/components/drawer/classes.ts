// R-5.12-4: one class string per element Drawer styles, built from the shared overlay constants.
import {
  ACTIONS_WRAP, FADE_MOTION, FOCUS_RING_INSET, FORCED_EDGE, HOVER, ICON_BUTTON, SCRIM, SCROLL_AREA,
} from '#shared/classes.js'
import type { Size } from '#shared/contracts/size.js'
import type { DrawerPlacement } from './types.js'

/** The scrim, on the drawer layer, under a dialog. It fades; the page behind is locked by Base UI. */
export const DRAWER_BACKDROP = `${SCRIM} z-(--tc-z-drawer) ${FADE_MOTION}`

/** The whole screen: a row that seats the sheet against one of its edges. */
export const DRAWER_VIEWPORT = 'fixed inset-0 z-(--tc-z-drawer) flex'

/** R-5.3-1: the edge the row pushes the sheet to. A flex row follows the direction, so start and end mirror. */
export const DRAWER_VIEWPORT_EDGE = {
  start: 'justify-start',
  end: 'justify-end',
  top: 'items-start',
  bottom: 'items-end',
} as const satisfies Record<DrawerPlacement, string>

/** Base UI moves the sheet by an inline transform while a finger holds it, and by these two variables
 * once it lets go. So the sheet rests on a transform too: on the translate property the two add up,
 * 80 px of sheet for 40 px of finger. A mouse that drags the sheet by its header selects no text. */
export const DRAWER_FOLLOW = 'transform-[translate(var(--drawer-swipe-movement-x,0px),var(--drawer-swipe-movement-y,0px))] data-swiping:select-none'

/** The slide. Not SLIDE_MOTION: that one eases the translate property, and the sheet moves by
 * transform. Base UI switches the transition off itself, inline, for as long as a finger holds the sheet. */
export const DRAWER_MOTION = 'transition-transform duration-(--tc-duration-slow) ease-out'

/** A column on the raised surface. It scrolls itself only where its bars leave the body no room,
 * breaks a word too long for its width, and draws its ring inside its box: three of its edges are
 * the edges of the screen. */
export const DRAWER_POPUP = [
  'relative flex flex-col bg-surface-raised text-body shadow-lg wrap-anywhere',
  DRAWER_FOLLOW,
  DRAWER_MOTION,
  SCROLL_AREA,
  FOCUS_RING_INSET,
].join(' ')

/** R-5.3-2: the slide of the two inline sheets multiplies by --tc-dir, so it leaves by its own edge in RTL. */
const OFF_END = 'data-starting-style:transform-[translateX(calc(100%*var(--tc-dir)))] data-ending-style:transform-[translateX(calc(100%*var(--tc-dir)))]'
const OFF_START = 'data-starting-style:transform-[translateX(calc(-100%*var(--tc-dir)))] data-ending-style:transform-[translateX(calc(-100%*var(--tc-dir)))]'
const OFF_TOP = 'data-starting-style:transform-[translateY(-100%)] data-ending-style:transform-[translateY(-100%)]'
const OFF_BOTTOM = 'data-starting-style:transform-[translateY(100%)] data-ending-style:transform-[translateY(100%)]'

/** The x floats over the first row of the sheet. Whatever that row is, it ends 4rem short of the
 * edge and is as tall as the x, so no line of it or of the row under it runs beneath the x. The
 * x itself is left out: in an empty sheet it is the first child. */
const CLEAR_OF_X = '*:first:not-last:pe-16 *:first:not-last:min-h-[calc(0.75rem+var(--tc-target-min,24px))] pointer-coarse:*:first:not-last:min-h-[calc(0.75rem+var(--tc-target-coarse,44px))]'

/** In a bottom sheet the first row is the second child: the grabber above it has used 1.125rem of the 0.75rem and the x. */
const CLEAR_OF_X_BOTTOM = '*:nth-2:not-last:pe-16 *:nth-2:not-last:min-h-[calc(var(--tc-target-min,24px)-0.375rem)] pointer-coarse:*:nth-2:not-last:min-h-[calc(var(--tc-target-coarse,44px)-0.375rem)]'

/** By placement: the box, the line on the one edge that faces the page, the safe areas of the screen
 * edges the sheet touches, where it slides in from and out to, and the corner it keeps for the x. */
export const DRAWER_EDGE = {
  start: `h-dvh w-full border-e-(length:--tc-line-width) border-line pt-safe pb-safe ps-safe ${OFF_START} ${CLEAR_OF_X}`,
  end: `h-dvh w-full border-s-(length:--tc-line-width) border-line pt-safe pb-safe pe-safe ${OFF_END} ${CLEAR_OF_X}`,
  top: `max-h-[90dvh] w-full border-b-(length:--tc-line-width) border-line pt-safe ps-safe pe-safe ${OFF_TOP} ${CLEAR_OF_X}`,
  bottom: `max-h-[90dvh] w-full border-t-(length:--tc-line-width) border-line pb-safe ps-safe pe-safe ${OFF_BOTTOM} ${CLEAR_OF_X_BOTTOM}`,
} as const satisfies Record<DrawerPlacement, string>

/** R-5.2-3: the widest a start or an end sheet grows, 256 to 480 px. Below that it fills the screen. */
export const DRAWER_WIDTH = {
  xs: 'max-w-64',
  sm: 'max-w-72',
  md: 'max-w-80',
  lg: 'max-w-96',
  xl: 'max-w-120',
  custom: '',
} as const satisfies Record<Size, string>

/** The bar a bottom sheet starts with. Decoration: the whole sheet takes the swipe. Forced colours
 * erase its fill, so it keeps a line there. */
export const DRAWER_GRABBER = `mx-auto mt-2.5 mb-1 h-1 w-9 shrink-0 rounded-full bg-line-strong ${FORCED_EDGE}`

/** It never shrinks, so it keeps its box while the body scrolls. Its end padding keeps a title clear
 * of the x, which is 44 px wide under a coarse pointer. */
export const DRAWER_HEADER = 'shrink-0 border-b-(length:--tc-line-width) border-line py-4 ps-4 pe-16'

export const DRAWER_TITLE = 'text-base font-semibold text-body'

export const DRAWER_DESCRIPTION = 'text-sm text-muted'

/** On a screen under 17rem tall (272 px) the bars leave the body a few lines. There it stops scrolling
 * and the sheet scrolls as one. flex-none, not shrink-0: a side sheet has a height of its own, so a
 * body of flex-1 starts from nothing and its text would be painted over the footer. */
export const DRAWER_BODY_SHORT = '[@media(height<17rem)]:flex-none [@media(height<17rem)]:overflow-y-visible'

/** R-10.5-1: the scroll container. Never shorter than one line of text and its padding, and
 * its ring is drawn inside its box, because the sheet clips whatever is outside it. */
export const DRAWER_BODY = `min-h-13 flex-1 px-4 py-4 text-sm ${SCROLL_AREA} ${FOCUS_RING_INSET} ${DRAWER_BODY_SHORT}`

/** It never shrinks either. The actions sit at the end and wrap onto rows on a narrow screen. */
export const DRAWER_FOOTER = `flex shrink-0 flex-wrap items-center justify-end gap-2 border-t-(length:--tc-line-width) border-line px-4 py-4 ${ACTIONS_WRAP}`

/** The x: an icon button on the neutral ramp, so its hover is the ghost tint. */
export const DRAWER_CLOSE = `${ICON_BUTTON} text-muted tone-neutral ${HOVER.ghost}`

/** WCAG 2.5.7: the x every sheet ends with. An absolute box ignores the padding of its parent,
 * so its offsets add the safe areas themselves: those of the screen edges its corner touches. */
export const DRAWER_X = {
  start: 'absolute top-[calc(0.75rem+var(--tc-safe-top))] inset-e-3',
  end: 'absolute top-[calc(0.75rem+var(--tc-safe-top))] inset-e-[calc(0.75rem+var(--tc-safe-end))]',
  top: 'absolute top-[calc(0.75rem+var(--tc-safe-top))] inset-e-[calc(0.75rem+var(--tc-safe-end))]',
  bottom: 'absolute top-3 inset-e-[calc(0.75rem+var(--tc-safe-end))]',
} as const satisfies Record<DrawerPlacement, string>
