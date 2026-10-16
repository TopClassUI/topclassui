'use client'

import { Slider as Base } from '@base-ui/react/slider'

import { cn } from '#shared/cn.js'
import {
  SLIDER_CONTROL, SLIDER_FULL, SLIDER_INDICATOR, SLIDER_KNOB, SLIDER_KNOB_SIZE, SLIDER_ROOT, SLIDER_ROW, SLIDER_TEXT,
  SLIDER_THUMB, SLIDER_TRACK, SLIDER_TRACK_SIZE, SLIDER_VALUE,
} from './classes.js'
import { SLIDER_DEFAULTS } from './constants.js'
import { useSlider } from './hook.js'
import type { SliderProps, SliderStateProps, SliderValue } from './types.js'

/** A slider: one thumb for a number, two for a pair. The arrows, Page Up and Down, Home and End and a press on the
 * track all move it, and each thumb's range input takes the focus and the name. Its value follows a form reset. */
export function Slider<Value extends SliderValue = number>({
  size = SLIDER_DEFAULTS.size,
  invalid = SLIDER_DEFAULTS.invalid,
  fullWidth = SLIDER_DEFAULTS.fullWidth,
  showValue = SLIDER_DEFAULTS.showValue,
  min = SLIDER_DEFAULTS.min,
  max = SLIDER_DEFAULTS.max,
  step = SLIDER_DEFAULTS.step,
  value,
  defaultValue,
  onValueChange,
  ref,
  locale,
  format,
  className,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
  'aria-describedby': ariaDescribedby,
  'aria-invalid': ariaInvalid,
  required: _required,
  ...rest
}: SliderProps<Value>) {
  const slider = useSlider({
    value, defaultValue, ref, min, max, step, locale, format,
    invalid: invalid || ariaInvalid === true || ariaInvalid === 'true',
    // A number or a pair, as Value says: the generic only narrows what the caller's handler is handed.
    onValueChange: onValueChange as SliderStateProps['onValueChange'],
    'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledby, 'aria-describedby': ariaDescribedby,
  })
  // The rest goes first, so the controlled pair, the limits and the design attributes are never overwritten.
  return (
    <Base.Root
      {...rest}
      {...slider.root}
      ref={slider.rootRef}
      dir={slider.dir}
      value={slider.value as Value}
      onValueChange={slider.onValueChange}
      min={slider.limits.min}
      max={slider.limits.max}
      step={slider.limits.step}
      locale={slider.locale}
      format={slider.format}
      thumbAlignment="center"
      // A Field passes aria-invalid itself, so it survives when `invalid` is off.
      aria-invalid={invalid ? true : ariaInvalid}
      data-size={size}
      className={cn(SLIDER_ROOT, SLIDER_TEXT[size], fullWidth && SLIDER_FULL, className)}
    >
      <div className={SLIDER_ROW}>
        {/* Base UI's own marker: a Drawer or a Toast never takes a drag that starts on the control as a swipe. */}
        <Base.Control className={SLIDER_CONTROL} data-base-ui-swipe-ignore="">
          <Base.Track className={cn(SLIDER_TRACK, SLIDER_TRACK_SIZE[size])}>
            <Base.Indicator className={SLIDER_INDICATOR} />
            {slider.thumbs.map((thumb, index) => (
              // The index puts each thumb of a range in the server HTML; without it both are hidden until hydration.
              <Base.Thumb key={index} index={index} {...thumb} className={SLIDER_THUMB}>
                <span className={cn(SLIDER_KNOB, SLIDER_KNOB_SIZE[size])} />
              </Base.Thumb>
            ))}
          </Base.Track>
        </Base.Control>
        {showValue ? <Base.Value className={SLIDER_VALUE} /> : null}
      </div>
    </Base.Root>
  )
}
