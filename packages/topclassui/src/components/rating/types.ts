import type { ChangeEvent, ComponentPropsWithRef, PointerEvent } from 'react'

import type { Size } from '#shared/contracts/size.js'
import type { Labels } from '#shared/labels/types.js'
import type { RATING_FILLS } from './constants.js'
import type { RatingSchemaInput } from './schema.js'

/** How much of one star is drawn. */
export type RatingFill = (typeof RATING_FILLS)[number]

// R-8.3-4: derived from the schema, so the props and the validation cannot drift apart.
export type RatingDesignProps = {
  [K in keyof RatingSchemaInput]?: RatingSchemaInput[K] | undefined
}

/** The role is the rating's own, and the stars are its only content. */
type Owned = 'children' | 'role' | 'dangerouslySetInnerHTML' | 'defaultValue' | 'defaultChecked' | 'onChange'

interface RatingShared
  extends Omit<ComponentPropsWithRef<'span'>, Owned>, Pick<RatingDesignProps, 'value' | 'max' | 'size'> {
  /** The built-in strings: `labels.rating.value` names a read-only rating, `labels.rating.stars` each step. Defaults to English. */
  labels?: Labels | undefined
  /** The BCP 47 tag the numbers in those names are formatted in. Defaults to `en`. */
  locale?: string | undefined
}

/** Stars drawn on the server: a `<span role="img">`, named "4 out of 5". */
export interface RatingReadOnlyProps extends RatingShared {
  /** Leave unset, or true, for stars that only show a value. */
  readOnly?: true | undefined
  defaultValue?: undefined
  name?: undefined
  disabled?: undefined
}

/** A radio group has no name of its own to read, so the caller gives one. */
type Named =
  | { 'aria-label': string; 'aria-labelledby'?: string | undefined }
  | { 'aria-label'?: string | undefined; 'aria-labelledby': string }

/** What both editing exports take: the radio group a person picks a rating in. */
type RatingEditing = RatingShared & Named & Pick<RatingDesignProps, 'defaultValue' | 'disabled'> & {
  /** The field name in a form. Each radio submits its step, "1" to max. Without one the rating is in no form: not submitted, not reset. */
  name?: string | undefined
}

/** The radio group, written by a server page. It hydrates, and submits in a form before any script runs. */
export type RatingEditableProps = RatingEditing & {
  /** false renders the radio group. */
  readOnly: false
}

/** The same radio group, with a handler. A client export: a Server Component passes onValueChange only as a Server Action. */
export type RatingInputProps = RatingEditing & {
  /** Called with the step a click or an arrow key checked, and on a form reset with the step it returns to. */
  onValueChange?: ((value: number) => void) | undefined
}

export type RatingProps = RatingReadOnlyProps | RatingEditableProps

/** What both editing exports hand the radio group: clamped numbers and the name of each step. */
export interface RatingFieldProps extends Omit<ComponentPropsWithRef<'span'>, Owned> {
  value: number | undefined
  defaultValue: number
  size: Size
  /** The accessible name of each step, first to last: one radio each. */
  names: readonly string[]
  name?: string | undefined
  disabled: boolean
  onValueChange?: ((value: number) => void) | undefined
}

/** What the editing hook reads from those props. */
export type RatingFieldOptions = Pick<RatingFieldProps, 'value' | 'defaultValue' | 'onValueChange' | 'name' | 'disabled' | 'onPointerLeave'>

/** The events the hook answers, named here so hook.ts writes no angle bracket. */
export type RatingRadioChange = ChangeEvent<HTMLInputElement>
export type RatingRowLeave = PointerEvent<HTMLSpanElement>
