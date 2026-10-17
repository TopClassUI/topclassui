import 'server-only'

import { Svg } from '#components/svg/index.js'
import { loadIcon } from './lib.js'
import type { IconProps } from './types.js'

export type { IconProps } from './types.js'

/** R-5.1-5: the one async, server-only file in the catalog. */
export async function Icon({ name, ...rest }: IconProps) {
  return <Svg icon={await loadIcon(name)} {...rest} />
}
