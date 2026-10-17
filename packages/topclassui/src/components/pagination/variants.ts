import { cva } from 'class-variance-authority'

import { DISABLED, FOCUS_RING, TOUCH_TARGET, TRANSITION } from '#shared/classes.js'
import { memoizeVariants } from '#shared/variants.js'
import { CELL, CELL_CURRENT, CELL_OTHER, CELL_SIZE } from './classes.js'
import { PAGINATION_DEFAULTS, PAGINATION_SIZES } from './constants.js'

/** A cell is a page that is not the current one, at the size of the component. */
const defaults = { size: PAGINATION_DEFAULTS.size, current: false } as const

const resolve = cva(
  [CELL, DISABLED, FOCUS_RING, TOUCH_TARGET, TRANSITION],
  {
    variants: {
      size: CELL_SIZE,
      current: { true: CELL_CURRENT, false: CELL_OTHER },
    },
    defaultVariants: defaults,
  },
)

/** The look of one cell as a string, for a link the caller renders itself (R-5.2-2). */
export const paginationVariants = memoizeVariants(resolve, {
  size: PAGINATION_SIZES,
  current: [true, false],
}, defaults)
