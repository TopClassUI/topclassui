import type { IconName } from '#icons/names.generated.js'
import type { SvgProps } from '#components/svg/types.js'

export interface IconProps extends Omit<SvgProps, 'icon'> {
  name: IconName
}
