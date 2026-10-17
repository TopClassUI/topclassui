// The mutations of the classes the fields share: Input now, and the fields of Unit 4. Found by scripts/mutations/index.ts;
// every label says "shared field". The rows Input's own tests catch keep Input's words, in shared.ts.
import type { Mutation } from '../lib/mutate.js'

const CLASSES = 'src/shared/classes.ts'

export const MUTATIONS: Mutation[] = [
  {
    label: 'the shared field invalid-within loses the inset ring, so a box whose field is invalid is told by hue alone',
    file: CLASSES,
    from: ' has-aria-invalid:inset-ring-[calc(var(--tc-ring-width)-var(--tc-line-width))]',
    to: '',
  },
  {
    label: 'the shared field holder loses minmax(0, ...), so its column is a floor again and two in a 1fr 1fr grid push a phone page sideways',
    file: CLASSES,
    from: "grid-cols-[minmax(0,var(--tc-input-width))]'",
    to: "grid-cols-[var(--tc-input-width)]'",
  },
  {
    label: 'the shared field holder loses w-fit, so in a block it fills the row, 1233 px at 1280, where an Input is 193',
    file: CLASSES,
    from: "export const FIELD_HOLDER = 'w-fit max-w-full ",
    to: "export const FIELD_HOLDER = 'max-w-full ",
  },
  {
    label: 'the shared field text loses the md step, so a wrapper reads --tc-input-width against 16 px and is 220.8 px beside a 193.2 px Input',
    file: CLASSES,
    from: '  md: `text-sm ${FIELD_TEXT_COARSE}`,',
    to: "  md: '',",
  },
  {
    label: 'the shared field text loses the coarse floor at lg and xl, so under a 10 px root a NumberField types at 10 px and iOS zooms',
    file: CLASSES,
    from: '  lg: `text-base ${FIELD_TEXT_COARSE}`,\n  xl: `text-base ${FIELD_TEXT_COARSE}`,',
    to: "  lg: 'text-base',\n  xl: 'text-base',",
  },
]
