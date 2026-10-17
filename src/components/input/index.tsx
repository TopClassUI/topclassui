// No 'use client': a client bundle gets it only when a client file imports it, or with `validate`.
import { cn } from '#shared/cn.js'
import { resolveMaxLength } from '#shared/contracts/boundaries.js'
// Named here as well, so a consumer program that never compiles shared/ gets the --tc-* keys.
import type {} from '#shared/style-tokens.js'
import { INPUT_OWN_WIDTH, INPUT_READ_ONLY } from './classes.js'
import { InputCheck } from './client.js'
import {
  INPUT_CAPPED_TYPES, INPUT_DEFAULT_TYPE, INPUT_DEFAULTS, INPUT_LTR_TYPES, INPUT_OWN_WIDTH_TYPES,
} from './constants.js'
import { checkRules } from './lib.js'
import type { InputProps } from './types.js'
import { inputVariants } from './variants.js'

/** A native input with the control look. It renders no text, so the type asks for a name, a text type is
 * capped by its type unless the caller says otherwise, and `validate` holds a scripted value to the same rules. */
export function Input({
  size = INPUT_DEFAULTS.size,
  invalid = INPUT_DEFAULTS.invalid,
  fullWidth = INPUT_DEFAULTS.fullWidth,
  validate = INPUT_DEFAULTS.validate,
  type = INPUT_DEFAULT_TYPE,
  maxLength,
  dir,
  readOnly,
  className,
  'aria-invalid': ariaInvalid,
  ...rest
}: InputProps) {
  // HTML matches the type attribute without regard to case, so 'Email' is an email field.
  const kind = String(type).toLowerCase()
  // HTML allows maxlength on these six only, so a date or a checkbox never carries one.
  const capped = INPUT_CAPPED_TYPES.some((allowed) => allowed === kind)
  // UAX 9: in a right-to-left paragraph a leading sign or a trailing slash changes sides.
  const ltr = dir === undefined && INPUT_LTR_TYPES.some((latin) => latin === kind)
  // A checkbox, a colour well or a date keeps the box the browser gives it.
  const ownWidth = !fullWidth && INPUT_OWN_WIDTH_TYPES.some((text) => text === kind)
  const cap = capped ? resolveMaxLength(maxLength, kind) : undefined

  // The rest goes first, so the resolved cap and the design attributes are never overwritten.
  const field = (
    <input
      {...rest}
      type={type}
      dir={ltr ? 'ltr' : dir}
      data-ltr={ltr ? '' : undefined}
      readOnly={readOnly}
      maxLength={cap}
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
  return validate ? <InputCheck rules={checkRules(kind, cap, rest)}>{field}</InputCheck> : field
}

export { inputVariants } from './variants.js'
export { InputSkeleton } from './skeleton.js'
export type {
  InputDesignProps, InputName, InputProps, InputSkeletonProps, InputVariantProps,
} from './types.js'
