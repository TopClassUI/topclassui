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

/** Inline code in prose and table cells: Latin, left to right, inside an Arabic sentence too. Mono on the text's own ground, as the docs frames draw it. */
export const INLINE_CODE = 'font-mono text-sm text-body'

/** A guide page's code block: on the page, edged, its header on the surface (globals.css). */
export const DOCS_CODE = 'docs-code'

export const LINK = `inline-flex items-center rounded-control text-primary-on-soft underline-offset-4 ${HOVER.link} ${FOCUS_RING} ${TOUCH_TARGET}`
/** Visible on focus, as S11 asks, and on hover of its heading. */
export const ANCHOR = `inline-flex items-center justify-center rounded-control text-muted opacity-0 group-hover/heading:opacity-100 focus-visible:opacity-100 ${FOCUS_RING} ${TOUCH_TARGET}`
export const CARD = `grid min-w-0 overflow-hidden rounded-box bg-surface ${BORDER}`
/** The Previewer card: the frames lift it off the page with a soft shadow. */
export const PREVIEWER = `${CARD} shadow-md`
export const CARD_PART = 'grid min-w-0 gap-3 border-t-(length:--tc-line-width) border-line p-4.5'
export const CARD_HEAD = 'grid min-w-0 gap-3 p-4.5'
/** The Previewer's head: name, chip and description at the start, the mode switch and Install at the end. */
export const PREVIEWER_HEAD = 'flex min-w-0 flex-wrap items-center gap-2.5 p-4.5'
/** The code part sits on the page background, as the stage does. */
export const CODE_PART = `${CARD_PART} gap-2.5 bg-page`
/** A part's caption row: the heading at the start, a count or a button at the end. */
export const PART_ROW = 'flex min-w-0 flex-wrap items-center justify-between gap-2'
/** Highlighted code drawn flat on its part, in the page's own colours (globals.css, .docs-flat-code). */
export const FLAT_CODE = 'docs-flat-code bg-transparent text-body [--tc-ring:var(--tc-primary-on-soft)]'
/** The same code in a bordered box on the page background, as Before you start draws it. */
export const BOXED_CODE = `${FLAT_CODE} rounded-control bg-page p-3 ${BORDER}`
/** A one-line copy field of the install row: the text, then its copy button. */
export const COPY_FIELD = `flex min-w-0 items-center gap-2 rounded-control bg-page ps-3 pe-1 ${BORDER}`
export const COPY_FIELD_TEXT = 'min-w-0 flex-1 py-2 font-mono text-xs text-body wrap-anywhere'
/** The two install columns side by side at 40rem and up, stacked below. */
export const INSTALL_ROW = 'grid min-w-0 border-t-(length:--tc-line-width) border-line sm:grid-cols-2'
export const INSTALL_COL = 'grid min-w-0 content-start gap-2 p-4.5'
export const INSTALL_COL_END = `${INSTALL_COL} border-t-(length:--tc-line-width) border-line sm:border-t-0 sm:border-s-(length:--tc-line-width)`
export const SECTION = 'grid min-w-0 scroll-mt-(--tc-sticky-top,0px) gap-3'
export const H1 = 'text-4xl font-semibold text-body'
export const H2_BASE = 'group/heading flex items-center gap-2 font-semibold text-body'
export const H2 = `${H2_BASE} text-xl`
/** A catalog section's title, 26 px in the frame, read as the scale's 2xl. */
export const SECTION_H2 = 'text-2xl'
export const CARD_TITLE = 'text-lg font-semibold text-body'
export const H3 = 'text-xs font-medium text-muted uppercase'
/** A part caption the frames write in sentence case: Every state, Copy the source, Then import it. */
export const CAPTION = 'text-xs font-medium text-muted'
export const PROSE = 'text-base text-body'
export const SMALL = 'text-sm text-muted'
/** The frames' 10 px notes under a field or a step, read as the scale's xs. */
export const NOTE = 'text-xs text-muted'
export const LIST = 'grid list-disc gap-1 ps-5 text-base text-body'
/** The stage holds the component on the page background, and a wide one scrolls inside it. */
export const STAGE = `grid min-w-0 grid-cols-1 place-items-center bg-page p-5 text-body ${SCROLL_X}`
/** An overlay open in the stage: paint containment makes the stage the box its fixed parts are placed in and cut to. */
export const STAGE_OPEN = 'relative contain-paint'
/** Try it beside the stage at 48rem and up, under it below. */
export const PLAY_ROW = 'grid min-w-0 md:grid-cols-[minmax(0,1fr)_15.5rem]'
export const TRY_IT = 'grid content-start gap-3.5 border-t-(length:--tc-line-width) border-line bg-surface p-4.5 text-body md:border-t-0 md:border-s-(length:--tc-line-width)'
export const CONTROL = 'grid gap-1.5'
export const CONTROL_LABEL = 'text-xs font-medium text-muted'
/** A boolean prop: the checkbox, then its name beside it. */
export const CHECK_ROW = 'flex min-w-0 items-center gap-2'
export const CHECK_LABEL = 'text-xs text-body'
/** The box each Try it control is reserved before it mounts, as tall as the sm control it stands for, so the column never shifts. */
export const CONTROL_RESERVE = {
  select: 'h-8 pointer-coarse:h-11',
  segmented: 'h-8 pointer-coarse:h-13',
  switch: 'size-6 pointer-coarse:size-11',
  slider: 'h-6 pointer-coarse:h-11',
  number: 'h-8 pointer-coarse:h-11',
} as const
/** A placeholder that fills the stage's content box, inside its padding, rather than its own min-height on top of it. */
export const STAGE_RESERVE = 'self-stretch justify-self-stretch'
export const STATE_SCOPE = 'grid min-w-0 gap-4 text-body'
/** Two demos per row at 64rem and up, one below (page 14). */
export const DEMO_GRID = 'grid min-w-0 gap-4 lg:grid-cols-2'
export const KNOBS = 'flex flex-wrap items-center gap-4'
export const KNOB = 'flex items-center gap-2 text-sm text-muted'
/** A heading inside a catalog card (Before you start, How to read a card): 16 px in the frames. */
export const IN_CARD_TITLE = 'text-base'
/** A numbered step or legend part's own title, 14 px semibold in the frames. */
export const STEP_TITLE = 'text-sm font-semibold text-body'
/** One step of Before you start: a cell of the card's grid, ruled off from its neighbours. */
export const STEP = 'grid min-w-0 content-start gap-2.5 border-t-(length:--tc-line-width) border-line p-4.5'
/** A small mono tag: once per app, a section's count. */
export const CHIP = `inline-flex items-center rounded-chip px-2 py-0.5 font-mono text-xs text-muted ${BORDER}`
/** The legend's step number in its soft round badge. */
export const LEGEND_NUMBER = 'inline-flex size-4.5 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-semibold text-primary-on-soft'
/** Every state: the cells share the row, each at least 144 px (six fit the frames' 906), and wrap below that; a wide state grows. */
export const STATE_GRID = 'flex min-w-0 flex-wrap items-start gap-y-4'
export const STATE_CELL = 'grid min-w-36 max-w-full grow basis-36 content-start justify-items-center gap-2.5'
/** The frames' 56 px box each state sits centred in. */
export const STATE_BOX = 'flex min-h-14 max-w-full items-center justify-center'
export const STATE_CAPTION = 'max-w-full text-center font-mono text-xs text-muted'
