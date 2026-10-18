import type { ComponentPropsWithRef, ReactNode, RefCallback } from 'react'

import type { FieldSchemaInput } from './schema.js'

// R-8.3-4: derived from the schema, so the props and the validation cannot drift apart.
export type FieldDesignProps = {
  [K in keyof FieldSchemaInput]?: FieldSchemaInput[K] | undefined
}

/** What a Field hands its child to spread onto the control: every one of the eleven takes it as it is. */
export interface FieldControl {
  /** The id the label's `for` points at; the label, hint and error ids are built from it. */
  id: string
  name: string
  required: boolean
  /** The label's id: it names a group or a slider, which no `<label for>` can. */
  'aria-labelledby': string
  /** The hint's id and then the error's, only those rendered; undefined when neither is. */
  'aria-describedby': string | undefined
  'aria-invalid': true | undefined
}

/** One message, or the array Zod's `fieldErrors` gives for a name. */
export type FieldError = string | readonly string[]

/** The control's id is the caller's `id` or `useId()`; the others follow it. */
export interface FieldIds {
  control: string
  label: string
  hint: string
  error: string
}

/** The id belongs to the control, never the root; the child is the control, never text. */
type Owned = 'children' | 'id' | 'dangerouslySetInnerHTML'

export type FieldProps = Omit<ComponentPropsWithRef<'div'>, Owned>
  & FieldDesignProps
  & {
    /** The control's name, and the key of its errors in a FormAction's answer. */
    name: string
    /** The visible name of the control. */
    label: ReactNode
    /** Text under the control that describes it: the first id of the control's aria-describedby. */
    hint?: ReactNode | undefined
    /** One message or several, read after the hint; with one, the control is invalid unless `invalid` says otherwise. */
    error?: FieldError | undefined
    /** The control's id; without it `useId()` makes one. Pass it when a page links to the field. */
    id?: string | undefined
    /** Called with the control object, which the control spreads: `(control) => <Input {...control} />`. Client-only for FieldLive. */
    children: (control: FieldControl) => ReactNode
  }

/** The same props: with no `error` of its own it reads the nearest FormAction's errors by `name`. */
export type FieldLiveProps = FieldProps

/** What both halves hand the one function that writes the markup. */
export interface FieldRenderProps {
  ids: FieldIds
  name: string
  label: ReactNode
  hint: ReactNode
  messages: readonly string[]
  invalid: boolean
  required: boolean
  inline: boolean
  children: (control: FieldControl) => ReactNode
  /** Everything that reaches the root: the caller's rest, className and ref, and FieldLive's listeners. */
  root: ComponentPropsWithRef<'div'>
}

/** What FieldLive's hook reads: the ids, the error, and the root's own ref and listeners, which it wraps. */
export type FieldLiveHookProps = Pick<FieldLiveProps, 'id' | 'name' | 'error' | 'ref' | 'onInput' | 'onChange' | 'onClick' | 'onKeyUp'>

/** The events FieldLive listens for on its root, named here because hook.ts writes no type argument. */
export type FieldInputEvent = Parameters<NonNullable<FieldLiveProps['onInput']>>[0]
export type FieldChangeEvent = Parameters<NonNullable<FieldLiveProps['onChange']>>[0]
export type FieldClickEvent = Parameters<NonNullable<FieldLiveProps['onClick']>>[0]
export type FieldKeyEvent = Parameters<NonNullable<FieldLiveProps['onKeyUp']>>[0]

/** What the hook hands the markup: the ids, the error that applies, and the root's ref and listeners, wrapped. */
export interface FieldLiveHookResult {
  ids: FieldIds
  error: FieldError | undefined
  root: {
    ref: RefCallback<HTMLDivElement>
    onInput: (event: FieldInputEvent) => void
    onChange: (event: FieldChangeEvent) => void
    onClick: (event: FieldClickEvent) => void
    onKeyUp: (event: FieldKeyEvent) => void
  }
}
