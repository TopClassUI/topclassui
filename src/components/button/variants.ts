import { cva } from 'class-variance-authority'

import { cn } from '#shared/cn.js'

import {
  BORDER_WIDTH, CONTROL_SIZE, DISABLED, FOCUS_RING, HOVER, LOADING, TOUCH_TARGET, TRANSITION,
} from '#shared/classes.js'
import { TONE_CLASS } from '#shared/contracts/tone.js'
import { BUTTON_DEFAULTS, BUTTON_TONES } from './constants.js'
import type { ButtonVariant, ButtonVariantProps } from './types.js'

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

/**
 * The look as a string, for an element that cannot be a Button. Four enums give
 * 360 outcomes, so each is resolved once instead of rescanning 18 compound
 * variants on every render.
 */
const cache = new Map<string, string>()

export function buttonVariants(props: ButtonVariantProps = {}): string {
  const variant = props.variant ?? BUTTON_DEFAULTS.variant
  const tone = props.tone ?? BUTTON_DEFAULTS.tone
  const size = props.size ?? BUTTON_DEFAULTS.size
  const fullWidth = props.fullWidth ?? BUTTON_DEFAULTS.fullWidth

  const key = `${variant}|${tone}|${size}|${String(fullWidth)}`
  let classes = cache.get(key)
  if (classes === undefined) {
    classes = cn(resolve({ variant, tone, size, fullWidth }))
    cache.set(key, classes)
  }
  // The cva export appended these, so dropping them would be a silent regression.
  const extra = props.className ?? props.class
  return extra === undefined ? classes : cn(classes, extra)
}
