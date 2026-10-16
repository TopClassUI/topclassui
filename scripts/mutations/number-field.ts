// The mutations of src/components/number-field. Found by scripts/mutations/index.ts; every label says "number field".
import type { Mutation } from '../lib/mutate.js'

const CLIENT = 'src/components/number-field/client.tsx'
const HOOK = 'src/components/number-field/hook.ts'
const LIB = 'src/components/number-field/lib.ts'
const CLASSES = 'src/components/number-field/classes.ts'

export const MUTATIONS: Mutation[] = [
  {
    label: 'the number field default is no longer clamped, so a value past max is submitted',
    file: HOOK,
    from: '    defaultValue: clampValue(defaultValue, limits, allowOutOfRange) ?? null,',
    to: '    defaultValue: defaultValue ?? null,',
  },
  {
    label: 'the number field stepper loses group-data-disabled/number:disabled:opacity-100, so a disabled field paints it at a quarter',
    file: CLASSES,
    from: ' group-data-disabled/number:disabled:opacity-100`',
    to: '`',
  },
  {
    label: 'the number field stepper loses its two data-readonly classes, so a read-only stepper looks live and takes the hover',
    file: CLASSES,
    from: ' data-readonly:pointer-events-none data-readonly:opacity-50',
    to: '',
  },
  {
    label: 'the number field mount effect is removed, so a number typed before hydration stays on screen and is not sent',
    file: HOOK,
    from: '    if (input && input.value !== input.defaultValue) input.value = input.defaultValue\n',
    to: '',
  },
  {
    label: 'the number field root loses FIELD_HOLDER, so its box is a floor again and two in a row scroll the page',
    file: CLASSES,
    from: 'export const NUMBER_FIELD_ROOT = `inline-grid align-middle ${FIELD_HOLDER}`',
    to: 'export const NUMBER_FIELD_ROOT = \'inline-grid align-middle\'',
  },
  {
    label: 'the number field bounds are not clamped, so min, max and step past the limits reach Base UI',
    file: LIB,
    from: '    min: min === undefined ? undefined : clamp(min, BOUNDS.limitMin, BOUNDS.limitMax),',
    to: '    min,',
  },
  {
    label: 'the number field ignores details.cancel(), so a handler that cancels still moves it',
    file: HOOK,
    from: '    if (!details.isCanceled) state.setValue(next)',
    to: '    state.setValue(next)',
  },
  {
    label: 'the number field calls the caller during a reset, so a reset reports a change',
    file: HOOK,
    from: '    if (!quiet.current) onValueChange?.(next, details)',
    to: '    onValueChange?.(next, details)',
  },
  {
    label: 'the number field reset leaves typed text in a focused input, so a blur then sends it',
    file: HOOK,
    from: '    sync: syncText,\n',
    to: '',
  },
  {
    label: 'the number field leaves a Latin paste to Base UI, which reads 1,234.5 as 1 under Arabic-Indic digits',
    file: LIB,
    from: '    return latin ? null : trimmed.replace(/,/g, \'\')',
    to: '    return null',
  },
  {
    label: 'the number field ignores a -u-nu- in the caller locale, so ar-u-nu-arab shows Latin digits',
    file: LIB,
    from: '    return new Intl.Locale(tag).numberingSystem ?? fallback',
    to: '    return fallback',
  },
  {
    label: 'the number field input loses dir ltr, so a typed negative number puts its sign at the right in Arabic',
    file: CLIENT,
    from: "dir={dir ?? 'ltr'}",
    to: 'dir={dir}',
  },
  {
    label: 'the number field steppers keep Base UI English names, so an Arabic page reads Increase',
    file: CLIENT,
    from: 'aria-label={field.labels.increase}',
    to: '',
  },
  {
    label: 'the number field drops invalid, so aria-invalid and the danger line never appear',
    file: CLIENT,
    from: 'aria-invalid={invalid ? true : ariaInvalid}',
    to: 'aria-invalid={ariaInvalid}',
  },
  {
    label: 'the number field decrease loses order-first, so it sits after the number on screen',
    file: CLASSES,
    from: "export const NUMBER_FIELD_DECREASE = 'order-first'",
    to: "export const NUMBER_FIELD_DECREASE = ''",
  },
  {
    label: 'the number field reads a NaN min or max as clamp() does, so max={NaN} becomes a limit of -1e15',
    file: LIB,
    from: '  return n !== undefined && !Number.isNaN(n)',
    to: '  return n !== undefined',
  },
  {
    label: 'the number field passes a NaN step to clamp(), so ArrowUp adds 0.000001',
    file: LIB,
    from: "step === 'any' ? 'any' : Number.isNaN(step) ? NUMBER_FIELD_DEFAULTS.step : clamp(",
    to: "step === 'any' ? 'any' : clamp(",
  },
  {
    label: 'the number field keeps a max under min, so the hidden input is never valid and the form never submits',
    file: LIB,
    from: '    max: low !== undefined && high !== undefined && high < low ? low : high,',
    to: '    max: high,',
  },
  {
    label: 'the number field leaves a typed Latin 1,234 to Base UI, which reads it as 1 under Arabic-Indic digits',
    file: HOOK,
    from: "    input.addEventListener('focusout', leave)\n",
    to: '',
  },
  {
    label: 'the number field box loses has-[input:disabled]:opacity-50, so in a disabled fieldset it stays at full ink',
    file: CLASSES,
    from: ' has-[input:disabled]:opacity-50',
    to: '',
  },
  {
    label: 'the number field stepper loses group-has-[input:disabled]/number:disabled:opacity-100, so a disabled fieldset paints it at a quarter',
    file: CLASSES,
    from: ' group-has-[input:disabled]/number:disabled:opacity-100',
    to: '',
  },
  {
    label: 'the number field stepper is shrink-0 again, so at a 32 px root the increase stepper of a large field is cut',
    file: CLASSES,
    from: 'aspect-square shrink items-center',
    to: 'aspect-square shrink-0 items-center',
  },
]
