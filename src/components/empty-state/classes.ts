/** R-5.12-4: EmptyState's own classes. It has no design prop, so each part has one fixed
 * string; the raw 12 and 32 px of the drawing are the plain steps gap-3 and p-8. */
import { BORDER } from '#shared/classes.js'

/** BORDER is the decorative line, which a dashed frame is. CSS draws its own dash, not 6 / 4. */
export const ROOT = [
  'flex flex-col items-center gap-3 rounded-box bg-surface p-8 text-center wrap-anywhere border-dashed',
  BORDER,
].join(' ')

/** The default icon only: an icon the caller passes keeps whatever colour it brings. */
export const ICON = 'text-muted'

export const TITLE = 'text-base font-semibold text-body'

export const DESCRIPTION = 'text-sm text-muted'
