'use client'

import { Svg } from '#components/svg/index.js'
import { resolveIcon } from './lib.js'
import type { IconProps } from './types.js'

/** R-5.1-5: the browser-only twin of the server `<Icon>`, with the identical props. */
export function Icon({ name, ...rest }: IconProps) {
  return <Svg icon={resolveIcon(name)} {...rest} />
}
