// R-8.3-1: zod lives here only, and components import this file with `import type`.
import { z } from 'zod'

import { sizeSchema } from '#shared/contracts/size.schema.js'
import { SLIDER_BOUNDARIES } from './boundaries.js'
import { SLIDER_DEFAULTS } from './constants.js'

const { limitMin, limitMax, stepMin, stepsBetweenMin } = SLIDER_BOUNDARIES

// R-8.3-3: .meta() is last in each chain, or zod drops it from the JSON Schema output.
export const sliderSchema = z.object({
  size: sizeSchema.default(SLIDER_DEFAULTS.size)
    .meta({ description: 'The scale of the track and the knob, and the width of an Input of that size; custom emits no size classes.' }),
  invalid: z.boolean().default(SLIDER_DEFAULTS.invalid)
    .meta({ description: 'Marks the value as wrong: sets aria-invalid on the group and on each range input, and the fill, the knob and the line around the track turn to danger.' }),
  fullWidth: z.boolean().default(SLIDER_DEFAULTS.fullWidth)
    .meta({ description: 'Fills its parent instead of taking the width of an Input of its size.' }),
  showValue: z.boolean().default(SLIDER_DEFAULTS.showValue)
    .meta({ description: 'Writes the value after the track, in the locale and the digits of the provider.' }),
  min: z.number().min(limitMin).max(limitMax).default(SLIDER_DEFAULTS.min)
    .meta({ description: 'The lowest value, and the value of a slider with no default; clamped to plus or minus 1e15.' }),
  max: z.number().min(limitMin).max(limitMax).default(SLIDER_DEFAULTS.max)
    .meta({ description: 'The highest value; clamped to plus or minus 1e15.' }),
  step: z.number().min(stepMin).max(limitMax).default(SLIDER_DEFAULTS.step)
    .meta({ description: 'What one arrow key moves; clamped to at least 0.000001, since a step of 0 would never move.' }),
  largeStep: z.number().min(stepMin).max(limitMax).default(SLIDER_DEFAULTS.largeStep)
    .meta({ description: 'What Page Up, Page Down and Shift with an arrow move; clamped to at least the step, so they always move.' }),
  minStepsBetweenValues: z.number().min(stepsBetweenMin).max(limitMax).default(SLIDER_DEFAULTS.minStepsBetweenValues)
    .meta({ description: 'The fewest steps between the two thumbs of a range; clamped to at least 0, so the thumbs never cross.' }),
})

export type SliderSchemaInput = z.input<typeof sliderSchema>
