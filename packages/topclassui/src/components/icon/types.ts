import type { IconName } from '#icons/names.generated.js'
import type { SvgProps } from '#components/svg/types.js'

export interface IconProps extends Omit<SvgProps, 'icon'> {
  /** One of the 84 built-in icon names, loaded on the server. */
  name: IconName
}
