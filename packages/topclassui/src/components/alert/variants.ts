import { cva } from 'class-variance-authority'

import { memoizeVariants } from '#shared/variants.js'

import { BORDER_WIDTH } from '#shared/classes.js'
import type { Tone } from '#shared/contracts/tone.js'
import { ON_OUTLINE, ON_SOFT, ON_SOLID } from './classes.js'
import { ALERT_DEFAULTS, ALERT_TONES, ALERT_VARIANTS } from './constants.js'

// cva needs every tone as a key; the colour itself comes from the compound variants.
const toneKeys = Object.fromEntries(ALERT_TONES.map((tone) => [tone, ''])) as Record<Tone, ''>

const resolve = cva(
  [
    'flex items-start gap-2 rounded-box px-pad-x-md py-3',
    // On every variant, so changing the variant never moves the layout.
    BORDER_WIDTH,
  ],
  {
    variants: {
      variant: { soft: '', solid: '', outline: '' },
      tone: toneKeys,
    },
    compoundVariants: [
      ...ALERT_TONES.map((tone) => ({ variant: 'soft' as const, tone, class: ON_SOFT[tone] })),
      ...ALERT_TONES.map((tone) => ({ variant: 'solid' as const, tone, class: ON_SOLID[tone] })),
      ...ALERT_TONES.map((tone) => ({ variant: 'outline' as const, tone, class: ON_OUTLINE[tone] })),
    ],
    defaultVariants: {
      variant: ALERT_DEFAULTS.variant,
      tone: ALERT_DEFAULTS.tone,
    },
  },
)

/** The look as a string, for an element that cannot be an Alert (R-5.2-2). */
export const alertVariants = memoizeVariants(resolve, {
  variant: ALERT_VARIANTS,
  tone: ALERT_TONES,
}, ALERT_DEFAULTS)
