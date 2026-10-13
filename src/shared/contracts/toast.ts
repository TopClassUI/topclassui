// R-8.3-2: values only, so nothing that reads a toast setting pulls zod into the bundle.
import { clamp } from '../clamp.js'
import type { Tone } from './tone.js'

/** A block edge, then an inline side: start and end mirror in Arabic, and no name is physical. */
export const TOAST_PLACEMENTS = ['top-start', 'top', 'top-end', 'bottom-start', 'bottom', 'bottom-end'] as const
export type ToastPlacement = (typeof TOAST_PLACEMENTS)[number]

/** What TopClassProvider resolves once for the whole app, and `useToastSettings()` returns. */
export interface ToastSettings {
  placement: ToastPlacement
  /** How many toasts show at once; Base UI marks the older ones `data-limited`. */
  limit: number
  /** Milliseconds before a toast closes itself. 0 keeps it until it is closed. */
  duration: number
}

/** The provider's `toast` prop: every key optional, and a plain object, so it crosses from a Server Component. */
export type ToastSettingsInput = { [K in keyof ToastSettings]?: ToastSettings[K] | undefined }

/** limit and duration are Base UI's own defaults, written out so the schema and the docs can name them. */
export const TOAST_DEFAULTS = {
  placement: 'bottom-end',
  limit: 3,
  duration: 5000,
  tone: 'neutral',
} as const satisfies ToastSettings & { tone: Tone }

/** R-8.3-6: guard rails, not validators. Ten toasts cover a phone screen, and ten minutes
 * is past any notice a reader waits on; a duration of 0 never closes by itself. */
export const TOAST_BOUNDARIES = {
  limitMin: 1,
  limitMax: 10,
  durationMin: 0,
  durationMax: 600000,
} as const

const { limitMin, limitMax, durationMin, durationMax } = TOAST_BOUNDARIES

const isPlacement = (value: unknown): value is ToastPlacement =>
  (TOAST_PLACEMENTS as readonly unknown[]).includes(value)

/** Number() first, as Pagination does: a string from JavaScript is not NaN to clamp. A value
 * that is no number takes the default, never the minimum: a duration of 0 never closes. */
function bound(given: unknown, fallback: number, min: number, max: number): number {
  const value = Number(given ?? fallback)
  return clamp(Number.isNaN(value) ? fallback : value, min, max)
}

/** R-5.7-7: the settings every toast runs on. A missing key takes its default, a number
 * outside the boundaries is clamped, and a limit is a whole number of toasts. */
export function resolveToastSettings(given: ToastSettingsInput = {}): ToastSettings {
  return {
    placement: isPlacement(given.placement) ? given.placement : TOAST_DEFAULTS.placement,
    limit: Math.trunc(bound(given.limit, TOAST_DEFAULTS.limit, limitMin, limitMax)),
    duration: bound(given.duration, TOAST_DEFAULTS.duration, durationMin, durationMax),
  }
}
