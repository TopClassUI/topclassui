import { caretLeft } from '#icons/data/caret-left.js'
import { caretRight } from '#icons/data/caret-right.js'
import { OVERLAY_SURFACE, TARGET_HEIGHT } from '#shared/classes.js'
import { Svg } from '#components/svg/index.js'
import { DatePicker } from '../index.js'
import type { DatePickerDesignProps } from '../types.js'

// The open calendar's look at rest, from the shared classes the popup is built on: a demo the site shows imports public paths only.
const panel = `flex w-67 max-w-full flex-col gap-2.5 px-3.5 py-3.5 ${OVERLAY_SURFACE}`
const head = 'flex items-center gap-2'
const caret = 'inline-flex size-6 shrink-0 items-center justify-center text-body'
const title = 'min-w-0 flex-1 text-center text-sm font-semibold text-body'
const weekday = 'pb-1 text-center text-xs font-medium text-muted'
const day = `inline-flex w-full items-center justify-center rounded-full text-xs tabular-nums text-body ${TARGET_HEIGHT}`
const chosen = 'bg-primary-solid font-medium text-primary-on-solid'

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

/** September 2026 from Monday: the first falls on a Tuesday. */
const WEEKS = [
  [null, 1, 2, 3, 4, 5, 6],
  [7, 8, 9, 10, 11, 12, 13],
  [14, 15, 16, 17, 18, 19, 20],
  [21, 22, 23, 24, 25, 26, 27],
  [28, 29, 30, null, null, null, null],
]

/** The frame's stage: the live trigger, closed, over a picture of its open calendar, the 22nd chosen. The picture is
 * hidden from a reader and inert, so the page keeps its focus order and nothing traps it. */
function Stage(props: DatePickerDesignProps) {
  return (
    <div data-stage="" className="grid w-67 max-w-full justify-items-start gap-2">
      <DatePicker aria-label="Check-in" defaultValue="2026-09-22" firstDayOfWeek={1} {...props} />
      <div aria-hidden inert className={panel}>
        <div className={head}>
          <span className={caret}><Svg icon={caretLeft} size="0.875rem" /></span>
          <span className={title}>September 2026</span>
          <span className={caret}><Svg icon={caretRight} size="0.875rem" /></span>
        </div>
        <div className="grid grid-cols-7 gap-y-1">
          {WEEKDAYS.map((name, at) => <span key={at} className={weekday}>{name}</span>)}
          {WEEKS.flat().map((date, at) => (
            <span key={at} className={date === 22 ? `${day} ${chosen}` : day}>{date ?? ''}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

/** The site's Try it stage: each schema prop arrives from a control, and an absent one keeps its default.
 * With stage it is the Stage above; the tree below stays one return, so the docs can write Try it values into it. */
export default function Demo({ stage = false, ...props }: DatePickerDesignProps & { stage?: boolean } = {}) {
  if (stage) return <Stage {...props} />
  return (
    <div className="grid justify-items-start gap-1.5">
      <label htmlFor="date-picker-playground" className="text-sm text-body">Check-in</label>
      <DatePicker id="date-picker-playground" defaultValue="2026-09-22" firstDayOfWeek={1} {...props} />
    </div>
  )
}
