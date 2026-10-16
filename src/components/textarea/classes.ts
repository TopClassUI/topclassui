// R-5.12-4: Textarea's own class strings. The look of a field is shared with Input (src/shared/classes.ts).
import { BORDER_WIDTH, CONTAIN, FIELD_BOX, FIELD_TEXT, FIELD_TEXT_COARSE, TARGET_HEIGHT } from '#shared/classes.js'
import type { Size } from '#shared/contracts/size.js'

/** No FIELD_LTR: it reads data-ltr, which only an Input writes. The dir of a textarea is the caller's. */
export const TEXTAREA_BOX = `block ${FIELD_BOX}`

/** The block padding of each size. The inline padding and the type step are the field's, and every
 * size keeps the touch floor for the text, as Input's do: text-base is 14 px under a 14 px root. */
export const TEXTAREA_SIZE = {
  xs: `px-pad-x-xs py-1.5 text-xs ${FIELD_TEXT_COARSE}`,
  sm: `px-pad-x-sm py-1.5 text-sm ${FIELD_TEXT_COARSE}`,
  md: `px-pad-x-md py-2.5 text-sm ${FIELD_TEXT_COARSE}`,
  lg: `px-pad-x-lg py-3 text-base ${FIELD_TEXT_COARSE}`,
  xl: `px-pad-x-xl py-4 text-base ${FIELD_TEXT_COARSE}`,
  custom: '',
} as const satisfies Record<Size, string>

/** A field that grows by itself takes no handle: a hand-set height would fight the next keystroke. */
export const TEXTAREA_RESIZE = { plain: 'resize-y', autosize: 'resize-none' } as const

/** The client half: the textarea above, its counter under it at the inline end. */
export const TEXTAREA_HOLDER = 'grid max-w-full gap-1.5'

/** The holder's type step, which its em width is measured in: lg and xl keep the field's touch floor too, or
 * under a 14 px root a held field is narrower than a plain one. */
export const TEXTAREA_HOLDER_TEXT = {
  ...FIELD_TEXT,
  lg: `text-base ${FIELD_TEXT_COARSE}`,
  xl: `text-base ${FIELD_TEXT_COARSE}`,
} as const satisfies Record<Size, string>

/** At the cap it is bold and not an error; past it, which only a value set by code can be, it is danger. */
export const TEXTAREA_COUNT = 'justify-self-end font-mono text-xs tabular-nums text-muted empty:hidden data-at-limit:font-semibold data-at-limit:text-body data-over-limit:font-semibold data-over-limit:text-danger-on-soft'

/** The box of the field it stands in for: the border width, the padding, one line per row, and the
 * field's floor, which a single row under a finger is shorter than (35 px against 44). */
export const TEXTAREA_SKELETON = `block whitespace-pre ${BORDER_WIDTH} border-transparent ${CONTAIN} ${TARGET_HEIGHT} animate-pulse rounded-control bg-neutral-soft motion-reduce:animate-none`
