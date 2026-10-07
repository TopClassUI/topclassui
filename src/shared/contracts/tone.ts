// R-8.3-2: values only, so nothing that imports a tone pulls zod into the bundle.

/** R-5.7-1: one tone vocabulary, so every toned component offers exactly the same set. */
export const TONES = ['primary', 'neutral', 'success', 'warning', 'danger', 'info'] as const
export type Tone = (typeof TONES)[number]

export const DEFAULT_TONE = 'primary' satisfies Tone

/** The utility that swaps the five interaction variables, one per tone (src/styles.css). */
export const TONE_CLASS = {
  primary: 'tone-primary',
  neutral: 'tone-neutral',
  success: 'tone-success',
  warning: 'tone-warning',
  danger: 'tone-danger',
  info: 'tone-info',
} as const satisfies Record<Tone, string>
