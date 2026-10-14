'use client'

import { Radio } from '@base-ui/react/radio'
import { RadioGroup as Base } from '@base-ui/react/radio-group'

import { cn } from '#shared/cn.js'
import { hasContent } from '#shared/render-trigger.js'
import { truncateLabel } from '#shared/truncate-label.js'
import { SEGMENTED_CONTROL_BOUNDARIES } from './boundaries.js'
import {
  SEGMENTED_FULL, SEGMENTED_HOLDER, SEGMENTED_HOLDER_FULL, SEGMENTED_ICON, SEGMENTED_ITEM, SEGMENTED_ITEM_SIZE,
  SEGMENTED_ROOT, SEGMENTED_ROOT_SIZE,
} from './classes.js'
import { SEGMENTED_CONTROL_DEFAULTS } from './constants.js'
import { SegmentedControlLookContext, useSegmentedControlItem, useSegmentedControlRoot } from './hook.js'
import type { SegmentedControlItemProps, SegmentedControlRootProps } from './types.js'

/** A radio group drawn as one track: one tab stop, the arrows move and select. The track sits in a holder that may
 * shrink to nothing, so a track too wide for its parent scrolls inside itself and never widens the page. */
export function SegmentedControlRoot({
  size = SEGMENTED_CONTROL_DEFAULTS.size,
  fullWidth = SEGMENTED_CONTROL_DEFAULTS.fullWidth,
  invalid = SEGMENTED_CONTROL_DEFAULTS.invalid,
  value,
  defaultValue,
  onValueChange,
  ref,
  className,
  'aria-invalid': ariaInvalid,
  ...rest
}: SegmentedControlRootProps) {
  const track = useSegmentedControlRoot(size, { value, defaultValue, onValueChange, ref })
  // The holder takes nothing from the caller; on the track the rest goes first, so nothing of ours is overwritten.
  return (
    <SegmentedControlLookContext value={track.look}>
      <div className={cn(SEGMENTED_HOLDER, fullWidth && SEGMENTED_HOLDER_FULL)}>
        <Base
          {...rest}
          ref={track.rootRef}
          value={track.value}
          onValueChange={track.onValueChange}
          // A Field passes aria-invalid itself, so it survives when `invalid` is off.
          aria-invalid={invalid ? true : ariaInvalid}
          data-size={size}
          className={cn(SEGMENTED_ROOT, SEGMENTED_ROOT_SIZE[size], fullWidth && SEGMENTED_FULL, className)}
        />
      </div>
    </SegmentedControlLookContext>
  )
}

/** One segment: a native button with the role of a radio, named by its own text. The text sits in a span of its own,
 * so a long label ends in an ellipsis. No indicator: the raised surface and the heavier text are the mark. */
export function SegmentedControlItem({ value, icon, className, children, ...rest }: SegmentedControlItemProps) {
  const { size, stop } = useSegmentedControlItem(value)
  return (
    <Radio.Root
      {...stop}
      {...rest}
      value={value}
      nativeButton
      render={<button />}
      className={cn(SEGMENTED_ITEM, SEGMENTED_ITEM_SIZE[size], className)}
    >
      {hasContent(icon) ? <span className={SEGMENTED_ICON}>{icon}</span> : null}
      {truncateLabel(children, SEGMENTED_CONTROL_BOUNDARIES.labelMaxLength)}
    </Radio.Root>
  )
}
