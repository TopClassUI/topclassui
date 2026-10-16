'use client'

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'

import { toSideAlign } from '#shared/floating.js'
import { useOverlayRoot } from '#shared/overlay-scope.js'
import { useDirection, useLabels, useLocale, useNumberFormat } from '#shared/provider/context.js'
import { usePortalLocale } from '#shared/provider/use-portal-locale.js'
import { useFormValue } from '#shared/use-form-value.js'
import {
  clampIso, createDateFormats, monthEnds, monthGrid, moveByKey, parseIsoDate, resolveRange, resolveWeekStart, shiftMonth,
  toIsoDate, todayParts, toValue,
} from './lib.js'
import type {
  DateParts, DatePickerActions, DatePickerCalendarProps, DatePickerDay, DatePickerFocusEvent, DatePickerKeyEvent,
  DatePickerChangeDetails, DatePickerStateProps,
} from './types.js'

/** The trigger's half: the value a form reset brings back, its text in the provider's locale and digits, the ids the
 * trigger is described by, the Escape scope of this root, and what the calendar part is handed when it loads. */
export function useDatePicker({
  value, defaultValue, onValueChange, open, defaultOpen, onOpenChange, placeholder, minDate, maxDate, required,
  'aria-describedby': describedBy,
}: DatePickerStateProps) {
  const { value: current, setValue, inputRef } = useFormValue({
    value: value === undefined ? undefined : toValue(value),
    defaultValue: toValue(defaultValue),
  })
  const [ownOpen, setOwnOpen] = useState(defaultOpen === true)
  const shown = open ?? ownOpen
  // Whether this root's calendar part has mounted: until it has, a close leaves nothing to animate out.
  const ready = useRef(false)
  const opened = useRef(shown)
  const onMount = useCallback(() => { ready.current = true }, [])
  const root = useOverlayRoot((next: boolean, details: DatePickerChangeDetails) => {
    onOpenChange?.(next, details)
    if (!details.isCanceled) setOwnOpen(next)
  })
  const portal = usePortalLocale()
  const labels = useLabels()
  const locale = useLocale()
  const numbering = useNumberFormat().resolvedOptions().numberingSystem
  const formats = useMemo(() => createDateFormats(locale, numbering), [locale, numbering])
  const range = useMemo(() => resolveRange(minDate, maxDate), [minDate, maxDate])
  const valueId = useId()
  const requiredId = useId()
  const actionsRef = useRef(null as DatePickerActions | null)
  const announce = useRef(false)

  // Closed before the part arrived: Base UI waits for a popup that never mounted to animate out and would mount the part
  // later, hidden and holding the focus. Unmounted now, the portal renders nothing when the part arrives.
  useEffect(() => {
    if (shown) opened.current = true
    else if (opened.current && !ready.current) actionsRef.current?.unmount()
  }, [shown])

  // A value written by script fires no event: once the chosen day is in the input, it says so, as a typed one would.
  useEffect(() => {
    if (!announce.current) return
    announce.current = false
    inputRef.current?.dispatchEvent(new Event('input', { bubbles: true }))
  }, [current, inputRef])

  const choose = useCallback((iso: string) => {
    if (iso !== current) {
      announce.current = true
      onValueChange?.(iso)
      setValue(iso)
    }
    actionsRef.current?.close()
  }, [current, onValueChange, setValue])

  const parts = parseIsoDate(current)
  return {
    ...portal,
    scope: root.scope,
    open: shown,
    onOpenChange: root.onOpenChange,
    actionsRef,
    inputRef,
    value: current,
    empty: parts === null,
    text: parts === null ? (placeholder ?? labels.datePicker.placeholder) : formats.date(parts),
    valueId,
    requiredId,
    requiredText: labels.common.required,
    // The value first, so the date is heard after the label; then the required word, which no button can carry.
    describedBy: [valueId, required === true ? requiredId : '', describedBy ?? ''].filter(Boolean).join(' '),
    calendar: { value: current, range, formats, choose, onMount },
    // React refuses a value with no handler; the input changes only through the value.
    onInputChange: () => undefined,
    // Once hydrated, the browser's required check lands on the trigger, not on the input nobody sees.
    onInputFocus: (event: DatePickerFocusEvent) => { (event.currentTarget.previousElementSibling as HTMLElement | null)?.focus() },
  }
}

/** The calendar's half: the active day and the keys that move it, the month it shows, today, and each cell's name. */
export function useDatePickerCalendar({ value, range, formats, firstDayOfWeek, choose, placement, onMount }: DatePickerCalendarProps) {
  const labels = useLabels()
  const locale = useLocale()
  const numbers = useNumberFormat()
  const rtl = useDirection() === 'rtl'
  const titleId = useId()
  const weekStart = useMemo(() => resolveWeekStart(firstDayOfWeek, locale), [firstDayOfWeek, locale])
  // Read when the calendar mounts, in the browser: it never renders on the server, so the two cannot disagree.
  const [today] = useState(() => toIsoDate(todayParts(new Date())))
  const [active, setActive] = useState(() => value ?? clampIso(today, range.min, range.max))
  const grid = useRef(null as HTMLTableElement | null)
  const focusing = useRef('mount' as 'mount' | 'key' | null)

  useEffect(() => { onMount() }, [onMount])

  // On mount and after a key: the focus follows the active day, into the month the grid now shows.
  useEffect(() => {
    if (focusing.current === null) return undefined
    const focus = () => {
      focusing.current = null
      const target = grid.current?.querySelector('button[tabindex="0"]')
      if (target instanceof HTMLElement) target.focus()
    }
    if (focusing.current === 'key') {
      focus()
      return undefined
    }
    // A frame later, once Base UI has placed the popup: focused where it first mounts, the browser scrolls toward it.
    const frame = requestAnimationFrame(focus)
    return () => { cancelAnimationFrame(frame) }
  }, [active])

  const onKeyDown = (event: DatePickerKeyEvent) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return
    const next = moveByKey(active, event.key, event.shiftKey, rtl, weekStart, range)
    if (next === null) return
    event.preventDefault()
    if (next === active) return
    focusing.current = 'key'
    setActive(next)
  }

  const shown = parseIsoDate(active) ?? { year: 1, month: 1, day: 1 }
  const cellOf = (day: DateParts | null, key: number): DatePickerDay => {
    if (day === null) return { key, iso: null, label: '', text: '', active: false, today: false, selected: false, disabled: false }
    const iso = toIsoDate(day)
    return {
      key, iso, label: formats.full(day), text: numbers.format(day.day), active: iso === active, today: iso === today,
      selected: iso === value, disabled: iso < range.min || iso > range.max,
    }
  }
  const cells = monthGrid(shown.year, shown.month, weekStart).map(cellOf)
  const ends = monthEnds(active, range)

  return {
    ...toSideAlign(placement),
    titleId,
    title: formats.month(shown),
    labels: { previous: labels.datePicker.previousMonth, next: labels.datePicker.nextMonth, close: labels.common.close },
    weekdays: Array.from({ length: 7 }, (_, at) => ({ key: at, ...formats.weekday(((weekStart - 1 + at) % 7) + 1) })),
    weeks: Array.from({ length: 6 }, (_, row) => ({ key: row, days: cells.slice(row * 7, row * 7 + 7) })),
    previous: { disabled: ends.atFirst, onClick: () => { setActive(shiftMonth(active, -1, range)) } },
    next: { disabled: ends.atLast, onClick: () => { setActive(shiftMonth(active, 1, range)) } },
    gridRef: grid,
    onKeyDown,
    pick: (iso: string) => { if (iso >= range.min && iso <= range.max) choose(iso) },
  }
}
