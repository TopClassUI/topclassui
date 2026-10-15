// R-8.3-1: zod lives here only, and components import this file with `import type`.
import { z } from 'zod'

import { sizeSchema } from '#shared/contracts/size.schema.js'
import { DATE_PICKER_BOUNDARIES } from './boundaries.js'
import { DATE_PICKER_DEFAULTS, DATE_PICKER_ISO_PATTERN, DATE_PICKER_PLACEMENTS } from './constants.js'
import { parseIsoDate } from './lib.js'

const { minDate, maxDate, firstDayOfWeekMin, firstDayOfWeekMax } = DATE_PICKER_BOUNDARIES

/** A real day between the bounds, as an ISO string: the same bounds clampIso holds the props to. */
const isoDate = z.string().regex(DATE_PICKER_ISO_PATTERN)
  .refine((iso) => parseIsoDate(iso) !== null && iso >= minDate && iso <= maxDate, { message: `a real day from ${minDate} to ${maxDate}` })

// R-8.3-3: .meta() is last in each chain, or zod drops it from the JSON Schema output.
export const datePickerSchema = z.object({
  size: sizeSchema.default(DATE_PICKER_DEFAULTS.size)
    .meta({ description: 'DatePicker: the height, the inline padding and the type step of the trigger, and its width with them; custom emits no size classes.' }),
  invalid: z.boolean().default(DATE_PICKER_DEFAULTS.invalid)
    .meta({ description: 'DatePicker: marks the date as wrong: sets aria-invalid on the trigger, whose line turns to danger and thickens.' }),
  fullWidth: z.boolean().default(DATE_PICKER_DEFAULTS.fullWidth)
    .meta({ description: 'DatePicker: the box fills the width of its parent instead of taking the width of an Input.' }),
  placement: z.enum(DATE_PICKER_PLACEMENTS).default(DATE_PICKER_DEFAULTS.placement)
    .meta({ description: 'DatePicker: the side and alignment the calendar opens at; start and end mirror in Arabic.' }),
  minDate: isoDate.default(DATE_PICKER_DEFAULTS.minDate)
    .meta({ description: `DatePicker: the first day that can be chosen, an ISO date clamped to ${minDate} to ${maxDate}.` }),
  maxDate: isoDate.default(DATE_PICKER_DEFAULTS.maxDate)
    .meta({ description: `DatePicker: the last day that can be chosen, clamped like minDate and raised to it when below.` }),
  firstDayOfWeek: z.number().min(firstDayOfWeekMin).max(firstDayOfWeekMax).optional()
    .meta({ description: 'DatePicker: the first column, 1 (Monday) to 7 (Sunday), rounded and clamped; left out, the locale\'s.' }),
})

export type DatePickerSchemaInput = z.input<typeof datePickerSchema>
