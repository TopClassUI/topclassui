'use client'

import { Checkbox as Base } from '@base-ui/react/checkbox'

import { check } from '#icons/data/check.js'
import { minus } from '#icons/data/minus.js'
import { cn } from '#shared/cn.js'
import { Svg } from '#components/svg/index.js'
import { CHECKBOX_BOX, CHECKBOX_MARK, CHECKBOX_ROOT, CHECKBOX_SIZE } from './classes.js'
import { CHECKBOX_DEFAULTS } from './constants.js'
import { useCheckbox } from './hook.js'
import type { CheckboxProps } from './types.js'

/** A checkbox. The root is a native button with the role, so a `<label htmlFor>` names it before any script
 * runs; the drawn box sits inside a target of 24 px, 44 under a finger, and shows a tick, or a dash while
 * `indeterminate`. Its value follows a form reset; Base UI's hidden checkbox is what the form sends. */
export function Checkbox({
  size = CHECKBOX_DEFAULTS.size,
  invalid = CHECKBOX_DEFAULTS.invalid,
  checked,
  defaultChecked,
  onCheckedChange,
  inputRef,
  indeterminate,
  className,
  'aria-invalid': ariaInvalid,
  ...rest
}: CheckboxProps) {
  const value = useCheckbox({ checked, defaultChecked, onCheckedChange, inputRef })
  // The rest goes first, so the button, the controlled pair and the design attributes are never overwritten.
  return (
    <Base.Root
      {...rest}
      nativeButton
      render={<button />}
      checked={value.checked}
      onCheckedChange={value.onCheckedChange}
      inputRef={value.inputRef}
      indeterminate={indeterminate}
      // A Field passes aria-invalid itself, so it survives when `invalid` is off.
      aria-invalid={invalid ? true : ariaInvalid}
      data-size={size}
      className={cn(CHECKBOX_ROOT, className)}
    >
      <span className={cn(CHECKBOX_BOX, CHECKBOX_SIZE[size])}>
        <Base.Indicator className={CHECKBOX_MARK}>
          <Svg icon={indeterminate ? minus : check} size="80%" />
        </Base.Indicator>
      </span>
    </Base.Root>
  )
}
