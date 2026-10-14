// The mutations of src/components/textarea. Found by scripts/mutations/index.ts; every label says "textarea".
import type { Mutation } from '../lib/mutate.js'

const INDEX = 'src/components/textarea/index.tsx'
const CLIENT = 'src/components/textarea/client.tsx'
const HOOK = 'src/components/textarea/hook.ts'
const LIB = 'src/components/textarea/lib.ts'
const CLASSES = 'src/components/textarea/classes.ts'

export const MUTATIONS: Mutation[] = [
  {
    label: 'the textarea cap stops going through resolveMaxLength, so a Textarea has no default limit',
    file: INDEX,
    from: 'const cap = resolveMaxLength(maxLength, TEXTAREA_CAP_TYPE) ?? null',
    to: 'const cap = maxLength ?? null',
  },
  {
    label: 'textarea rows are not clamped, so rows={99} draws a field taller than two screens',
    file: INDEX,
    from: 'const rows = clampRows(givenRows)',
    to: 'const rows = givenRows',
  },
  {
    label: 'textarea maxRows may sit under rows, so an autosize field shrinks below where it starts',
    file: LIB,
    from: 'return Math.max(clamp(Math.round(maxRows), TEXTAREA_BOUNDARIES.maxRowsMin, TEXTAREA_BOUNDARIES.maxRowsMax), rows)',
    to: 'return clamp(Math.round(maxRows), TEXTAREA_BOUNDARIES.maxRowsMin, TEXTAREA_BOUNDARIES.maxRowsMax)',
  },
  {
    label: 'the textarea server stops counting line breaks, so a pre-filled autosize field jumps at hydration',
    file: INDEX,
    from: 'rows={autosize ? estimateRows(text, rows, maxRows) : rows}',
    to: 'rows={rows}',
  },
  {
    label: 'the textarea row count forgets that scrollHeight is rounded up, so three lines of 16 px text on a phone read four',
    file: LIB,
    from: '(scrollHeight - padding - 1) / lineHeight',
    to: '(scrollHeight - padding) / lineHeight',
  },
  {
    label: 'the textarea counter waits for one character past nine tenths of the cap',
    file: LIB,
    from: 'length >= cap * COUNTER_THRESHOLD',
    to: 'length > cap * COUNTER_THRESHOLD',
  },
  {
    label: 'a textarea at its cap reads as over it, so a full field is drawn in danger',
    file: LIB,
    from: "return length === cap ? 'at' : 'over'",
    to: "return 'over'",
  },
  {
    label: 'the textarea counter prints its numbers in Latin digits whatever the provider says',
    file: LIB,
    from: 'return `${format.format(length)} / ${format.format(cap)}`',
    to: 'return `${String(length)} / ${String(cap)}`',
  },
  {
    label: 'the visible textarea count loses dir="ltr", so in Arabic it reads 500 / 42',
    file: CLIENT,
    from: '<span aria-hidden dir="ltr">',
    to: '<span aria-hidden>',
  },
  {
    label: 'the textarea counter loses its words, so a screen reader hears no count',
    file: CLIENT,
    from: '{field.counted ? <span className="sr-only">{field.spoken}</span> : null}',
    to: '',
  },
  {
    label: 'the textarea counter is no longer its description, so the count is never read with the field',
    file: INDEX,
    from: 'joinIds(describedBy, counterId)',
    to: 'describedBy',
  },
  {
    label: 'the textarea holder stops hearing input, so the count and the rows stand still while one types',
    file: CLIENT,
    from: '      onInput={field.onInput}\n',
    to: '',
  },
  {
    label: 'the textarea holder stops measuring after a commit, so a value set by its owner leaves the count behind',
    file: HOOK,
    from: '    measure()\n    // A form reset',
    to: '    // A form reset',
  },
  {
    label: 'the textarea holder ignores a form reset, so the count shows what was typed after the text is gone',
    file: HOOK,
    from: 'const onReset = () => { timer = window.setTimeout(measure, 0) }',
    to: 'const onReset = () => { timer = undefined }',
  },
  {
    label: 'the textarea count starts at 0 on the client, so hydration finds a different number than the server printed',
    file: HOOK,
    from: 'useState(length)',
    to: 'useState(0)',
  },
  {
    label: 'a lg textarea loses its touch floor for the text, so under a 14 px root iOS zooms the page',
    file: CLASSES,
    from: 'lg: `px-pad-x-lg py-3 text-base ${FIELD_TEXT_COARSE}`,',
    to: "lg: 'px-pad-x-lg py-3 text-base',",
  },
  {
    label: 'the textarea skeleton loses the field floor, so one row under a finger is 35 px beside a 44 px field',
    file: CLASSES,
    from: '${CONTAIN} ${TARGET_HEIGHT} animate-pulse',
    to: '${CONTAIN} animate-pulse',
  },
  {
    label: 'an autosize textarea keeps its resize handle, which fights the next keystroke',
    file: INDEX,
    from: "TEXTAREA_RESIZE[autosize ? 'autosize' : 'plain']",
    to: 'TEXTAREA_RESIZE.plain',
  },
  {
    label: 'a textarea in its holder keeps its own width, so fullWidth on the holder leaves the field at 193 px',
    file: INDEX,
    from: "held || fullWidth ? 'w-full' : FIELD_OWN_WIDTH,",
    to: "fullWidth ? 'w-full' : FIELD_OWN_WIDTH,",
  },
  {
    label: 'the textarea holder is no grid, so the counter can no longer sit at the inline end',
    file: CLASSES,
    from: "TEXTAREA_HOLDER = 'grid max-w-full gap-1.5'",
    to: "TEXTAREA_HOLDER = 'max-w-full gap-1.5'",
  },
]
