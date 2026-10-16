'use client'

import { DirectionProvider } from '@base-ui/react/direction-provider'
import { OTPField as Base } from '@base-ui/react/otp-field'

import { cn } from '#shared/cn.js'
import { OTP_CELL, OTP_CELL_SIZE, OTP_ROOT, OTP_SEPARATOR, OTP_WRAP } from './classes.js'
import { OTP_FIELD_DEFAULTS } from './constants.js'
import { useOtpField } from './hook.js'
import type { OtpFieldProps } from './types.js'

/** A one-time code, one character per cell. The cells run left to right in every direction, a paste fills them from
 * the focused one, and Arabic-Indic digits are stored as ASCII. Base UI's hidden input is what the form sends. */
export function OTPField({
  length = OTP_FIELD_DEFAULTS.length,
  size = OTP_FIELD_DEFAULTS.size,
  invalid = OTP_FIELD_DEFAULTS.invalid,
  groupSize = OTP_FIELD_DEFAULTS.groupSize,
  value,
  defaultValue,
  onValueChange,
  onValueComplete,
  autoSubmit,
  validationType,
  normalizeValue,
  inputMode,
  ref,
  className,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  ...rest
}: OtpFieldProps) {
  const otp = useOtpField({
    length, groupSize, value, defaultValue, onValueChange, onValueComplete, autoSubmit, validationType, normalizeValue, inputMode, ref,
  })
  // A Field passes aria-invalid itself, so it survives when `invalid` is off.
  const cellInvalid = invalid ? true : ariaInvalid
  // A code reads left to right: without the provider an Arabic page would run the arrows against the cells.
  return (
    <DirectionProvider direction="ltr">
      <Base.Root
        {...rest}
        {...otp.digits}
        ref={otp.rootRef}
        length={otp.length}
        value={otp.value}
        onValueChange={otp.onValueChange}
        onValueComplete={otp.onValueComplete}
        dir="ltr"
        data-size={size}
        className={cn(OTP_ROOT, otp.wraps && OTP_WRAP, className)}
      >
        {otp.cells.flatMap(({ label, separator }, index) => {
          const cell = (
            <Base.Input
              key={`cell-${String(index)}`}
              aria-label={label}
              aria-labelledby={index === 0 ? ariaLabelledBy : undefined}
              aria-describedby={index === 0 ? ariaDescribedBy : undefined}
              aria-invalid={cellInvalid}
              className={cn(OTP_CELL, OTP_CELL_SIZE[size])}
            />
          )
          return separator ? [cell, <span key={`separator-${String(index)}`} aria-hidden className={OTP_SEPARATOR} />] : [cell]
        })}
      </Base.Root>
    </DirectionProvider>
  )
}
