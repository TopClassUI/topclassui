// R-8.3-2: the value lists and the defaults. The bounds live in boundaries.ts.
import { BREADCRUMB_BOUNDARIES } from './boundaries.js'

/** An absolute http or https origin with no path and no trailing slash, such as `https://example.com`. */
export const BREADCRUMB_SITE_URL_PATTERN = /^https?:\/\/[^/?#\s]+$/

/** Every prop's starting value. maxItems starts at its rail, so a real trail is never folded unasked. */
export const BREADCRUMB_DEFAULTS = {
  showHome: false,
  maxItems: BREADCRUMB_BOUNDARIES.maxItems.max,
} as const
