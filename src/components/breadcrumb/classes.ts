/** R-5.12-4: Breadcrumb's own classes. It has no design prop, so each part has one fixed
 * string; the raw 8 px of the drawing is the plain step gap-2. */
import { CONTAIN, FOCUS_RING, HOVER, LABEL, TOUCH_TARGET } from '#shared/classes.js'

/** 14 px Regular, the one type step the frame draws. */
export const ROOT = 'text-sm'

/** It wraps, so a long trail grows down the page instead of across it. */
export const LIST = 'flex flex-wrap items-center gap-2'

/** A crumb and the separator before it are one flex item, so they wrap together. */
export const ITEM = `flex min-w-0 items-center gap-2 ${CONTAIN}`

export const SEPARATOR = 'text-muted'

/** R-5.6-2: the box is 24 px, 44 under a coarse pointer, and the text stays centred in it,
 * so the row still reads as one line of text. */
export const LINK = [
  'inline-flex items-center justify-center rounded-chip text-muted underline-offset-4',
  CONTAIN,
  HOVER.link,
  FOCUS_RING,
  TOUCH_TARGET,
].join(' ')

/** A crumb with no href that is not the last one: plain text in the trail's own colour. */
export const TEXT = `${LABEL} text-muted`

/** The page being read, in the body colour so it stands out from the links before it. */
export const CURRENT = `${LABEL} text-body`
