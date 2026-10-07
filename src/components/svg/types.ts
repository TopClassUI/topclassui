import type { SVGProps } from 'react'

import type { IconData } from '#icons/types.js'
import type { IconSize } from '#shared/contracts/size.js'

/** `name` is omitted: the svg attribute would collide with the icon name. */
export interface SvgProps extends Omit<SVGProps<SVGSVGElement>, 'children' | 'name'> {
  /** An icon imported explicitly, so the loader map never reaches the browser. */
  icon: IconData
  /** The five names, or any CSS length. Defaults to 1em so the icon follows the text. */
  size?: IconSize | number | (string & {}) | undefined
  /** Set for a meaningful icon; leave unset or empty for a decorative one. */
  label?: string | undefined
  /** Defaults to true for directional icons (arrows, carets). */
  flipRtl?: boolean | undefined
}
