'use client'

import { cn } from '#shared/cn.js'
import { RATING_GROUP, RATING_RADIO, RATING_STEP } from './classes.js'
import { useRatingField } from './hook.js'
import { fillOf, toField } from './lib.js'
import { RatingStar } from './parts/rating-star.js'
import type { RatingFieldProps, RatingInputProps } from './types.js'

/** An editable Rating for a client caller: the radio group of `<Rating readOnly={false}>`, and onValueChange. */
export function RatingInput(props: RatingInputProps) {
  return <RatingField {...toField(props)} />
}

/** The editing half: a native radio group, so the arrows, Tab and a form work before any script runs. */
export function RatingField({
  value, defaultValue, onValueChange, size, names, name, disabled, onPointerLeave, className, ...rest
}: RatingFieldProps) {
  const field = useRatingField({ value, defaultValue, onValueChange, name, disabled, onPointerLeave })
  return (
    <span
      {...rest}
      role="radiogroup"
      data-size={size}
      data-disabled={disabled ? '' : undefined}
      onPointerLeave={field.leave}
      className={cn(RATING_GROUP, className)}
    >
      {names.map((label, index) => {
        const step = index + 1
        return (
          <label key={step} className={RATING_STEP} onPointerEnter={field.enter(step)}>
            <input
              ref={index === 0 ? field.watchForm : undefined}
              type="radio"
              name={field.name}
              form={field.form}
              value={step}
              checked={field.checked === step}
              onChange={field.select}
              disabled={disabled}
              aria-label={label}
              className={RATING_RADIO}
            />
            <RatingStar fill={fillOf(step, field.shown)} size={size} />
          </label>
        )
      })}
    </span>
  )
}
