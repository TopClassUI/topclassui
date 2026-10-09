import { cva } from 'class-variance-authority'

import { memoizeVariants } from '#shared/variants.js'

import { BORDER_WIDTH, CONTAIN } from '#shared/classes.js'
import { CLIP, ON_SOFT, TAG_SIZE } from './classes.js'
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
    },
    defaultVariants: {
      tone: TAG_DEFAULTS.tone,
      size: TAG_DEFAULTS.size,
    },
  },
)

/** The look as a string, for an element that cannot be a Tag (R-5.2-2). */
export const tagVariants = memoizeVariants(resolve, {
  tone: TAG_TONES,
  size: TAG_SIZES,
}, TAG_DEFAULTS)
