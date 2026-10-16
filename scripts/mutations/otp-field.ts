// The mutations of src/components/otp-field. Found by scripts/mutations/index.ts; every label says "otp field".
import type { Mutation } from '../lib/mutate.js'

const CLIENT = 'src/components/otp-field/client.tsx'
const HOOK = 'src/components/otp-field/hook.ts'
const LIB = 'src/components/otp-field/lib.ts'
const CLASSES = 'src/components/otp-field/classes.ts'

export const MUTATIONS: Mutation[] = [
  {
    label: 'the otp field stops mapping the Arabic-Indic digits, so an Arabic keyboard cannot fill it',
    file: LIB,
    from: '    else if (code >= arabicIndic && code <= arabicIndic + 9) out += String(code - arabicIndic)\n',
    to: '',
  },
  {
    label: 'the otp field cells read invalid alone, so the aria-invalid of a Field is lost',
    file: CLIENT,
    from: 'const cellInvalid = invalid ? true : ariaInvalid',
    to: 'const cellInvalid = invalid ? true : undefined',
  },
  {
    label: 'the otp field root never takes OTP_WRAP, so twelve cells scroll a phone sideways',
    file: CLIENT,
    from: 'cn(OTP_ROOT, otp.wraps && OTP_WRAP, className)',
    to: 'cn(OTP_ROOT, className)',
  },
  {
    label: 'the otp field cell takes a basis in place of its max-w, so a table cell counts it as 40 px',
    file: CLASSES,
    from: "md: 'h-control-md max-w-control-md ",
    to: "md: 'h-control-md basis-control-md ",
  },
  {
    label: 'the otp field hands Base UI defaultValue again, so a form reset leaves the code as it was',
    file: CLIENT,
    from: '        value={otp.value}\n        onValueChange={otp.onValueChange}\n',
    to: '        defaultValue={defaultValue}\n        onValueChange={onValueChange}\n',
  },
  {
    label: 'the otp field drops its own LTR provider, so under an Arabic provider ArrowLeft goes to the next cell',
    file: CLIENT,
    from: "import { DirectionProvider } from '@base-ui/react/direction-provider'",
    to: 'const DirectionProvider = ({ children }) => children',
  },
  {
    label: 'the otp field group loses dir="ltr", so in an Arabic page the cells run right to left',
    file: CLIENT,
    from: '        dir="ltr"\n',
    to: '',
  },
  {
    label: 'the otp field names no cell after the first, so a screen reader hears six unnamed boxes',
    file: CLIENT,
    from: 'aria-label={label}',
    to: 'aria-label={undefined}',
  },
  {
    label: 'the otp field puts aria-describedby on every cell, so the hint is read six times',
    file: CLIENT,
    from: 'aria-describedby={index === 0 ? ariaDescribedBy : undefined}',
    to: 'aria-describedby={ariaDescribedBy}',
  },
  {
    label: 'the otp field group loses the caller aria-labelledby, so a tab stop on a later cell sits in an unnamed group',
    file: CLIENT,
    from: '        aria-labelledby={ariaLabelledBy}\n',
    to: '',
  },
  {
    label: 'the otp field autoSubmit sends the last form on the page, not the field\'s own',
    file: HOOK,
    from: "if (autoSubmit) state.rootRef.current?.querySelector('input')?.form?.requestSubmit()",
    to: 'if (autoSubmit) [...document.forms].at(-1)?.requestSubmit()',
  },
  {
    label: 'the otp field never hands Base UI its completion handler, so autoSubmit sends nothing',
    file: CLIENT,
    from: '        onValueComplete={otp.onValueComplete}\n',
    to: '',
  },
  {
    label: 'the otp field completion never reaches the caller, so onValueComplete hears nothing',
    file: HOOK,
    from: '    onValueComplete?.(code, details)\n',
    to: '',
  },
  {
    label: 'the otp field ignores details.cancel(), so a handler that cancels still changes the code',
    file: HOOK,
    from: '    if (!details.isCanceled) state.setValue(next)',
    to: '    state.setValue(next)',
  },
  {
    label: 'the otp field never calls the caller handler, so onValueChange hears nothing',
    file: HOOK,
    from: '    onValueChange?.(next, details)\n',
    to: '',
  },
  {
    label: 'the otp field drops the caller ref, which then never holds the group',
    file: HOOK,
    from: '  useImperativeHandle(ref, () => state.rootRef.current as HTMLDivElement, [state.rootRef])\n',
    to: '  void ref\n',
  },
  {
    label: 'the otp field length is not clamped, so length 99 draws 99 cells',
    file: LIB,
    from: '  return Math.trunc(clamp(length, OTP_FIELD_BOUNDARIES.lengthMin, OTP_FIELD_BOUNDARIES.lengthMax))',
    to: '  return length',
  },
  {
    label: 'the otp field groupSize is not clamped, so a negative or fractional group draws stray separators',
    file: LIB,
    from: 'const group = Math.trunc(clamp(groupSize, OTP_FIELD_BOUNDARIES.groupSizeMin, length))',
    to: 'const group = groupSize',
  },
  {
    label: 'the otp field draws a separator after the last cell',
    file: LIB,
    from: 'group > 0 && index < length - 1 && ',
    to: 'group > 0 && ',
  },
  {
    label: 'the otp field leaves numeric to Base UI, which refuses an Arabic-Indic digit',
    file: LIB,
    from: "if (validationType !== 'numeric' || normalizeValue) return",
    to: 'return',
  },
  {
    label: 'the otp field loses its numeric keyboard once numeric is ours',
    file: LIB,
    from: "inputMode: inputMode ?? 'numeric'",
    to: 'inputMode',
  },
  {
    label: 'the otp field puts the caller className first, so its own gap wins a conflict',
    file: CLIENT,
    from: 'cn(OTP_ROOT, otp.wraps && OTP_WRAP, className)',
    to: 'cn(className, OTP_ROOT, otp.wraps && OTP_WRAP)',
  },
  {
    label: 'the otp field cell loses its size, so every size draws the same cell',
    file: CLIENT,
    from: 'cn(OTP_CELL, OTP_CELL_SIZE[size])',
    to: 'OTP_CELL',
  },
  {
    label: 'the otp field stops writing data-size',
    file: CLIENT,
    from: '        data-size={size}\n',
    to: '',
  },
  {
    label: 'the otp field md cell loses its coarse cap, so on a phone it stays 40 px wide',
    file: CLASSES,
    from: "text-lg pointer-coarse:max-w-[var(--tc-target-coarse,44px)] pointer-coarse:text-[max(1.125rem,16px)]'",
    to: "text-lg pointer-coarse:text-[max(1.125rem,16px)]'",
  },
  {
    label: 'the otp field md cell loses its 16 px floor under a coarse pointer, so iOS zooms a small root',
    file: CLASSES,
    from: " pointer-coarse:text-[max(1.125rem,16px)]'",
    to: "'",
  },
  {
    label: 'the otp field cell loses its 24 px floor, so a narrow parent squeezes it under the target size',
    file: CLASSES,
    from: 'w-full min-w-[var(--tc-target-min,24px)] shrink',
    to: 'w-full min-w-0 shrink',
  },
  {
    label: 'the otp field cell loses its height floor, so under a finger it is 40 px tall',
    file: CLASSES,
    from: ' ${TARGET_HEIGHT} ${FIELD_INVALID}`',
    to: ' ${FIELD_INVALID}`',
  },
  {
    label: 'the otp field cell loses the invalid mark, so aria-invalid draws nothing',
    file: CLASSES,
    from: ' ${TARGET_HEIGHT} ${FIELD_INVALID}`',
    to: ' ${TARGET_HEIGHT}`',
  },
  {
    label: 'the otp field root loses w-fit, so in an Arabic form the cells fill the block from its far side',
    file: CLASSES,
    from: "'flex w-fit min-w-0",
    to: "'flex min-w-0",
  },
  {
    label: 'the otp field separator is erased under forced colours',
    file: CLASSES,
    from: " forced-colors:bg-[CanvasText]'",
    to: "'",
  },
]
