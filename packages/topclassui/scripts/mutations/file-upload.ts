// The mutations of src/components/file-upload. Found by scripts/mutations/index.ts; every label says "file upload".
import type { Mutation } from '../lib/mutate.js'

const CLIENT = 'src/components/file-upload/client.tsx'
const HOOK = 'src/components/file-upload/hook.ts'
const LIB = 'src/components/file-upload/lib.ts'
const CLASSES = 'src/components/file-upload/classes.ts'

export const MUTATIONS: Mutation[] = [
  {
    label: 'the file upload stops writing the kept files back into input.files, so a refused file is sent',
    file: HOOK,
    from: '    writeFiles(state.inputRef.current, sorted.accepted)\n',
    to: '',
  },
  {
    label: 'the file upload keeps a file over maxSize',
    file: LIB,
    from: 'if (file.size > maxSize) rejected.push',
    to: 'if (file.size > Number.MAX_VALUE) rejected.push',
  },
  {
    label: 'the file upload input is multiple at maxFiles 1',
    file: HOOK,
    from: 'multiple: limits.maxFiles > 1,',
    to: 'multiple: limits.maxFiles >= 1,',
  },
  {
    label: 'the file upload leaves a refused file out of the hidden status line, so a screen reader never hears it',
    file: HOOK,
    from: '    refused: refused.slice(0, FILE_UPLOAD_ANNOUNCED).map((row) => describe(row, -1)),',
    to: '    refused: [],',
  },
  {
    label: 'the file upload remove dispatches no input event, so FieldLive never hears the list change',
    file: HOOK,
    from: '    announceWrite(state.inputRef.current)\n    onValueChange?.(files)',
    to: '    onValueChange?.(files)',
  },
  {
    label: 'the file upload dispatches change after a scripted write, which its own onChange reads as a new pick',
    file: HOOK,
    from: "new Event('input', { bubbles: true })",
    to: "new Event('change', { bubbles: true })",
  },
  {
    label: 'the file upload reads accept with its case, so .PDF refuses brief.pdf',
    file: LIB,
    from: ".map((token) => token.trim().toLowerCase())",
    to: '.map((token) => token.trim())',
  },
  {
    label: 'the file upload reads image/* as a bare prefix, so imagery/png passes',
    file: LIB,
    from: 'type.startsWith(token.slice(0, -1))',
    to: 'type.startsWith(token.slice(0, -2))',
  },
  {
    label: 'the file upload with maxFiles 1 no longer replaces its file: the second pick is cut',
    file: LIB,
    from: 'if (maxFiles === 1 && fresh.length > 0)',
    to: 'if (maxFiles === 0 && fresh.length > 0)',
  },
  {
    label: 'the file upload stops clamping maxFiles, so maxFiles={0} keeps nothing',
    file: HOOK,
    from: 'clamp(Math.floor(props.maxFiles ?? FILE_UPLOAD_DEFAULTS.maxFiles), maxFilesMin, maxFilesMax)',
    to: 'Math.floor(props.maxFiles ?? FILE_UPLOAD_DEFAULTS.maxFiles)',
  },
  {
    label: 'the file upload stops clamping maxSize, so 20 GiB lets an 11 GiB file through',
    file: HOOK,
    from: 'clamp(props.maxSize ?? FILE_UPLOAD_DEFAULTS.maxSize, maxSizeMin, maxSizeMax)',
    to: '(props.maxSize ?? FILE_UPLOAD_DEFAULTS.maxSize)',
  },
  {
    label: 'the file upload stops clamping visibleRows, so 500 rows reach --tc-list-rows',
    file: HOOK,
    from: 'clamp(props.visibleRows, visibleRowsMin, visibleRowsMax)',
    to: 'props.visibleRows',
  },
  {
    label: 'the file upload moves the focus to the previous remove first, skipping the next row',
    file: HOOK,
    from: 'Math.min(focusAt.current, state.value.rows.length - 1)',
    to: 'Math.min(focusAt.current - 1, state.value.rows.length - 1)',
  },
  {
    label: 'the file upload forgets the drag count, so moving over the input clears the drag look',
    file: HOOK,
    from: '    if (depth.current === 0) setDragging(false)',
    to: '    setDragging(false)',
  },
  {
    label: 'the file upload takes a drag of text for a drag of files',
    file: HOOK,
    from: "event.dataTransfer.types.includes('Files')",
    to: 'event.dataTransfer.types.length >= 0',
  },
  {
    label: 'a disabled file upload still adds a dropped file',
    file: HOOK,
    from: '    setDragging(false)\n    if (disabled) return\n',
    to: '    setDragging(false)\n',
  },
  {
    label: 'the file upload puts the caller ids before the zone hint in aria-describedby',
    file: HOOK,
    from: '[hintId, describedBy].filter(Boolean)',
    to: '[describedBy, hintId].filter(Boolean)',
  },
  {
    label: 'the file upload remove button is named by the file alone, so it reads brief.pdf and not Remove brief.pdf',
    file: CLIENT,
    from: 'aria-labelledby={`${row.removeId} ${row.nameId}`}',
    to: 'aria-labelledby={row.nameId}',
  },
  {
    label: 'the file upload list loses its role, which list-style none drops in Safari with VoiceOver',
    file: CLIENT,
    from: '<ul role="list" ref',
    to: '<ul ref',
  },
  {
    label: 'the file upload calls no onValueChange after a pick',
    file: HOOK,
    from: '    onValueChange?.(sorted.accepted)\n',
    to: '',
  },
  {
    label: 'the file upload no longer writes the list into the input after a reset',
    file: HOOK,
    from: 'useFormValue({ defaultValue: untouched, sync: syncFiles })',
    to: 'useFormValue({ defaultValue: untouched })',
  },
  {
    label: 'the file upload ignores files picked before hydration',
    file: HOOK,
    from: '    if (files && files.length > 0) latestAdd.current([...files])',
    to: '    void files',
  },
  {
    label: 'the file upload drag look is a fill and a hue only: the line stays dashed',
    file: CLASSES,
    from: ' data-dragging:border-solid',
    to: '',
  },
  {
    label: 'the file upload drag line is not Highlight under forced colours',
    file: CLASSES,
    from: ' forced-colors:data-dragging:border-[Highlight]',
    to: '',
  },
  {
    label: 'the file upload message line is display none while empty, so its first words are not heard',
    file: CLASSES,
    from: "text-danger-on-soft empty:sr-only'",
    to: "text-danger-on-soft empty:hidden'",
  },
  {
    label: 'the file upload root is not relative, so its hidden status line is placed by some other box',
    file: CLASSES,
    from: "FILE_UPLOAD_ROOT = 'relative grid",
    to: "FILE_UPLOAD_ROOT = 'grid",
  },
  {
    label: 'the file upload input no longer covers the zone, so a click on the prompt opens nothing',
    file: CLASSES,
    from: "FILE_UPLOAD_INPUT = 'absolute inset-0 size-full",
    to: "FILE_UPLOAD_INPUT = 'absolute size-full",
  },
  {
    label: 'the file upload picks the unit before rounding, so 1,048,575 bytes print 1,024 kB',
    file: LIB,
    from: 'while (Math.round(value * 10) / 10 >= 1024 &&',
    to: 'while (value >= 1024 &&',
  },
  {
    label: 'the file upload counts no cut, so a second over-limit pick in a row is silent',
    file: HOOK,
    from: 'cuts: state.value.cuts + (sorted.cut ? 1 : 0)',
    to: 'cuts: state.value.cuts',
  },
  {
    label: 'the file upload message keeps its node across cuts, so a second over-limit pick in a row is silent',
    file: CLIENT,
    from: '<span key={upload.messageKey}>',
    to: '<span>',
  },
  {
    label: 'the file upload list lets a row shrink under its content once it scrolls',
    file: CLASSES,
    from: 'grid grid-cols-1 auto-rows-max gap-1.5',
    to: 'grid grid-cols-1 gap-1.5',
  },
  {
    label: 'the file upload list cap leaves out the gaps, so it shows one row fewer than visibleRows',
    file: CLASSES,
    from: '*var(--spacing)*1.5)] pointer-coarse:',
    to: '*0)] pointer-coarse:',
  },
  {
    label: 'the file upload coarse cap drops --tc-row-height, which ROW_TOUCH keeps, so at a 32 px root the list shows fewer rows than it should',
    file: CLASSES,
    from: 'pointer-coarse:max-h-[calc(var(--tc-list-rows)*max(var(--tc-row-height),var(--tc-target-coarse,44px)+',
    to: 'pointer-coarse:max-h-[calc(var(--tc-list-rows)*max(var(--tc-target-coarse,44px)+',
  },
  {
    label: 'the file upload hint keeps a word with no space to break at whole, so the page scrolls sideways',
    file: CLASSES,
    from: 'primary-on-soft wrap-anywhere ${CONTAIN} [&_a',
    to: 'primary-on-soft ${CONTAIN} [&_a',
  },
  {
    label: 'the file upload prompt keeps a long word whole and runs past the zone',
    file: CLASSES,
    from: 'font-medium wrap-anywhere ${CONTAIN}`',
    to: 'font-medium`',
  },
  {
    label: 'the file upload hint leaves its links under the input, so a click on one opens the picker',
    file: CLASSES,
    from: ' [&_a,&_button]:relative [&_a,&_button]:z-1',
    to: '',
  },
  {
    label: 'the file upload remove of a disabled upload looks enabled',
    file: CLASSES,
    from: '${HOVER.ghost} ${DISABLED}`',
    to: '${HOVER.ghost}`',
  },
  {
    label: 'the file upload input has no title, so Chromium shows its own No file chosen over the zone',
    file: CLIENT,
    from: '          title=""\n',
    to: '',
  },
  {
    label: 'the file upload reads every refused name aloud again, so ten thousand refusals are ten thousand lines',
    file: HOOK,
    from: 'refused.slice(0, FILE_UPLOAD_ANNOUNCED)',
    to: 'refused',
  },
  {
    label: 'the file upload list stops windowing, so ten thousand refused rows are all mounted',
    file: HOOK,
    from: '  const rows = collection.rows.map(({ item, index }) => describe(item, index))',
    to: '  const rows = state.value.rows.map((item, index) => describe(item, index))',
  },
  {
    label: 'the file upload spacer forgets the gap after it, so the list is taller than its rows by one gap per window',
    file: LIB,
    from: 'Math.max(0, padding - gap)',
    to: 'padding',
  },
]
