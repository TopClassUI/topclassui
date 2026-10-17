import { cva } from 'class-variance-authority'

import { memoizeVariants } from '#shared/variants.js'

import { BORDER_WIDTH, CONTAIN } from '#shared/classes.js'
import type { Tone } from '#shared/contracts/tone.js'
import { BADGE_SIZE, ON_OUTLINE, ON_SOFT, ON_SOLID } from './classes.js'
import { BADGE_DEFAULTS, BADGE_SIZES, BADGE_TONES, BADGE_VARIANTS } from './constants.js'

// cva needs every tone as a key; the colour itself comes from the compound variants.
const toneKeys = Object.fromEntries(BADGE_TONES.map((tone) => [tone, ''])) as Record<Tone, ''>

const resolve = cva(
  [
    'inline-flex items-center rounded-chip font-medium',
    // On every variant, so changing the variant never moves the layout.
    BORDER_WIDTH,
    CONTAIN,
  ],
  {
    variants: {
      variant: { solid: '', soft: '', outline: '' },
      tone: toneKeys,
      size: BADGE_SIZE,
    },
    compoundVariants: [
      ...BADGE_TONES.map((tone) => ({ variant: 'solid' as const, tone, class: ON_SOLID[tone] })),
      ...BADGE_TONES.map((tone) => ({ variant: 'soft' as const, tone, class: ON_SOFT[tone] })),
      ...BADGE_TONES.map((tone) => ({ variant: 'outline' as const, tone, class: ON_OUTLINE[tone] })),
    ],
    defaultVariants: {
      variant: BADGE_DEFAULTS.variant,
      tone: BADGE_DEFAULTS.tone,
      size: BADGE_DEFAULTS.size,
    },
  },
)

/** The look as a string, for an element that cannot be a Badge (R-5.2-2). */
export const badgeVariants = memoizeVariants(resolve, {
  variant: BADGE_VARIANTS,
  tone: BADGE_TONES,
  size: BADGE_SIZES,
}, BADGE_DEFAULTS)
