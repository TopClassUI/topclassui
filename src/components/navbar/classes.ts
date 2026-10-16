// R-5.12-4: one class string per element Navbar styles, built from the shared constants.
import { CONTAIN, FOCUS_RING, HOVER, SCROLL_X, STICKY_TOP, TOUCH_TARGET } from '#shared/classes.js'
import type { NavbarTop } from './types.js'

/** The bar. One row while its parts fit; when they do not, a part drops to a row of its own
 * before the page grows wider. Its side padding is the drawn 20 px plus the safe area: the
 * safe utility alone would replace the 20 px and leave none. */
export const NAVBAR_ROOT = [
  'flex min-h-15 w-full flex-wrap items-center gap-x-6 gap-y-2 pb-1.5',
  'ps-[calc(1.25rem+var(--tc-safe-start))] pe-[calc(1.25rem+var(--tc-safe-end))]',
  'bg-surface-raised border-b-(length:--tc-line-width) border-line',
].join(' ')

/** R-5.2-3: a bar that sticks clears the top safe area too; one that scrolls away starts under it. */
export const NAVBAR_TOP = {
  sticky: `${STICKY_TOP} pt-[calc(0.375rem+var(--tc-safe-top))]`,
  flow: 'pt-1.5',
} as const satisfies Record<NavbarTop, string>

/** It keeps its width while the bar has room and gives way only when alone on a row that
 * is too narrow for it: its text then ends in an ellipsis, and an element it holds is cut at
 * its edge. Its own ring is an outline, which its own clipping does not reach. */
export const NAVBAR_BRAND = [
  'inline-flex items-center gap-2 overflow-hidden rounded-control text-base font-semibold text-body',
  CONTAIN,
  FOCUS_RING,
  TOUCH_TARGET,
].join(' ')

/** The landmark. A grid of one column that may shrink to nothing, so the list inside it can
 * scroll: a plain box would widen the bar, and a flex or grid parent of the bar, to the width
 * of all its links. It takes the room the brand and the actions leave, and no less than 6rem. */
export const NAVBAR_LINKS = 'grid min-w-0 grow basis-24 grid-cols-1'

/** The list scrolls sideways inside the bar. Its padding is the reach of a focus ring and a
 * pixel more, since a box that clips would cut the ring and a row of fractional widths ends a
 * fraction short; the margin takes the same room back. In px tokens, as the ring is. */
export const NAVBAR_LIST_ROOM = '-m-[calc(var(--tc-ring-width)+var(--tc-ring-offset)+1px)] p-[calc(var(--tc-ring-width)+var(--tc-ring-offset)+1px)]'

/** Tab does not scroll a link that is half in view: Chromium leaves it cut, by 31 px measured.
 * The list therefore snaps, to the one link that has the keyboard focus: with none, it scrolls freely.
 * Under the pointer it never snaps, or a wheel would spring back to a link that keeps the focus. */
export const NAVBAR_LIST = `flex items-center gap-5 snap-x snap-mandatory hover:snap-none ${NAVBAR_LIST_ROOM} ${SCROLL_X}`

/** Never squeezed by its neighbours, and never wider than the room the list shows. */
export const NAVBAR_ITEM = `flex shrink-0 ${CONTAIN}`

/** The page being read is heavier as well as darker: colour alone is no cue (WCAG 1.4.1).
 * Forced colours paint every link in one colour, so there it is underlined as well. The list
 * opens scrolled to it, so on a phone the mark is in view; a browser without the property ignores it. */
export const NAVBAR_CURRENT = 'aria-[current=page]:font-semibold aria-[current=page]:text-body forced-colors:aria-[current=page]:underline aria-[current=page]:[scroll-initial-target:nearest]'

/** Its text is centred, so under a finger a short link grows to 44 px evenly; content that
 * does not fit starts at the start edge and is cut at the end. The link that has the keyboard
 * focus is the one thing its list snaps to. */
export const NAVBAR_LINK = [
  'inline-flex items-center justify-center-safe overflow-hidden rounded-control text-sm text-muted',
  NAVBAR_CURRENT,
  'focus-visible:snap-center',
  CONTAIN,
  HOVER.link,
  FOCUS_RING,
  TOUCH_TARGET,
].join(' ')

/** At the end of the bar. It wraps what it holds before it grows wider than the bar. */
export const NAVBAR_ACTIONS = `ms-auto flex flex-wrap items-center justify-end gap-2 ${CONTAIN}`
