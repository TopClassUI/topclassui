// R-8.3-1: zod lives here only, and components import this file with `import type`.
import { z } from 'zod'

import { TOAST_BOUNDARIES } from './boundaries.js'
import { TOAST_DEFAULTS, TOAST_PRIORITIES, TOAST_TONES } from './constants.js'

const { durationMin, durationMax } = TOAST_BOUNDARIES

// R-8.3-3: .meta() is last in each chain, or zod drops it from the JSON Schema output.
export const toastSchema = z.object({
  tone: z.enum(TOAST_TONES).default(TOAST_DEFAULTS.tone)
    .meta({ description: 'toast.add: what the toast means. success, warning, danger and info draw an icon; neutral and primary none.' }),
  duration: z.number().min(durationMin).max(durationMax).optional()
    .meta({ description: 'toast.add: milliseconds before it closes itself, clamped; 0 stays until closed; left out, the provider duration applies.' }),
  priority: z.enum(TOAST_PRIORITIES).default(TOAST_DEFAULTS.priority)
    .meta({ description: 'toast.add: high is announced at once, as an alert; low waits for the reader to finish.' }),
})

export type ToastSchemaInput = z.input<typeof toastSchema>
