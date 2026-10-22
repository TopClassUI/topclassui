// The site's own class strings, built from the library's shared constants (docs-site rule 1, choice 20).
import { BORDER, FOCUS_RING, HOVER, POINTER, SCROLL_X, TOUCH_TARGET, TRANSITION } from 'topclassui/classes'

/** A text link inside prose or a list: the library's ring and target, underlined on hover. */
export const TEXT_LINK = `inline-flex items-center text-primary-on-soft underline-offset-4 ${HOVER.link} ${FOCUS_RING} ${TOUCH_TARGET} rounded-chip`

/** The shell's type steps between the library's 12, 14 and 16 px, as the docs frames draw them: 11, 13, 15 (a lead, or a name on one line) and 32 px. */
export const TYPE = {
  eyebrow: 'text-[0.6875rem] leading-4',
  nav: 'text-[0.8125rem] leading-5',
  lead: 'text-[0.9375rem] leading-6',
  name: 'text-[0.9375rem] leading-5',
  title: 'text-[2rem] leading-10',
} as const

const QUIET = `inline-flex items-center ${HOVER.link} ${FOCUS_RING} ${TOUCH_TARGET} ${TRANSITION} rounded-chip`

/** A quiet link in the footer or On this page. */
export const QUIET_LINK = `${QUIET} text-muted`

/** An On this page entry: the section being read in the primary text and heavier, so colour is not the only cue. */
export const TOC_LINK = {
  current: `${QUIET} font-medium text-primary-on-soft`,
  rest: QUIET_LINK,
} as const

/** The small capitals over a list: a sidebar group, On this page, a pager card. Arabic has no case. */
export const SHELL_EYEBROW = `${TYPE.eyebrow} font-medium text-muted uppercase`

/** The navbar's search trigger, sunk into the page with a quiet label; merged after the Button's own classes. */
export const SEARCH_TRIGGER = `bg-page font-normal text-muted ${TYPE.nav}`

/** A segment of the mode switch, regular and the chosen one medium; merged after the segment's own classes. */
export const MODE_SEGMENT = `font-normal data-checked:font-medium ${TYPE.nav}`

/** A sidebar row merged after the library's: muted until hovered; the page being read keeps its pill and primary text, without the edge bar. */
export const SIDE_LINK = {
  current: `px-2 font-medium before:hidden ${TYPE.nav}`,
  rest: `px-2 text-muted hover:text-body ${TYPE.nav}`,
} as const

/** The skip link: hidden until it takes the focus, then drawn above the navbar. */
export const SKIP_LINK = `sr-only focus:not-sr-only focus:fixed focus:top-2 focus:inset-s-2 focus:z-(--tc-z-toast) focus:p-3 bg-surface-raised text-body rounded-control ${FOCUS_RING}`

/** The eyebrow over a Home section heading: the drawn 11 px in capitals, without the frame's letter-spacing (R-5.3-3); Arabic has no case. */
export const EYEBROW = 'text-[0.6875rem]/[1.2] font-medium text-primary-on-soft uppercase'

/** 30 px on a phone up to the drawn 40 px at 1440, on the drawn 1.12 line. */
export const SECTION_TITLE = 'text-[clamp(1.875rem,1.25rem+2vw,2.5rem)] leading-[1.12] font-semibold text-body'

/** A Home section's lead: the drawn 17 px on a 1.52 line, 720 px at most. */
export const SECTION_LEAD = 'max-w-180 text-[1.0625rem]/[1.52] text-muted'

export const LEAD = 'max-w-3xl text-lg text-muted'

/** The drawn 16 px corner of Home's larger cards: twice the radius knob, capped as rounded-box is, so a pill mode never rounds a card into a lozenge. */
export const ROUNDED_CARD = 'rounded-[min(calc(var(--tc-radius)*2),1.5rem)]'

/** A Home panel: the surface, the line and the drawn 14 px corner. */
export const PANEL = `flex min-w-0 flex-col gap-3 rounded-box bg-surface p-4.5 ${BORDER}`

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

/** Inline code in a prose paragraph or list: mono in the paragraph's own muted colour, so it never outshines the sentence. */
export const PROSE_CODE = 'font-mono text-sm text-muted'

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

/** The box that lays a code block's Copy button over its header (globals.css keeps the header clear of it). */
export const CODE_FRAME = 'docs-fence relative isolate grid min-w-0 grid-cols-1'

/** The header's Copy button: 28 px and edged, as drawn, at the header's inline end; 44 px under a finger. */
export const CODE_COPY = `absolute top-2 inset-e-2 z-1 inline-flex h-control-xs items-center gap-1.5 rounded-control bg-surface px-2.5 text-xs font-medium text-body tone-neutral ${BORDER} ${HOVER.outline} ${TOUCH_TARGET} ${FOCUS_RING} ${TRANSITION} ${POINTER}`
export const CODE_COPY_ICON = 'flex text-muted'

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
export const COPY_FIELD = `flex min-w-0 items-center gap-0.5 rounded-control bg-page ps-2.5 pe-0 ${BORDER}`
/** The frames' 11 px mono: a 59-character import line fits a 932 px card's half beside a 24 px copy target. */
export const COPY_FIELD_TEXT = 'min-w-0 flex-1 py-2 font-mono text-[0.6875rem] leading-4 text-body wrap-anywhere'
export const COPY_FIELD_BUTTON = 'size-6 px-0'
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
/** A guide page's title and lead, a step under H1 and LEAD, as the guide frames draw them. */
export const GUIDE_TITLE = `${TYPE.title} font-semibold text-body`
export const GUIDE_LEAD = `${TYPE.lead} text-muted`
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
/** A boolean prop: the frames' 16 px box, then its name beside it; the 6.5 px pulled from each side of its 24 px target gives the frames' 25 px pitch down a list of them. */
export const CHECK_ROW = 'flex min-w-0 items-center gap-2 -my-[0.40625rem]'
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
/** One example card a row, each as wide as the Previewer above it (page 14). */
export const DEMO_GRID = 'grid min-w-0 gap-6'
/** The example knobs in Try it's dress: a surface panel, each label above its segmented control. */
export const KNOBS = `flex min-w-0 flex-wrap items-end gap-6 rounded-box bg-surface p-4.5 ${BORDER}`
export const KNOB = 'grid gap-1.5 text-xs font-medium text-muted'
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
/** Every state: abutting cells of one basis grow equally to share the row, each at least 144 px (six fit the frames' 906), and wrap below that; a wide state grows. */
export const STATE_GRID = 'flex min-w-0 flex-wrap items-start gap-x-0 gap-y-4'
export const STATE_CELL = 'grid min-w-[max(9rem,min-content)] max-w-full grow basis-36 content-start justify-items-center gap-2.5'
/** The frames' 56 px box each state sits centred in. */
export const STATE_BOX = 'flex min-h-14 max-w-full items-center justify-center'
export const STATE_CAPTION = 'max-w-full text-center font-mono text-xs text-muted'
