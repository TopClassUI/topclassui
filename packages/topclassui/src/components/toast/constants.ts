// R-8.3-2: the value lists and the defaults. Placement, limit and duration are the provider's, so they come from the shared contract.
import { checkCircle } from '#icons/data/check-circle.js'
import { info } from '#icons/data/info.js'
import { spinner } from '#icons/data/spinner.js'
import { warning } from '#icons/data/warning.js'
import { warningCircle } from '#icons/data/warning-circle.js'
import { TOAST_DEFAULTS as SETTINGS_DEFAULTS } from '#shared/contracts/toast.js'
import { TONES } from '#shared/contracts/tone.js'

export { TOAST_PLACEMENTS } from '#shared/contracts/toast.js'

/** The shared six. `toast.promise` also writes Base UI's own `loading`, `success` and `error`. */
export const TOAST_TONES = TONES

/** Base UI's two: `high` is announced at once, as an alert. */
export const TOAST_PRIORITIES = ['low', 'high'] as const

/** What `toast.add` fills in, and the provider's settings beside it. The tone is neutral, which draws no icon. */
export const TOAST_DEFAULTS = {
  ...SETTINGS_DEFAULTS,
  priority: 'low',
} as const

/** The icon of each type that carries one, so a tone is never told by colour alone. Neutral and primary have none. */
export const TOAST_ICONS = {
  success: checkCircle,
  danger: warningCircle,
  error: warningCircle,
  warning,
  info,
  loading: spinner,
} as const
