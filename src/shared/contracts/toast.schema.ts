// R-8.3-1: the only toast file that may load zod; a component references it as a type.
import { z } from 'zod'

import { TOAST_BOUNDARIES, TOAST_DEFAULTS, TOAST_PLACEMENTS } from './toast.js'

const { limitMin, limitMax, durationMin, durationMax } = TOAST_BOUNDARIES

// R-8.3-3: .meta() is last in each chain, or zod drops it from the JSON Schema output.
export const toastSettingsSchema = z.object({
  placement: z.enum(TOAST_PLACEMENTS).default(TOAST_DEFAULTS.placement)
    .meta({ description: 'TopClassProvider toast: the corner or edge the toasts sit at; start and end mirror in Arabic.' }),
  limit: z.number().int().min(limitMin).max(limitMax).default(TOAST_DEFAULTS.limit)
    .meta({ description: 'TopClassProvider toast: how many toasts show at once; clamped to 1-10, and a fraction is cut.' }),
  duration: z.number().min(durationMin).max(durationMax).default(TOAST_DEFAULTS.duration)
    .meta({ description: 'TopClassProvider toast: milliseconds before a toast closes itself, clamped; 0 keeps it until closed.' }),
})

export type ToastSettingsSchemaInput = z.input<typeof toastSettingsSchema>
