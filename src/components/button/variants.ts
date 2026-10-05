import { cva } from 'class-variance-authority'

import {
  BORDER_WIDTH, CONTROL_SIZE, DISABLED, FOCUS_RING, HOVER, LOADING, TOUCH_TARGET, TRANSITION,
} from '#shared/classes.js'
import { TONE_CLASS } from '#shared/contracts/tone.js'
import { BUTTON_DEFAULTS, BUTTON_TONES } from './constants.js'
import type { ButtonVariant } from './types.js'

/** R-5.2-3: a lookup of complete class strings, never a name built from an expression. */
const ON_SOLID = {
  primary: 'bg-primary-solid text-primary-on-solid',
  neutral: 'bg-neutral-solid text-neutral-on-solid',
  success: 'bg-success-solid text-success-on-solid',
  warning: 'bg-warning-solid text-warning-on-solid',
  danger: 'bg-danger-solid text-danger-on-solid',
  info: 'bg-info-solid text-info-on-solid',
} as const

const ON_SOFT = {
  primary: 'bg-primary-soft text-primary-on-soft',
  neutral: 'bg-neutral-soft text-neutral-on-soft',
  success: 'bg-success-soft text-success-on-soft',
  warning: 'bg-warning-soft text-warning-on-soft',
  danger: 'bg-danger-soft text-danger-on-soft',
  info: 'bg-info-soft text-info-on-soft',
} as const

/** cva wants a mutable list here, so the tuple is declared once rather than inline. */
const UNFILLED: ButtonVariant[] = ['outline', 'ghost', 'link']

/** outline, ghost and link have no fill, so only the tone's text colour applies. */
const TONE_TEXT = {
  primary: 'text-primary-on-soft',
  neutral: 'text-neutral-on-soft',
  success: 'text-success-on-soft',
  warning: 'text-warning-on-soft',
  danger: 'text-danger-on-soft',
  info: 'text-info-on-soft',
} as const

export const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium rounded-control',
    // The width is always present with a transparent colour, so outline shifts nothing.
    `${BORDER_WIDTH} border-transparent`,
    DISABLED,
    LOADING,
    FOCUS_RING,
    TOUCH_TARGET,
    TRANSITION,
  ],
  {
    variants: {
      variant: {
        solid: HOVER.solid,
        soft: HOVER.soft,
        outline: `border-line-strong ${HOVER.outline}`,
        ghost: HOVER.ghost,
        link: `underline-offset-4 ${HOVER.link}`,
      },
      tone: TONE_CLASS,
      size: CONTROL_SIZE,
      fullWidth: { true: 'w-full', false: '' },
    },
    compoundVariants: [
      ...BUTTON_TONES.map((tone) => ({ variant: 'solid' as const, tone, class: ON_SOLID[tone] })),
      ...BUTTON_TONES.map((tone) => ({ variant: 'soft' as const, tone, class: ON_SOFT[tone] })),
      ...BUTTON_TONES.map((tone) => ({
        variant: UNFILLED,
        tone,
        class: TONE_TEXT[tone],
      })),
    ],
    defaultVariants: {
      variant: BUTTON_DEFAULTS.variant,
      tone: BUTTON_DEFAULTS.tone,
      size: BUTTON_DEFAULTS.size,
      fullWidth: BUTTON_DEFAULTS.fullWidth,
    },
  },
)
