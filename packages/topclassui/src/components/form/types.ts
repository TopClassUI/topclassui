import type { ComponentPropsWithRef, ReactNode, Ref } from 'react'

import type { FormErrors } from '#shared/form-errors.js'

/** A native form: `action` is a URL or a Server Action, and every attribute reaches the element. */
export type FormProps = ComponentPropsWithRef<'form'>

/** What every FormAction state holds: the errors by field name. A state of your own adds `values` or `message`. */
export interface FormActionState {
  errors?: FormErrors | undefined
}

/** A Server Action a server page hands it, or a client function: the last state and the entries in, the next state out. */
export type FormActionFunction<S extends FormActionState> = (state: S, formData: FormData) => S | Promise<S>

/** `initialState` may be left out only when `{}` is a state, that is when every key of the state is optional. */
type Initial<S> = Partial<S> extends S ? { initialState?: S | undefined } : { initialState: S }

/** React writes these itself for a function action and refuses them from a caller; the action is FormAction's own. */
type Owned = 'action' | 'children' | 'method' | 'encType' | 'target'

export type FormActionProps<S extends FormActionState = FormActionState> =
  Omit<ComponentPropsWithRef<'form'>, Owned>
  & Initial<S>
  & {
    action: FormActionFunction<S>
    /** The page the form posts to before hydration, passed to useActionState: its response renders this state. */
    permalink?: string | undefined
    /** The fields; or a function of the action's last state and `pending`, so the fields read what it answered. */
    children?: ReactNode | ((state: S, pending: boolean) => ReactNode)
  }

/** The props as FormAction reads them, with the starting state optional whatever the state type. */
export type FormActionOwnProps<S extends FormActionState> = Omit<FormActionProps<S>, 'initialState'> & { initialState?: S | undefined }

/** A method's type, whose parameters are bivariant, so an action on a wider state fits: hook.ts writes no type argument. */
type AnyStateAction = { action(state: FormActionState, formData: FormData): FormActionState | Promise<FormActionState> }['action']

/** What FormAction's hook reads. */
export interface FormActionHookProps {
  action: AnyStateAction
  initialState: FormActionState
  permalink: string | undefined
  ref: Ref<HTMLFormElement> | undefined
}
