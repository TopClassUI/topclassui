import { cva } from 'class-variance-authority'

import { memoizeVariants } from '#shared/variants.js'

import {
  BORDER_WIDTH, CONTAIN, CONTROL_SIZE, DISABLED, FOCUS_RING, HOVER, LOADING, TOUCH_TARGET,
  TRANSITION,
} from '#shared/classes.js'
import { TONE_CLASS } from '#shared/contracts/tone.js'
import { ON_SOFT, ON_SOLID, TONE_TEXT } from './classes.js'
import {
  BUTTON_DEFAULTS, BUTTON_SIZES, BUTTON_TONES, BUTTON_BODY_TEXT, BUTTON_VARIANTS,
} from './constants.js'

const resolve = cva(
  [
    'inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap font-medium rounded-control',
    // The width is always present, so switching to outline shifts no layout.
    BORDER_WIDTH,
    CONTAIN,
    DISABLED,
    LOADING,
    FOCUS_RING,
    TOUCH_TARGET,
    TRANSITION,
  ],
  {
    variants: {
      // Each variant names its own border colour, so the raw output never conflicts.
      variant: {
        solid: `border-transparent ${HOVER.solid}`,
        soft: `border-transparent ${HOVER.soft}`,
        outline: `border-line-strong ${HOVER.outline}`,
        ghost: `border-transparent ${HOVER.ghost}`,
        link: `border-transparent underline-offset-4 ${HOVER.link}`,
      },
      tone: TONE_CLASS,
      size: CONTROL_SIZE,
      fullWidth: { true: 'w-full', false: '' },
    },
    compoundVariants: [
      ...BUTTON_TONES.map((tone) => ({ variant: 'solid' as const, tone, class: ON_SOLID[tone] })),
      ...BUTTON_TONES.map((tone) => ({ variant: 'soft' as const, tone, class: ON_SOFT[tone] })),
      // Spread: cva wants a mutable list, and R-8.3-5 wants the source as const.
      { variant: [...BUTTON_BODY_TEXT], class: 'text-body' },
      ...BUTTON_TONES.map((tone) => ({ variant: 'link' as const, tone, class: TONE_TEXT[tone] })),
    ],
    defaultVariants: {
      variant: BUTTON_DEFAULTS.variant,
      tone: BUTTON_DEFAULTS.tone,
      size: BUTTON_DEFAULTS.size,
      fullWidth: BUTTON_DEFAULTS.fullWidth,
    },
  },
)

/** The look as a string, for an element that cannot be a Button (R-5.2-2). */
export const buttonVariants = memoizeVariants(resolve, {
  variant: BUTTON_VARIANTS,
  tone: BUTTON_TONES,
  size: BUTTON_SIZES,
  fullWidth: [true, false],
}, BUTTON_DEFAULTS)
