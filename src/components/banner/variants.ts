import { cva } from 'class-variance-authority'

import { memoizeVariants } from '#shared/variants.js'

import { ON_SOFT } from './classes.js'
import { BANNER_DEFAULTS, BANNER_TONES } from './constants.js'

// No radius and no border: the row spans the page, edge to edge.
const resolve = cva('flex w-full items-center gap-3 px-5 py-3 text-sm font-medium wrap-anywhere', {
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
