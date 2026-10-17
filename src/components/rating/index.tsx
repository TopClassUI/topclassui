// No 'use client': a read-only rating is server HTML, and only readOnly={false} renders the client half.
import { cn } from '#shared/cn.js'
import { en } from '#shared/labels/en.js'
import { createNumberFormat } from '#shared/labels/get-labels.js'
import { RATING_ROOT } from './classes.js'
import { RatingField } from './client.js'
import { RATING_DEFAULTS } from './constants.js'
import { Star, fillOf, stepsOf, toMax, toShown, toStep } from './lib.js'
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
function Editable({
  value, defaultValue = RATING_DEFAULTS.value, max: rawMax = RATING_DEFAULTS.max, size = RATING_DEFAULTS.size,
  disabled = RATING_DEFAULTS.disabled, labels = en, locale = RATING_DEFAULTS.locale, readOnly: _readOnly, ...rest
}: RatingEditableProps) {
  const max = toMax(rawMax)
  const fmt = createNumberFormat(locale)
  return (
    <RatingField
      {...rest}
      value={value === undefined ? undefined : toStep(value, max)}
      defaultValue={toStep(defaultValue, max)}
      size={size}
      disabled={disabled}
      names={stepsOf(max).map((step) => labels.rating.stars(step, fmt))}
    />
  )
}

/** A row of stars. Read-only by default, which renders on the server and ships no script;
 * readOnly={false} renders a native radio group, the one part that hydrates. */
export function Rating(props: RatingProps) {
  return props.readOnly === false ? <Editable {...props} /> : <ReadOnly {...props} />
}

export { RatingSkeleton } from './skeleton.js'
export type {
  RatingDesignProps, RatingEditableProps, RatingFill, RatingProps, RatingReadOnlyProps, RatingSkeletonProps,
} from './types.js'
