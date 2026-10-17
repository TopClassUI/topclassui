'use client'

import { FormErrorsContext } from '#shared/form-errors.js'
import { FORM_DEFAULTS } from './constants.js'
import { useFormAction } from './hook.js'
import type { FormActionOwnProps, FormActionProps, FormActionState } from './types.js'

/** A form whose action answers with a state: its errors reach every FieldLive inside by name, the focus goes to the
 * first invalid control, and a function child reads the state and `pending`. */
export function FormAction<S extends FormActionState = FormActionState>(props: FormActionProps<S>) {
  const { action, initialState, permalink, children, ref, ...rest }: FormActionOwnProps<S> = props
  const form = useFormAction({ action, initialState: initialState ?? FORM_DEFAULTS.initialState, permalink, ref })
  // The hook is written on FormActionState; what it holds is what the caller's own action returned.
  const state = form.state as S
  return (
    <FormErrorsContext value={state.errors}>
      <form {...rest} ref={form.ref} action={form.formAction} aria-busy={form.pending || undefined}>
        {typeof children === 'function' ? children(state, form.pending) : children}
      </form>
    </FormErrorsContext>
  )
}
