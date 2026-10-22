'use client'

import { Popover as Base } from '@base-ui/react/popover'
import { lazy, Suspense } from 'react'

import { calendarBlank } from '#icons/data/calendar-blank.js'
import { FIELD_HOLDER_FULL, FIELD_SIZE, FIELD_TEXT } from '#shared/classes.js'
import { cn } from '#shared/cn.js'
import { Svg } from '#components/svg/index.js'
import { DATE_PICKER_ICON, DATE_PICKER_INPUT, DATE_PICKER_ROOT, DATE_PICKER_TRIGGER, DATE_PICKER_VALUE } from './classes.js'
import { DATE_PICKER_DEFAULTS } from './constants.js'
import { useDatePicker } from './hook.js'
import type { DatePickerProps } from './types.js'

// Its own chunk: the popup and the calendar's markup load on the first open, never with the page.
const DatePickerCalendar = lazy(() => import('./parts/date-picker-calendar.js').then((module) => ({ default: module.DatePickerCalendar })))

/** A button that shows the chosen day in the provider's locale and opens a month grid in a popup, and a hidden input
 * that sends the day as an ISO date, before hydration and after a form reset. The grid loads on the first open. */
export function DatePicker({
  size = DATE_PICKER_DEFAULTS.size,
  invalid = DATE_PICKER_DEFAULTS.invalid,
  fullWidth = DATE_PICKER_DEFAULTS.fullWidth,
  placement = DATE_PICKER_DEFAULTS.placement,
  value, defaultValue, onValueChange, placeholder, minDate, maxDate, firstDayOfWeek,
  modal = DATE_PICKER_DEFAULTS.modal,
  open, defaultOpen, onOpenChange, onOpenChangeComplete, container,
  name, form, required, disabled,
  className,
  'aria-invalid': ariaInvalid,
  'aria-describedby': describedBy,
  ...rest
}: DatePickerProps) {
  const picker = useDatePicker({
    value, defaultValue, onValueChange, open, defaultOpen, onOpenChange, placeholder, minDate, maxDate, required,
    'aria-describedby': describedBy,
  })
  return (
    <Base.Root modal={modal} open={picker.open} onOpenChange={picker.onOpenChange} onOpenChangeComplete={onOpenChangeComplete} actionsRef={picker.actionsRef}>
      <span className={cn(DATE_PICKER_ROOT, FIELD_TEXT[size], fullWidth && FIELD_HOLDER_FULL)}>
        <Base.Trigger
          {...rest}
          disabled={disabled}
          // A Field passes aria-invalid itself, so it survives when `invalid` is off.
          aria-invalid={invalid ? true : ariaInvalid}
          aria-describedby={picker.describedBy}
          data-size={size}
          className={cn(DATE_PICKER_TRIGGER, FIELD_SIZE[size], className)}
        >
          <span aria-hidden="true" className={DATE_PICKER_ICON}><Svg icon={calendarBlank} size="0.875rem" /></span>
          <span id={picker.valueId} data-placeholder={picker.empty ? '' : undefined} className={DATE_PICKER_VALUE}>{picker.text}</span>
        </Base.Trigger>
        <input
          ref={picker.inputRef}
          aria-hidden="true"
          tabIndex={-1}
          autoComplete="off"
          className={DATE_PICKER_INPUT}
          name={name}
          form={form}
          required={required}
          disabled={disabled}
          value={picker.value ?? ''}
          onChange={picker.onInputChange}
          onFocus={picker.onInputFocus}
        />
        {required === true ? <span id={picker.requiredId} hidden>{picker.requiredText}</span> : null}
      </span>
      <Base.Portal container={container}>
        {/* Around the whole popup: one that mounted empty and grew once the grid came was flipped by Base UI mid-frame. */}
        <Suspense fallback={null}>
          <DatePickerCalendar
            {...picker.calendar}
            firstDayOfWeek={firstDayOfWeek}
            placement={placement}
            scope={picker.scope}
            dir={picker.dir}
            lang={picker.lang}
          />
        </Suspense>
      </Base.Portal>
    </Base.Root>
  )
}
