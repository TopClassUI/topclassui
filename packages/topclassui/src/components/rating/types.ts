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
  onValueChange?: undefined
  name?: undefined
  disabled?: undefined
}

/** A radio group has no name of its own to read, so the caller gives one. */
type Named =
  | { 'aria-label': string; 'aria-labelledby'?: string | undefined }
  | { 'aria-label'?: string | undefined; 'aria-labelledby': string }

/** The radio group a person picks a rating in. It hydrates, and submits in a form before any script runs. */
export type RatingEditableProps = RatingShared & Named & Pick<RatingDesignProps, 'defaultValue' | 'disabled'> & {
  /** false renders the radio group. */
  readOnly: false
  /** Called with the step a click or an arrow key checked, and on a form reset with the step it returns to. */
  onValueChange?: ((value: number) => void) | undefined
  /** The field name in a form. Each radio submits its step, "1" to max. Without one the rating is in no form: not submitted, not reset. */
  name?: string | undefined
}

export type RatingProps = RatingReadOnlyProps | RatingEditableProps

/** What the server half hands the client half: clamped numbers and the name of each step, all serializable. */
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

/** One star of either half: how much of it is filled, at the row's size. */
export interface RatingStarProps {
  fill: RatingFill
  size: Size
}

/** What the editing hook reads from those props. */
export type RatingFieldOptions = Pick<RatingFieldProps, 'value' | 'defaultValue' | 'onValueChange' | 'name' | 'disabled' | 'onPointerLeave'>

/** The events the hook answers, named here so hook.ts writes no angle bracket. */
export type RatingRadioChange = ChangeEvent<HTMLInputElement>
export type RatingRowLeave = PointerEvent<HTMLSpanElement>
