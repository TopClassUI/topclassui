'use client'

import { Popover as Base } from '@base-ui/react/popover'

import { caretLeft } from '#icons/data/caret-left.js'
import { caretRight } from '#icons/data/caret-right.js'
import { x } from '#icons/data/x.js'
import { FLOATING } from '#shared/floating.js'
import { Svg } from '#components/svg/index.js'
import {
  DATE_PICKER_CELL, DATE_PICKER_DAY, DATE_PICKER_GRID, DATE_PICKER_HEADER, DATE_PICKER_NAV, DATE_PICKER_POPUP,
  DATE_PICKER_POSITIONER, DATE_PICKER_SCROLL, DATE_PICKER_TITLE, DATE_PICKER_WEEKDAY,
} from '../classes.js'
import { useDatePickerCalendar } from '../hook.js'
import type { DatePickerCalendarProps } from '../types.js'

/** The popup and its month grid, in the chunk the trigger loads on the first open: previous, the month, next and close,
 * then six weeks of seven cells with one tab stop. The Close part is what makes Base UI trap the focus (PopoverPopup.js). */
export function DatePickerCalendar(props: DatePickerCalendarProps) {
  const calendar = useDatePickerCalendar(props)
  return (
    <Base.Positioner
      dir={props.dir}
      lang={props.lang}
      side={calendar.side}
      align={calendar.align}
      sideOffset={FLOATING.sideOffset}
      collisionPadding={FLOATING.collisionPadding}
      className={DATE_PICKER_POSITIONER}
    >
      <Base.Popup data-overlay={props.scope} data-placement={props.placement} initialFocus={false} className={DATE_PICKER_POPUP}>
        <div className={DATE_PICKER_HEADER}>
          <button
            type="button"
            aria-label={calendar.labels.previous}
            aria-disabled={calendar.previous.disabled ? true : undefined}
            onClick={calendar.previous.onClick}
            onPointerDown={calendar.previous.disabled ? calendar.refuse : undefined}
            className={DATE_PICKER_NAV}
          >
            <Svg icon={caretLeft} size="0.875rem" />
          </button>
          <Base.Title id={calendar.titleId} aria-live="polite" className={DATE_PICKER_TITLE}>{calendar.title}</Base.Title>
          <button
            type="button"
            aria-label={calendar.labels.next}
            aria-disabled={calendar.next.disabled ? true : undefined}
            onClick={calendar.next.onClick}
            onPointerDown={calendar.next.disabled ? calendar.refuse : undefined}
            className={DATE_PICKER_NAV}
          >
            <Svg icon={caretRight} size="0.875rem" />
          </button>
          <Base.Close aria-label={calendar.labels.close} className={DATE_PICKER_NAV}><Svg icon={x} size="0.875rem" /></Base.Close>
        </div>
        <div className={DATE_PICKER_SCROLL}>
          <table ref={calendar.gridRef} role="grid" aria-labelledby={calendar.titleId} onKeyDown={calendar.onKeyDown} className={DATE_PICKER_GRID}>
            <thead>
              <tr>
                {calendar.weekdays.map((day) => (
                  <th key={day.key} scope="col" abbr={day.long} className={DATE_PICKER_WEEKDAY}>{day.narrow}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {calendar.weeks.map((week) => (
                <tr key={week.key}>
                  {week.days.map((day) => (
                    <td key={day.key} role="gridcell" aria-selected={day.selected ? true : undefined} className={DATE_PICKER_CELL}>
                      {day.iso === null ? null : (
                        <button
                          type="button"
                          tabIndex={day.active ? 0 : -1}
                          aria-label={day.label}
                          aria-current={day.today ? 'date' : undefined}
                          // The focus is on the button, not the cell, so the button says it is the chosen day too.
                          aria-pressed={day.selected}
                          aria-disabled={day.disabled ? true : undefined}
                          data-selected={day.selected ? '' : undefined}
                          onClick={() => { calendar.pick(day.iso ?? '') }}
                          onPointerDown={day.disabled ? calendar.refuse : undefined}
                          className={DATE_PICKER_DAY}
                        >
                          {day.text}
                        </button>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Base.Popup>
    </Base.Positioner>
  )
}
