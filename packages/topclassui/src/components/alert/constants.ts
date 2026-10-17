// R-8.3-2: the value lists, the defaults and the icon of each tone. Alert bounds nothing.
import { checkCircle } from '#icons/data/check-circle.js'
import { info } from '#icons/data/info.js'
import { warningCircle } from '#icons/data/warning-circle.js'
import { warning } from '#icons/data/warning.js'
import type { IconData } from '#icons/types.js'
import { TONES, type Tone } from '#shared/contracts/tone.js'

export const ALERT_VARIANTS = ['soft', 'solid', 'outline'] as const

export const ALERT_TONES = TONES

/** Every prop's starting value. A caller overrides any of them by passing the prop.
 * info, not the shared primary: the docs playground selects it. */
export const ALERT_DEFAULTS = {
  variant: 'soft',
  tone: 'info',
} as const

/** The icon each tone shows unless the caller passes its own, so the message reads
 * without colour. Figma draws no primary or neutral alert; both take the info icon. */
export const ALERT_ICONS: Record<Tone, IconData> = {
  primary: info,
  neutral: info,
  success: checkCircle,
  warning: warning,
  danger: warningCircle,
  info: info,
}
