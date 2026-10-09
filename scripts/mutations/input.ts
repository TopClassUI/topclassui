// The mutations of src/components/input. Found by scripts/mutations/index.ts.
import type { Mutation } from '../lib/mutate.js'

export const MUTATIONS: Mutation[] = [
  {
    label: 'every Input type gets a character cap, though HTML allows maxlength on six text types only',
    file: 'src/components/input/index.tsx',
    from: 'maxLength={capped ? resolveMaxLength(maxLength, type) : undefined}',
    to: 'maxLength={resolveMaxLength(maxLength, type)}',
  },
  {
    label: 'every Input takes the text cap, so an email field accepts 512 characters instead of 254',
    file: 'src/components/input/index.tsx',
    from: 'resolveMaxLength(maxLength, type)',
    to: 'resolveMaxLength(maxLength)',
  },
  {
    label: 'an invalid Input turns its border red but never says so to a screen reader',
    file: 'src/components/input/index.tsx',
    from: 'aria-invalid={invalid ? true : ariaInvalid}',
    to: 'aria-invalid={ariaInvalid}',
  },
  {
    label: 'an invalid Input keeps the resting border, so nothing on the screen marks the error',
    file: 'src/components/input/variants.ts',
    from: "    'aria-invalid:border-danger-solid',\n",
    to: '',
  },
  {
    label: 'the Input type stops asking for a name, so an unlabelled one compiles',
    file: 'src/components/input/types.ts',
    from: "    id: string\n    'aria-label'?: string | undefined",
    to: "    id?: string | undefined\n    'aria-label'?: string | undefined",
  },
  {
    label: 'the Input skeleton loses its full width, so the field shifts the form when it loads',
    file: 'src/components/input/skeleton.tsx',
    from: "'block w-full animate-pulse",
    to: "'block animate-pulse",
  },
  {
    label: 'a text input keeps the fixed width of the browser, so two in a row push a phone page sideways',
    file: 'src/components/input/index.tsx',
    from: '        ownWidth && INPUT_OWN_WIDTH,\n',
    to: '',
  },
  {
    label: 'every input type takes the text width, so a checkbox or a colour well is stretched to 193px',
    file: 'src/components/input/index.tsx',
    from: 'const ownWidth = !fullWidth && INPUT_OWN_WIDTH_TYPES.some((text) => text === type)',
    to: 'const ownWidth = !fullWidth',
  },
  {
    label: 'a number or email input takes the direction of a right-to-left form, so a minus sign changes sides',
    file: 'src/components/input/index.tsx',
    from: "      dir={ltr ? 'ltr' : dir}\n",
    to: '      dir={dir}\n',
  },
  {
    label: "an input forces left-to-right over the caller's own dir, so dir=\"auto\" on an email field is lost",
    file: 'src/components/input/index.tsx',
    from: 'const ltr = dir === undefined && INPUT_LTR_TYPES',
    to: 'const ltr = INPUT_LTR_TYPES',
  },
  {
    label: 'an invalid input is told by hue alone again: the ring inside its line is gone',
    file: 'src/components/input/classes.ts',
    from: "  'aria-invalid:inset-ring-[calc(var(--tc-ring-width)-var(--tc-line-width))]',\n",
    to: '',
  },
  {
    label: 'an invalid input looks like a valid one under forced colours, where its ring cannot paint',
    file: 'src/components/input/classes.ts',
    from: "  'forced-colors:aria-invalid:border-(length:--tc-ring-width)',\n",
    to: '',
  },
  {
    label: 'an invalid input widens its border in every mode, which moves its text by a pixel',
    file: 'src/components/input/classes.ts',
    from: "'forced-colors:aria-invalid:border-(length:--tc-ring-width)'",
    to: "'aria-invalid:border-(length:--tc-ring-width)'",
  },
  {
    label: 'the text of a medium input drops under 16px on a touch screen, so iOS zooms the page on focus',
    file: 'src/components/input/classes.ts',
    from: '  md: `${CONTROL_SIZE.md} ${COARSE_TEXT}`,',
    to: '  md: CONTROL_SIZE.md,',
  },
  {
    label: 'a read-only input looks exactly like an editable one again',
    file: 'src/components/input/index.tsx',
    from: '        readOnly && INPUT_READ_ONLY,\n',
    to: '',
  },
  {
    label: 'an input stops importing the style augmentation, so --tc-input-width in style does not compile in a program without Progress',
    file: 'src/components/input/index.tsx',
    from: "import type {} from '#shared/style-tokens.js'\n",
    to: '',
  },
]
