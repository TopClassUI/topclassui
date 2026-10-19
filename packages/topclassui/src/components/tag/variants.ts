import { cva } from 'class-variance-authority'

import { memoizeVariants } from '#shared/variants.js'

import { BORDER_WIDTH, CONTAIN } from '#shared/classes.js'
import { TONE_CLASS } from '#shared/contracts/tone.js'
import { CLIP, ON_SOFT, TAG_INTERACTIVE, TAG_SIZE } from './classes.js'
import { TAG_DEFAULTS, TAG_SIZES, TAG_TONES } from './constants.js'

const resolve = cva(
  [
    'inline-flex items-center rounded-chip font-medium',
    // The width Badge carries, so a Tag is exactly as tall as a Badge beside it.
    BORDER_WIDTH,
    CONTAIN,
    CLIP,
  ],
  {
    variants: {
      tone: ON_SOFT,
      size: TAG_SIZE,
      interactive: { true: TAG_INTERACTIVE, false: '' },
    },
    // The hover tints read the tone's variables, which only the tone utility sets.
    compoundVariants: TAG_TONES.map((tone) => ({ interactive: true, tone, class: TONE_CLASS[tone] })),
    defaultVariants: {
      tone: TAG_DEFAULTS.tone,
      size: TAG_DEFAULTS.size,
      interactive: false,
    },
  },
)

/** The look as a string, for an element that cannot be a Tag (R-5.2-2). */
export const tagVariants = memoizeVariants(resolve, {
  tone: TAG_TONES,
  size: TAG_SIZES,
  interactive: [true, false],
}, { ...TAG_DEFAULTS, interactive: false })
