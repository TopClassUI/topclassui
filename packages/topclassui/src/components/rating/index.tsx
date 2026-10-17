// No 'use client': a read-only rating is server HTML, and only readOnly={false} renders the client half.
import { cn } from '#shared/cn.js'
import { en } from '#shared/labels/en.js'
import { createNumberFormat } from '#shared/labels/get-labels.js'
import { RATING_ROOT } from './classes.js'
import { RatingField } from './client.js'
import { RATING_DEFAULTS } from './constants.js'
import { Star, fillOf, stepsOf, toField, toMax, toShown } from './lib.js'
import type { RatingEditableProps, RatingProps, RatingReadOnlyProps } from './types.js'

/** Stars that show a value, named "4 out of 5" unless the caller names them. */
function ReadOnly({
  value = RATING_DEFAULTS.value, max: rawMax = RATING_DEFAULTS.max, size = RATING_DEFAULTS.size,
  labels = en, locale = RATING_DEFAULTS.locale, readOnly: _readOnly, className, ...rest
}: RatingReadOnlyProps) {
  const max = toMax(rawMax)
  const shown = toShown(value, max)
  return (
    <span
      {...rest}
      role="img"
      aria-label={rest['aria-label'] ?? labels.rating.value(shown, max, createNumberFormat(locale))}
      data-size={size}
      className={cn(RATING_ROOT, className)}
    >
      {stepsOf(max).map((step) => <Star key={step} fill={fillOf(step, shown)} size={size} />)}
    </span>
  )
}

/** The client half, handed only what can cross: clamped numbers and the name of each step. */
function Editable({ readOnly: _readOnly, ...props }: RatingEditableProps) {
  return <RatingField {...toField(props)} />
}

/** A row of stars. Read-only by default, which renders on the server and ships no script;
 * readOnly={false} renders a native radio group, the one part that hydrates. It takes no function: RatingInput does. */
export function Rating(props: RatingProps) {
  return props.readOnly === false ? <Editable {...props} /> : <ReadOnly {...props} />
}

export { RatingInput } from './client.js'
export type {
  RatingDesignProps, RatingEditableProps, RatingFill, RatingInputProps, RatingProps, RatingReadOnlyProps,
} from './types.js'
