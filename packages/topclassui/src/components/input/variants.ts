import { cva } from 'class-variance-authority'

import { FIELD_BOX, FIELD_LTR } from '#shared/classes.js'
import { memoizeVariants } from '#shared/variants.js'
import { INPUT_SIZE } from './classes.js'
import { INPUT_DEFAULTS, INPUT_SIZES } from './constants.js'

// The red line of FIELD_BOX beats BORDER_STRONG on specificity: the attribute selector outranks the plain class.
const resolve = cva(
  [FIELD_BOX, FIELD_LTR],
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
