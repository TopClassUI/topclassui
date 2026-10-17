// The site's own class strings, built from the library's shared constants (docs-site rule 1, choice 20).
import { FOCUS_RING, HOVER, TOUCH_TARGET, TRANSITION } from 'topclassui/classes'

/** A text link inside prose or a list: the library's ring and target, underlined on hover. */
export const TEXT_LINK = `inline-flex items-center text-primary-on-soft underline-offset-4 ${HOVER.link} ${FOCUS_RING} ${TOUCH_TARGET} rounded-chip`

/** A quiet link in the footer or On this page. */
export const QUIET_LINK = `inline-flex items-center text-muted ${HOVER.link} ${FOCUS_RING} ${TOUCH_TARGET} ${TRANSITION} rounded-chip`

/** The skip link: hidden until it takes the focus, then drawn above the navbar. */
export const SKIP_LINK = `sr-only focus:not-sr-only focus:fixed focus:top-2 focus:inset-s-2 focus:z-(--tc-z-toast) focus:p-3 bg-surface-raised text-body rounded-control ${FOCUS_RING}`

/** Small caps-free eyebrow over a Home section heading. */
export const EYEBROW = 'text-xs font-semibold text-primary-on-soft'

export const SECTION_TITLE = 'text-3xl font-semibold text-body lg:text-4xl'

export const LEAD = 'text-base text-muted'
