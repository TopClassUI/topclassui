import { cva } from 'class-variance-authority'

import { cn } from '#shared/cn.js'

import {
  BORDER_WIDTH, CONTROL_SIZE, DISABLED, FOCUS_RING, HOVER, LOADING, TOUCH_TARGET, TRANSITION,
} from '#shared/classes.js'
import { TONE_CLASS } from '#shared/contracts/tone.js'
import { ON_SOFT, ON_SOLID, TONE_TEXT } from './classes.js'
import { BUTTON_DEFAULTS, BUTTON_SIZES, BUTTON_TONES, BUTTON_UNFILLED, BUTTON_VARIANTS } from './constants.js'
import type { ButtonVariantProps } from './types.js'

const resolve = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium rounded-control',
    // The width is always present, so switching to outline shifts no layout.
    BORDER_WIDTH,
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
      ...BUTTON_TONES.map((tone) => ({
        // Spread: cva wants a mutable list, and R-8.3-5 wants the source as const.
        variant: [...BUTTON_UNFILLED],
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

/**
 * The look as a string, for an element that cannot be a Button. Four enums give
 * 360 outcomes, so each is resolved once instead of rescanning 18 compound
 * variants on every render.
 */
const cache = new Map<string, string>()

/** One definition, so the cached key and the allowed set can never disagree. */
const keyFor = (variant: string, tone: string, size: string, fullWidth: boolean) =>
  `${variant}|${tone}|${size}|${String(fullWidth)}`

/** Only the 360 real keys, so a JS caller passing a free string cannot grow the map. */
const CACHEABLE = new Set(
  BUTTON_VARIANTS.flatMap((variant) =>
    BUTTON_TONES.flatMap((tone) =>
      BUTTON_SIZES.flatMap((size) =>
        [true, false].map((wide) => keyFor(variant, tone, size, wide))))),
)

export function buttonVariants(props: ButtonVariantProps = {}): string {
  const variant = props.variant ?? BUTTON_DEFAULTS.variant
  const tone = props.tone ?? BUTTON_DEFAULTS.tone
  const size = props.size ?? BUTTON_DEFAULTS.size
  const fullWidth = props.fullWidth ?? BUTTON_DEFAULTS.fullWidth

  const key = keyFor(variant, tone, size, fullWidth)
  let classes = cache.get(key)
  if (classes === undefined) {
    classes = cn(resolve({ variant, tone, size, fullWidth }))
    if (CACHEABLE.has(key)) cache.set(key, classes)
  }
  // The cva export appended these, so dropping them would be a silent regression.
  const extra = props.className ?? props.class
  return extra === undefined ? classes : cn(classes, extra)
}
