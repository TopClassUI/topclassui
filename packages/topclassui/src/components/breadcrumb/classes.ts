/** R-5.12-4: Breadcrumb's own classes. It has no design prop, so each part has one fixed
 * string; the raw 8 px of the drawing is the plain step gap-2. */
import { CONTAIN, FOCUS_RING, HOVER, LABEL, TOUCH_TARGET } from '#shared/classes.js'

/** 14 px Regular, the one type step the frame draws. */
export const ROOT = 'text-sm'

/** It wraps, so a long trail grows down the page instead of across it. */
export const LIST = 'flex flex-wrap items-center gap-2'

/** A crumb and the separator before it are one flex item, so they wrap together. The caret
 * inherits its colour from here: one set on the svg itself survives forced colours. */
export const ITEM = `flex min-w-0 items-center gap-2 text-muted ${CONTAIN}`

/** R-5.6-2: the box is 24 px, 44 under a coarse pointer, and the text stays centred in it,
 * so the row still reads as one line of text. Under a pointer it lifts to the body colour, underlined 3 px down (Figma 138:1140). */
export const LINK = [
  'inline-flex items-center justify-center gap-1.5 rounded-chip text-muted underline-offset-3',
  CONTAIN,
  HOVER.mutedLink,
  FOCUS_RING,
  TOUCH_TARGET,
].join(' ')

/** A crumb with no href that is not the last one: plain text in the trail's own colour. */
export const TEXT = `${LABEL} text-muted`

/** The page being read: the body colour, and a weight too, so colour is not the only cue.
 * Semibold, not medium: a font with only a regular and a bold face paints 500 as regular. */
export const CURRENT = `${LABEL} text-body font-semibold`

/** The crumbs maxItems leaves out stand as one mark between two carets: three dots, muted, not a control. */
export const GAP = 'inline-flex text-muted'

/** The text of a crumb that showHome draws as the house icon: still read, never drawn. */
export const HIDDEN_LABEL = 'sr-only'
