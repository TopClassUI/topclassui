// The site's own class strings, built from the library's shared constants (docs-site rule 1, choice 20).
import { BORDER, FOCUS_RING, HOVER, SCROLL_X, TOUCH_TARGET, TRANSITION } from 'topclassui/classes'

/** A text link inside prose or a list: the library's ring and target, underlined on hover. */
export const TEXT_LINK = `inline-flex items-center text-primary-on-soft underline-offset-4 ${HOVER.link} ${FOCUS_RING} ${TOUCH_TARGET} rounded-chip`

/** A quiet link in the footer or On this page. */
export const QUIET_LINK = `inline-flex items-center text-muted ${HOVER.link} ${FOCUS_RING} ${TOUCH_TARGET} ${TRANSITION} rounded-chip`

/** The skip link: hidden until it takes the focus, then drawn above the navbar. */
export const SKIP_LINK = `sr-only focus:not-sr-only focus:fixed focus:top-2 focus:inset-s-2 focus:z-(--tc-z-toast) focus:p-3 bg-surface-raised text-body rounded-control ${FOCUS_RING}`

/** The eyebrow over a Home section heading, in capitals as drawn; Arabic has no case. */
export const EYEBROW = 'text-xs font-medium text-primary-on-soft uppercase'

/** 30 px on a phone up to the drawn 40 px at 1440. */
export const SECTION_TITLE = 'text-[clamp(1.875rem,1.25rem+2vw,2.5rem)] leading-tight font-semibold text-body'

export const LEAD = 'max-w-3xl text-lg text-muted'

/** A Home panel: the surface, the line and the drawn 14 px corner. */
export const PANEL = `flex min-w-0 flex-col gap-3.5 rounded-box bg-surface p-4.5 ${BORDER}`

/** The soft fill of a tone and its text, for Home's tinted cards (Follow us, What you need). */
export const TINT = {
  primary: 'bg-primary-soft text-primary-on-soft',
  info: 'bg-info-soft text-info-on-soft',
  danger: 'bg-danger-soft text-danger-on-soft',
  neutral: 'bg-neutral-soft text-neutral-on-soft',
  success: 'bg-success-soft text-success-on-soft',
} as const

/** The solid fill of a tone, for the icon tiles on the tinted cards. */
export const TILE = {
  primary: 'bg-primary-solid text-primary-on-solid',
  info: 'bg-info-solid text-info-on-solid',
  danger: 'bg-danger-solid text-danger-on-solid',
  neutral: 'bg-neutral-solid text-neutral-on-solid',
  success: 'bg-success-solid text-success-on-solid',
} as const

/** Inline code in prose and table cells: Latin, left to right, inside an Arabic sentence too. Mono on the text's own ground, as the docs frames draw it. */
export const INLINE_CODE = 'font-mono text-sm text-body'

/** A guide table as the docs frames draw it: the body rows on the surface, and every row shown, with no scroll inside. */
export const PROSE_TABLE = 'bg-surface max-h-none'

/** A cell of a guide table: muted, regular, 13 px and top-aligned. The header row is the one at aria-rowindex 1: on the page, body-coloured, semibold, 14 px. */
const PROSE_CELL = 'px-3.5 py-3 align-top text-[0.8125rem]/5 font-normal text-muted in-aria-[rowindex=1]:bg-page in-aria-[rowindex=1]:text-sm in-aria-[rowindex=1]:font-semibold in-aria-[rowindex=1]:text-body'

/** How a column of a guide table lays out: sized to its content on one line, or wrapping above a floor, so a phone scrolls the table instead of stacking one word per line. */
export const PROSE_COLUMN = {
  fit: `${PROSE_CELL} whitespace-nowrap`,
  wrap: `${PROSE_CELL} whitespace-normal min-w-32`,
  prose: `${PROSE_CELL} whitespace-normal min-w-60`,
} as const

/** Code an author wrote in a cell arrives at prose size (INLINE_CODE); in a guide table it takes the cell's. */
export const AUTHORED_CELL = '**:text-[length:inherit]'

/** Code a guide table prints itself: mono and body-coloured, at the cell's size. */
export const TABLE_CODE = 'font-mono text-body'

/** A printed default as one box, so in Arabic it sits at the start of its cell like every other value while its lines read left to right. */
export const DEFAULT_CODE = `${TABLE_CODE} inline-block`

/** A printed object default, one entry per line; the lines after the first indented past its opening brace. */
export const DEFAULT_LINE = {
  first: 'block',
  rest: 'block ps-[2ch]',
} as const

/** A guide page's code block: on the page, edged, its header on the surface (globals.css). */
export const DOCS_CODE = 'docs-code'

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
