/** R-5.12-4: EmptyState's own classes. It has no design prop, so each part has one fixed
 * string; the previewer's raw 10 and 28 px are the plain steps gap-2.5 and p-7. */
import { BORDER_STRONG } from '#shared/classes.js'

/** The previewer draws the dash in line-strong, so the frame reads on the page. CSS draws its own dash, not 6 / 4. */
export const ROOT = [
  'flex flex-col items-center gap-2.5 rounded-box bg-surface p-7 text-center wrap-anywhere border-dashed',
  BORDER_STRONG,
].join(' ')

/** The default icon only: an icon the caller passes keeps whatever colour it brings. */
export const ICON = 'text-muted'

/** leading-tight: the previewer sets each line at its normal height, about 1.2, not the scale's looser default. */
export const TITLE = 'text-base leading-tight font-semibold text-body'

export const DESCRIPTION = 'text-sm leading-tight text-muted'

/** compact: the tight form, laid over the classes above, so cn() swaps each conflicting class. */
export const COMPACT = {
  root: 'gap-1.5 p-4',
  title: 'text-sm leading-tight',
  description: 'text-xs leading-tight',
} as const
