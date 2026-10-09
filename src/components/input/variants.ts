import { cva } from 'class-variance-authority'

import {
  BORDER_STRONG, CONTAIN, DISABLED, FOCUS_RING, TOUCH_TARGET, TRANSITION,
} from '#shared/classes.js'
import { memoizeVariants } from '#shared/variants.js'
import { INPUT_INVALID_WIDTH, INPUT_LTR, INPUT_SIZE } from './classes.js'
import { INPUT_DEFAULTS, INPUT_SIZES } from './constants.js'

const resolve = cva(
  [
    'rounded-control bg-surface-raised text-body placeholder:text-muted',
    // It beats BORDER_STRONG on specificity: the attribute selector outranks the plain class.
    'aria-invalid:border-danger-solid',
    INPUT_INVALID_WIDTH,
    INPUT_LTR,
    BORDER_STRONG,
    CONTAIN,
    DISABLED,
    FOCUS_RING,
    TOUCH_TARGET,
    TRANSITION,
  ],
  {
    variants: {
      size: INPUT_SIZE,
      fullWidth: { true: 'w-full', false: '' },
    },
    defaultVariants: {
      size: INPUT_DEFAULTS.size,
      fullWidth: INPUT_DEFAULTS.fullWidth,
    },
  },
)

/** The look as a string, for an element that cannot be an Input (R-5.2-2). */
export const inputVariants = memoizeVariants(resolve, {
  size: INPUT_SIZES,
  fullWidth: [true, false],
}, { size: INPUT_DEFAULTS.size, fullWidth: INPUT_DEFAULTS.fullWidth })
