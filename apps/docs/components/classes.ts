// The site's own class strings, built from the library's shared constants (docs-site rule 1, choice 20).
import { BORDER, FOCUS_RING, HOVER, SCROLL_X, TOUCH_TARGET, TRANSITION } from 'topclassui/classes'

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

/** Inline code in prose and table cells: Latin, left to right, inside an Arabic sentence too. */
export const INLINE_CODE = 'rounded-chip bg-neutral-soft px-1 font-mono text-sm text-body'

export const LINK = `inline-flex items-center rounded-control text-primary-on-soft underline-offset-4 ${HOVER.link} ${FOCUS_RING} ${TOUCH_TARGET}`
/** Visible on focus, as S11 asks, and on hover of its heading. */
export const ANCHOR = `inline-flex items-center justify-center rounded-control text-muted opacity-0 group-hover/heading:opacity-100 focus-visible:opacity-100 ${FOCUS_RING} ${TOUCH_TARGET}`
export const CARD = `grid min-w-0 overflow-hidden rounded-box bg-surface ${BORDER}`
export const CARD_PART = 'grid min-w-0 gap-3 border-t-(length:--tc-line-width) border-line p-4.5'
export const CARD_HEAD = 'grid min-w-0 gap-3 p-4.5'
export const SECTION = 'grid min-w-0 scroll-mt-(--tc-sticky-top,0px) gap-3'
export const H1 = 'text-4xl font-semibold text-body'
export const H2 = 'group/heading flex items-center gap-2 text-xl font-semibold text-body'
export const CARD_TITLE = 'text-lg font-semibold text-body'
export const H3 = 'text-xs font-semibold text-muted uppercase'
export const PROSE = 'text-base text-body'
export const SMALL = 'text-sm text-muted'
export const LIST = 'grid list-disc gap-1 ps-5 text-base text-body'
/** The stage holds the component on the page background, and a wide one scrolls inside it. */
export const STAGE = `grid min-w-0 grid-cols-1 place-items-center bg-page p-5 text-body ${SCROLL_X}`
/** Try it beside the stage at 48rem and up, under it below. */
export const PLAY_ROW = 'grid min-w-0 md:grid-cols-[minmax(0,1fr)_15.5rem]'
export const TRY_IT = 'grid content-start gap-3.5 border-t-(length:--tc-line-width) border-line bg-page p-4.5 text-body md:border-t-0 md:border-s-(length:--tc-line-width)'
export const CONTROL = 'grid gap-1.5'
export const CONTROL_LABEL = 'font-mono text-xs text-muted'
/** The box each Try it control is reserved before it mounts, as tall as the sm control it stands for, so the column never shifts. */
export const CONTROL_RESERVE = {
  select: 'h-8 pointer-coarse:h-11',
  segmented: 'h-8 pointer-coarse:h-13',
  switch: 'h-6 w-10 pointer-coarse:h-11',
  slider: 'h-6 pointer-coarse:h-11',
  number: 'h-8 pointer-coarse:h-11',
} as const
/** A placeholder that fills the stage's content box, inside its padding, rather than its own min-height on top of it. */
export const STAGE_RESERVE = 'self-stretch justify-self-stretch'
export const STATE_SCOPE = `min-w-0 rounded-box bg-page p-4 text-body ${SCROLL_X}`
/** Two demos per row at 64rem and up, one below (page 14). */
export const DEMO_GRID = 'grid min-w-0 gap-4 lg:grid-cols-2'
export const KNOBS = 'flex flex-wrap items-center gap-4'
export const KNOB = 'flex items-center gap-2 text-sm text-muted'
