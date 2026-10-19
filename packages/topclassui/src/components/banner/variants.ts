import { cva } from 'class-variance-authority'

import { memoizeVariants } from '#shared/variants.js'

import { FORCED_EDGE, ON_SOFT } from './classes.js'
import { BANNER_DEFAULTS, BANNER_TONES } from './constants.js'

// Edge to edge, so no radius or border, at the frame's 18 by 11 px of padding; it wraps a long action under the message, and min-w-0 lets a track stay narrow.
const resolve = cva(['flex w-full min-w-0 flex-wrap items-center gap-3 px-4.5 py-2.75 text-sm/tight font-medium wrap-anywhere', FORCED_EDGE], {
  variants: {
    tone: ON_SOFT,
  },
  defaultVariants: {
    tone: BANNER_DEFAULTS.tone,
  },
})

/** The look as a string, for an element that cannot be a Banner (R-5.2-2). */
export const bannerVariants = memoizeVariants(resolve, {
  tone: BANNER_TONES,
}, BANNER_DEFAULTS)
