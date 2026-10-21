/** R-5.12-4: Card's own class strings, one per part. The padding and the gap sit on the
 * root, where Figma's Previewer: Card (137:705) puts them: 18 around, 10 between. */
import { BORDER, FOCUS_RING, FORCED_EDGE, HOVER, TRANSITION } from '#shared/classes.js'

export const CARD_ROOT = ['flex flex-col gap-2.5 rounded-box bg-surface-raised p-4.5', BORDER].join(' ')

/** A card rendered as a link or a button: the drawn hover and focus-visible states. */
export const CARD_INTERACTIVE = ['cursor-pointer text-start', HOVER.surface, FOCUS_RING, TRANSITION].join(' ')

/** Full bleed over the root's padding, 120 tall as drawn, with 18 to the title below. */
export const CARD_MEDIA = [
  '-mx-4.5 -mt-4.5 mb-2 flex min-h-30 items-center justify-center overflow-hidden rounded-t-box bg-neutral-soft text-muted',
].join(' ')

/** The drawn title. The heading level is the caller's; this sets only the type. */
export const CARD_HEADER = 'text-base/5 font-semibold text-body'

/** A block, not a flex column, so a link inside a sentence stays on its line. */
export const CARD_BODY = 'text-sm/tight text-muted'

/** The drawn action row: 8 between the buttons, 10 from the text through the root's gap. */
export const CARD_FOOTER = 'flex flex-wrap items-center gap-2'

/** The card's box at 5:2 until the caller gives the real height in className. Its fill is
 * all that draws it, so it carries the line forced colours leave of a shape. */
export const CARD_SKELETON = [
  'block w-full aspect-5/2 rounded-box animate-pulse bg-neutral-soft motion-reduce:animate-none',
  FORCED_EDGE,
].join(' ')
