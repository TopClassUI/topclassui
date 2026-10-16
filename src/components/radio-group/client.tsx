'use client'

import { Radio } from '@base-ui/react/radio'
import { RadioGroup as Base } from '@base-ui/react/radio-group'

import { circleFill } from '#icons/data/circle-fill.js'
import { cn } from '#shared/cn.js'
import { Svg } from '#components/svg/index.js'
import {
  RADIO_BOX, RADIO_DOT, RADIO_GROUP, RADIO_ITEM, RADIO_ITEM_TEXT, RADIO_LABEL, RADIO_SIZE, RADIO_TARGET,
} from './classes.js'
import { RADIO_GROUP_DEFAULTS } from './constants.js'
import { RadioGroupLookContext, useRadioGroupItem, useRadioGroupRoot } from './hook.js'
import type { RadioGroupItemProps, RadioGroupRootProps } from './types.js'

/** A group of radios under one name: one tab stop, the arrows move and select. Its value follows a form reset, and
 * it shares its size with its radios. */
export function RadioGroupRoot({
  size = RADIO_GROUP_DEFAULTS.size,
  orientation = RADIO_GROUP_DEFAULTS.orientation,
  invalid = RADIO_GROUP_DEFAULTS.invalid,
  value,
  defaultValue,
  onValueChange,
  ref,
  className,
  'aria-invalid': ariaInvalid,
  ...rest
}: RadioGroupRootProps) {
  const group = useRadioGroupRoot(size, { value, defaultValue, onValueChange, ref })
  // The rest goes first, so the controlled pair, the root ref and the design attributes are never overwritten.
  return (
    <RadioGroupLookContext value={group.look}>
      <Base
        key={group.resetKey}
        {...rest}
        ref={group.rootRef}
        value={group.value}
        onValueChange={group.onValueChange}
        // A Field passes aria-invalid itself, so it survives when `invalid` is off.
        aria-invalid={invalid ? true : ariaInvalid}
        data-size={size}
        data-orientation={orientation}
        className={cn(RADIO_GROUP[orientation], className)}
      />
    </RadioGroupLookContext>
  )
}

/** One radio and its text, inside a label: the label names the radio before any script runs, and a click on the
 * text selects it. The radio is a native button around the drawn circle, in a target of 24 px, 44 under a finger. */
export function RadioGroupItem({ value, className, style, children, ...rest }: RadioGroupItemProps) {
  const { size, stop } = useRadioGroupItem(value)
  return (
    <label className={cn(RADIO_ITEM, RADIO_ITEM_TEXT[size], className)} style={style}>
      <Radio.Root {...stop} {...rest} value={value} nativeButton render={<button />} className={RADIO_TARGET}>
        <span className={cn(RADIO_BOX, RADIO_SIZE[size])}>
          <Radio.Indicator className={RADIO_DOT}>
            <Svg icon={circleFill} size="56%" />
          </Radio.Indicator>
        </span>
      </Radio.Root>
      <span className={RADIO_LABEL}>{children}</span>
    </label>
  )
}
