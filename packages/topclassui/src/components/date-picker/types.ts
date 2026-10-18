import type { Popover as Base } from '@base-ui/react/popover'
import type { Ref } from 'react'

import type { ControlName } from '#shared/contracts/name.js'
import type { DATE_PICKER_PLACEMENTS } from './constants.js'
import type { DatePickerSchemaInput } from './schema.js'

export type DatePickerPlacement = (typeof DATE_PICKER_PLACEMENTS)[number]

// R-8.3-4: derived from the schema, so the props and the validation cannot drift apart.
export type DatePickerDesignProps = {
  [K in keyof DatePickerSchemaInput]?: DatePickerSchemaInput[K] | undefined
}

/** R-5.6-1: `id` for a `<label htmlFor>`, which names the trigger, or one of the two ARIA names. */
export type DatePickerName = ControlName

/** The trigger is always our button with our content, opened by a press; a value is the root's, never the button's. */
type TriggerRemoved = 'render' | 'nativeButton' | 'handle' | 'payload' | 'openOnHover' | 'delay' | 'closeDelay' | 'children'
  | 'value' | 'defaultValue' | 'type' | 'className' | 'ref' | 'id' | 'aria-label' | 'aria-labelledby' | 'name' | 'form'

/** The root's open state is the consumer's; its children, handle, actions, modality and trigger ids are ours. */
type RootRemoved = 'className' | 'children' | 'handle' | 'actionsRef' | 'modal' | 'triggerId' | 'defaultTriggerId'

// R-5.7-5: derived at the seam. The root's open state, the trigger's own props, and the form's.
export type DatePickerProps = Omit<Base.Trigger.Props, TriggerRemoved>
  & Omit<Base.Root.Props, RootRemoved>
  & DatePickerDesignProps
  & {
    /** The chosen day as an ISO date, `YYYY-MM-DD`, or null. A string that is not a real day counts as null. */
    value?: string | null | undefined
    /** The day of the first render, and the one a form reset brings back. */
    defaultValue?: string | null | undefined
    /** Called with the ISO date of the day chosen. Client-only. */
    onValueChange?: ((value: string) => void) | undefined
    /** The text of an empty trigger. Left out, the provider's `datePicker.placeholder`. */
    placeholder?: string | undefined
    /** Where the calendar mounts; `<body>` by default. */
    container?: Base.Portal.Props['container']
    /** The form input's name: the form sends `name=YYYY-MM-DD`, and `name=` when empty. */
    name?: string | undefined
    /** The id of a form elsewhere on the page that the form input belongs to. */
    form?: string | undefined
    /** Blocks an empty submit, with or without script; the trigger is described as required. */
    required?: boolean | undefined
    /** On the trigger, merged last, so a consumer class wins a conflict with its own. */
    className?: string | undefined
    /** The trigger, a `<button aria-haspopup="dialog">`. */
    ref?: Ref<HTMLButtonElement> | undefined
  }
  & DatePickerName

/** A day as the date math holds it: month 1 to 12, day 1 to 31. */
export interface DateParts {
  year: number
  month: number
  day: number
}

/** The days that can be chosen, as ISO strings, min never after max. */
export interface DateRange {
  min: string
  max: string
}

/** The texts of a day in one locale and numbering system. */
export interface DateFormats {
  /** The trigger's text: dateStyle medium. */
  date: (parts: DateParts) => string
  /** The title: the month and the year. */
  month: (parts: DateParts) => string
  /** A day's name for a reader: dateStyle full. */
  full: (parts: DateParts) => string
  /** A column's head, 1 (Monday) to 7: one letter, and the whole name for its abbr. */
  weekday: (day: number) => { narrow: string, long: string }
}

/** What the hook of the trigger reads. */
export type DatePickerStateProps = Pick<DatePickerProps, 'value' | 'defaultValue' | 'onValueChange' | 'open' | 'defaultOpen' | 'onOpenChange'
  | 'placeholder' | 'minDate' | 'maxDate' | 'required' | 'aria-describedby'>

/** What Base UI hands the root's onOpenChange, which the hook reads for a cancel. */
export type DatePickerChangeDetails = Base.Root.ChangeEventDetails

/** What the trigger hands the calendar part, which loads on the first open. */
export interface DatePickerCalendarProps {
  value: string | null
  range: DateRange
  formats: DateFormats
  firstDayOfWeek: number | undefined
  /** Sets the day, tells the form, and closes the popup. */
  choose: (iso: string) => void
  /** Tells the trigger the part has mounted, so a close from then on animates it out. */
  onMount: () => void
  placement: DatePickerPlacement
  /** The root's Escape scope, which the popup writes as data-overlay. */
  scope: string
  /** The provider's, for the positioner, since the portal inherits neither; undefined with no provider. */
  dir: 'ltr' | 'rtl' | undefined
  lang: string | undefined
}

/** One cell of the grid: empty outside the month, else a day and how it reads. */
export interface DatePickerDay {
  key: number
  /** Null for a cell outside the month, which stays empty, as drawn. */
  iso: string | null
  /** The day's full name, read for the button. */
  label: string
  /** The number shown, in the provider's digits. */
  text: string
  /** The one day with tabindex 0. */
  active: boolean
  today: boolean
  selected: boolean
  /** Outside minDate to maxDate: aria-disabled, never chosen. */
  disabled: boolean
}

/** Base UI's imperative close, which the calendar calls once a day is chosen. */
export type DatePickerActions = Base.Root.Actions

// Named here because hook.ts writes no type argument.
export type DatePickerKeyEvent = { key: string, shiftKey: boolean, altKey: boolean, ctrlKey: boolean, metaKey: boolean, preventDefault: () => void }
export type DatePickerFocusEvent = { currentTarget: HTMLInputElement }
