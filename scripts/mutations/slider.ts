// The mutations of src/components/slider. Found by scripts/mutations/index.ts; every label says "slider".
import type { Mutation } from '../lib/mutate.js'

const CLIENT = 'src/components/slider/client.tsx'
const HOOK = 'src/components/slider/hook.ts'
const CLASSES = 'src/components/slider/classes.ts'

export const MUTATIONS: Mutation[] = [
  {
    label: 'the slider thumb loses its index, so both thumbs of a range are hidden in the server HTML',
    file: CLIENT,
    from: '<Base.Thumb key={index} index={index} {...thumb}',
    to: '<Base.Thumb key={index} {...thumb}',
  },
  {
    label: 'the slider control loses the swipe marker, so a finger dragging a thumb inside a Drawer swipes it shut',
    file: CLIENT,
    from: ' data-base-ui-swipe-ignore=""',
    to: '',
  },
  {
    label: 'the slider range inputs never carry aria-invalid, so a screen reader on the focused thumb hears no error',
    file: HOOK,
    from: "if (invalid) input?.setAttribute('aria-invalid', 'true')",
    to: "if (invalid) input?.removeAttribute('aria-invalid')",
  },
  {
    label: 'the slider root loses FIELD_HOLDER, so in a w-fit parent the slider is as wide as its thumb',
    file: CLASSES,
    from: 'export const SLIDER_ROOT = `group/slider grid ${FIELD_HOLDER} ${DISABLED}`',
    to: 'export const SLIDER_ROOT = `group/slider grid ${DISABLED}`',
  },
  {
    label: 'the slider root loses has-disabled, so inside a disabled fieldset a press on the track still moves the thumb',
    file: CLASSES,
    from: ' has-disabled:pointer-events-none',
    to: '',
  },
  {
    label: 'the slider root does not dim inside a disabled fieldset, so it looks live while the form sends nothing',
    file: CLASSES,
    from: ' has-disabled:opacity-50',
    to: '',
  },
  {
    label: 'the slider root loses its dir, so with no provider on an rtl page the thumb is drawn off its value',
    file: CLIENT,
    from: '      dir={slider.dir}\n',
    to: '',
  },
  {
    label: 'the slider passes largeStep unclamped, so largeStep={-10} turns Page Up into Page Down',
    file: HOOK,
    from: 'largeStep: clamp(props.largeStep, step, limitMax),',
    to: 'largeStep: props.largeStep,',
  },
  {
    label: 'the slider passes minStepsBetweenValues unclamped, so NaN lets the thumbs of a range cross',
    file: HOOK,
    from: 'minStepsBetweenValues: clamp(props.minStepsBetweenValues, stepsBetweenMin, limitMax),',
    to: 'minStepsBetweenValues: props.minStepsBetweenValues,',
  },
  {
    label: 'the slider hands Base UI defaultValue again, so a form reset leaves the thumb where it was',
    file: CLIENT,
    from: '      value={slider.value as Value}\n      onValueChange={slider.onValueChange}\n',
    to: '      defaultValue={defaultValue}\n      onValueChange={onValueChange}\n',
  },
  {
    label: 'the slider with no default starts at 0, not at min',
    file: HOOK,
    from: 'defaultValue: defaultValue ?? limits.min',
    to: 'defaultValue: defaultValue ?? 0',
  },
  {
    label: 'the slider ignores details.cancel(), so a handler that cancels still moves the thumb',
    file: HOOK,
    from: '    if (!details.isCanceled) state.setValue(next)',
    to: '    state.setValue(next)',
  },
  {
    label: 'the slider never calls the caller handler, so onValueChange hears nothing',
    file: HOOK,
    from: '    onValueChange?.(next, details)\n',
    to: '',
  },
  {
    label: 'the slider drops the caller ref, which then never holds the group',
    file: HOOK,
    from: '  useImperativeHandle(ref, () => state.rootRef.current as HTMLDivElement, [state.rootRef])\n',
    to: '  void ref\n',
  },
  {
    label: 'the slider passes step unclamped, so step={0} reaches Base UI',
    file: HOOK,
    from: 'step: clamp(props.step, stepMin, limitMax)',
    to: 'step: props.step',
  },
  {
    label: 'the slider passes max unclamped, so max={1e308} reaches Base UI',
    file: HOOK,
    from: 'max: clamp(props.max, limitMin, limitMax)',
    to: 'max: props.max',
  },
  {
    label: 'the slider names both thumbs of a range Minimum',
    file: HOOK,
    from: "'aria-label': index === 0 ? labels.minimum : labels.maximum,",
    to: "'aria-label': labels.minimum,",
  },
  {
    label: 'the slider range thumbs speak Base UI English value text, "20 start range"',
    file: HOOK,
    from: '      getAriaValueText: formattedOnly,\n',
    to: '',
  },
  {
    label: 'the slider range thumbs lose aria-describedby, which then stays on no element a screen reader lands on',
    file: HOOK,
    from: "      'aria-describedby': describedBy,\n      getAriaValueText",
    to: '      getAriaValueText',
  },
  {
    label: 'the slider single thumb loses its name, so the range input is unnamed',
    file: HOOK,
    from: "? [{ ...name, 'aria-describedby': describedBy }]",
    to: "? [{ 'aria-describedby': describedBy }]",
  },
  {
    label: 'the slider puts the name of one thumb on the group too',
    file: HOOK,
    from: 'root: single ? {} : name,',
    to: 'root: name,',
  },
  {
    label: 'the slider drops the provider digits, so Arabic digits never reach the value',
    file: HOOK,
    from: 'numberingSystem: format?.numberingSystem ?? numbering',
    to: 'numberingSystem: format?.numberingSystem',
  },
  {
    label: 'the slider drops the provider locale, so the runtime locale formats the value',
    file: HOOK,
    from: 'locale: props.locale ?? providerLocale,',
    to: 'locale: props.locale,',
  },
  {
    label: 'the slider places the thumb at the edge, with an inline script that needs a CSP nonce',
    file: CLIENT,
    from: 'thumbAlignment="center"',
    to: 'thumbAlignment="edge"',
  },
  {
    label: 'the slider keeps required in the rest props, so it lands on the group as <div required>',
    file: CLIENT,
    from: '  required: _required,\n',
    to: '',
  },
  {
    label: 'the slider drops invalid, so aria-invalid and the danger look never appear',
    file: CLIENT,
    from: 'aria-invalid={invalid ? true : ariaInvalid}',
    to: 'aria-invalid={ariaInvalid}',
  },
  {
    label: 'the slider ignores fullWidth',
    file: CLIENT,
    from: 'fullWidth && SLIDER_FULL',
    to: 'false && SLIDER_FULL',
  },
  {
    label: 'the slider puts the caller className first, so its own width wins a conflict',
    file: CLIENT,
    from: 'cn(SLIDER_ROOT, SLIDER_TEXT[size], fullWidth && SLIDER_FULL, className)',
    to: 'cn(className, SLIDER_ROOT, SLIDER_TEXT[size], fullWidth && SLIDER_FULL)',
  },
  {
    label: 'the slider loses the type step of an Input, so its width is not an Input width at its size',
    file: CLIENT,
    from: 'cn(SLIDER_ROOT, SLIDER_TEXT[size], ',
    to: 'cn(SLIDER_ROOT, ',
  },
  {
    label: 'the slider track loses its size, so every size draws the same track',
    file: CLIENT,
    from: 'cn(SLIDER_TRACK, SLIDER_TRACK_SIZE[size])',
    to: 'cn(SLIDER_TRACK)',
  },
  {
    label: 'the slider knob loses its size, so every size draws the same knob',
    file: CLIENT,
    from: 'cn(SLIDER_KNOB, SLIDER_KNOB_SIZE[size])',
    to: 'cn(SLIDER_KNOB)',
  },
  {
    label: 'the slider ignores showValue',
    file: CLIENT,
    from: '{showValue ? <Base.Value className={SLIDER_VALUE} /> : null}',
    to: '{null}',
  },
  {
    label: 'the slider thumb loses TOUCH_TARGET, so the thumb is as small as its knob',
    file: CLASSES,
    from: 'export const SLIDER_THUMB = `group/thumb flex items-center justify-center ${TOUCH_TARGET}`',
    to: 'export const SLIDER_THUMB = `group/thumb flex items-center justify-center`',
  },
  {
    label: 'the slider control loses touch-none, so a finger dragging the thumb scrolls the page',
    file: CLASSES,
    from: 'relative flex min-w-0 flex-1 touch-none select-none',
    to: 'relative flex min-w-0 flex-1 select-none',
  },
  {
    label: 'the slider control loses half a target of padding under a finger, so a thumb at 0 pokes out of the box',
    file: CLASSES,
    from: ' pointer-coarse:px-[calc(var(--tc-target-coarse,44px)/2)]',
    to: '',
  },
  {
    label: 'the slider track loses its forced-colours line, so the empty track vanishes there',
    file: CLASSES,
    from: 'bg-neutral-soft ${FORCED_EDGE} ',
    to: 'bg-neutral-soft ',
  },
  {
    label: 'the slider invalid track loses its danger line, so invalid is told by hue alone',
    file: CLASSES,
    from: ' group-aria-invalid/slider:outline-solid group-aria-invalid/slider:outline-(length:--tc-line-width)',
    to: '',
  },
  {
    label: 'the slider fill is erased under forced colours, with no Highlight',
    file: CLASSES,
    from: ' forced-colors:bg-[Highlight]',
    to: '',
  },
  {
    label: 'the slider ring moves off the knob',
    file: CLASSES,
    from: ' group-has-focus-visible/thumb:outline-solid',
    to: '',
  },
]
