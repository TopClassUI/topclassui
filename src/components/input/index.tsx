// No 'use client': a client bundle gets it only when a client file imports it.
import { cn } from '#shared/cn.js'
import { resolveMaxLength } from '#shared/contracts/boundaries.js'
import { INPUT_OWN_WIDTH, INPUT_READ_ONLY } from './classes.js'
import {
  INPUT_CAPPED_TYPES, INPUT_DEFAULT_TYPE, INPUT_DEFAULTS, INPUT_LTR_TYPES, INPUT_OWN_WIDTH_TYPES,
} from './constants.js'
import type { InputProps } from './types.js'
import { inputVariants } from './variants.js'

/** A native input with the control look. It renders no text, so the type asks for a
 * name, and a text type is capped by its type unless the caller says otherwise. */
export function Input({
  size = INPUT_DEFAULTS.size,
  invalid = INPUT_DEFAULTS.invalid,
  fullWidth = INPUT_DEFAULTS.fullWidth,
  type = INPUT_DEFAULT_TYPE,
  maxLength,
  dir,
  readOnly,
  className,
  'aria-invalid': ariaInvalid,
  ...rest
}: InputProps) {
  // HTML allows maxlength on these six only, so a date or a checkbox never carries one.
  const capped = INPUT_CAPPED_TYPES.some((allowed) => allowed === type)
  // UAX 9: in a right-to-left paragraph a leading sign or a trailing slash changes sides.
  const ltr = dir === undefined && INPUT_LTR_TYPES.some((latin) => latin === type)
  // A checkbox, a colour well or a date keeps the box the browser gives it.
  const ownWidth = !fullWidth && INPUT_OWN_WIDTH_TYPES.some((text) => text === type)

  // The rest goes first, so the resolved cap and the design attributes are never overwritten.
  return (
    <input
      {...rest}
      type={type}
      dir={ltr ? 'ltr' : dir}
      data-ltr={ltr ? '' : undefined}
      readOnly={readOnly}
      maxLength={capped ? resolveMaxLength(maxLength, type) : undefined}
      // A Field passes aria-invalid itself, so it survives when `invalid` is off.
      aria-invalid={invalid ? true : ariaInvalid}
      data-invalid={invalid ? '' : undefined}
      data-size={size}
      className={cn(
        inputVariants({ size, fullWidth }),
        ownWidth && INPUT_OWN_WIDTH,
        readOnly && INPUT_READ_ONLY,
        className,
      )}
    />
  )
}

export { inputVariants } from './variants.js'
export { InputSkeleton } from './skeleton.js'
export type {
  InputDesignProps, InputName, InputProps, InputSkeletonProps, InputVariantProps,
} from './types.js'
