// The mutations of src/components/switch. Found by scripts/mutations/index.ts; every label says "switch".
import type { Mutation } from '../lib/mutate.js'

const CLIENT = 'src/components/switch/client.tsx'
const HOOK = 'src/components/switch/hook.ts'
const CLASSES = 'src/components/switch/classes.ts'

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
]
