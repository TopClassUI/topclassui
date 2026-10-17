// R-8.3-2: the value lists and the defaults. The bounds of the skeleton live in boundaries.ts.
import { DEFAULT_TONE, TONES, type Tone } from '#shared/contracts/tone.js'

export const TIMELINE_STATUSES = ['done', 'current', 'todo'] as const

export const TIMELINE_TONES = TONES

/** The tone of an item that names neither a tone nor a status that has one. */
export const TIMELINE_DEFAULTS = {
  tone: DEFAULT_TONE,
} as const

/** The tone Figma draws each status in, used only while the item names none. A todo
 * item has no entry: its marker is hollow whatever the tone. */
export const TIMELINE_STATUS_TONES = {
  done: 'success',
  current: 'primary',
} as const satisfies Partial<Record<(typeof TIMELINE_STATUSES)[number], Tone>>

/** The placeholder's starting shape: three events, as the drawn rail has before its todo. */
export const TIMELINE_SKELETON_DEFAULTS = {
  rows: 3,
} as const
