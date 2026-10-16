// R-5.12-4: CodeBlock's own class strings, read by index.tsx and client.tsx.
import { CONTAIN, FOCUS_RING_INSET, FORCED_EDGE, ICON_BUTTON, LABEL, SCROLL_X } from '#shared/classes.js'

/** One column, so the code scrolls inside the block and never widens its parent. relative: it holds the live region. The rings take the block's text colour. */
export const CODE_BLOCK_ROOT = `relative grid min-w-0 grid-cols-1 rounded-box bg-neutral-solid text-neutral-on-solid [--tc-ring:var(--tc-neutral-on-solid)] ${CONTAIN} ${FORCED_EDGE}`
export const CODE_BLOCK_HEADER = 'flex min-w-0 items-center gap-2 px-3.5 py-1.5'
export const CODE_BLOCK_ICON = 'flex shrink-0 text-neutral-on-solid/70'
export const CODE_BLOCK_TITLE = `${LABEL} flex-1 font-mono text-xs text-neutral-on-solid/70`
/** 24 px, 44 under a finger: the drawn 14 px icon is under the floor. HOVER.ghost reads the page's neutral/soft, which sits next to this text colour. */
export const CODE_BLOCK_COPY = `ms-auto ${ICON_BUTTON} text-neutral-on-solid/70 hover:bg-neutral-on-solid/10 hover:text-neutral-on-solid`
/** Sideways inside its own box; the ring is drawn inside, since the block sits flush with its edges. A classic
 * scrollbar takes the block's colours, not the page's, or the ring's bottom side lands on a track of its own colour. */
export const CODE_BLOCK_PRE = `rounded-b-box px-3.5 pb-3.5 font-mono text-sm whitespace-pre tab-2 text-start [scrollbar-color:var(--tc-neutral-solid-thumb)_var(--tc-neutral-solid)] ${FOCUS_RING_INSET} ${SCROLL_X}`
/** No header above it: the top padding comes back and every corner rounds. */
export const CODE_BLOCK_PRE_ALONE = 'rounded-box pt-3.5'
/** wrap: a long line breaks, and nothing scrolls sideways. */
export const CODE_BLOCK_WRAP = 'whitespace-pre-wrap wrap-anywhere'
export const CODE_BLOCK_STATUS = 'sr-only'
