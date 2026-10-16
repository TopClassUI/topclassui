// The mutations of src/shared/use-form-value.ts. Found by scripts/mutations/index.ts.
import type { Mutation } from '../lib/mutate.js'

export const MUTATIONS: Mutation[] = [
  {
    label: 'the shared form value keeps its reset listener after unmount, so a control that is gone still answers its form',
    file: 'src/shared/use-form-value.ts',
    from: "      form.removeEventListener('reset', onReset)\n",
    to: '',
  },
  {
    label: 'the shared form value resets to the first default and not the latest, so a server action that sends the values back loses them',
    file: 'src/shared/use-form-value.ts',
    from: '  latest.current = { value, defaultValue, sync }',
    to: '  latest.current = { ...latest.current, value, sync }',
  },
  {
    label: 'the shared form value stops calling sync for a controlled control, so its checkbox sends the first default while the screen shows the owner value',
    file: 'src/shared/use-form-value.ts',
    from: 'write?.(controlled === undefined ? fallback : controlled, inputRef.current, rootRef.current)',
    to: 'if (controlled === undefined) write?.(fallback, inputRef.current, rootRef.current)',
  },
  {
    label: 'the shared form value resets after a cancelled reset, so the control moves while the inputs beside it stay',
    file: 'src/shared/use-form-value.ts',
    from: '        if (event.defaultPrevented) return\n',
    to: '',
  },
  {
    label: 'the shared form value binds the first form it finds for good, so after the form prop changes the new form resets nothing and the old one still does',
    file: 'src/shared/use-form-value.ts',
    from: '    if (bound.current?.form === form) return\n',
    to: '    if (bound.current) return\n',
  },
]
