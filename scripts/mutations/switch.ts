// The mutations of src/components/switch. Found by scripts/mutations/index.ts; every label says "switch".
import type { Mutation } from '../lib/mutate.js'

const CLIENT = 'src/components/switch/client.tsx'
const HOOK = 'src/components/switch/hook.ts'
const CLASSES = 'src/components/switch/classes.ts'
const SKELETON = 'src/components/switch/skeleton.tsx'

export const MUTATIONS: Mutation[] = [
  {
    label: 'the switch slide loses var(--tc-dir), so in Arabic the thumb leaves its track',
    file: CLASSES,
    from: "md: 'group-data-checked/toggle:translate-x-[calc(0.9375rem*var(--tc-density)*var(--tc-dir))]'",
    to: "md: 'group-data-checked/toggle:translate-x-[calc(0.9375rem*var(--tc-density))]'",
  },
  {
    label: 'the switch hands Base UI defaultChecked again, so a form reset leaves it as it was while the form sends the default',
    file: CLIENT,
    from: '      checked={value.checked}\n      onCheckedChange={value.onCheckedChange}\n',
    to: '      defaultChecked={defaultChecked}\n      onCheckedChange={onCheckedChange}\n',
  },
  {
    label: 'the switch root is Base UI span again, so a label htmlFor names nothing in the server HTML',
    file: CLIENT,
    from: '      nativeButton\n      render={<button />}\n',
    to: '',
  },
  {
    label: 'the switch ignores details.cancel(), so a handler that cancels still flips it',
    file: HOOK,
    from: '    if (!details.isCanceled) state.setValue(next)',
    to: '    state.setValue(next)',
  },
  {
    label: 'the switch never calls the caller handler, so onCheckedChange hears nothing',
    file: HOOK,
    from: '    onCheckedChange?.(next, details)\n',
    to: '',
  },
  {
    label: 'the switch drops the caller inputRef, which then never holds the hidden input',
    file: HOOK,
    from: '  useImperativeHandle(inputRef, () => state.inputRef.current as HTMLInputElement, [state.inputRef])\n',
    to: '  void inputRef\n',
  },
  {
    label: 'the switch stops writing its hidden checkbox after a reset, so a controlled one sends the first default',
    file: HOOK,
    from: 'sync: syncChecked })',
    to: '})',
  },
  {
    label: 'the switch drops invalid, so aria-invalid and the danger line never appear',
    file: CLIENT,
    from: 'aria-invalid={invalid ? true : ariaInvalid}',
    to: 'aria-invalid={ariaInvalid}',
  },
  {
    label: 'the switch thumb loses its forced-colours fill, so off it is erased under forced colours',
    file: CLASSES,
    from: ' forced-colors:bg-[ButtonText]',
    to: '',
  },
  {
    label: 'the switch thumb is surface-raised again when off, 1.2:1 on its track in light and 1.08:1 in dark',
    file: CLASSES,
    from: 'rounded-full bg-line-strong group-data-checked/toggle:bg-primary-on-solid',
    to: 'rounded-full bg-surface-raised group-data-checked/toggle:bg-primary-on-solid',
  },
  {
    label: 'the switch custom slide is empty again, so a custom switch sized from CSS keeps its thumb at the start when on',
    file: CLASSES,
    from: "  custom: 'group-data-checked/toggle:translate-x-[calc((100cqw-100%)*var(--tc-dir))]',",
    to: "  custom: '',",
  },
  {
    label: 'the switch custom track is no container, so its thumb measures the viewport and leaves the track',
    file: CLASSES,
    from: "  custom: '@container',",
    to: "  custom: '',",
  },
  {
    label: 'the switch skeleton draws an md track at every size, so an xl switch jumps when it arrives',
    file: SKELETON,
    from: 'SWITCH_TRACK_SIZE[size]',
    to: 'SWITCH_TRACK_SIZE.md',
  },
  {
    label: 'the switch skeleton loses the target floor, so under a finger it is 20 px shorter than its switch',
    file: CLASSES,
    from: 'items-center justify-center ${TOUCH_TARGET}`',
    to: 'items-center justify-center`',
  },
  {
    label: 'the switch skeleton takes aria-hidden from the caller, so a placeholder can be read out',
    file: SKELETON,
    from: '{...rest} aria-hidden>',
    to: 'aria-hidden {...rest}>',
  },
]
