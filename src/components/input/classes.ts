/** R-5.12-4: Input's own class strings. The box, the ring and the scale are the shared
 * ones; these are what only a text field needs. */
import { CONTROL_SIZE } from '#shared/classes.js'
import type { Size } from '#shared/contracts/size.js'

/** A percentage with a cap, which a flex row can shrink. The browser's own width is a
 * fixed minimum: two of them in a grid form measured 426px on a 320px phone. A definite
 * width is never stretched, so a grid or a column no longer fills it: fullWidth does. */
export const INPUT_OWN_WIDTH = 'w-[min(100%,var(--tc-input-width))]'

/** Thicker as well as red, since hue alone is no cue (WCAG 1.4.1). The ring is drawn inside
 * the line, so no text moves; forced colours drop shadows, so there the line itself grows. */
export const INPUT_INVALID_WIDTH = [
  'aria-invalid:inset-ring-[calc(var(--tc-ring-width)-var(--tc-line-width))]',
  'aria-invalid:inset-ring-danger-solid',
  'forced-colors:aria-invalid:border-(length:--tc-ring-width)',
].join(' ')

/** A value forced left-to-right keeps the form's side, and its placeholder keeps the
 * order of its own script, so an Arabic hint on an email field still ends correctly. */
export const INPUT_LTR = 'data-ltr:text-match-parent data-ltr:placeholder:[unicode-bidi:plaintext]'

/** Kept but not typed in, so it sits on the soft surface. Set from the prop: `read-only:`
 * also matches a disabled input, a file input and every element that is not a field. */
export const INPUT_READ_ONLY = 'bg-neutral-soft'

// iOS Safari zooms the page when a focused field's text is under 16 CSS px, so the floor is px.
const COARSE_TEXT = 'pointer-coarse:text-[max(1rem,16px)]'

/** The shared scale plus the touch floor for the text. `custom` still emits nothing. */
export const INPUT_SIZE = {
  xs: `${CONTROL_SIZE.xs} ${COARSE_TEXT}`,
  sm: `${CONTROL_SIZE.sm} ${COARSE_TEXT}`,
  md: `${CONTROL_SIZE.md} ${COARSE_TEXT}`,
  lg: `${CONTROL_SIZE.lg} ${COARSE_TEXT}`,
  xl: `${CONTROL_SIZE.xl} ${COARSE_TEXT}`,
  custom: '',
} as const satisfies Record<Size, string>
