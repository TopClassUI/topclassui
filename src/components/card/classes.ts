/** R-5.12-4: Card's own class strings, one per part. The padding and the gap sit on the
 * root, where the previewer and the Modes cards put them, with the Components-page 20 and 8. */
import { BORDER } from '#shared/classes.js'

export const CARD_ROOT = ['flex flex-col gap-2 rounded-box bg-surface-raised p-5', BORDER].join(' ')

/** The drawn title. The heading level is the caller's; this sets only the type. */
export const CARD_HEADER = 'text-base font-semibold text-body'

/** A block, not a flex column, so a link inside a sentence stays on its line. */
export const CARD_BODY = 'text-sm text-muted'

/** The drawn action row: 8 between the buttons, and 12 from the text with the root's gap. */
export const CARD_FOOTER = 'flex flex-wrap items-center gap-2 pt-1'

/** The card's box at 5:2 until the caller gives the real height in className. */
export const CARD_SKELETON =
  'block w-full aspect-5/2 rounded-box animate-pulse bg-neutral-soft motion-reduce:animate-none'
