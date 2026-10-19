// The mutations of src/components/date-picker. Found by scripts/mutations/index.ts; every label says "date picker".
import type { Mutation } from '../lib/mutate.js'

const CLIENT = 'src/components/date-picker/client.tsx'
const PART = 'src/components/date-picker/parts/date-picker-calendar.tsx'
const HOOK = 'src/components/date-picker/hook.ts'
const LIB = 'src/components/date-picker/lib.ts'
const CLASSES = 'src/components/date-picker/classes.ts'

export const MUTATIONS: Mutation[] = [
  {
    label: 'the date picker trigger loses its ring while the calendar is open',
    file: CLASSES,
    from: 'text-start ${FIELD_BOX} ${OPEN_RING} ${POINTER}`',
    to: 'text-start ${FIELD_BOX} ${POINTER}`',
  },
  {
    label: 'the date picker day loses its pill and goes back to the control radius',
    file: CLASSES,
    from: 'justify-center rounded-full align-middle text-xs',
    to: 'justify-center rounded-control align-middle text-xs',
  },
  {
    label: 'the date picker addMonths stops keeping the day inside the month, so 31 March back a month is 3 March',
    file: LIB,
    from: '  return withinYears({ year, month, day: Math.min(parts.day, daysInMonth(year, month)) })',
    to: '  return withinYears(partsOf(utcDate(year, month, parts.day)))',
  },
  {
    label: 'the date picker keys lose their RTL swap, so ArrowLeft is the day before in Arabic too',
    file: LIB,
    from: '  const ahead = rtl ? -1 : 1',
    to: '  const ahead = 1',
  },
  {
    label: 'the date picker calendar loses its Close part, so Base UI traps nothing and no button is named Close',
    file: PART,
    from: '        <Base.Close aria-label={calendar.labels.close} className={DATE_PICKER_NAV}><Svg icon={x} size="0.875rem" /></Base.Close>\n',
    to: '',
  },
  {
    label: 'the date picker todayParts reads the UTC getters, so in Riyadh after 21:00 UTC today is yesterday',
    file: LIB,
    from: '  return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() }',
    to: '  return { year: now.getUTCFullYear(), month: now.getUTCMonth() + 1, day: now.getUTCDate() }',
  },
  {
    label: 'the date picker builds a day with Date.UTC, so year 1 becomes 1901',
    file: LIB,
    from: '  const date = new Date(0)\n  date.setUTCFullYear(year, month - 1, day)\n  return date',
    to: '  return new Date(Date.UTC(year, month - 1, day))',
  },
  {
    label: 'the date picker Home is kept inside the month again, so Home from 3 September stops at the 1st, not on Monday 31 August',
    file: LIB,
    from: '    Home: () => addDays(parts, -back),',
    to: '    Home: () => ({ ...parts, day: Math.max(1, parts.day - back) }),',
  },
  {
    label: 'the date picker End is kept inside the month again, so End from 29 September stops at the 30th, not on Sunday 4 October',
    file: LIB,
    from: '    End: () => addDays(parts, 6 - back),',
    to: '    End: () => ({ ...parts, day: Math.min(daysInMonth(parts.year, parts.month), parts.day + 6 - back) }),',
  },
  {
    label: 'the date picker keys stop clamping into the range, so ArrowLeft walks past minDate',
    file: LIB,
    from: '  return move ? clampIso(toIsoDate(move()), range.min, range.max) : null',
    to: '  return move ? toIsoDate(move()) : null',
  },
  {
    label: 'the date picker no longer raises maxDate to minDate when it is below it',
    file: LIB,
    from: '  return { min, max: max < min ? min : max }',
    to: '  return { min, max }',
  },
  {
    label: 'the date picker grid ignores the first day of the week, so every month starts on a Monday column',
    file: LIB,
    from: '  const offset = (isoWeekday({ year, month, day: 1 }) - firstDay + 7) % 7',
    to: '  const offset = (isoWeekday({ year, month, day: 1 }) - 1 + 7) % 7',
  },
  {
    label: 'the date picker firstDayOfWeek prop is ignored and the locale always decides',
    file: LIB,
    from: '  if (firstDayOfWeek !== undefined) return clamp(Math.round(firstDayOfWeek), firstDayOfWeekMin, firstDayOfWeekMax)\n',
    to: '',
  },
  {
    label: 'the date picker stops dispatching an input event after a choice, so FieldLive and listeners never hear it',
    file: HOOK,
    from: "    inputRef.current?.dispatchEvent(new Event('input', { bubbles: true }))",
    to: '    void inputRef',
  },
  {
    label: 'the date picker trigger is no longer described by its value, so the day is not heard after the label',
    file: HOOK,
    from: "    describedBy: [valueId, required === true ? requiredId : '', describedBy ?? ''].filter(Boolean).join(' '),",
    to: "    describedBy: [required === true ? requiredId : '', describedBy ?? ''].filter(Boolean).join(' '),",
  },
  {
    label: 'the date picker drops the hidden required word, so a reader never learns the field is required',
    file: CLIENT,
    from: '        {required === true ? <span id={picker.requiredId} hidden>{picker.requiredText}</span> : null}\n',
    to: '',
  },
  {
    label: 'the date picker form input loses its name, so the form sends nothing',
    file: CLIENT,
    from: '          name={name}\n',
    to: '',
  },
  {
    label: 'the date picker keeps a string that is no day as its default, so the form sends 2026-02-30',
    file: HOOK,
    from: '    defaultValue: toValue(defaultValue),',
    to: '    defaultValue: defaultValue ?? null,',
  },
  {
    label: 'the date picker calendar no longer focuses the active day when it mounts',
    file: HOOK,
    from: '    if (target instanceof HTMLElement) target.focus()',
    to: '    void target',
  },
  {
    label: 'the date picker chooses a day outside the range when it is pressed',
    file: HOOK,
    from: '    pick: (iso: string) => { if (iso >= range.min && iso <= range.max) choose(iso) },',
    to: '    pick: (iso: string) => { choose(iso) },',
  },
  {
    label: 'the date picker form input no longer hands the focus to the trigger, so a failed required check focuses a 1 px box',
    file: CLIENT,
    from: '          onFocus={picker.onInputFocus}\n',
    to: '',
  },
  {
    label: 'the date picker popup loses its Escape scope, so a guard cannot find its own popup',
    file: PART,
    from: '<Base.Popup data-overlay={props.scope} ',
    to: '<Base.Popup ',
  },
  {
    label: 'the date picker positioner loses the provider direction, so an RTL island opens left to right',
    file: PART,
    from: '      dir={props.dir}\n',
    to: '',
  },
  {
    label: 'the date picker chosen day loses the Highlight pair under forced colours, where its fill is erased',
    file: CLASSES,
    from: " forced-colors:data-selected:bg-[Highlight] forced-colors:data-selected:text-[HighlightText]'",
    to: "'",
  },
  {
    label: 'the date picker today loses its underline, so it is told by weight alone',
    file: CLASSES,
    from: ' aria-[current=date]:underline aria-[current=date]:underline-offset-4',
    to: '',
  },
  {
    label: 'the date picker day loses its coarse-pointer floor, so a finger gets a 32 px day',
    file: CLASSES,
    from: '  TARGET_HEIGHT,\n',
    to: '',
  },
  {
    label: 'the date picker previous button never disables, so it walks into months wholly under minDate',
    file: LIB,
    from: '  return { atFirst: first <= range.min, atLast: last >= range.max }',
    to: '  return { atFirst: false, atLast: last >= range.max }',
  },
  {
    label: 'the date picker leaves Base UI mounted after a close during the first load, so the part arrives hidden and takes the focus',
    file: HOOK,
    from: '    else if (opened.current && !ready.current) actionsRef.current?.unmount()',
    to: '    else if (opened.current && !ready.current) void actionsRef',
  },
  {
    label: 'the date picker next month button is natively disabled at maxDate, so the focus it held drops to the body',
    file: PART,
    from: 'aria-disabled={calendar.next.disabled ? true : undefined}',
    to: 'disabled={calendar.next.disabled}',
  },
  {
    label: 'the date picker previous month button is natively disabled at minDate, so the focus it held drops to the body',
    file: PART,
    from: 'aria-disabled={calendar.previous.disabled ? true : undefined}',
    to: 'disabled={calendar.previous.disabled}',
  },
  {
    label: 'the date picker next month button still acts while aria-disabled, so it moves the tab stop to the last day',
    file: HOOK,
    from: 'onClick: () => { if (!ends.atLast) setActive(',
    to: 'onClick: () => { setActive(',
  },
  {
    label: 'the date picker previous month button still acts while aria-disabled, so it moves the tab stop to the first day',
    file: HOOK,
    from: 'onClick: () => { if (!ends.atFirst) setActive(',
    to: 'onClick: () => { setActive(',
  },
  {
    label: 'the date picker month buttons lose their aria-disabled dimming, so one at the range end looks pressable',
    file: CLASSES,
    from: 'export const DATE_PICKER_NAV = `${ICON_BUTTON} text-body ${HOVER.ghost} ${ARIA_DISABLED}`',
    to: 'export const DATE_PICKER_NAV = `${ICON_BUTTON} text-body ${HOVER.ghost}`',
  },
  {
    label: 'the date picker day button loses aria-pressed, so the focused chosen day reads as a plain button',
    file: PART,
    from: '                        aria-pressed={day.selected}\n',
    to: '',
  },
  {
    label: 'the date picker chosen day loses its inset line, so in dark mode its 2.88:1 fill alone tells it',
    file: CLASSES,
    from: '  \'data-selected:inset-ring-(length:--tc-line-width) data-selected:inset-ring-primary-on-soft\',\n',
    to: '',
  },
  {
    label: 'the date picker chosen day keeps the theme ring under forced colours, 2.4:1 on a Canvas of the other lightness',
    file: CLASSES,
    from: '  \'forced-colors:data-selected:[--tc-ring:CanvasText]\',\n',
    to: '',
  },
  {
    label: 'the date picker popup keeps its full side padding on a narrow screen, so at a 32 px root two digits overflow their day',
    file: CLASSES,
    from: 'px-[clamp(4px,calc(1rem-(17.5rem*var(--tc-density)-var(--available-width,100vw))/2),min(1rem,16px))]',
    to: 'px-[min(1rem,16px)]',
  },
  {
    label: 'the date picker popup block padding grows with the root again, 32 px above and below the month at a 32 px root',
    file: CLASSES,
    from: "'py-[min(1rem,16px)] px-[clamp(",
    to: "'p-4 px-[clamp(",
  },
  {
    label: 'the date picker cell keeps a side padding, so a day is narrower than its column and two digits overflow at a 32 px root',
    file: CLASSES,
    from: "export const DATE_PICKER_CELL = 'px-0 py-[min(0.125rem,2px)] text-center'",
    to: "export const DATE_PICKER_CELL = 'p-[min(0.125rem,2px)] text-center'",
  },
  {
    label: 'the date picker month header shrinks again, so on a short screen the grid takes its room and the month buttons are squeezed',
    file: CLASSES,
    from: "export const DATE_PICKER_HEADER = 'flex shrink-0 items-center gap-2'",
    to: "export const DATE_PICKER_HEADER = 'flex items-center gap-2'",
  },
  {
    label: 'the date picker grid wrapper loses SCROLL_AREA, so the popup scrolls the month away with the grid',
    file: CLASSES,
    from: "  SCROLL_AREA,\n  FOCUS_RING_INSET,\n  DATE_PICKER_SCROLL_SHORT,\n",
    to: "  FOCUS_RING_INSET,\n  DATE_PICKER_SCROLL_SHORT,\n",
  },
  {
    label: 'the date picker grid keeps scrolling on a short screen, so a wheel that starts on one row of days ends inside it',
    file: CLASSES,
    from: "  DATE_PICKER_SCROLL_SHORT,\n].join(' ')",
    to: "].join(' ')",
  },
]
