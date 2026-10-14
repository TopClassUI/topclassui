'use client'

import { NumberField as Base } from '@base-ui/react/number-field'

import { minus } from '#icons/data/minus.js'
import { plus } from '#icons/data/plus.js'
import { CONTROL_HEIGHT, FIELD_HOLDER_FULL, FIELD_TEXT } from '#shared/classes.js'
import { cn } from '#shared/cn.js'
import { Svg } from '#components/svg/index.js'
import { NUMBER_FIELD_DECREASE, NUMBER_FIELD_GROUP, NUMBER_FIELD_INPUT, NUMBER_FIELD_ROOT, NUMBER_FIELD_STEP } from './classes.js'
import { NUMBER_FIELD_DEFAULTS } from './constants.js'
import { useNumberField } from './hook.js'
import type { NumberFieldProps } from './types.js'

/** A number typed or stepped between `min` and `max`: decrease, the number, increase on screen, mirrored in
 * right-to-left while the number stays left-to-right. Base UI's hidden input sends the plain number, and follows a reset. */
export function NumberField({
  size = NUMBER_FIELD_DEFAULTS.size,
  invalid = NUMBER_FIELD_DEFAULTS.invalid,
  fullWidth = NUMBER_FIELD_DEFAULTS.fullWidth,
  value,
  defaultValue,
  onValueChange,
  inputRef,
  min,
  max,
  step,
  allowOutOfRange,
  locale,
  format,
  className,
  dir,
  placeholder,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  ...rest
}: NumberFieldProps) {
  const field = useNumberField({ value, defaultValue, onValueChange, inputRef, min, max, step, allowOutOfRange, locale, format })
  // The rest goes first, so the controlled pair, the bounds and the design attributes are never overwritten.
  return (
    <Base.Root
      {...rest}
      value={field.value}
      onValueChange={field.onValueChange}
      inputRef={field.inputRef}
      min={field.min}
      max={field.max}
      step={field.step}
      allowOutOfRange={allowOutOfRange}
      locale={field.locale}
      format={field.format}
      data-size={size}
      className={cn(NUMBER_FIELD_ROOT, FIELD_TEXT[size], fullWidth && FIELD_HOLDER_FULL, className)}
    >
      <Base.Group className={cn(NUMBER_FIELD_GROUP, CONTROL_HEIGHT[size])}>
        <Base.Input
          ref={field.fieldRef}
          dir={dir ?? 'ltr'}
          placeholder={placeholder}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          aria-describedby={ariaDescribedBy}
          // A Field passes aria-invalid itself, so it survives when `invalid` is off.
          aria-invalid={invalid ? true : ariaInvalid}
          aria-roledescription={field.labels.field}
          onPaste={field.onPaste}
          className={NUMBER_FIELD_INPUT}
        />
        <Base.Decrement aria-label={field.labels.decrease} className={cn(NUMBER_FIELD_STEP, NUMBER_FIELD_DECREASE)}>
          <Svg icon={minus} size="0.875rem" />
        </Base.Decrement>
        <Base.Increment aria-label={field.labels.increase} className={NUMBER_FIELD_STEP}>
          <Svg icon={plus} size="0.875rem" />
        </Base.Increment>
      </Base.Group>
    </Base.Root>
  )
}
