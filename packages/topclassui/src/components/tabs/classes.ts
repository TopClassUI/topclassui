// R-5.12-4: one class string per element Tabs styles, built from the shared constants.
import {
  CONTAIN, CONTROL_HEIGHT, FOCUS_RING, FOCUS_RING_INSET, FORCED_EDGE, POINTER, SCROLL_X, TOUCH_TARGET, TRANSITION,
} from '#shared/classes.js'
import type { Size } from '#shared/contracts/size.js'
import type { TabsVariant } from './types.js'

/** A grid of one column that may shrink to nothing: a list that scrolls would otherwise widen a
 * grid track, a w-fit parent or a table cell to the width of all its tabs. */
export const TABS_ROOT = 'grid grid-cols-1'

/** The line under the tabs, drawn inside the list as a shadow and not as its border: the list
 * clips, so a tab can paint over a shadow and never over a border. Forced colours erase a
 * shadow, so there the line is a border and the bar sits above it. */
export const TABS_LIST_LINE = 'shadow-[inset_0_calc(var(--tc-line-width)*-1)_var(--tc-line)] forced-colors:border-b-(length:--tc-line-width)'

/** Base UI brings a tab into view by whole pixels measured from its offset parent, and Chromium
 * stops an RTL list a fraction short of its end: the list is that parent and keeps a pixel of scroll
 * padding, so no tab the keyboard reaches is cut (0.72 px was). */
export const TABS_LIST_SCROLL = `relative scroll-px-px ${SCROLL_X}`

/** R-5.2-3: the list of each look, as wide as its tabs (Figma 138:809), the line one with its hairline under the bar.
 * Both scroll sideways inside themselves when the tabs do not fit, and both keep at least a pixel before the first tab and after the last: the scroll padding is then met where the
 * server drew them, so hydration scrolls no RTL list (it moved by 1 px), and an RTL list reaches its end. */
export const TABS_LIST = {
  line: `flex w-fit max-w-full items-center gap-5 px-px pb-px ${TABS_LIST_LINE} ${TABS_LIST_SCROLL}`,
  enclosed: `flex w-fit max-w-full items-center gap-0.5 rounded-control bg-surface p-0.5 ${FORCED_EDGE} ${TABS_LIST_SCROLL}`,
} as const satisfies Record<TabsVariant, string>

/** A disabled tab still takes the focus from the arrow keys, so what it holds is dimmed and
 * not the tab: its ring keeps its full contrast (2.5:1 was measured at half opacity). Base UI
 * writes aria-disabled, so no browser greys it: forced colours take the system's grey instead. */
export const TABS_TAB_DISABLED = [
  'data-disabled:*:opacity-50',
  'forced-colors:data-disabled:*:opacity-100 forced-colors:data-disabled:not-data-active:text-[GrayText]',
].join(' ')

/** What a tab of either look is. It clips what it holds, and its ring is drawn inside its
 * box, because the list clips too. Content that fits is centred; content that does not starts
 * at the start edge, so the beginning of a label is never the part that is cut. */
const TAB = [
  'inline-flex shrink-0 items-center justify-center-safe gap-2 overflow-hidden whitespace-nowrap font-normal text-muted',
  'data-active:font-semibold data-active:text-body',
  CONTAIN,
  POINTER,
  TOUCH_TARGET,
  TRANSITION,
  TABS_TAB_DISABLED,
].join(' ')

/** Forced colours paint every border, a transparent one too: there the bar of a tab that is
 * not active takes the colour of the page, and the active one the system's highlight. */
export const TABS_BAR = [
  'border-b-2 border-transparent data-active:border-primary-solid forced-colors:border-[Canvas] forced-colors:data-active:border-[Highlight]',
  // A disabled tab's bar dims with its label, as Figma 138:962 draws it; forced colours take the system's grey, as the label does.
  'data-disabled:data-active:border-primary-solid/50 forced-colors:data-disabled:data-active:border-[GrayText]',
].join(' ')

/** The line tab's ring, still inside its box since the list clips, but inset past the 2 px bar and the ring offset,
 * so the bar shows under a focused tab (Figma 138:949). */
export const TABS_RING_ABOVE_BAR = [
  'outline-none focus-visible:outline-solid focus-visible:outline-(length:--tc-ring-width) focus-visible:outline-ring',
  'focus-visible:-outline-offset-[calc(var(--tc-ring-width)+var(--tc-ring-offset)+2px)]',
].join(' ')

/** A flat raised fill, with no edge and no shadow, as Figma 138:809 draws it: the semibold body label tells the
 * active tab too. Forced colours erase a fill: there it takes the system pair, with a ring that shows on it. */
export const TABS_RAISED = [
  'rounded-control data-active:bg-surface-raised',
  'forced-colors:data-active:forced-color-adjust-none forced-colors:data-active:bg-[Highlight]',
  'forced-colors:data-active:text-[HighlightText]',
  'forced-colors:data-active:[--tc-ring:HighlightText]',
].join(' ')

/** R-5.2-3: the active tab is told by a bar or by an edged, raised surface, and by its weight:
 * 400 at rest, since Windows' own font draws 500 and 600 as one face. */
export const TABS_TAB = {
  line: `${TAB} ${TABS_BAR} ${TABS_RING_ABOVE_BAR}`,
  enclosed: `${TAB} ${FOCUS_RING_INSET} ${TABS_RAISED}`,
} as const satisfies Record<TabsVariant, string>

/** The type step, with the inline padding one step under a button's: Figma 138:809 pads a md tab 11 px.
 * A line tab is the control height; an enclosed one a step lower, so its box is the drawn 36 px at md. */
export const TABS_SIZE = {
  line: {
    xs: `${CONTROL_HEIGHT.xs} px-pad-x-xs text-xs`,
    sm: `${CONTROL_HEIGHT.sm} px-pad-x-xs text-sm`,
    md: `${CONTROL_HEIGHT.md} px-pad-x-sm text-sm`,
    lg: `${CONTROL_HEIGHT.lg} px-pad-x-md text-base`,
    xl: `${CONTROL_HEIGHT.xl} px-pad-x-lg text-base`,
    custom: '',
  },
  enclosed: {
    xs: 'px-pad-x-xs text-xs',
    sm: `${CONTROL_HEIGHT.xs} px-pad-x-xs text-sm`,
    md: `${CONTROL_HEIGHT.sm} px-pad-x-sm text-sm`,
    lg: `${CONTROL_HEIGHT.md} px-pad-x-md text-base`,
    xl: `${CONTROL_HEIGHT.lg} px-pad-x-lg text-base`,
    custom: '',
  },
} as const satisfies Record<TabsVariant, Record<Size, string>>

/** A margin and not a padding: the ring of a focused panel reaches 4 px outside its box,
 * and the list above would paint over a ring that lay on it. A long word breaks. */
export const TABS_PANEL = `mt-4 wrap-anywhere ${FOCUS_RING}`
