// The mutations of src/components/form. Found by scripts/mutations/index.ts. Every label starts with "form:".
import type { Mutation } from '../lib/mutate.js'

const CLIENT = 'src/components/form/client.tsx'
const HOOK = 'src/components/form/hook.ts'
const INDEX = 'src/components/form/index.tsx'

export const MUTATIONS: Mutation[] = [
  {
    label: 'form: FormAction no longer provides the errors, so no field shows what the action returned',
    file: CLIENT,
    from: '<FormErrorsContext value={state.errors}>',
    to: '<FormErrorsContext value={undefined}>',
  },
  {
    label: 'form: FormAction provides an empty record before its first answer, so its readers no longer read the undefined of the plan',
    file: CLIENT,
    from: '<FormErrorsContext value={state.errors}>',
    to: '<FormErrorsContext value={state.errors ?? {}}>',
  },
  {
    label: 'form: the focus effect is removed, so after errors the focus stays on the submit button',
    file: HOOK,
    from: '    focusFirstInvalid(form.current)\n',
    to: '\n',
  },
  {
    label: 'form: a function child is called with the starting state instead of the current one',
    file: CLIENT,
    from: 'children(state, form.pending)',
    to: 'children((initialState ?? FORM_DEFAULTS.initialState) as S, form.pending)',
  },
  {
    label: 'form: aria-busy is never written, so nothing tells the form is pending',
    file: CLIENT,
    from: 'aria-busy={form.pending || undefined}',
    to: 'aria-busy={undefined}',
  },
  {
    label: 'form: the focus moves on the first render too, when no answer has come',
    file: HOOK,
    from: 'if (state === first.current || !hasErrors',
    to: 'if (!hasErrors',
  },
  {
    label: 'form: a radiogroup in error is focused itself, which it cannot take, instead of its checked or first radio',
    file: HOOK,
    from: '  if (invalid.tabIndex >= 0) return invalid\n',
    to: '  return invalid\n',
  },
  {
    label: 'form: a disabled control in error is taken as focused, so the focus never reaches the next one',
    file: HOOK,
    from: 'if (target && target.ownerDocument.activeElement === target) return',
    to: 'if (target) return',
  },
  {
    label: 'form: an empty message counts as an error, so an answer with none still moves the focus',
    file: HOOK,
    from: '.some((message) => message !== \'\')',
    to: '.some(() => true)',
  },
  {
    label: 'form: permalink is not passed to useActionState, so a post before hydration lands on the wrong page',
    file: HOOK,
    from: 'useActionState(action, initialState, permalink)',
    to: 'useActionState(action, initialState)',
  },
  {
    label: 'form: a function ref of the caller is never called',
    file: HOOK,
    from: "if (typeof forwarded === 'function') return forwarded(node)",
    to: "if (typeof forwarded === 'function') return undefined",
  },
  {
    label: 'form: an object ref of the caller is never set',
    file: HOOK,
    from: '    if (forwarded) forwarded.current = node\n',
    to: '\n',
  },
  {
    label: 'form: Form writes noValidate, so a required field posts empty before hydration',
    file: INDEX,
    from: '<form {...rest} className=',
    to: '<form noValidate {...rest} className=',
  },
  {
    label: 'form: Form passes the className as it is, so two conflicting classes both stay',
    file: INDEX,
    from: 'className={cn(className) || undefined}',
    to: 'className={className}',
  },
]
