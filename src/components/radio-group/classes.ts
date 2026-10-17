// R-5.12-4: the class strings of the radio group, built from the shared toggle constants (unit-4.md, RadioGroup).
import { FORCED_EDGE, TOGGLE_BOX, TOGGLE_SIZE, TOGGLE_TARGET, TOUCH_TARGET } from '#shared/classes.js'

/** A column, or a row that wraps. The group is named, so a radio in a nested group reads its own. */
export const RADIO_GROUP = {
  vertical: 'group/radios flex min-w-0 max-w-full flex-col items-start gap-2.5',
  horizontal: 'group/radios flex min-w-0 max-w-full flex-row flex-wrap items-start gap-x-4 gap-y-2.5',
} as const

/** The label around one radio and its text: a click anywhere on it selects the radio. */
export const RADIO_ITEM = 'inline-flex min-w-0 max-w-full items-center gap-2 text-body'

export const RADIO_ITEM_TEXT = { xs: 'text-xs', sm: 'text-sm', md: 'text-sm', lg: 'text-base', xl: 'text-base', custom: '' } as const

/** The circle sizes of the toggle scale: 14, 16, 20, 24 and 28 px. */
export const RADIO_SIZE = TOGGLE_SIZE

/** The peer of its label text, so the text of a disabled radio dims with it. */
export const RADIO_TARGET = `peer ${TOGGLE_TARGET}`

/** aria-invalid sits on the group: role="radio" does not take it. */
export const RADIO_INVALID = 'group-aria-invalid/radios:border-danger-solid group-aria-invalid/radios:group-data-checked/toggle:border-danger-solid group-aria-invalid/radios:inset-ring-[calc(var(--tc-ring-width)-var(--tc-line-width))] group-aria-invalid/radios:inset-ring-danger-solid group-aria-invalid/radios:group-data-checked/toggle:inset-ring-danger-solid forced-colors:group-aria-invalid/radios:border-(length:--tc-ring-width)'

/** Checked: a line 2 px thick and the dot, in primary-on-soft: primary-solid is 2.88:1 on the dark fill (R-5.6-4). */
export const RADIO_BOX = `rounded-full bg-surface-raised text-primary-on-soft ${TOGGLE_BOX} group-data-checked/toggle:border-primary-on-soft group-data-checked/toggle:inset-ring-[calc(var(--tc-ring-width)-var(--tc-line-width))] group-data-checked/toggle:inset-ring-primary-on-soft ${RADIO_INVALID}`

/** Base UI's Indicator, mounted only while the radio is checked: it centres the dot. */
export const RADIO_DOT = 'flex size-full items-center justify-center'

/** A choice is read whole, so its text wraps. */
export const RADIO_LABEL = 'min-w-0 wrap-anywhere peer-disabled:opacity-50'

/** The skeleton's target: the floor of the radio it stands in for, 24 px and 44 under a finger, around the circle. */
export const RADIO_GROUP_SKELETON_TARGET = `inline-flex w-fit shrink-0 items-center justify-center ${TOUCH_TARGET}`

/** The circle in the neutral fill, which pulses. Its size is RADIO_SIZE, as the radio's is. */
export const RADIO_GROUP_SKELETON_CIRCLE = `block rounded-full bg-neutral-soft animate-pulse motion-reduce:animate-none ${FORCED_EDGE}`

/** One line of the label's type step, 1em tall with margins making up the line height. Its width is a guess of 6em:
 * the caller's text cannot be measured before it arrives. */
export const RADIO_GROUP_SKELETON_LINE = `block h-[1em] my-[calc((1lh-1em)/2)] w-[6em] rounded-chip bg-neutral-soft animate-pulse motion-reduce:animate-none ${FORCED_EDGE}`
