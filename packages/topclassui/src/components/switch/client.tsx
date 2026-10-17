'use client'

import { Switch as Base } from '@base-ui/react/switch'

import { cn } from '#shared/cn.js'
import { SWITCH_ROOT, SWITCH_SLIDE, SWITCH_THUMB, SWITCH_TRACK, SWITCH_TRACK_SIZE } from './classes.js'
import { SWITCH_DEFAULTS } from './constants.js'
import { useSwitch } from './hook.js'
import type { SwitchProps } from './types.js'

/** An on/off switch. The root is a native button with the role, so a `<label htmlFor>` names it before any
 * script runs; the drawn track sits inside a target of 24 px, 44 under a finger, and its thumb slides toward
 * the inline end. Its value follows a form reset; Base UI's hidden checkbox is what the form sends. */
export function Switch({
  size = SWITCH_DEFAULTS.size,
  invalid = SWITCH_DEFAULTS.invalid,
  checked,
  defaultChecked,
  onCheckedChange,
  inputRef,
  className,
  'aria-invalid': ariaInvalid,
  ...rest
}: SwitchProps) {
  const value = useSwitch({ checked, defaultChecked, onCheckedChange, inputRef })
  // The rest goes first, so the button, the controlled pair and the design attributes are never overwritten.
  return (
    <Base.Root
      {...rest}
      nativeButton
      render={<button />}
      checked={value.checked}
      onCheckedChange={value.onCheckedChange}
      inputRef={value.inputRef}
      // A Field passes aria-invalid itself, so it survives when `invalid` is off.
      aria-invalid={invalid ? true : ariaInvalid}
      data-size={size}
      className={cn(SWITCH_ROOT, className)}
    >
      <span className={cn(SWITCH_TRACK, SWITCH_TRACK_SIZE[size])}>
        <Base.Thumb className={cn(SWITCH_THUMB, SWITCH_SLIDE[size])} />
      </span>
    </Base.Root>
  )
}
