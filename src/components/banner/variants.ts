import { cva } from 'class-variance-authority'

import { memoizeVariants } from '#shared/variants.js'

import { BANNER_BOX, ON_SOFT } from './classes.js'
import { BANNER_DEFAULTS, BANNER_TONES } from './constants.js'

const resolve = cva([BANNER_BOX, 'font-medium wrap-anywhere'], {
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
